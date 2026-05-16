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

// Boot-time downgrade for the now-removed vendor-role split. Earlier we
// promoted 'superette' and 'boucherie' to first-class roles; that feature
// is gone. Any rows still carrying those role/type values would break the
// Sequelize ENUM validation on read, so consolidate them back to plain
// 'restaurant'. Postgres can't DROP VALUE from an existing enum without
// recreating it — the orphan values stay in the type definition, unused.
async function downgradeLegacyVendorRoles() {
  const dialect = sequelize.getDialect();
  if (dialect !== 'postgres') return;

  try {
    const [userRes] = await sequelize.query(`
      UPDATE "Users"
      SET role = 'restaurant'
      WHERE role IN ('superette', 'boucherie')
    `);
    // Restaurant.type column no longer exists in the model. If a legacy column
    // is still present in the DB, leave it — sync({alter:true}) drops it on
    // the next non-prod boot. Production runs without alter, so this is a no-op.
    // eslint-disable-next-line no-console
    console.log('[migrate] vendor-role downgrade: users=%s', userRes?.rowCount ?? 0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migrate] vendor-role downgrade skipped:', err.message);
  }
}

module.exports = { sequelize, User, Restaurant, Product, Order, OrderItem, Place, Reservation, downgradeLegacyVendorRoles };
