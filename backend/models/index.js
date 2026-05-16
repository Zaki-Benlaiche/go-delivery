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

// One-shot migration: lift legacy users from role='restaurant'+type='superette'
// (or boucherie) to the dedicated role. Old clients registered as restaurant
// and the vendor kind lived only on Restaurant.type — the new auth flow treats
// the kind as a first-class role so the dashboard router can pick the right
// UI without joining Restaurant on every request.
//
// Idempotent: re-running is a no-op once the rows are flipped. Runs at boot
// after sequelize.sync(), gated by `dialect === 'postgres'` so SQLite dev
// runs don't trip the qualified column references.
async function migrateLegacyVendorRoles() {
  const dialect = sequelize.getDialect();
  if (dialect !== 'postgres') return;
  try {
    const [supRes] = await sequelize.query(`
      UPDATE "Users"
      SET role = 'superette'
      WHERE role = 'restaurant'
        AND id IN (SELECT "userId" FROM "Restaurants" WHERE type = 'superette')
    `);
    const [boucRes] = await sequelize.query(`
      UPDATE "Users"
      SET role = 'boucherie'
      WHERE role = 'restaurant'
        AND id IN (SELECT "userId" FROM "Restaurants" WHERE type = 'boucherie')
    `);
    // Sequelize returns metadata as second element; rowCount is on the metadata
    // for postgres. Logged via console (logger isn't wired here to avoid a
    // circular import — this only runs once at boot).
    // eslint-disable-next-line no-console
    console.log('[migrate] vendor-role lift: superette=%s boucherie=%s', supRes?.rowCount ?? 0, boucRes?.rowCount ?? 0);
  } catch (err) {
    // Non-fatal: if migration fails, the app still boots and admin can flip
    // roles manually via /admin/users/:id/role.
    // eslint-disable-next-line no-console
    console.warn('[migrate] vendor-role lift skipped:', err.message);
  }
}

module.exports = { sequelize, User, Restaurant, Product, Order, OrderItem, Place, Reservation, migrateLegacyVendorRoles };
