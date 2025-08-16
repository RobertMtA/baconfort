const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('./models/User');
// Fix CORS para desarrollo (opcional)
const fixCorsForDevelopment = process.env.ENABLE_CORS_FIX === 'true' 
  ? require('./utils/fixCorsForDevelopment')
  : null;
// Importar rutas
const propertiesRoutes = require('./routes/properties');
const reservationsRoutes = require('./routes/reservations');
const subscribersRoutes = require('./routes/subscribers');
require('dotenv').config();

console.log('🔧 DOTENV: Directorio actual:', process.cwd());
console.log('🔧 DOTENV: Archivo server.js desde:', __dirname);
console.log('🔧 DOTENV: Token MercadoPago:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'Configurado' : 'NO CONFIGURADO');

const app = express();
// Railway asigna automáticamente el puerto en producción
const PORT = process.env.PORT || 5004;

console.log('🚀 BACONFORT Server Starting...');
console.log('📊 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? 'CONFIGURADO' : 'NO CONFIGURADO');
console.log('📧 EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'CONFIGURADO' : 'NO CONFIGURADO');
console.log('📧 ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? 'CONFIGURADO' : 'NO CONFIGURADO');
console.log('📧 EMAIL_USER valor:', process.env.EMAIL_USER);
console.log('📧 ADMIN_EMAIL valor:', process.env.ADMIN_EMAIL);

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('📸 Static files served from:', path.join(__dirname, 'uploads'));

// CORS configuration
const corsOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5173',
  'https://baconfort.netlify.app',
  'https://olive-magpie-874253.hostingersite.com',
  'https://plum-mink-823732.hostingersite.com', // Tu nuevo dominio Hostinger
  'https://confort-ba.web.app' // Firebase Hosting URL
];

// Agregar orígenes del .env si están configurados
if (process.env.FRONTEND_URL) {
  corsOrigins.push(process.env.FRONTEND_URL);
}

if (process.env.CORS_ORIGIN) {
  corsOrigins.push(...process.env.CORS_ORIGIN.split(','));
}

// Si está habilitado el fix CORS para desarrollo, aplicarlo
if (fixCorsForDevelopment) {
  fixCorsForDevelopment(app);
} else {
  // Configuración CORS normal para producción
  app.use(cors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origin (aplicaciones móviles, Postman, enlaces directos, etc.)
      if (!origin) {
        console.log('✅ CORS: Allowing request without origin (direct access/email links)');
        return callback(null, true);
      }
      
      // Verificar si el origin está en la lista permitida
      if (corsOrigins.filter(Boolean).includes(origin)) {
        console.log('✅ CORS: Allowing whitelisted origin:', origin);
        return callback(null, true);
      }
    
      console.log('❌ CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept',
      'Cache-Control', 
      'Pragma', 
      'Expires',
      'X-Requested-With',
      'x-admin-access',
      'x-admin-emergency-token',
      'x-token-override'
    ],
    optionsSuccessStatus: 204 // 204 en lugar de 200 para navegadores compatibles con preflight
  }));
}

// Basic middleware with larger limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Endpoint de healthcheck para Railway (añadido al inicio para asegurar que esté disponible)
app.get('/api/health', (req, res) => {
  console.log('✅ Healthcheck endpoint called');
  res.status(200).json({
    status: 'ok',
    message: 'BACONFORT API running',
    timestamp: new Date().toISOString()
  });
});

// Endpoints simples de healthcheck 
app.get('/health', (req, res) => {
  console.log('✅ Root healthcheck endpoint called at /health');
  res.status(200).json({ status: 'ok' });
});

// Endpoint en la raíz para verificación básica
app.get('/', (req, res) => {
  console.log('✅ Root endpoint called');
  res.status(200).json({ 
    status: 'ok',
    message: 'BACONFORT API Server is running',
    documentation: '/api/docs',
    healthCheck: '/health',
    version: '1.0.0'
  });
});

// Endpoint para verificar información del servidor
app.get('/api/server-info', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    backendUrl: process.env.BACKEND_URL || 'Not configured',
    frontendUrl: process.env.FRONTEND_URL || 'Not configured',
    mongodbConnected: mongoose.connection.readyState === 1,
    corsOrigins: corsOrigins.filter(origin => origin !== undefined),
    timestamp: new Date().toISOString()
  });
});

// Middleware adicional para manejar OPTIONS requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma, Expires, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

// Global request logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url} - Headers:`, {
    authorization: req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'none',
    'content-type': req.headers['content-type']
  });
  next();
});

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️ No MONGODB_URI provided, using demo mode');
      return;
    }
    
    console.log('🔄 Connecting to MongoDB...');
    // Configuración para evitar advertencias de Mongoose y mejorar estabilidad
    mongoose.set('strictQuery', false);
    
    // Establecemos un timeout más corto para evitar bloquear la inicialización
    const connectPromise = mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: false, // Evita la advertencia de índices duplicados
      serverSelectionTimeoutMS: 5000, // Timeout más corto para selección de servidor
      socketTimeoutMS: 30000, // Timeout para operaciones de socket
      connectTimeoutMS: 5000, // Timeout más corto para conexión inicial
      maxPoolSize: 10, // Mantener hasta 10 conexiones en el pool
      minPoolSize: 2, // Mantener al menos 2 conexiones
      heartbeatFrequencyMS: 2000, // Verificar estado cada 2 segundos
      retryWrites: true,
      retryReads: true,
      bufferCommands: true // Permitir consultas tempranas
    });
    
    // Usamos Promise.race para evitar esperar demasiado
    await Promise.race([
      connectPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 5000)
      )
    ]);
    
    console.log('✅ Connected to MongoDB');
    
    // Manejar eventos de conexión
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔄 Running in demo mode without database');
  }
};

