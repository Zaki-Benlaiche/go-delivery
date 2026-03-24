const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: '/default-product.png',
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'General',
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Product;
