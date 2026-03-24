const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { sequelize, User, Restaurant, Product } = require('./models');
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', require('./routes/orderRoutes')(io));

// Socket.io
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`❌ Client disconnected: ${socket.id}`));
});

// Seed Data for Development
const seedDatabase = async () => {
  const userCount = await User.count();
  if (userCount > 0) return;

  console.log('🌱 Seeding database...');

  // Create restaurant owners
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

  // Create a test client
  await User.create({ name: 'Client Test', email: 'client@go.com', password: 'password123', role: 'client', phone: '0660000001' });

  // Create a test driver
  await User.create({ name: 'Driver Mohamed', email: 'driver@go.com', password: 'password123', role: 'driver', phone: '0770000001' });

  console.log('✅ Seed data created successfully!');
};

// Start Server
const PORT = process.env.PORT || 3001;

sequelize.sync({ force: false }).then(async () => {
  await seedDatabase();
  server.listen(PORT, () => {
    console.log(`🚀 GO-DELIVERY Backend running on http://localhost:${PORT}`);
  });
});
