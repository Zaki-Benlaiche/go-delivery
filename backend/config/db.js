const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  // Production: PostgreSQL via a pgbouncer-style pooled URL (Supabase/Neon).
  // The provider already pools server-side, so we keep our app-side pool small —
  // every connection from this process consumes one of the pooled slots, and
  // exhausting them stalls every other instance sharing the database.
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
      // Hard ceiling on any single query. A runaway scan can't pin a worker
      // forever — the connection is killed and returned to the pool.
      statement_timeout: 8000,
      // If a transaction sits idle (e.g. client crashed mid-flow), reclaim
      // the connection instead of letting it block the pool.
      idle_in_transaction_session_timeout: 10000,
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 5,
      min: 0,
      acquire: 10000, // wait at most 10s for a free connection before failing fast
      idle: 10000,
      evict: 5000,
    },
    logging: false,
    benchmark: false,
    define: {
      timestamps: true,
      paranoid: false,
    },
  });
} else {
  // Local development: SQLite fallback — single-file, no setup.
  const path = require('path');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false,
  });
}

module.exports = sequelize;
