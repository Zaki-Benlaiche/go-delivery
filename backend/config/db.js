const { Sequelize } = require('sequelize');
const dns = require('dns');

// Fix for Supabase IPv6 resolution
dns.setDefaultResultOrder('verbatim');

let sequelize;

if (process.env.DATABASE_URL) {
  // Production: PostgreSQL (Supabase)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  });
} else {
  // Local development: SQLite fallback
  const path = require('path');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false,
  });
}

module.exports = sequelize;
