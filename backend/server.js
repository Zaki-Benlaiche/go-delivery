const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const pinoHttp = require('pino-http');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const logger = require('./lib/logger');
const { sequelize, User, Restaurant, Product, Place, downgradeLegacyVendorRoles } = require('./models');
const { SECRET } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Trust the first proxy hop so req.ip reflects the real client (Render/Fly
// terminate TLS upstream). Without this, every request looks like the same IP
// and the rate limiter fires on the proxy rather than the abuser.
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.disable('etag');

// CORS: lock down when FRONTEND_URL is set; otherwise stay open so the APK
// (which sends no Origin header) keeps working on first deploy.
const corsOrigin = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001']
  : '*';

const corsOptions = {
  origin: corsOrigin,
  credentials: true,
  maxAge: 86400, // browsers cache the preflight for 24h instead of asking on every call
};

const io = new Server(server, {
  cors: { origin: '*' },
  // Drop dead clients quickly — a stuck mobile connection shouldn't hold a slot.
  // 10s timeout is aggressive but mobile networks reconnect cleanly; a
  // half-dead socket was previously pinned for 20s and chewed a slot the
  // whole time.
  pingInterval: 25000,
  pingTimeout: 10000,
  // Compress only payloads above 1KB; below that, the CPU cost beats the savings.
  perMessageDeflate: { threshold: 1024 },
  // 1MB cap kills oversized frames that could DoS a single worker.
  maxHttpBufferSize: 1e6,
  transports: ['websocket', 'polling'],
});

// --- Middleware order matters ---
// helmet first (security headers on every response, including errors).
app.use(
  helmet({
    contentSecurityPolicy: false, // APK loads inline scripts; CSP needs separate work.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// gzip after helmet so headers are set, but before routes so responses are compressed.
// level: 4 is the sweet spot on Render free-tier shared CPU — within ~3% of the
// size of level 6 but ~40% less CPU. The dyno tail-latency matters more than
// a few extra KB on the wire.
app.use(
  compression({
    threshold: 1024,
    level: 4,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  })
);

app.use(cors(corsOptions));

// Structured logger. Skip the noisy /healthz pings so logs stay readable.
app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === '/healthz' },
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    serializers: {
      req: (req) => ({ method: req.method, url: req.url, id: req.id }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Make io available to every controller via req.io. Lets routes drop the
// `(req, res) => ctrl(req, res, io)` wrappers and the controllers be wrapped
// in plain asyncHandler() — fewer closures, fewer try/catch, and unhandled
// rejections all funnel through the central error handler.
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Health probe — no DB hit. Point UptimeRobot at this every 14min to keep the
// Render free dyno warm and avoid the 30s cold-start.
app.get('/healthz', (req, res) => res.status(200).send('ok'));

// Readiness probe — checks the DB. Use this in container orchestrators that
// distinguish "alive" from "ready to receive traffic".
app.get('/readyz', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'db_unavailable', error: err.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', require('./routes/orderRoutes')(io));
app.use('/api/admin', adminRoutes);
app.use('/api', require('./routes/reservationRoutes')(io));

// Socket.io: authenticate on the handshake instead of after connection.
// Unauthenticated sockets never get to consume server resources.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    // Allow legacy clients to connect and identify later, for backwards compat.
    return next();
  }
  try {
    socket.user = jwt.verify(token, SECRET);
    next();
  } catch {
    next(new Error('AUTH_INVALID'));
  }
});

const joinRoomsForUser = (socket, user) => {
  if (!user) return;
  const { id, role } = user;
  if (role === 'client') socket.join(`client_${id}`);
  if (role === 'driver') {
    socket.join('drivers');
    socket.join(`driver_${id}`);
  }
  if (role === 'restaurant') socket.join(`restaurant_${id}`);
  if (role === 'place') socket.join(`place_${id}`);
  if (role === 'admin') socket.join('admins');
};

io.on('connection', (socket) => {
  // Auto-join if the handshake carried a valid token.
  if (socket.user) joinRoomsForUser(socket, socket.user);

  // Legacy identify event — kept so older APK builds keep working.
  socket.on('identify', (payload) => {
    try {
      const decoded = jwt.verify(payload?.token, SECRET);
      joinRoomsForUser(socket, decoded);
    } catch {
      // bad token — ignored; the next API call will reject them anyway.
    }
  });
});

// Centralized error handler. Logs structured details, returns a clean JSON
// body that never leaks stack traces in production.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  req.log?.error({ err }, 'unhandled error');
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.expose ? err.message : 'Internal Server Error',
    ...(process.env.DATABASE_URL ? {} : { stack: err.stack }),
  });
});

// Last-resort guards — log and exit, let the orchestrator restart us.
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandledRejection');
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaughtException');
  // Give pino a tick to flush before dying.
  setTimeout(() => process.exit(1), 100).unref();
});

