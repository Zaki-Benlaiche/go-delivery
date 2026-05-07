const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'accepted',
      'preparing',
      'ready',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ),
    defaultValue: 'pending',
  },
  total: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  deliveryFee: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  deliveryAddress: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  // Free-text list for superette/boucherie orders. When set, the order has
  // no menu items — the driver reads this list, shops, and fills `total`
  // with the receipt amount before confirming delivery.
  shoppingList: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['status'] },
    { fields: ['customerId'] },
    { fields: ['driverId'] },
    { fields: ['restaurantId'] },
    { fields: ['status', 'driverId'] },
  ],
});

module.exports = Order;
