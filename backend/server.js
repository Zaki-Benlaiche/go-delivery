const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { sequelize, User, Restaurant, Product, Place } = require('./models');
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();
const server = http.createServer(app);

// NOTE: In production, origin should be Restricted to the Frontend URL
// e.g., const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL } });
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors()); // TODO: Restrict for production
app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 image payloads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', require('./routes/orderRoutes')(io));
app.use('/api/admin', adminRoutes);
app.use('/api', reservationRoutes);

// Socket.io
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`❌ Client disconnected: ${socket.id}`));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Seed Data for Development
const seedDatabase = async () => {
  try {
    const userCount = await User.count();
    const restaurantCount = await Restaurant.count();

    if (userCount > 0 && restaurantCount > 0) {
      console.log('✅ Database already seeded.');
      return;
    }

    console.log('🌱 Seeding database...');

    // Create admin user if not exists
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      await User.create({ name: 'Admin Go', email: 'admin@go.com', password: 'password123', role: 'admin', phone: '0555555555' });
    }

    // Create restaurant owners if not exists
    const owners = await User.findAll({ where: { role: 'restaurant' } });
    if (owners.length === 0) {
      const owner1 = await User.create({ name: 'Ahmed Pizzeria', email: 'pizza@go.com', password: 'password123', role: 'restaurant', phone: '0550000001' });
      const owner2 = await User.create({ name: 'Karim Burger', email: 'burger@go.com', password: 'password123', role: 'restaurant', phone: '0550000002' });
      const owner3 = await User.create({ name: 'Youcef Tacos', email: 'tacos@go.com', password: 'password123', role: 'restaurant', phone: '0550000003' });

      // Create restaurants
      const r1 = await Restaurant.create({ name: 'Pizza Palace', description: 'Best pizza in town!', image: '🍕', address: 'Rue Didouche Mourad, Algiers', userId: owner1.id });
      const r2 = await Restaurant.create({ name: 'Burger Empire', description: 'Premium burgers & fries', image: '🍔', address: 'Boulevard Hassan, Oran', userId: owner2.id });
      const r3 = await Restaurant.create({ name: 'Tacos El Rey', description: 'Authentic tacos & wraps', image: '🌮', address: 'Centre Ville, Constantine', userId: owner3.id });

      // Create products
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

    // Create test client if not exists
    const client = await User.findOne({ where: { role: 'client' } });
    if (!client) {
      await User.create({ name: 'Client Test', email: 'client@go.com', password: 'password123', role: 'client', phone: '0660000001' });
    }

    // Create test driver if not exists
    const driver = await User.findOne({ where: { role: 'driver' } });
    if (!driver) {
      await User.create({ name: 'Driver Mohamed', email: 'driver@go.com', password: 'password123', role: 'driver', phone: '0770000001' });
    }

    // Seed Places + Place Owner Accounts for Reservation Feature
    const placeCount = await Place.count();
    if (placeCount === 0) {
      // Create place owner accounts
      const drKarim = await User.create({ name: 'Dr. Karim', email: 'drkarim@go.com', password: 'password123', role: 'place', phone: '0555100001' });
      const drSarah = await User.create({ name: 'Dr. Sarah', email: 'drsarah@go.com', password: 'password123', role: 'place', phone: '0555100002' });
      const clinique = await User.create({ name: 'Clinique El Shifa', email: 'clinique@go.com', password: 'password123', role: 'place', phone: '0555100003' });
      const apc = await User.create({ name: 'APC Mairie', email: 'apc@go.com', password: 'password123', role: 'place', phone: '0555100004' });
      const poste = await User.create({ name: 'Algérie Poste', email: 'poste@go.com', password: 'password123', role: 'place', phone: '0555100005' });

      // Create places linked to owners
      await Place.bulkCreate([
        { name: 'Dr. Karim - Cardiologue', type: 'doctor', address: 'Centre Ville', description: 'Consultation cardiologie', icon: '🩺', userId: drKarim.id },
        { name: 'Dr. Sarah - Dentiste', type: 'doctor', address: 'El Kodia', description: 'Soins dentaires', icon: '🦷', userId: drSarah.id },
        { name: 'Clinique El Shifa', type: 'clinic', address: 'Route Nationale', description: 'Urgences et consultations', icon: '🏥', userId: clinique.id },
        { name: 'APC - Mairie (Etat Civil)', type: 'government', address: 'Place Centrale', description: 'Documents administratifs', icon: '🏢', userId: apc.id },
        { name: 'Algérie Poste', type: 'other', address: 'Boulevard Principal', description: 'Retrait et versement', icon: '📮', userId: poste.id },
      ]);
    }

    console.log('✅ Seed data check/creation successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

// Start Server
const PORT = process.env.PORT || 3001;

sequelize.sync({ force: false }).then(async () => {
  await seedDatabase();
  server.listen(PORT, () => {
    console.log(`🚀 GO-DELIVERY Backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to sync database:', err);
});

