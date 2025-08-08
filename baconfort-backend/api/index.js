// SERVIDOR BACONFORT OPTIMIZADO PARA VERCEL
const express = require('express');
const cors = require('cors');

const app = express();

console.log('🚀 BACONFORT Vercel Server Starting...');

// CORS muy permisivo para Vercel
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware para OPTIONS
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    return res.status(200).end();
  }
  next();
});

// Logging simple
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Datos en memoria para Vercel
const users = [
  {
    id: 'admin-vercel',
    name: 'Admin Baconfort',
    email: 'admin@baconfort.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    role: 'admin'
  }
];

const properties = [
  {
    id: 'moldes-1680',
    title: 'Hermoso Apartamento en Palermo',
    description: 'Apartamento completamente equipado en el corazón de Palermo',
    price: 120,
    location: 'Palermo, CABA',
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    images: ['/img/img-portada-moldes-1680.jpg'],
    amenities: ['WiFi', 'Cocina', 'Aire Acondicionado']
  }
];

const reservations = [];

// ========================================
// ENDPOINTS BÁSICOS
// ========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BACONFORT VERCEL API FUNCIONANDO',
    timestamp: new Date().toISOString(),
    version: 'vercel-1.0.0'
  });
});

// API root
app.get('/api', (req, res) => {
  res.json({
    message: 'BACONFORT API - VERCEL',
    version: 'vercel-1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/register', 
      '/api/properties',
      '/api/reservations'
    ],
    timestamp: new Date().toISOString()
  });
});

// ========================================
// AUTENTICACIÓN SIMPLIFICADA
// ========================================

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Verificación simple para admin
    if (email === 'admin@baconfort.com' && password === 'admin123') {
      const user = users[0];
      const token = 'vercel_admin_token_' + Date.now();
      
      console.log('Login successful for admin');
      
      return res.json({
        success: true,
        message: 'Login exitoso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    }

    res.status(401).json({
      success: false,
      error: 'Credenciales inválidas'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, email y contraseña son requeridos'
      });
    }

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name,
      email: email.toLowerCase(),
      password: password, // En producción real, hashear
      role: 'user'
    };

    users.push(newUser);

    const token = 'vercel_user_token_' + Date.now();

    console.log('User registered:', email);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ========================================
// PROPIEDADES
// ========================================

app.get('/api/properties', (req, res) => {
  res.json({
    success: true,
    data: properties,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/properties/:id', (req, res) => {
  const property = properties.find(p => p.id === req.params.id);
  if (!property) {
    return res.status(404).json({
      success: false,
      error: 'Propiedad no encontrada'
    });
  }
  res.json({
    success: true,
    data: property,
    timestamp: new Date().toISOString()
  });
});

// ========================================
// RESERVAS
// ========================================

app.get('/api/reservations', (req, res) => {
  res.json({
    success: true,
    data: reservations,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/reservations', (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests, fullName, email, message } = req.body;
    
    if (!propertyId || !checkIn || !checkOut || !guests || !fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos'
      });
    }
    
    const newReservation = {
      id: 'res-' + Date.now(),
      propertyId,
      checkIn,
      checkOut,
      guests,
      fullName,
      email,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    reservations.push(newReservation);
    
    console.log('New reservation created:', newReservation.id);
    
    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: newReservation
    });
  } catch (error) {
    console.error('Reservation error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ========================================
// CATCH ALL Y ERROR HANDLING
// ========================================

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'BACONFORT API - VERCEL',
    version: 'vercel-1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Catch all API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    available: ['/api/health', '/api/auth/login', '/api/properties', '/api/reservations']
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Para Vercel
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
