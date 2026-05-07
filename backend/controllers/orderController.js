const { Order, OrderItem, Product, Restaurant, User } = require('../models');

// Shared include used by every order fetch — keeps payloads consistent.
const ORDER_INCLUDE = [
  { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
  { model: Restaurant, as: 'restaurant' },
  { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
  { model: User, as: 'driver', attributes: ['id', 'name', 'phone'] },
];

// Clamp and parse pagination params. Defaults are tuned so the existing UI
// (which doesn't paginate yet) keeps working: 50 rows is enough for active +
// recent history, while preventing accidental "load everything" payloads.
const parsePagination = (req, defaultLimit = 50, maxLimit = 200) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || defaultLimit, 1), maxLimit);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  return { limit, offset };
};

exports.createOrder = async (req, res, io) => {
  try {
    const { restaurantId, items, deliveryAddress, shoppingList } = req.body;

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    const isShoppingFlow = restaurant.type === 'superette' || restaurant.type === 'boucherie';

    // Branch by vendor type. Restaurants need at least one menu item; shopping
    // flow shops need a non-empty list (the driver buys based on this text).
    if (isShoppingFlow) {
      if (!shoppingList || !shoppingList.trim()) {
        return res.status(400).json({ message: 'La liste de courses est obligatoire.' });
      }
    } else if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item.' });
    }

    let total = 0;
    let orderItemsPayload = [];

    if (!isShoppingFlow) {
      // Menu order — bulk fetch products in a single query (no N+1) and total up.
      const productIds = items.map(i => i.productId);
      const products = await Product.findAll({ where: { id: productIds } });
      const productMap = new Map(products.map(p => [p.id, p]));

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) continue;
        total += product.price * item.quantity;
        orderItemsPayload.push({ productId: item.productId, quantity: item.quantity, price: product.price });
      }
    }

    const order = await Order.create({
      customerId: req.user.id,
      restaurantId,
      deliveryAddress,
      total,
      deliveryFee: 0,
      status: isShoppingFlow ? 'ready' : 'pending',
      shoppingList: isShoppingFlow ? shoppingList.trim() : null,
    });

    if (orderItemsPayload.length > 0) {
      await OrderItem.bulkCreate(orderItemsPayload.map(p => ({ ...p, orderId: order.id })));
    }

    const fullOrder = await Order.findByPk(order.id, { include: ORDER_INCLUDE });

    // Customer always gets the confirmation event in their personal room.
    io.to(`client_${req.user.id}`).emit('new_order', fullOrder);

    if (isShoppingFlow) {
      // Shopping-list shops don't process orders — push directly to drivers
      // so anyone available can claim the run, buy on the customer's behalf,
      // and fill in the receipt total at delivery time.
      io.to('drivers').emit('order_ready_for_pickup', fullOrder);
    } else {
      // Menu restaurant — owner accepts/prepares before drivers see it.
      io.to(`restaurant_${restaurant.userId}`).emit('new_order', fullOrder);
    }

    res.status(201).json(fullOrder);
  } catch (err) {
    console.error('❌ CreateOrder error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { role, id } = req.user;
    const { limit, offset } = parsePagination(req);
    let where = {};

    if (role === 'client') where = { customerId: id };
    if (role === 'restaurant') {
      const rest = await Restaurant.findOne({ where: { userId: id }, attributes: ['id'] });
      if (!rest) return res.json([]);
      where = { restaurantId: rest.id };
    }
    if (role === 'driver') where = { driverId: id };

    const orders = await Order.findAll({
      where,
      include: ORDER_INCLUDE,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json(orders);
  } catch (err) {
    console.error('❌ GetOrders error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getAvailableOrders = async (req, res) => {
  try {
    const { limit, offset } = parsePagination(req, 100, 200);
    const orders = await Order.findAll({
      where: { status: 'ready', driverId: null },
      include: [
        { model: Restaurant, as: 'restaurant' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
      ],
      order: [['createdAt', 'ASC']],
      limit,
      offset,
    });
    res.json(orders);
  } catch (err) {
    console.error('❌ GetAvailableOrders error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.updateOrderStatus = async (req, res, io) => {
  try {
    const { id } = req.params;
    const { status, deliveryFee, total } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Driver accepts the run — claim with race-condition guard and apply their price.
    if (status === 'out_for_delivery' && req.user.role === 'driver') {
      if (order.driverId && order.driverId !== req.user.id) {
        return res.status(409).json({ message: 'Order already accepted by another driver.' });
      }
      order.driverId = req.user.id;
      const fee = Number(deliveryFee);
      if (Number.isFinite(fee) && fee >= 0) {
        order.deliveryFee = fee;
      }
    }

    // Driver fills the receipt total when delivering a shopping-list order
    // (superette/boucherie). For menu orders the total is locked at creation
    // and ignored here.
    if (req.user.role === 'driver' && order.shoppingList && total !== undefined) {
      const t = Number(total);
      if (Number.isFinite(t) && t >= 0) {
        order.total = t;
      }
    }

    order.status = status;
    await order.save();

    const fullOrder = await Order.findByPk(id, { include: ORDER_INCLUDE });

    // Send to the parties involved instead of broadcasting to every connected socket.
    const restaurantOwnerId = fullOrder.restaurant?.userId;
    if (restaurantOwnerId) io.to(`restaurant_${restaurantOwnerId}`).emit('order_updated', fullOrder);
    if (fullOrder.customerId) io.to(`client_${fullOrder.customerId}`).emit('order_updated', fullOrder);
    if (fullOrder.driverId) io.to(`driver_${fullOrder.driverId}`).emit('order_updated', fullOrder);

    if (status === 'ready') {
      // All available drivers should hear about this pickup.
      io.to('drivers').emit('order_ready_for_pickup', fullOrder);
    } else if (status === 'out_for_delivery') {
      // Removed from the pool — let drivers drop it from their available list.
      io.to('drivers').emit('order_taken', { id: fullOrder.id });
    }

    res.json(fullOrder);
  } catch (err) {
    console.error('❌ UpdateOrderStatus error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
