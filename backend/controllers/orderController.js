const { Order, OrderItem, Product, Restaurant, User } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

// Shared include used by every order fetch. Attributes are tightened on the
// nested entities to avoid pulling base64 product images and long restaurant
// descriptions on every list-view round-trip — these payloads were the single
// largest contributor to /orders response size before the cut.
const ORDER_INCLUDE = [
  {
    model: OrderItem,
    as: 'items',
    attributes: ['id', 'quantity', 'price', 'productId'],
    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'category'] }],
  },
  {
    model: Restaurant,
    as: 'restaurant',
    attributes: ['id', 'name', 'image', 'address', 'isOpen', 'userId'],
  },
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

exports.createOrder = asyncHandler(async (req, res) => {
  const { restaurantId, items, deliveryAddress } = req.body;

  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found.' });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order must have at least one item.' });
  }

  // Bulk fetch products in a single query (no N+1) and total up.
  const productIds = items.map(i => i.productId);
  const products = await Product.findAll({ where: { id: productIds } });
  const productMap = new Map(products.map(p => [p.id, p]));

  let total = 0;
  const orderItemsPayload = [];
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) continue;
    total += product.price * item.quantity;
    orderItemsPayload.push({ productId: item.productId, quantity: item.quantity, price: product.price });
  }

  const order = await Order.create({
    customerId: req.user.id,
    restaurantId,
    deliveryAddress,
    total,
    deliveryFee: 0,
    status: 'pending',
  });

  if (orderItemsPayload.length > 0) {
    await OrderItem.bulkCreate(orderItemsPayload.map(p => ({ ...p, orderId: order.id })));
  }

  const fullOrder = await Order.findByPk(order.id, { include: ORDER_INCLUDE });

  // Customer gets the confirmation; restaurant owner gets the incoming order.
  // Drivers don't hear about it until the restaurant flips status to 'ready'.
  req.io.to(`client_${req.user.id}`).emit('new_order', fullOrder);
  req.io.to(`restaurant_${restaurant.userId}`).emit('new_order', fullOrder);

  res.status(201).json(fullOrder);
});

exports.getOrders = asyncHandler(async (req, res) => {
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
});

exports.getAvailableOrders = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req, 100, 200);
  // Drivers' "available" feed is hot — every connected driver re-pulls it on
  // every socket nudge. Strip everything they don't need to render the card:
  // no order items (they pick up the bag, they don't read the menu), and only
  // the restaurant fields the card actually displays.
  const orders = await Order.findAll({
    where: { status: 'ready', driverId: null },
    attributes: ['id', 'status', 'total', 'deliveryAddress', 'createdAt', 'restaurantId', 'customerId'],
    include: [
      { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'address'] },
      { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
    ],
    order: [['createdAt', 'ASC']],
    limit,
    offset,
  });
  res.json(orders);
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, deliveryFee } = req.body;

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

  order.status = status;
  await order.save();

  const fullOrder = await Order.findByPk(id, { include: ORDER_INCLUDE });

  // Send to the parties involved instead of broadcasting to every connected socket.
  const restaurantOwnerId = fullOrder.restaurant?.userId;
  if (restaurantOwnerId) req.io.to(`restaurant_${restaurantOwnerId}`).emit('order_updated', fullOrder);
  if (fullOrder.customerId) req.io.to(`client_${fullOrder.customerId}`).emit('order_updated', fullOrder);
  if (fullOrder.driverId) req.io.to(`driver_${fullOrder.driverId}`).emit('order_updated', fullOrder);

  if (status === 'ready') {
    // All available drivers should hear about this pickup.
    req.io.to('drivers').emit('order_ready_for_pickup', fullOrder);
  } else if (status === 'out_for_delivery') {
    // Removed from the pool — let drivers drop it from their available list.
    req.io.to('drivers').emit('order_taken', { id: fullOrder.id });
  }

  res.json(fullOrder);
});
