const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./config/database');
const redis = require('./config/redis');

// Routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const customerRoutes = require('./routes/customers');
const chatRoutes = require('./routes/chat');
const campaignRoutes = require('./routes/campaigns');
const settingsRoutes = require('./routes/settings');
const analyticsRoutes = require('./routes/analytics');

// Middleware
const { authenticate } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { validateInput } = require('./middleware/validation');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);

// Health Check
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Check Redis connection
    await redis.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', authenticate, bookingRoutes);
app.use('/api/v1/customers', authenticate, customerRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/campaigns', authenticate, campaignRoutes);
app.use('/api/v1/settings', authenticate, settingsRoutes);
app.use('/api/v1/analytics', authenticate, analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.url,
    method: req.method
  });
});

// Error Handling
app.use(errorHandler);

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await db.close();
    await redis.quit();
    process.exit(0);
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 MndAI Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔐 CORS origin: ${process.env.CORS_ORIGIN}`);
});

module.exports = app;
