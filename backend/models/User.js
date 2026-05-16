const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  role: {
    // 'superette' and 'boucherie' are first-class roles (not Restaurant subtypes
    // any more) so the auth flow can route them straight to their own dashboard
    // and the shopping-list ordering UX without going through restaurant menus.
    // Legacy users that registered as 'restaurant' + Restaurant.type='superette'
    // are migrated by models/index.js on the next sync.
    type: DataTypes.ENUM('client', 'restaurant', 'driver', 'place', 'admin', 'superette', 'boucherie'),
    allowNull: false,
    defaultValue: 'client',
  },
});

// Native bcrypt offloads to libuv's thread pool, so concurrent hashes don't
// freeze the event loop the way bcryptjs (pure JS) did. Cost 10 is the OWASP
// floor and is fast enough on native (~60ms) — the tail latency stays bounded
// even under registration spikes because hashing happens off the main thread.
const HASH_COST = 10;

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, HASH_COST);
});

// Re-hash on password change (admin-set or self-service) so update flows
// don't accidentally store plaintext.
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, HASH_COST);
  }
});

module.exports = User;
