const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5005;

console.log('🚀 MINI SERVER - Testing port 5005...');
console.log('📊 Port:', PORT);

// Simple CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  console.log('🔍 Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Mini server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Test route for properties
app.get('/api/properties', (req, res) => {
  console.log('🏠 Properties requested');
  res.json({ 
    success: true,
    data: [],
    message: 'Test endpoint - no real data',
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mini server running on port ${PORT}`);
  console.log('🌍 Host: 0.0.0.0');
  console.log(`🔍 Test URL: http://localhost:${PORT}/api/health`);
  console.log('✅ Server ready');
});

// Keep alive interval
setInterval(() => {
  console.log('💓 Server heartbeat - still alive');
}, 30000);

// Error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

console.log('🔄 Server startup complete');