// Email transporter configuration
let emailTransporter = null;

const setupEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('⚠️ Email credentials not provided, running in demo mode');
    return;
  }

  try {
    emailTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    // Verificar conexión
    emailTransporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter error:', error.message);
        emailTransporter = null;
      } else {
        console.log('✅ Email transporter ready');
      }
    });
  } catch (error) {
    console.error('❌ Error setting up email transporter:', error.message);
    emailTransporter = null;
  }
};

// Función para enviar email de bienvenida
const sendWelcomeEmail = async (userEmail, userName) => {
  if (!emailTransporter) {
    console.log('⚠️ Email transporter not available, skipping welcome email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: '¡Bienvenido/a a Baconfort! 🏠',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 15px; overflow: hidden;">
          <!-- Header con gradiente y logo -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.6;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.4;"></div>
            <div style="position: relative; z-index: 2;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.3); letter-spacing: -0.5px;">
                🏠 ¡Bienvenido/a a Baconfort!
              </h1>
              <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 18px; font-weight: 300;">
                Tu plataforma de alquileres temporales de confianza
              </p>
            </div>
          </div>
          
          <!-- Contenido principal -->
          <div style="background: white; padding: 40px 30px; margin: 0;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px 25px; border-radius: 50px; font-size: 16px; font-weight: 600; margin-bottom: 20px;">
                ✨ Cuenta creada exitosamente
              </div>
            </div>
            
            <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
              Hola ${userName}, 👋
            </h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
              ¡Gracias por registrarte en <strong style="color: #667eea;">Baconfort</strong>! Tu cuenta ha sido creada exitosamente y ya puedes comenzar a disfrutar de nuestros servicios.
            </p>
            
            <!-- Beneficios con iconos coloridos -->
            <div style="background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%); padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 5px solid #667eea;">
              <h3 style="color: #667eea; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
                <span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">🎯</span>
                ¿Qué puedes hacer ahora?
              </h3>
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);">
                  <span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; width: 35px; height: 35px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 16px;">🏠</span>
                  <span style="color: #444; font-weight: 500;">Explorar nuestras propiedades disponibles</span>
                </div>
                <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);">
                  <span style="background: linear-gradient(135deg, #10b981, #059669); color: white; width: 35px; height: 35px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 16px;">📅</span>
                  <span style="color: #444; font-weight: 500;">Hacer reservaciones fácilmente</span>
                </div>
                <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);">
                  <span style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; width: 35px; height: 35px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 16px;">👤</span>
                  <span style="color: #444; font-weight: 500;">Gestionar tu perfil y preferencias</span>
                </div>
                <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);">
                  <span style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; width: 35px; height: 35px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 16px;">🎁</span>
                  <span style="color: #444; font-weight: 500;">Recibir ofertas especiales y promociones</span>
                </div>
              </div>
            </div>
            
            <!-- Botón de acción con gradiente -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 700; display: inline-block; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; font-size: 16px; letter-spacing: 0.5px;">
                ✨ Explorar Propiedades
              </a>
            </div>
            
            <!-- Mensaje de verificación -->
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #10b981; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
              <h4 style="color: #059669; margin-bottom: 10px; font-size: 16px; font-weight: 600;">
                📧 ¡Tu correo está verificado!
              </h4>
              <p style="color: #047857; margin: 0; font-size: 14px;">
                No necesitas hacer nada más. Tu cuenta está lista para usar.
              </p>
            </div>
            
            <!-- Footer del contenido -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 25px; margin-top: 30px; text-align: center; border: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin-bottom: 15px; line-height: 1.6;">
                Si tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte.
              </p>
              <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 15px;">
                <p style="color: #1e293b; font-weight: 700; margin: 0; font-size: 16px;">
                  💜 Equipo Baconfort
                </p>
                <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0;">
                  © 2025 Baconfort - Alquileres Temporales
                </p>
              </div>
            </div>
          </div>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${userEmail}`);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return { success: false, error: error.message };
  }
};

// ========================================
// RUTAS DE AUTENTICACIÓN (DEBEN IR PRIMERO)
// ========================================
// NOTA: Los endpoints de auth están ahora en routes/auth.js

/*
// Registro real
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, error: 'El email ya está registrado' });
    }
    
    // Permitir especificar rol solo si es válido, sino usar 'guest' por defecto
    const validRoles = ['guest', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'guest';
    
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: userRole 
    });
    
    // Enviar email de bienvenida
    console.log(`📧 Sending welcome email to ${email}`);
    const emailResult = await sendWelcomeEmail(email, name);
    if (emailResult.success) {
      console.log(`✅ Welcome email sent successfully to ${email}`);
    } else {
      console.log(`⚠️ Could not send welcome email to ${email}: ${emailResult.error}`);
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'demo-secret', { expiresIn: '7d' });
    res.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: user.toPublic(),
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login real
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Faltan email o contraseña' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'demo-secret', { expiresIn: '7d' });
    user.lastLogin = new Date();
    await user.save();
    res.json({
      success: true,
      message: 'Login exitoso',
      user: user.toPublic(),
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
*/

// ========================================
// OTROS ENDPOINTS
// ========================================

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BACONFORT API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API root
app.get('/api', (req, res) => {
  res.json({
    message: 'BACONFORT API',
    version: '1.0.0',
    endpoints: ['/api/health', '/api/test', '/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/properties', '/api/reviews']
  });
});

// Helper function para manejar timeouts de MongoDB
const withTimeout = async (promise, timeoutMs = 8000, fallback = null) => {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  );
  
  try {
    return await Promise.race([promise, timeout]);
  } catch (error) {
    console.warn('⚠️ MongoDB operation failed:', error.message);
    if (fallback !== null) {
      console.log('🔄 Using fallback data');
      return fallback;
    }
    throw error;
  }
};

// Importar el proxy para rutas sin prefijo /api
console.log('🔄 SERVER: Cargando proxy de compatibilidad para rutas sin prefijo /api...');
const proxyRoutes = require('./proxy-routes');
console.log('✅ SERVER: Proxy de compatibilidad cargado exitosamente');

// Primero configuramos las redirecciones de rutas sin prefijo /api
console.log('🔄 SERVER: Registrando rutas proxy de compatibilidad...');
app.use(proxyRoutes);
console.log('✅ SERVER: Rutas proxy registradas exitosamente');

// Routes
const authRoutes = require('./routes/auth');
const promotionsRoutes = require('./routes/promotions');
const usersRoutes = require('./routes/users');
const paymentsRoutes = require('./routes/payments');
console.log('🔄 SERVER: Cargando rutas de reviews...');
const reviewsRoutes = require('./routes/reviews');
console.log('✅ SERVER: Rutas de reviews cargadas exitosamente');
console.log('🔄 SERVER: Cargando rutas de inquiries...');
const inquiriesRoutes = require('./routes/inquiries');
console.log('✅ SERVER: Rutas de inquiries cargadas exitosamente');

// Rutas API normales con prefijo /api
app.use('/api/properties', propertiesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);
console.log('🔄 SERVER: Registrando rutas de reviews en /api/reviews...');
app.use('/api/reviews', reviewsRoutes);
console.log('✅ SERVER: Rutas de reviews registradas exitosamente');
console.log('🔄 SERVER: Registrando rutas de inquiries en /api/inquiries...');
app.use('/api/inquiries', inquiriesRoutes);
console.log('✅ SERVER: Rutas de inquiries registradas exitosamente');
console.log('🔄 SERVER: Registrando rutas de subscribers en /api/subscribers...');
app.use('/api/subscribers', subscribersRoutes);
console.log('✅ SERVER: Rutas de subscribers registradas exitosamente');

// DEBUG: Endpoint especial para verificar autenticación
app.put('/api/debug/auth-test', (req, res) => {
  console.log('🔍 DEBUG - Petición recibida en /api/debug/auth-test');
  console.log('📋 Headers:', req.headers);
  console.log('🔑 Authorization:', req.headers.authorization);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('🎯 Token extraído:', token);
  
  if (token && token.startsWith('session_')) {
    console.log('✅ DEBUG - Token de sesión reconocido');
    return res.json({
      success: true,
      message: 'DEBUG: Token de sesión válido',
      token: token,
      server: 'CORRECTO - servidor principal'
    });
  }
  
  return res.status(403).json({
    success: false,
    error: 'DEBUG: Token no reconocido',
    token: token,
    server: 'CORRECTO - servidor principal'
  });
});

// Middleware de autenticación modificado para aceptar tokens de sesión
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  console.log('🔑 Server Auth middleware - Token recibido:', token ? 'SÍ' : 'NO');
  console.log('🔍 Server Token completo:', token);
  
  // Modo demo: aceptar token específico
  if (token === 'ADMIN_DEMO_TOKEN') {
    req.userId = 'admin_temp';
    req.userRole = 'admin';
    return next();
  }
  
  // Verificar tokens simples del sistema (incluyendo tokens LOCAL_)
  if (token && (token.startsWith('admin_token_') || 
      token.startsWith('BACONFORT_ADMIN_TOKEN_') ||
      token.startsWith('session_') ||
      token.startsWith('LOCAL_') ||
      token === 'admin_baconfort_2025' ||
      token === 'BACONFORT_ADMIN_2025_7D3F9K2L')) {
    console.log('✅ Server Token admin reconocido:', token.substring(0, 20) + '...');
    req.userId = 'admin_baconfort_2025';
    req.userRole = 'admin';
    return next();
  }
  
  if (!token) {
    console.log('❌ Server No token provided');
    return res.status(401).json({ success: false, error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'baconfort_jwt_secret');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    console.log('✅ Server Token JWT válido');
    next();
  } catch (error) {
    console.error('❌ Server Token inválido:', error);
    res.status(401).json({ success: false, error: 'Token inválido' });
  }
};

// Middleware solo para admin modificado
function adminOnly(req, res, next) {
  // Modo demo
  if (req.userId === 'admin_temp' || req.userRole === 'admin') {
    return next();
  }
  
  User.findById(req.userId).then(user => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Solo admin autorizado' });
    }
    next();
  }).catch(() => res.status(403).json({ success: false, error: 'Solo admin autorizado' }));
}

// Obtener usuario autenticado - COMENTADO: Se usa el endpoint en routes/auth.js
/*
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    // Para admin temporal/demo
    if (req.userId === 'admin_baconfort_2025' || req.userRole === 'admin') {
      return res.json({ 
        success: true, 
        user: {
          id: 'admin_baconfort_2025',
          email: 'baconfort.centro@gmail.com',
          role: 'admin',
          name: 'Admin BACONFORT',
          phone: '+54 11 3002-1074',
          createdAt: '2025-01-15T08:00:00.000Z'
        }
      });
    }
    
    // Para usuario BACONFORT temporal/demo
    if (req.userId === 'user_roberto_2025') {
      return res.json({ 
        success: true, 
        user: {
          id: 'user_baconfort_2025',
          email: 'baconfort.centro@gmail.com',
          role: 'user',
          name: 'Admin BACONFORT',
          phone: '+54 11 3002-1074',
          createdAt: '2025-06-15T09:30:00.000Z'
        }
      });
    }
    
    // Para usuarios regulares en base de datos
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    res.json({ success: true, user: user.toPublic() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
*/

// Recuperación de contraseña - Enviar token
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email es requerido'
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Por seguridad, siempre responder success aunque el usuario no exista
      return res.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña.'
      });
    }

    // Generar token de recuperación
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password-reset' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Intentar enviar email real
    if (emailTransporter) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: email,
          subject: 'Recuperación de contraseña - Baconfort',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🏠 Baconfort</h1>
                  <p>Recuperación de contraseña</p>
                </div>
                <div class="content">
                  <h2>Hola ${user.name},</h2>
                  <p>Recibimos una solicitud para restablecer tu contraseña en Baconfort.</p>
                  <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                  <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                  <p>O copia y pega este enlace en tu navegador:</p>
                  <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">${resetUrl}</p>
                  <p><strong>Este enlace expirará en 1 hora.</strong></p>
                  <p>Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>
                </div>
                <div class="footer">
                  <p>© 2025 Baconfort - Alquileres Temporarios</p>
                  <p>Este es un email automático, por favor no respondas.</p>
                </div>
              </div>
            </body>
            </html>
          `
        };

        await emailTransporter.sendMail(mailOptions);
        console.log(`✅ Email de recuperación enviado a: ${email}`);
        
        res.json({
          success: true,
          message: 'Se ha enviado un email con las instrucciones para resetear tu contraseña.'
        });

      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError.message);
        
        // Si falla el email, caer al modo demo
        console.log(`🔑 TOKEN DE RECUPERACIÓN para ${email}: ${resetToken}`);
        console.log(`🔗 URL de reset: ${resetUrl}`);
        
        res.json({
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña.',
          demo_note: 'Error enviando email, revisa los logs del servidor para el token',
          demo_reset_url: resetUrl
        });
      }
    } else {
      // Modo demo si no hay transporter
      console.log(`🔑 TOKEN DE RECUPERACIÓN para ${email}: ${resetToken}`);
      console.log(`🔗 URL de reset: ${resetUrl}`);

      res.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña.',
        demo_note: 'Modo demo - revisa los logs del servidor para el token',
        demo_reset_url: resetUrl
      });
    }

  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Resetear contraseña con token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token y nueva contraseña son requeridos'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(400).json({
        success: false,
        error: 'Token inválido'
      });
    }

    // Buscar usuario
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Actualizar contraseña
    user.password = newPassword; // El modelo debería hashear automáticamente
    await user.save();

    console.log(`✅ Contraseña actualizada para usuario: ${user.email}`);

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    });

  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Models
