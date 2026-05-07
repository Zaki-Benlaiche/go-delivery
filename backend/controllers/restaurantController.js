const { Restaurant, Product } = require('../models');

// 30-second in-memory cache for the public restaurant list. The home screen
// of every customer hits this on each visit, but the data only changes when
// owners toggle isOpen or update their card — staleness up to 30s is fine.
let restaurantsCache = { data: null, expiresAt: 0 };
const RESTAURANTS_TTL_MS = 30_000;

const invalidateRestaurantsCache = () => { restaurantsCache.expiresAt = 0; };
exports.invalidateRestaurantsCache = invalidateRestaurantsCache;

// List view only needs cards (name, image, address, status). Products are fetched
// lazily by getRestaurantById when the user opens a specific restaurant — this
// avoids returning megabytes of base64 product images on the home screen.
exports.getAllRestaurants = async (req, res) => {
  try {
    const now = Date.now();
    // Tell APK/browser caches to reuse this response for up to 20s — saves the
    // network round-trip entirely on rapid re-renders of the home screen.
    res.set('Cache-Control', 'public, max-age=20');
    if (restaurantsCache.data && restaurantsCache.expiresAt > now) {
      return res.json(restaurantsCache.data);
    }

    const restaurants = await Restaurant.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description', 'image', 'address', 'isOpen', 'userId', 'type'],
      order: [['id', 'ASC']],
    });
    restaurantsCache = { data: restaurants, expiresAt: now + RESTAURANTS_TTL_MS };
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [{ model: Product, as: 'products' }],
    });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });

    await restaurant.update(req.body);
    invalidateRestaurantsCache();
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });

    const product = await Product.create({ ...req.body, restaurantId: restaurant.id });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });

    const product = await Product.findOne({ where: { id: req.params.id, restaurantId: restaurant.id } });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    await product.update(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.toggleOpenStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });

    await restaurant.update({ isOpen: !restaurant.isOpen });
    invalidateRestaurantsCache();
    res.json({ isOpen: restaurant.isOpen });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });

    const product = await Product.findOne({ where: { id: req.params.id, restaurantId: restaurant.id } });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    await product.destroy();
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