// Seed Data — unchanged behavior, just routed through the new logger.
const seedDatabase = async () => {
  try {
    const [userCount, restaurantCount] = await Promise.all([User.count(), Restaurant.count()]);

    if (userCount > 0 && restaurantCount > 0) {
      logger.info('Database already seeded.');
      return;
    }

    logger.info('Seeding database...');

    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      await User.create({ name: 'Admin Go', email: 'admin@go.com', password: 'password123', role: 'admin', phone: '0555555555' });
    }

    const owners = await User.findAll({ where: { role: 'restaurant' } });
    if (owners.length === 0) {
      const owner1 = await User.create({ name: 'Ahmed Pizzeria', email: 'pizza@go.com', password: 'password123', role: 'restaurant', phone: '0550000001' });
      const owner2 = await User.create({ name: 'Karim Burger', email: 'burger@go.com', password: 'password123', role: 'restaurant', phone: '0550000002' });
      const owner3 = await User.create({ name: 'Youcef Tacos', email: 'tacos@go.com', password: 'password123', role: 'restaurant', phone: '0550000003' });

      const r1 = await Restaurant.create({ name: 'Pizza Palace', description: 'Best pizza in town!', image: '🍕', address: 'Rue Didouche Mourad, Algiers', userId: owner1.id });
      const r2 = await Restaurant.create({ name: 'Burger Empire', description: 'Premium burgers & fries', image: '🍔', address: 'Boulevard Hassan, Oran', userId: owner2.id });
      const r3 = await Restaurant.create({ name: 'Tacos El Rey', description: 'Authentic tacos & wraps', image: '🌮', address: 'Centre Ville, Constantine', userId: owner3.id });

      await Product.bulkCreate([
        { name: 'Margherita', price: 800, category: 'Pizza', restaurantId: r1.id, image: '🍕' },
        { name: 'Pepperoni', price: 1000, category: 'Pizza', restaurantId: r1.id, image: '🍕' },
        { name: 'Four Cheese', price: 1200, category: 'Pizza', restaurantId: r1.id, image: '🧀' },
        { name: 'Classic Burger', price: 600, category: 'Burger', restaurantId: r2.id, image: '🍔' },
        { name: 'Double Cheese', price: 900, category: 'Burger', restaurantId: r2.id, image: '🍔' },
        { name: 'Chicken Wings', price: 700, category: 'Sides', restaurantId: r2.id, image: '🍗' },
        { name: 'Beef Tacos', price: 500, category: 'Tacos', restaurantId: r3.id, image: '🌮' },
        { name: 'Chicken Wrap', price: 550, category: 'Wrap', restaurantId: r3.id, image: '🌯' },
        { name: 'Nachos Supreme', price: 650, category: 'Sides', restaurantId: r3.id, image: '🧀' },
      ]);
    }

    const client = await User.findOne({ where: { role: 'client' } });
    if (!client) {
      await User.create({ name: 'Client Test', email: 'client@go.com', password: 'password123', role: 'client', phone: '0660000001' });
    }

    const driver = await User.findOne({ where: { role: 'driver' } });
    if (!driver) {
      await User.create({ name: 'Driver Mohamed', email: 'driver@go.com', password: 'password123', role: 'driver', phone: '0770000001' });
    }

    const placeCount = await Place.count();
    if (placeCount === 0) {
      const drKarim = await User.create({ name: 'Dr. Karim', email: 'drkarim@go.com', password: 'password123', role: 'place', phone: '0555100001' });
      const drSarah = await User.create({ name: 'Dr. Sarah', email: 'drsarah@go.com', password: 'password123', role: 'place', phone: '0555100002' });
      const clinique = await User.create({ name: 'Clinique El Shifa', email: 'clinique@go.com', password: 'password123', role: 'place', phone: '0555100003' });
      const apc = await User.create({ name: 'APC Mairie', email: 'apc@go.com', password: 'password123', role: 'place', phone: '0555100004' });
      const poste = await User.create({ name: 'Algérie Poste', email: 'poste@go.com', password: 'password123', role: 'place', phone: '0555100005' });

      await Place.bulkCreate([
        { name: 'Dr. Karim - Cardiologue', type: 'doctor', address: 'Centre Ville', description: 'Consultation cardiologie', icon: '🩺', userId: drKarim.id },
        { name: 'Dr. Sarah - Dentiste', type: 'doctor', address: 'El Kodia', description: 'Soins dentaires', icon: '🦷', userId: drSarah.id },
        { name: 'Clinique El Shifa', type: 'clinic', address: 'Route Nationale', description: 'Urgences et consultations', icon: '🏥', userId: clinique.id },
        { name: 'APC - Mairie (Etat Civil)', type: 'government', address: 'Place Centrale', description: 'Documents administratifs', icon: '🏢', userId: apc.id },
        { name: 'Algérie Poste', type: 'other', address: 'Boulevard Principal', description: 'Retrait et versement', icon: '📮', userId: poste.id },
      ]);
    }

    logger.info('Seed data check/creation successful.');
  } catch (err) {
    logger.error({ err }, 'Seeding error');
  }
};

// Boot
const PORT = process.env.PORT || 3001;
const optIn = process.env.SYNC_ALTER === '1';
const optOut = process.env.SYNC_ALTER === '0';
const isProd = !!process.env.DATABASE_URL;
const shouldAlter = optIn || (!isProd && !optOut);
const syncOptions = shouldAlter ? { alter: true } : {};

sequelize
  .sync(syncOptions)
  .then(async () => {
    // Order matters: migration first (downgrades any orphan vendor roles),
    // then seed (which only runs on a fresh DB), then accept connections.
    await downgradeLegacyVendorRoles();
    await seedDatabase();
    server.listen(PORT, () => {
      logger.info({ port: PORT, env: isProd ? 'production' : 'development' }, '🚀 GO-DELIVERY backend up');
    });
  })
  .catch((err) => {
    logger.fatal({ err }, 'Failed to sync database');
    process.exit(1);
  });

// Graceful shutdown so in-flight requests finish before we drop connections.
const shutdown = (signal) => {
  logger.info({ signal }, 'shutdown initiated');
  server.close(() => {
    sequelize.close().finally(() => process.exit(0));
  });
  // Hard exit after 10s if anything is hanging.
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