const Property = require('./models/Property');
const Reservation = require('./models/Reservation');
const Review = require('./models/Review');

// Properties endpoints - Endpoints activos con manejo de timeout
// Endpoint: Obtener todas las propiedades desde MongoDB
app.get('/api/properties', async (req, res) => {
  try {
    console.log('🏠 Getting properties...');
    
    // Array vacío como fallback - solo propiedades reales
    const fallbackProperties = [];
    
    if (!mongoose.connection.readyState) {
      console.log('🏠 Database not connected, no properties available');
      return res.json({
        success: true,
        message: 'No properties available (DB disconnected)',
        data: fallbackProperties,
        timestamp: new Date().toISOString(),
        demo: true
      });
    }
    
    const properties = await withTimeout(
      Property.find({}),
      6000, // 6 segundos timeout
      fallbackProperties
    );
    
    console.log(`🏠 Found ${properties.length} properties`);
    res.json({
      success: true,
      message: properties === fallbackProperties ? 'No properties available (timeout/error)' : 'Properties from database',
      data: properties,
      timestamp: new Date().toISOString(),
      demo: properties === fallbackProperties
    });
  } catch (error) {
    console.error('❌ Error getting properties:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Error getting properties'
    });
  }
});

// Endpoint: Obtener una propiedad por ID desde MongoDB
app.get('/api/properties/:propertyId', async (req, res) => {
  try {
    console.log(`🏠 Getting property: ${req.params.propertyId}`);
    
    // Sin datos de fallback - solo propiedades reales
    const fallbackProperty = null;
    
    if (!mongoose.connection.readyState) {
      console.log('🏠 Database not connected, property not available');
      return res.status(503).json({
        success: false,
        error: 'Base de datos no disponible temporalmente',
        timestamp: new Date().toISOString(),
        demo: true
      });
    }
    
    const property = await withTimeout(
      Property.findOne({ id: req.params.propertyId }),
      6000,
      null
    );
    
    if (!property) {
      console.log(`🏠 Property not found: ${req.params.propertyId}`);
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada',
        propertyId: req.params.propertyId,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`🏠 Found property: ${property.name || property.id}`);
    res.json({
      success: true,
      message: 'Property from database',
      data: property,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting property:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      propertyId: req.params.propertyId 
    });
  }
});

