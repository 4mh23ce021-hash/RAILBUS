require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'railbus_fallback_jwt_secret_dev_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Demo Admin
  DEMO_ADMIN_EMAIL: process.env.DEMO_ADMIN_EMAIL || 'admin@railbus.demo',
  DEMO_ADMIN_PASSWORD: process.env.DEMO_ADMIN_PASSWORD || 'RailBus@Admin2026',

  // RailRadar API
  RAILRADAR_API_KEY: process.env.RAILRADAR_API_KEY || '',
  RAILRADAR_BASE_URL: process.env.RAILRADAR_BASE_URL || 'https://railradar.in/api/v1',
  RAILRADAR_MODE: process.env.RAILRADAR_MODE || 'simulated',

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_RAILBUS_DEV',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'test_secret_dev_key_2026',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_railbus_dev_test',
  RAZORPAY_MODE: process.env.RAZORPAY_MODE || 'test',

  // Client
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
};

module.exports = env;
