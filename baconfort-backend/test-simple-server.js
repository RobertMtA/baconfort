const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5005;

// CORS simple
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  console.log('✅ Health check recibido');
  res.json({ status: 'OK', message: 'Server is running', port: PORT });
});

// Test reviews endpoint
app.get('/api/reviews/admin', (req, res) => {
  console.log('✅ Reviews admin endpoint recibido');
  console.log('Headers:', req.headers);
  res.json({ 
    success: true, 
    message: 'Reviews endpoint working',
    data: []
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Reviews test: http://localhost:${PORT}/api/reviews/admin`);
});