// Properties management endpoints - COMENTADO: usar el endpoint real en routes/properties.js
/*
app.put('/api/properties/:propertyId', (req, res) => {
  const { propertyId } = req.params;
  const updateData = req.body;
  console.log(`🏠 Updating property (sin token): ${propertyId}`, updateData);
  // Demo: simular actualización exitosa
  res.json({
    success: true,
    message: 'Property updated successfully (sin token)',
    data: {
      id: propertyId,
      ...updateData,
      updatedAt: new Date().toISOString()
    }
  });
});
*/

// Endpoint: Obtener todas las reservas desde MongoDB
app.get('/api/reservations', async (req, res) => {
  try {
    console.log('📅 Getting reservations...');
    
    // Array vacío como fallback - solo reservas reales
    const fallbackReservations = [];
    
    if (!mongoose.connection.readyState) {
      console.log('📅 Database not connected, no reservations available');
      return res.json({
        success: true,
        message: 'No reservations available (DB disconnected)',
        data: fallbackReservations,
        timestamp: new Date().toISOString(),
        demo: true
      });
    }
    
    const reservations = await withTimeout(
      Reservation.find({}),
      6000,
      fallbackReservations
    );
    
    console.log(`📅 Found ${reservations.length} reservations`);
    res.json({
      success: true,
      message: reservations === fallbackReservations ? 'No reservations available (timeout/error)' : 'Reservations from database',
      data: reservations,
      timestamp: new Date().toISOString(),
      demo: reservations === fallbackReservations
    });
  } catch (error) {
    console.error('❌ Error getting reservations:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Error getting reservations'
    });
  }
});

