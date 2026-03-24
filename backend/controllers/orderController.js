const { Order, OrderItem, Product, Restaurant, User } = require('../models');

exports.createOrder = async (req, res, io) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body;

    // Calculate total
    let total = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (product) total += product.price * item.quantity;
    }

    const order = await Order.create({
      customerId: req.user.id,
      restaurantId,
      deliveryAddress,
      total,
      status: 'pending',
    });

    // Create order items
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Fetch complete order with relations
    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: Restaurant, as: 'restaurant' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
      ],
    });

    // Notify restaurant via Socket.io
    io.emit('new_order', fullOrder);

    res.status(201).json(fullOrder);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { role, id } = req.user;
    let where = {};

    if (role === 'client') where = { customerId: id };
    if (role === 'restaurant') {
      const rest = await Restaurant.findOne({ where: { userId: id } });
      if (rest) where = { restaurantId: rest.id };
    }
    if (role === 'driver') where = { driverId: id };

    const orders = await Order.findAll({
      where,
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: Restaurant, as: 'restaurant' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
        { model: User, as: 'driver', attributes: ['id', 'name', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: 'ready', driverId: null },
      include: [
        { model: Restaurant, as: 'restaurant' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
      ],
      order: [['createdAt', 'ASC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.updateOrderStatus = async (req, res, io) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // If driver accepts delivery
    if (status === 'out_for_delivery' && req.user.role === 'driver') {
      order.driverId = req.user.id;
    }

    order.status = status;
    await order.save();

    // Fetch updated order with relations
    const fullOrder = await Order.findByPk(id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: Restaurant, as: 'restaurant' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
        { model: User, as: 'driver', attributes: ['id', 'name', 'phone'] },
      ],
    });

    // Notify all clients
    io.emit('order_updated', fullOrder);

    // If order is ready, notify drivers
    if (status === 'ready') {
      io.emit('order_ready_for_pickup', fullOrder);
    }

    res.json(fullOrder);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
