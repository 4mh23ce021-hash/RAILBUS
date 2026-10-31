const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const conductorRoutes = require('./routes/conductorRoutes');

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  }
});
app.use('/api/auth/passenger/login', authLimiter);
app.use('/api/auth/admin/login', authLimiter);
app.use('/api/auth/conductor/login', authLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'RAILBUS Mobility Synchronization Engine',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
    railradarMode: env.RAILRADAR_MODE,
    razorpayMode: env.RAZORPAY_MODE
  });
});

// Mount Routes strictly by domain
app.use('/api/auth', authRoutes);
app.use('/api/passenger', passengerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/conductor', conductorRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