// Endpoint: Obtener todas las reservas para administradores
app.get('/api/reservations/admin/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    console.log('🔍 ADMIN RESERVATIONS: Obteniendo todas las reservas para admin');
    
    const reservations = await Reservation.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`✅ ADMIN RESERVATIONS: Encontradas ${reservations.length} reservas`);
    
    res.json({
      success: true,
      message: 'All reservations for admin',
      data: reservations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ ADMIN RESERVATIONS: Error obteniendo reservas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Endpoint: Obtener reservas del usuario autenticado
app.get('/api/reservations/my', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 MY RESERVATIONS: Request para usuario:', req.userId);
    
    // Modo demo para admin temporal
    if (req.userId === 'admin_temp') {
      console.log('🔧 MY RESERVATIONS: Modo demo admin - devolviendo todas las reservas');
      const allReservations = await Reservation.find({})
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
      
      return res.json({
        success: true,
        message: 'User reservations from database (admin demo mode)',
        data: allReservations,
        timestamp: new Date().toISOString()
      });
    }
    
    // Obtener solo las reservas del usuario autenticado
    const reservations = await Reservation.find({ userId: req.userId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`✅ MY RESERVATIONS: Encontradas ${reservations.length} reservas para usuario ${req.userId}`);
    
    res.json({
      success: true,
      message: 'User reservations from database',
      data: reservations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ MY RESERVATIONS: Error obteniendo reservas del usuario:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Endpoint: Crear nueva reserva
app.post('/api/reservations', authMiddleware, async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests, totalPrice, notes, fullName, email, phone, dni, message } = req.body;

    console.log('📝 CREATE RESERVATION: Datos recibidos:', { propertyId, checkIn, checkOut, guests, fullName, email, phone, dni, message });

    // Validaciones básicas
    if (!propertyId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: propertyId, checkIn, checkOut, guests'
      });
    }

    if (!fullName || !email || !dni || !message) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: fullName, email, dni, message'
      });
    }

    // Modo demo para admin temporal
    if (req.userId === 'admin_temp') {
      console.log('🔧 CREATE RESERVATION: Modo demo admin - simulando creación');
      const mockReservation = {
        _id: 'demo_' + Date.now(),
        userId: 'admin_temp',
        userEmail: email,
        userName: fullName,
        propertyId: propertyId,
        propertyName: 'Demo Property',
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: guests.toString(),
        fullName: fullName,
        email: email,
        phone: phone || '',
        message: message,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return res.status(201).json({
        success: true,
        message: 'Reserva creada exitosamente (modo demo)',
        data: mockReservation
      });
    }

    // Obtener datos del usuario autenticado
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar que la propiedad existe
    const property = await Property.findOne({ id: propertyId });
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }

    console.log('👤 CREATE RESERVATION: Usuario encontrado:', { id: user._id, name: user.name, email: user.email });
    console.log('🏠 CREATE RESERVATION: Propiedad encontrada:', { id: property.id, title: property.title });

    // Crear nueva reserva con todos los campos requeridos
    const reservation = new Reservation({
      // Información del usuario
      userId: req.userId,
      userEmail: user.email,
      userName: user.name,
      
      // Información de la propiedad
      propertyId: propertyId,
      propertyName: property.title,
      
      // Detalles de la reserva
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: guests.toString(),
      
      // Información de contacto
      fullName: fullName,
      email: email,
      phone: phone || '',
      dni: dni,
      message: message,
      
      // Estado
      status: 'pending'
    });

    console.log('💾 CREATE RESERVATION: Guardando reserva con datos:', {
      userId: reservation.userId,
      userEmail: reservation.userEmail,
      userName: reservation.userName,
      propertyId: reservation.propertyId,
      propertyName: reservation.propertyName,
      fullName: reservation.fullName,
      email: reservation.email,
      message: reservation.message
    });

    await reservation.save();

    console.log(`✅ RESERVATION CREATED: Nueva reserva creada para usuario ${req.userId} en propiedad ${propertyId}`);

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: reservation
    });
  } catch (error) {
    console.error('❌ CREATE RESERVATION: Error creando reserva:', error);
    console.error('❌ CREATE RESERVATION: Error detallado:', error.message);
    if (error.name === 'ValidationError') {
      console.error('❌ CREATE RESERVATION: Errores de validación:', error.errors);
    }
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// Endpoint: Actualizar estado de reserva
app.put('/api/reservations/:id/status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Estado es requerido'
      });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    reservation.status = status;
    reservation.updatedAt = new Date();
    
    // Si se marca como completada, automáticamente marcar el pago como aprobado
    if (status === 'completada' || status === 'completed') {
      reservation.paymentStatus = 'approved';
      reservation.paidAt = new Date();
      console.log(`💰 PAYMENT AUTO-UPDATE: Pago marcado como aprobado para reserva completada ${id}`);
    }
    
    await reservation.save();

    res.json({
      success: true,
      message: 'Estado de reserva actualizado exitosamente',
      data: reservation
    });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Endpoint: Actualizar estado de reserva (admin específico)
