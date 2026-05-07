const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  image: {
    type: DataTypes.TEXT,
    defaultValue: '🏪',
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Vendor type: regular restaurant (menu-based) or shopping-list shops
  // (superette/boucherie). Shopping-list shops don't see incoming orders —
  // the driver receives a free-text list and buys on the customer's behalf.
  type: {
    type: DataTypes.ENUM('restaurant', 'superette', 'boucherie'),
    allowNull: false,
    defaultValue: 'restaurant',
  },
}, {
  indexes: [
    { fields: ['userId'] },
    { fields: ['isActive'] },
    { fields: ['type'] },
  ],
});

module.exports = Restaurant;
