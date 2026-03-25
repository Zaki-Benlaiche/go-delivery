const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Restaurant } = require('../models');
const { SECRET } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Block admin registration from public API
    const allowedRoles = ['client', 'restaurant', 'driver'];
    const safeRole = allowedRoles.includes(role) ? role : 'client';

    const user = await User.create({ name, email, password, role: safeRole, phone: phone || '' });

    // If registering as restaurant, create a restaurant entry
    if (role === 'restaurant') {
      await Restaurant.create({
        name: `${name}'s Restaurant`,
        userId: user.id,
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });

    console.log(`✅ User registered: ${email} (${role})`);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('❌ Register error:', err.message);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    console.log(`🔐 Login attempt: ${email}`);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(404).json({ message: 'User not found.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log(`🔑 Password valid: ${valid}`);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });

    console.log(`✅ Login success: ${email} (${user.role})`);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Restaurant, as: 'restaurant' }],
    });
    res.json(user);
  } catch (err) {
    console.error('❌ GetMe error:', err.message);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
