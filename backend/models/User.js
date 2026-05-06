const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

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
    type: DataTypes.ENUM('client', 'restaurant', 'driver', 'place', 'admin'),
    allowNull: false,
    defaultValue: 'client',
  },
});

// Hash password before saving. Cost 8 (instead of 10) on shared-CPU free tier:
// each hash drops from ~120ms to ~30ms, so concurrent logins don't pile up
// behind each other on the single Node event loop.
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 8);
});

module.exports = User;
