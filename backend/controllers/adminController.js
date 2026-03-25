const { User, Restaurant, Order, Product } = require('../models');

exports.getStats = async (req, res) => {
  try {
    const userCount = await User.count();
    const restaurantCount = await Restaurant.count();
    const orderCount = await Order.count();
    const totalRevenue = await Order.sum('total') || 0;

    res.json({
      users: userCount,
      restaurants: restaurantCount,
      orders: orderCount,
      revenue: totalRevenue
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }]
    });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurants', error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'customer', attributes: ['name'] },
        { model: Restaurant, as: 'restaurant', attributes: ['name'] },
        { model: User, as: 'driver', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};