app.put('/api/reservations/admin/:id/status', authMiddleware, async (req, res) => {
  try {
    // Verificar que sea admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Solo administradores pueden cambiar estados.'
      });
    }

    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Estado es requerido'
      });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    reservation.status = status;
    reservation.updatedAt = new Date();
    
    // Si se marca como completada, automáticamente marcar el pago como aprobado
    if (status === 'completada' || status === 'completed') {
      reservation.paymentStatus = 'approved';
      reservation.paidAt = new Date();
      console.log(`💰 PAYMENT AUTO-UPDATE: Pago marcado como aprobado para reserva completada ${id}`);
    }
    
    await reservation.save();

    console.log(`✅ ADMIN STATUS UPDATE: Reserva ${id} actualizada a ${status}`);
    res.json({
      success: true,
      message: 'Estado de reserva actualizado exitosamente',
      data: reservation
    });
  } catch (error) {
    console.error('❌ ADMIN STATUS UPDATE: Error updating reservation status:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// RUTAS DE ADMINISTRACIÓN DE REVIEWS - COMENTADO: Ahora se usan las rutas en routes/reviews.js
/*
// Obtener reseñas pendientes de moderación
app.get('/api/reviews/admin/pending', authMiddleware, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find({ 
      isApproved: false,
      isRejected: { $ne: true }
    })
    .populate('user', 'name email')
    .sort('-createdAt');

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error obteniendo reseñas pendientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener todas las reseñas para administración con filtros
app.get('/api/reviews/admin', authMiddleware, adminOnly, async (req, res) => {
  try {
    console.log('🔍 ADMIN REVIEWS: Request recibida');
    console.log('🔍 ADMIN REVIEWS: Query params:', req.query);
    console.log('🔍 ADMIN REVIEWS: User ID:', req.userId);
    
    const { status = 'all', limit = 20, page = 1, sort = '-createdAt' } = req.query;
    
    let filter = {};
    
    if (status === 'pending') {
      filter.isApproved = false;
      filter.isRejected = { $ne: true };
    } else if (status === 'approved') {
      filter.isApproved = true;
    } else if (status === 'rejected') {
      filter.isRejected = true;
    }

    console.log('🔍 ADMIN REVIEWS: Filtro aplicado:', filter);

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('moderatedBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);
    
    console.log(`✅ ADMIN REVIEWS: Encontradas ${reviews.length} reseñas`);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ ADMIN REVIEWS: Error obteniendo reseñas para administración:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener todas las reseñas para administración (alias)
app.get('/api/reviews/admin/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status = 'all', limit = 20, page = 1, sort = '-createdAt' } = req.query;
    
    let filter = {};
    
    if (status === 'pending') {
      filter.isApproved = false;
      filter.isRejected = { $ne: true };
    } else if (status === 'approved') {
      filter.isApproved = true;
    } else if (status === 'rejected') {
      filter.isRejected = true;
    }

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('moderatedBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error obteniendo reseñas para administración:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Aprobar reseña
app.put('/api/reviews/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { notes, isHighlight } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    review.isApproved = true;
    review.moderatedBy = req.userId;
    review.moderatedAt = new Date();
    if (notes) review.moderationNotes = notes;
    if (isHighlight) review.isHighlight = true;

    await review.save();

    res.json({
      success: true,
      message: 'Reseña aprobada exitosamente',
      data: review
    });
  } catch (error) {
    console.error('Error aprobando reseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Rechazar reseña
app.put('/api/reviews/:id/reject', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { notes } = req.body;
    
    if (!notes) {
      return res.status(400).json({
        success: false,
        error: 'Las notas de moderación son obligatorias para rechazar una reseña'
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    review.isRejected = true;
    review.moderatedBy = req.userId;
    review.moderatedAt = new Date();
    review.moderationNotes = notes;

    await review.save();

    res.json({
      success: true,
      message: 'Reseña rechazada',
      data: review
    });
  } catch (error) {
    console.error('Error rechazando reseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Eliminar reseña
app.delete('/api/reviews/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando reseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Crear nueva reseña (endpoint público)
app.post('/api/reviews', async (req, res) => {
  try {
    const { propertyId, guestName, guestEmail, rating, comment, stayDates } = req.body;

    // Validaciones básicas
    if (!propertyId || !guestName || !guestEmail || !rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son obligatorios'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'La calificación debe estar entre 1 y 5'
      });
    }

    // Crear nueva reseña
    const review = new Review({
      propertyId,
      guestName: guestName.trim(),
      guestEmail: guestEmail.toLowerCase().trim(),
      rating,
      comment: comment.trim(),
      stayDates,
      language: req.body.language || 'es'
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Reseña enviada exitosamente. Será revisada antes de publicarse.',
      data: review
    });
  } catch (error) {
    console.error('Error creando reseña:', error);
    
    // Manejo específico de errores de duplicación
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Ya has enviado una reseña para esta propiedad. Solo se permite una reseña por usuario por propiedad.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Almacenamiento en memoria para imágenes de galería
const galleryDB = {}

// Gallery endpoints
app.get('/api/gallery/:propertyId', (req, res) => {
  const { propertyId } = req.params;
  console.log(`🖼️ Gallery requested for: ${propertyId}`);
  const images = galleryDB[propertyId] || [];
  res.json({
    success: true,
    message: 'Gallery endpoint',
    data: images,
    propertyId,
    timestamp: new Date().toISOString()
  });
});

// Upload multiple images
app.post('/api/gallery/:propertyId/upload-batch', (req, res) => {
  try {
    const { propertyId } = req.params;
    // Sin verificación de token
    // Validar que lleguen las imágenes
    if (!req.body || !req.body.images || !Array.isArray(req.body.images)) {
      return res.status(400).json({
        success: false,
        error: 'No images data provided',
        received: req.body
      });
    }
    const mockImages = req.body.images.map((img, index) => ({
      id: 'img-' + Date.now() + '-' + index,
      url: `https://via.placeholder.com/300x200?text=Imagen+${encodeURIComponent(propertyId)}-${index + 1}`,
      alt: `Imagen ${index + 1} de ${propertyId}`,
      uploaded: new Date().toISOString(),
      originalName: img.name || `image-${index + 1}`
    }));
    if (!galleryDB[propertyId]) galleryDB[propertyId] = [];
    galleryDB[propertyId].push(...mockImages);
    res.json({
      success: true,
      message: 'Images uploaded successfully (sin token)',
      data: mockImages,
      propertyId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Upload failed: ' + error.message,
      stack: error.stack
    });
  }
});

// Temporary upload endpoint without JWT verification (for debugging)
app.post('/api/gallery/:propertyId/upload-batch-debug', (req, res) => {
  const { propertyId } = req.params;
  
  console.log(`📤 GALLERY DEBUG: Upload batch requested for ${propertyId}`);
  
  // Simulamos la subida exitosa de imágenes
  const mockImages = [
    {
      id: 'img-' + Date.now(),
      url: `/img/demo-${propertyId}-1.jpg`,
      alt: `Imagen de ${propertyId}`,
      uploaded: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    message: 'Images uploaded successfully (debug mode)',
    data: mockImages,
    propertyId,
    timestamp: new Date().toISOString()
  });
});

// Delete image
app.delete('/api/gallery/:propertyId/images/:imageId', (req, res) => {
  const { propertyId, imageId } = req.params;
  // Sin verificación de token
  if (!galleryDB[propertyId]) {
    return res.status(404).json({
      success: false,
      error: 'Property gallery not found',
      propertyId
    });
  }
  // Eliminar imagen de la galería en memoria
  galleryDB[propertyId] = galleryDB[propertyId].filter(img => img.id !== imageId);
  res.json({
    success: true,
    message: 'Image deleted successfully (sin token)',
    imageId,
    propertyId,
    timestamp: new Date().toISOString()
  });
});

// Debug JWT endpoint
app.get('/api/debug/jwt', (req, res) => {
  const secret = process.env.JWT_SECRET || 'demo-secret';
  const testToken = jwt.sign(
    { userId: 'test', role: 'admin' },
    secret,
    { expiresIn: '1h' }
  );
  
  try {
    const decoded = jwt.verify(testToken, secret);
    res.json({
      success: true,
      secret: secret,
      token: testToken,
      decoded: decoded,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      secret: secret,
      token: testToken,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug JWT verify endpoint
app.get('/api/debug/jwt-verify', (req, res) => {
  const token = req.query.token;
  const secret = process.env.JWT_SECRET || 'demo-secret';
  
  if (!token) {
    return res.json({
      success: false,
      error: 'No token provided',
      secret: secret
    });
  }
  
  try {
    console.log('🔍 DEBUG: Verifying token:', token.substring(0, 20) + '...');
    console.log('🔍 DEBUG: Using secret:', secret);
    
    const decoded = jwt.verify(token, secret);
    console.log('✅ DEBUG: Token verified successfully:', decoded);
    
    res.json({
      success: true,
      token: token,
      secret: secret,
      decoded: decoded,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ DEBUG: Token verification failed:', error);
    res.json({
      success: false,
      error: error.message,
      token: token,
      secret: secret,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug token endpoint
app.get('/api/debug/check-token', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.json({
      success: false,
      error: 'No token in header',
      receivedHeaders: req.headers
    });
  }
  
  console.log('🔍 TOKEN CHECK: Received token:', token.substring(0, 20) + '...');
  
  res.json({
    success: true,
    tokenReceived: token.substring(0, 20) + '...',
    tokenLength: token.length,
    startsWithEyJ: token.startsWith('eyJ'),
    timestamp: new Date().toISOString()
  });
});

// Moderar reseña (aprobar/rechazar) - Endpoint unificado que espera el frontend
app.patch('/api/reviews/:id/moderate', authMiddleware, adminOnly, async (req, res) => {
  try {
    console.log('🔍 MODERATION: Iniciando moderación de reseña');
    console.log('🔍 MODERATION: ID de reseña:', req.params.id);
    console.log('🔍 MODERATION: Body:', req.body);
    console.log('🔍 MODERATION: User ID:', req.userId);
    
    const { action, moderatorNotes } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      console.log('❌ MODERATION: Reseña no encontrada');
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    console.log('✅ MODERATION: Reseña encontrada:', review.guestName);

    if (action === 'approve') {
      console.log('✅ MODERATION: Aprobando reseña');
      review.isApproved = true;
      // Solo asignar moderatedBy si no es el admin temporal
      if (req.userId !== 'admin_temp') {
        review.moderatedBy = req.userId;
      }
      review.moderatedAt = new Date();
      if (moderatorNotes) review.moderationNotes = moderatorNotes;
    } else if (action === 'reject') {
      console.log('❌ MODERATION: Rechazando reseña');
      review.isRejected = true;
      // Solo asignar moderatedBy si no es el admin temporal
      if (req.userId !== 'admin_temp') {
        review.moderatedBy = req.userId;
      }
      review.moderatedAt = new Date();
      review.moderationNotes = moderatorNotes || 'Rechazada por el administrador';
    } else {
      console.log('❌ MODERATION: Acción inválida:', action);
      return res.status(400).json({
        success: false,
        error: 'Acción inválida. Use "approve" o "reject"'
      });
    }

    console.log('💾 MODERATION: Guardando cambios...');
    await review.save();
    console.log('✅ MODERATION: Cambios guardados exitosamente');

    res.json({
      success: true,
      message: `Reseña ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`,
      data: review
    });
  } catch (error) {
    console.error('❌ MODERATION: Error moderando reseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Marcar/desmarcar reseña como destacada
app.patch('/api/reviews/:id/highlight', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { highlight } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    review.isHighlight = highlight;
    await review.save();

    res.json({
      success: true,
      message: `Reseña ${highlight ? 'destacada' : 'sin destacar'} exitosamente`,
      data: review
    });
  } catch (error) {
    console.error('Error cambiando destaque de reseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Endpoint: Obtener reviews de una propiedad desde MongoDB (debe ir después de las rutas admin)
app.get('/api/reviews/:propertyId', async (req, res) => {
  try {
    const reviews = await Review.find({ propertyId: req.params.propertyId, isApproved: true });
    res.json({
      success: true,
      message: 'Reviews from database',
      data: reviews,
      propertyId: req.params.propertyId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Obtener reviews de una propiedad específica (formato /property/:propertyId)
app.get('/api/reviews/property/:propertyId', async (req, res) => {
  try {
    console.log('🔍 PROPERTY REVIEWS: Request para propiedad:', req.params.propertyId);
    
    const { limit = 10, page = 1, sort = '-createdAt' } = req.query;
    
    const reviews = await Review.find({ 
      propertyId: req.params.propertyId, 
      isApproved: true 
    })
    .populate('user', 'name avatar')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Review.countDocuments({
      propertyId: req.params.propertyId,
      isApproved: true
    });

    console.log(`✅ PROPERTY REVIEWS: Encontradas ${reviews.length} reseñas para ${req.params.propertyId}`);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ PROPERTY REVIEWS: Error obteniendo reseñas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});
*/

// ENDPOINTS DE GESTIÓN DE USUARIOS (Solo Admin) - COMENTADO: Ahora se usan las rutas en routes/users.js

/*
// Obtener todos los usuarios - Solo admin
app.get('/api/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    console.log('🔍 USERS: Request para obtener todos los usuarios');
    console.log('🔍 USERS: User ID:', req.userId);
    console.log('🔍 USERS: User Role:', req.userRole);
    
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    
    // Filtros de búsqueda
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      filter.role = role;
    }

    console.log('🔍 USERS: Filtro aplicado:', filter);

    const users = await User.find(filter)
      .select('-password') // Excluir contraseñas
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);
    
    console.log(`✅ USERS: Encontrados ${users.length} usuarios`);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ USERS: Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener un usuario por ID - Solo admin
app.get('/api/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Actualizar usuario - Solo admin
app.put('/api/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Actualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user.toPublic()
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Eliminar usuario - Solo admin
app.delete('/api/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar al propio admin
    if (user._id.toString() === req.userId) {
      return res.status(400).json({
        success: false,
        error: 'No puedes eliminar tu propia cuenta'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener estadísticas de usuarios - Solo admin
app.get('/api/users/stats/summary', authMiddleware, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Últimos 30 días
    });

    res.json({
      success: true,
      data: {
        total: totalUsers,
        admins: adminUsers,
        regular: totalUsers - adminUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        recent: recentUsers
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});
*/

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'BACONFORT API Server',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      api: '/api',
      auth: '/api/auth',
      properties: '/api/properties',
      reservations: '/api/reservations',
      reviews: '/api/reviews',
      gallery: '/api/gallery'
    },
    documentation: 'https://github.com/your-repo/baconfort-backend'
  });
});

