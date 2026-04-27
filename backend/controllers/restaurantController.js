const { Restaurant, Product } = require('../models');

exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { isActive: true },
      include: [{ model: Product, as: 'products', where: { isAvailable: true }, required: false }],
    });
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
