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

// Boot-time migrations for the vendor-role split. Two passes:
//
//   1. Widen the Postgres ENUM. Sequelize.sync() does NOT add values to an
//      existing ENUM — it only creates one the first time. So a fresh insert
//      of role='superette' against a DB created before this feature fails
//      with `invalid input value for enum`, the catch returns 500, and the
//      user falls back to role='client'. ALTER TYPE ... ADD VALUE IF NOT
//      EXISTS is the supported widening op and is idempotent.
//
//   2. Lift legacy users from role='restaurant'+Restaurant.type='superette'
//      (or boucherie) to the dedicated role. The kind used to live only on
//      Restaurant.type; now it's a first-class user role so the dashboard
//      router can pick the right UI without joining Restaurant.
//
// Both passes are postgres-only — SQLite (dev) defines ENUMs as plain CHECK
// constraints which Sequelize already keeps in sync via the model definition.
async function migrateLegacyVendorRoles() {
  const dialect = sequelize.getDialect();
  if (dialect !== 'postgres') return;

  // Widen ENUM. ALTER TYPE ... ADD VALUE cannot run inside a transaction
  // block on older PG, so call it directly. Wrap each one because we don't
  // want a single failure (e.g. value already exists on PG < 9.6 without
  // IF NOT EXISTS support) to abort the second add.
  for (const role of ['superette', 'boucherie']) {
    try {
      await sequelize.query(`ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS '${role}'`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[migrate] enum widen %s skipped:', role, err.message);
    }
  }

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
    // eslint-disable-next-line no-console
    console.log('[migrate] vendor-role lift: superette=%s boucherie=%s', supRes?.rowCount ?? 0, boucRes?.rowCount ?? 0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migrate] vendor-role lift skipped:', err.message);
  }
}

module.exports = { sequelize, User, Restaurant, Product, Order, OrderItem, Place, Reservation, migrateLegacyVendorRoles };
