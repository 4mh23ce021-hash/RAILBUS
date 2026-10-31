const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');
const env = require('./config/env');

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Attach io instance to express app for access in controllers
app.set('io', io);

// Socket.IO Connection & Room Management
io.on('connection', (socket) => {
  // Client can register authenticated room
  socket.on('join_room', (data) => {
    if (!data) return;
    const { token, role, userId } = data;

    // Verify token if provided
    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        if (decoded.role === 'ADMIN') {
          socket.join('admin_room');
        } else if (decoded.role === 'CONDUCTOR') {
          socket.join('conductor_room');
        } else if (decoded.userId) {
          socket.join(`passenger:${decoded.userId}`);
        }
      } catch (err) {
        // Fallback for public room or guest
      }
    } else if (userId) {
      socket.join(`passenger:${userId}`);
    }

    if (role === 'admin') {
      socket.join('admin_room');
    }
  });

  socket.on('disconnect', () => {
    // Clean disconnection
  });
});

const PORT = env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚆 RAILBUS MOBILITY SERVER RUNNING ON PORT ${PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`🔐 Demo Admin: ${env.DEMO_ADMIN_EMAIL}`);
  console.log(`📡 WebSocket Gateway: Active`);
  console.log(`=======================================================`);
});

module.exports = { app, server, io };
