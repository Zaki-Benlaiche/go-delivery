const { User, Restaurant, Order, Product, Place } = require('../models');

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

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['client', 'restaurant', 'driver', 'admin', 'place'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.role = role;
    await user.save();

    res.json({ message: `User ${user.name} is now ${role}.`, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Error updating role', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    // Clean up associated data
    if (user.role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ where: { userId: user.id } });
      if (restaurant) {
        await Product.destroy({ where: { restaurantId: restaurant.id } });
        await restaurant.destroy();
      }
    }

    if (user.role === 'place') {
      await Place.destroy({ where: { userId: user.id } });
    }

    const userName = user.name;
    await user.destroy();

    console.log(`🗑️ User deleted: ${userName} (ID: ${id})`);
    res.json({ message: `L'utilisateur ${userName} a été supprimé avec succès.` });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: err.message });
  }
};
