const { User, Restaurant, Order, Product, Place } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

const parsePagination = (req, defaultLimit = 100, maxLimit = 500) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || defaultLimit, 1), maxLimit);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  return { limit, offset };
};

// 60s in-memory cache for the admin overview. The dashboard polls it on every
// tab focus; recomputing four COUNT/SUM aggregates per visit is wasted CPU on
// the free dyno. Invalidates implicitly when its TTL expires.
let statsCache = { data: null, expiresAt: 0 };
const STATS_TTL_MS = 60_000;

exports.getStats = asyncHandler(async (req, res) => {
  const now = Date.now();
  if (statsCache.data && statsCache.expiresAt > now) {
    return res.json(statsCache.data);
  }

  const [userCount, restaurantCount, orderCount, totalRevenue] = await Promise.all([
    User.count(),
    Restaurant.count(),
    Order.count(),
    Order.sum('total'),
  ]);

  const payload = {
    users: userCount,
    restaurants: restaurantCount,
    orders: orderCount,
    revenue: totalRevenue || 0,
  };
  statsCache = { data: payload, expiresAt: now + STATS_TTL_MS };
  res.json(payload);
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req);
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });
  res.json(users);
});

exports.getAllRestaurants = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req);
  const restaurants = await Restaurant.findAll({
    include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });
  res.json(restaurants);
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req);
  const orders = await Order.findAll({
    include: [
      { model: User, as: 'customer', attributes: ['name'] },
      { model: Restaurant, as: 'restaurant', attributes: ['name'] },
      { model: User, as: 'driver', attributes: ['name'] }
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });
  res.json(orders);
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (parseInt(id, 10) === req.user.id) {
    return res.status(400).json({ message: 'You cannot change your own role.' });
  }

  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const oldRole = user.role;
  user.role = role;
  await user.save();

  // Auto-create Restaurant or Place when role changes to those types
  if (role === 'restaurant' && oldRole !== 'restaurant') {
    const existing = await Restaurant.findOne({ where: { userId: user.id } });
    if (!existing) {
      await Restaurant.create({ name: `${user.name}'s Restaurant`, userId: user.id });
    }
  }

  if (role === 'place' && oldRole !== 'place') {
    const existing = await Place.findOne({ where: { userId: user.id } });
    if (!existing) {
      await Place.create({ name: user.name, type: 'other', address: '', description: '', icon: '🏢', userId: user.id });
    }
  }

  // Invalidate the stats cache since a role flip changes the per-role counts
  // the admin overview shows.
  statsCache.expiresAt = 0;
  res.json({ message: `User ${user.name} is now ${role}.`, user: { id: user.id, name: user.name, role: user.role } });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (parseInt(id, 10) === req.user.id) {
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

  req.log?.info({ userId: id, userName }, 'admin: user deleted');
  statsCache.expiresAt = 0;
  res.json({ message: `L'utilisateur ${userName} a été supprimé avec succès.` });
});
