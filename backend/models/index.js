const sequelize = require('../config/db');
const User = require('./User');
const Restaurant = require('./Restaurant');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Place = require('./Place');
const Reservation = require('./Reservation');

// ========== ASSOCIATIONS ==========

// User (restaurant owner) -> Restaurant
User.hasOne(Restaurant, { foreignKey: 'userId', as: 'restaurant' });
Restaurant.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// Restaurant -> Products
Restaurant.hasMany(Product, { foreignKey: 'restaurantId', as: 'products' });
Product.belongsTo(Restaurant, { foreignKey: 'restaurantId' });

// User (client) -> Orders
User.hasMany(Order, { foreignKey: 'customerId', as: 'customerOrders' });
Order.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

// Restaurant -> Orders
Restaurant.hasMany(Order, { foreignKey: 'restaurantId', as: 'orders' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// User (driver) -> Orders
User.hasMany(Order, { foreignKey: 'driverId', as: 'driverOrders' });
Order.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

// Order -> OrderItems -> Product
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Reservation associations
User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Place.hasMany(Reservation, { foreignKey: 'placeId', as: 'reservations' });
Reservation.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });

// Place owner association
User.hasOne(Place, { foreignKey: 'userId', as: 'place' });
Place.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

module.exports = { sequelize, User, Restaurant, Product, Order, OrderItem, Place, Reservation };