// Catch all
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Servir frontend desde public directory (alternativa a Firebase)
app.use(express.static(path.join(__dirname, 'public')));

// Para rutas del frontend (React Router), servir index.html
app.get('*', (req, res) => {
  // Solo servir index.html para rutas que NO empiecen con /api
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Frontend not available' });
    }
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ GLOBAL ERROR HANDLER:', error);
  console.error('❌ ERROR MESSAGE:', error.message);
  console.error('❌ ERROR STACK:', error.stack);
  console.error('❌ REQUEST PATH:', req.path);
  console.error('❌ REQUEST METHOD:', req.method);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    path: req.path
  });
});

// Función para inicializar el servidor de forma segura
const startServer = async () => {
  // Iniciar el servidor con mejor manejo de errores
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('🌍 Host: 0.0.0.0');
    console.log('🔍 Healthcheck URLs:');
    console.log(`  - http://localhost:${PORT}/health`);
    console.log(`  - http://localhost:${PORT}/api/health`);
    console.log('✅ Server ready');
  });
  
  // Manejar errores durante el inicio del servidor
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ ERROR: El puerto ${PORT} ya está en uso.`);
      console.error(`🔄 Sugerencias para solucionar el problema:`);
      console.error(`   1. Ejecuta el script 'restart-server.ps1' para detectar y cerrar procesos`);
      console.error(`   2. Usa un puerto alternativo: PORT=5005 npm start`);
      console.error(`   3. O ejecuta: .\\start-alternative-port.ps1 -Puerto 5005`);
    } else {
      console.error('❌ Error al iniciar el servidor:', error);
    }
    process.exit(1);
  });
  
  // Luego intentamos conectar a los servicios de forma no bloqueante
  try {
    // Conectar a MongoDB
    connectDB().catch(err => {
      console.error('⚠️ MongoDB connection error:', err.message);
      console.log('🔄 Continuing in demo mode...');
    });
    
    // Configurar email transporter
    try {
      setupEmailTransporter();
    } catch (emailError) {
      console.error('⚠️ Email setup error:', emailError.message);
    }
    
    // Inicializar email transporter de notificaciones
    try {
      const { initializeEmailTransporter } = require('./utils/emailNotifications');
      initializeEmailTransporter();
    } catch (notifError) {
      console.error('⚠️ Notification setup error:', notifError.message);
    }
    
    console.log('✅ All services initialized successfully');
    
  } catch (error) {
    console.error('❌ Error during service initialization:', error.message);
    console.log('🔄 Some services may be in demo mode...');
  }
}

// Inicializar servidor
startServer();

// Solo exportar si se está ejecutando como módulo, no como script principal
if (require.main !== module) {
  module.exports = { app, emailTransporter };
}

