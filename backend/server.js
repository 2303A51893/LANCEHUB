
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const { User } = require('./models');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const bidRoutes = require('./routes/bidRoutes');
const contractRoutes = require('./routes/contractRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const seedDatabase = require('./seeders/seedData');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Freelancer Platform API',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDatabase();

    // Check whether MongoDB contains users
    const userCount = await User.countDocuments();

    if (userCount === 0 || process.env.FORCE_SEED === 'true') {
      console.log('[Server] Database is empty. Seeding sample data...');
      await seedDatabase();
    }

    if (process.env.NODE_ENV !== 'test') {
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log('=======================================================');
        console.log(`LanceHub API Server running on port: ${PORT}`);
        console.log(`Health Check: http://localhost:${PORT}/api/health`);
        console.log('=======================================================');
      });

      return server;
    }
  } catch (error) {
    console.error('Failed to start server:', error);

    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }

    throw error;
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
