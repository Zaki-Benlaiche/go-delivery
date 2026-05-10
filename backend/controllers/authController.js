const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Restaurant, Place } = require('../models');
const { SECRET } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../lib/logger');

const TOKEN_TTL = '7d';
const ALLOWED_ROLES = new Set(['client', 'restaurant', 'driver', 'place']);
const ALLOWED_RESTAURANT_TYPES = new Set(['restaurant', 'superette', 'boucherie']);

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: TOKEN_TTL });

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, restaurantType } = req.body;
  const safeRole = ALLOWED_ROLES.has(role) ? role : 'client';

  // Skip the duplicate findOne — the unique constraint catches it in the
  // INSERT path with a single round-trip instead of two.
  let user;
  try {
    user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      phone: phone || '',
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    throw err;
  }

  // Side-entity creation runs in parallel where possible; today only one of
  // these branches fires, but Promise.all keeps the structure ready for a
  // future "restaurant + place owner" hybrid role.
  if (safeRole === 'restaurant') {
    const safeType = ALLOWED_RESTAURANT_TYPES.has(restaurantType) ? restaurantType : 'restaurant';
    await Restaurant.create({
      name: `${name}'s Shop`,
      userId: user.id,
      type: safeType,
    });
  } else if (safeRole === 'place') {
    await Place.create({
      name,
      type: 'other',
      address: '',
      description: 'Nouvel établissement',
      icon: '🏢',
      userId: user.id,
    });
  }

  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Constant-time comparison branch: always run bcrypt even when the user
  // is missing, so attackers can't distinguish "no such email" from "wrong
  // password" via timing.
  const user = await User.findOne({ where: { email } });
  const hash = user?.password || '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi';
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
  }

  res.json({ token: signToken(user), user: publicUser(user) });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Restaurant, as: 'restaurant' }],
  });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
});

// Eslint guard — keep `logger` referenced for future controller-level audit logs
void logger;
