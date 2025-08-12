// routes/auth.js - Rutas de autenticación
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authenticateToken, requireAdmin, ADMIN_CREDENTIALS, JWT_SECRET } = require('../middleware/auth');
const User = require('../models/User');
const { sendVerificationEmail, sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

// Renovar token
router.post('/refresh-token', (req, res) => {
  try {
    const { refreshToken, email } = req.body;
    
    console.log('🔄 Renovando token para:', email);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido para renovar token'
      });
    }

    // Para usuarios admin
    if (email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) {
      const newToken = jwt.sign(
        { 
          id: 'admin_baconfort_2025',
          email: ADMIN_CREDENTIALS.email,
          role: ADMIN_CREDENTIALS.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('✅ Token admin renovado exitosamente');
      
      return res.json({
        success: true,
        message: 'Token renovado exitosamente',
        user: {
          id: 'admin_baconfort_2025',
          email: ADMIN_CREDENTIALS.email,
          role: ADMIN_CREDENTIALS.role,
          name: 'Admin BACONFORT'
        },
        token: newToken
      });
    }

    // Para usuarios regulares, buscar en la base de datos
    User.findOne({ email: email.toLowerCase() })
      .then(user => {
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'Usuario no encontrado'
          });
        }

        const newToken = jwt.sign(
          { 
            id: user._id,
            userId: user._id,
            email: user.email,
            role: user.role,
            name: user.name
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        console.log('✅ Token usuario renovado exitosamente para:', email);

        res.json({
          success: true,
          message: 'Token renovado exitosamente',
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            phone: user.phone,
            createdAt: user.createdAt
          },
          token: newToken
        });
      })
      .catch(error => {
        console.error('❌ Error renovando token:', error);
        res.status(500).json({
          success: false,
          error: 'Error interno del servidor'
        });
      });

  } catch (error) {
    console.error('❌ Error renovando token:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔑 Login attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña requeridos'
      });
    }
    
    // Verificar credenciales admin - Solo se permite baconfort.centro@gmail.com
    if (email.toLowerCase() === 'baconfort.centro@gmail.com' &&
        password === ADMIN_CREDENTIALS.password) {
      
      const token = jwt.sign(
        { 
          id: 'admin_baconfort_2025',
          email: ADMIN_CREDENTIALS.email,
          role: ADMIN_CREDENTIALS.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('✅ Admin login successful');
      
      return res.json({
        success: true,
        message: 'Login exitoso',
        user: {
          id: 'admin_baconfort_2025',
          email: ADMIN_CREDENTIALS.email,
          role: ADMIN_CREDENTIALS.role,
          name: 'Admin BACONFORT',
          phone: '+54 11 3002-1074',
          createdAt: '2025-01-15T08:00:00.000Z'
        },
        token
      });
    }
    
    // 👤 VERIFICAR USUARIOS REGULARES
    // Primero buscar en la base de datos
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (user) {
        const isPasswordValid = await user.comparePassword(password);
        if (isPasswordValid) {
          // 🔐 VERIFICAR EMAIL ANTES DE PERMITIR LOGIN
          if (!user.emailVerified) {
            console.log('❌ Login attempt with unverified email:', email);
            return res.status(401).json({
              success: false,
              error: 'Debes verificar tu email antes de poder iniciar sesión. Revisa tu bandeja de entrada.',
              needsEmailVerification: true
            });
          }
          
          const token = jwt.sign(
            { 
              id: user._id,
              userId: user._id, // Para compatibilidad con middleware
              email: user.email,
              role: user.role,
              name: user.name
            },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          // Actualizar último login
          user.lastLogin = new Date();
          await user.save();
          
          console.log('✅ Database user login successful:', email);
          
          return res.json({
            success: true,
            message: 'Login exitoso',
            user: {
              id: user._id,
              email: user.email,
              role: user.role,
              name: user.name,
              phone: user.phone,
              emailVerified: user.emailVerified,
              createdAt: user.createdAt,
              lastLogin: user.lastLogin
            },
            token
          });
        }
      }
    } catch (dbError) {
      console.log('Database error during login:', dbError);
      // Continuar con el fallback si hay error de BD
    }
    
    // Fallback: Para el usuario específico hardcoded (temporal)
    if (email.toLowerCase() === 'baconfort.centro@gmail.com' && password === 'password123') {
      const userId = 'user_roberto_2025';
      const token = jwt.sign(
        { 
          id: userId,
          userId: userId, // Para compatibilidad con middleware
          email: email.toLowerCase(),
          role: 'user',
          name: 'Roberto Gaona'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('✅ Hardcoded user login successful:', email);
      
      return res.json({
        success: true,
        message: 'Login exitoso',
        user: {
          id: userId,
          email: email.toLowerCase(),
          role: 'user',
          name: 'Roberto Gaona',
          phone: '+54 11 1234-5678',
          createdAt: '2025-06-15T09:30:00.000Z'
        },
        token
      });
    }
    
    // Si no coincide con ningún usuario válido
    console.log('❌ Invalid credentials for:', email);
    return res.status(401).json({
      success: false,
      error: 'Credenciales inválidas'
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Registro de usuarios
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    console.log('📝 Register attempt:', email);
    
    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, email y contraseña son requeridos'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }
     // Crear nuevo usuario
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: password,
      phone: phone || null,
      role: 'user',
      emailVerified: false,
      verificationToken: verificationToken
    });

    // Guardar usuario en la base de datos
    await newUser.save();
    
    // Enviar email de verificación
    const emailResult = await sendVerificationEmail(email, name, verificationToken);
    if (!emailResult.success) {
      console.warn('⚠️ No se pudo enviar email de verificación:', emailResult.error);
    }

    // NO enviar email de bienvenida aquí - se enviará después de la verificación
    console.log('📧 Email de verificación enviado, bienvenida se enviará tras verificar');

    console.log('✅ User registered successfully:', email);
    console.log(emailResult.success ? '📧 Verification email sent' : '⚠️ Verification email failed');

    // NO GENERAR TOKEN JWT - El usuario debe verificar su email primero
    // Devolver respuesta exitosa SIN token
    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Te hemos enviado un email de verificación. Debes verificar tu email antes de poder iniciar sesión.',
      emailSent: emailResult.success,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        phone: newUser.phone,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt
      },
      requiresEmailVerification: true
      // NO incluir token aquí - el usuario debe verificar email primero
    });
    
  } catch (error) {
    console.error('❌ Register error:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Verificar usuario actual
router.get('/me', authenticateToken, (req, res) => {
  console.log('👤 /auth/me - Usuario actual:', req.user?.email, 'Rol:', req.user?.role);
  console.log('🔍 /auth/me - Datos completos de req.user:', JSON.stringify(req.user, null, 2));
  
  // Devolver datos específicos según el rol
  if (req.user.role === 'admin') {
    const userData = {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      name: 'Admin BACONFORT',
      phone: '+54 11 4176-6377',
      createdAt: '2025-01-15T08:00:00.000Z'
    };
    console.log('📤 /auth/me - Enviando datos admin:', JSON.stringify(userData, null, 2));
    
    res.json({
      success: true,
      user: userData
    });
  } else if (req.user.role === 'user' || req.user.role === 'guest') {
    // Datos específicos para usuarios regulares (user o guest)
    const userData = {
      id: req.user.id || req.user.userId,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name || 'Usuario',
      phone: req.user.phone || null,
      createdAt: req.user.createdAt || new Date().toISOString()
    };
    
    // Si es admin de baconfort, usar sus datos específicos
    if (req.user.email === 'baconfort.centro@gmail.com') {
      userData.name = 'Admin BACONFORT';
      userData.phone = '+54 11 3002-1074';
      userData.createdAt = '2025-06-15T09:30:00.000Z';
    }
    
    res.json({
      success: true,
      user: userData
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Rol de usuario no válido'
    });
  }
});

// Actualizar perfil de usuario autenticado
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    console.log('👤 /auth/profile - Actualizar perfil:', req.user?.email, { name, email, phone });
    
    // Validaciones básicas
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'El nombre debe tener al menos 2 caracteres'
      });
    }
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }
    
    // Para admin, actualizar datos especiales
    if (req.user.role === 'admin') {
      const updatedUser = {
        id: req.user.id,
        email: email,
        role: 'admin',
        name: name,
        phone: phone || '+54 11 4176-6377',
        createdAt: req.user.createdAt || '2025-01-15T08:00:00.000Z',
        updatedAt: new Date().toISOString()
      };
      
      console.log('✅ Admin profile updated:', updatedUser);
      
      return res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        user: updatedUser
      });
    }
    
    // Para usuarios normales (cuando se implemente registro)
    const updatedUser = {
      id: req.user.id,
      email: email,
      role: req.user.role,
      name: name,
      phone: phone,
      createdAt: req.user.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ User profile updated:', updatedUser);
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Cambiar contraseña
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    console.log('🔐 /auth/change-password - Usuario:', req.user?.email);
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña actual y nueva contraseña requeridas'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Para admin, verificar contraseña actual
    if (req.user.role === 'admin') {
      if (currentPassword !== ADMIN_CREDENTIALS.password) {
        return res.status(401).json({
          success: false,
          error: 'Contraseña actual incorrecta'
        });
      }
      
      // En un sistema real, aquí actualizarías la contraseña en la base de datos
      console.log('⚠️ Password change requested for admin - would update in real DB');
      
      return res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    }
    
    // Para usuarios normales (cuando se implemente registro con DB)
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Password change error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Verificar token
router.post('/verify', authenticateToken, (req, res) => {
  console.log('🔍 /auth/verify - Token válido para:', req.user?.email);
  
  res.json({
    success: true,
    valid: true,
    user: req.user
  });
});

// Verificar email con token
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token de verificación requerido'
      });
    }
    
    console.log('📧 Verificando email con token:', token.substring(0, 8) + '...');
    
    // Buscar usuario con el token de verificación
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Token de verificación inválido o expirado'
      });
    }
    
    if (user.emailVerified) {
      return res.json({
        success: true,
        message: 'El email ya está verificado',
        alreadyVerified: true
      });
    }
    
    // Marcar email como verificado
    user.emailVerified = true;
    user.verificationToken = null;
    await user.save();
    
    // Enviar email de bienvenida
    const welcomeResult = await sendWelcomeEmail(user.email, user.name);
    if (!welcomeResult.success) {
      console.warn('⚠️ No se pudo enviar email de bienvenida:', welcomeResult.error);
    }
    
    console.log('✅ Email verificado exitosamente:', user.email);
    
    res.json({
      success: true,
      message: 'Email verificado exitosamente',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified
      }
    });
    
  } catch (error) {
    console.error('❌ Error verificando email:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Reenviar email de verificación
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido'
      });
    }
    
    console.log('🔄 Reenviando verificación para:', email);
    
    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    if (user.emailVerified) {
      return res.json({
        success: true,
        message: 'El email ya está verificado',
        alreadyVerified: true
      });
    }
    
    // Generar nuevo token de verificación
    const newVerificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = newVerificationToken;
    await user.save();
    
    // Enviar email de verificación
    const emailResult = await sendVerificationEmail(email, user.name, newVerificationToken);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: 'No se pudo enviar el email de verificación'
      });
    }
    
    console.log('📧 Email de verificación reenviado exitosamente:', email);
    
    res.json({
      success: true,
      message: 'Email de verificación reenviado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error reenviando verificación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  console.log('👋 Logout request');
  
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

// Endpoint temporal para obtener token de verificación (solo para desarrollo)
router.get('/debug/verification-token/:email', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Not found' });
    }

    const { email } = req.params;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      email: user.email,
      verificationToken: user.verificationToken,
      emailVerified: user.emailVerified,
      verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${user.verificationToken}`
    });
  } catch (error) {
    console.error('Error getting verification token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Enviar código de verificación para reserva
router.post('/send-verification', authenticateToken, async (req, res) => {
  try {
    const { email, propertyName, reservationData } = req.body;
    const userId = req.user.id;

    console.log('📧 SEND VERIFICATION: Enviando código para:', email);
    console.log('🔍 DEBUG: Email del request body:', email);
    console.log('🔍 DEBUG: Email del usuario autenticado:', req.user.email);
    console.log('🔍 DEBUG: Usuario completo:', JSON.stringify(req.user, null, 2));

    // Verificar que el usuario esté autenticado
    // Permitir verificación para usuarios válidos (simplificado)
    const isValidUser = req.user && req.user.email;
    
    if (!isValidUser) {
      console.log('❌ DEBUG: Usuario no válido o sin email');
      return res.status(403).json({
        success: false,
        message: 'Usuario no válido para verificación de email'
      });
    }

    console.log('✅ DEBUG: Usuario válido, continuando con verificación...');

    // Generar código de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar el código en la base de datos con expiración de 5 minutos
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
    
    // Para usuarios virtuales (como Roberto/admin), guardar en memoria temporalmente
    // Para usuarios reales, guardar en base de datos
    const isVirtualUser = userId.includes('admin_') || userId.includes('roberto') || !userId.match(/^[0-9a-fA-F]{24}$/);
    
    if (isVirtualUser) {
      console.log('🔄 DEBUG: Usuario virtual detectado, guardando código en memoria temporal');
      // Para usuarios virtuales, usar una variable global temporal (en producción usar Redis)
      global.virtualUserVerifications = global.virtualUserVerifications || {};
      global.virtualUserVerifications[userId] = {
        verificationCode,
        verificationCodeExpires: expiresAt,
        verificationAttempts: 0,
        email: email
      };
      console.log('💾 DEBUG: Código guardado para usuario virtual:', userId);
    } else {
      console.log('🔄 DEBUG: Usuario real detectado, guardando en base de datos');
      await User.findByIdAndUpdate(userId, {
        verificationCode,
        verificationCodeExpires: expiresAt,
        verificationAttempts: 0
      });
      console.log('💾 DEBUG: Código guardado en base de datos para usuario:', userId);
    }

    // Enviar email con el código
    const { initializeEmailTransporter } = require('../utils/emailNotifications');
    const transporter = require('../utils/emailNotifications');
    
    // Función para enviar email de verificación
    const sendVerificationCodeEmail = async (userEmail, code, propertyName) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `🔐 Código de Verificación - Reserva en ${propertyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
            <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50; margin: 0; font-size: 2rem;">🔐 Verificación de Email</h1>
                <p style="color: #7f8c8d; margin: 10px 0 0; font-size: 1.1rem;">Para tu reserva en ${propertyName}</p>
              </div>
              
              <div style="background: #e8f8f5; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 10px; color: #2c3e50; font-size: 1.1rem;">Tu código de verificación es:</p>
                <div style="background: #27ae60; color: white; font-size: 2.5rem; font-weight: bold; padding: 15px; border-radius: 8px; letter-spacing: 0.3rem;">
                  ${code}
                </div>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  ⏰ <strong>Este código expira en 5 minutos</strong><br>
                  📱 Ingresa el código en la página de reserva para continuar
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #7f8c8d; margin: 0; font-size: 0.9rem;">
                  Si no solicitaste este código, puedes ignorar este email.<br>
                  <strong>BaconFort</strong> - Sistema de Reservas
                </p>
              </div>
            </div>
          </div>
        `
      };

      const nodemailer = require('nodemailer');
      const emailTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD
        }
      });

      await emailTransporter.sendMail(mailOptions);
    };

    await sendVerificationCodeEmail(email, verificationCode, propertyName);

    console.log('✅ SEND VERIFICATION: Código enviado exitosamente');

    res.json({
      success: true,
      message: 'Código de verificación enviado',
      expiresAt
    });

  } catch (error) {
    console.error('❌ SEND VERIFICATION: Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando código de verificación',
      error: error.message
    });
  }
});

// Verificar código de email
router.post('/verify-email-code', authenticateToken, async (req, res) => {
  try {
    const { email, code } = req.body;
    const userId = req.user.id;

    console.log('🔍 VERIFY CODE: Verificando código para:', email);

    // Verificar que el usuario esté autenticado
    // Permitir verificación para usuarios válidos (simplificado)
    const isValidUser = req.user && req.user.email;
    
    if (!isValidUser) {
      console.log('❌ DEBUG: Usuario no válido o sin email');
      return res.status(403).json({
        success: false,
        message: 'Usuario no válido para verificación de código'
      });
    }

    // Determinar si es usuario virtual o real
    const isVirtualUser = userId.includes('admin_') || userId.includes('roberto') || !userId.match(/^[0-9a-fA-F]{24}$/);
    
    let verificationData;
    
    if (isVirtualUser) {
      console.log('🔄 DEBUG: Verificando código para usuario virtual:', userId);
      // Para usuarios virtuales, obtener de memoria temporal
      const virtualVerifications = global.virtualUserVerifications || {};
      verificationData = virtualVerifications[userId];
      
      if (!verificationData) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró código de verificación. Solicita uno nuevo.'
        });
      }
    } else {
      console.log('🔄 DEBUG: Verificando código para usuario real en base de datos:', userId);
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      verificationData = {
        verificationCode: user.verificationCode,
        verificationCodeExpires: user.verificationCodeExpires,
        verificationAttempts: user.verificationAttempts || 0
      };
    }

    // Verificar que el código no haya expirado
    if (!verificationData.verificationCodeExpires || new Date() > verificationData.verificationCodeExpires) {
      return res.status(400).json({
        success: false,
        message: 'El código de verificación ha expirado'
      });
    }

    // Verificar límite de intentos
    if (verificationData.verificationAttempts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Demasiados intentos. Solicita un nuevo código'
      });
    }

    // Verificar el código
    if (verificationData.verificationCode !== code) {
      if (isVirtualUser) {
        global.virtualUserVerifications[userId].verificationAttempts += 1;
      } else {
        await User.findByIdAndUpdate(userId, {
          $inc: { verificationAttempts: 1 }
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Código de verificación incorrecto'
      });
    }

    // Código válido - limpiar datos de verificación
    if (isVirtualUser) {
      console.log('🧹 DEBUG: Limpiando datos de verificación para usuario virtual');
      delete global.virtualUserVerifications[userId];
    } else {
      console.log('🧹 DEBUG: Limpiando datos de verificación en base de datos');
      await User.findByIdAndUpdate(userId, {
        $unset: {
          verificationCode: 1,
          verificationCodeExpires: 1,
          verificationAttempts: 1
        }
      });
    }

    console.log('✅ VERIFY CODE: Código verificado exitosamente');

    res.json({
      success: true,
      message: 'Email verificado exitosamente'
    });

  } catch (error) {
    console.error('❌ VERIFY CODE: Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando código',
      error: error.message
    });
  }
});

// Ruta para solicitud de recuperación de contraseña
// Importar utilidad para envío de correos
const sendPasswordResetEmail = require('../utils/emailSender');

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('🔄 /auth/forgot-password - Email solicitado:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un email válido'
      });
    }

    // Verificar si es el admin (caso especial)
    if (email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) {
      console.log('ℹ️ Solicitud de recuperación para cuenta de administrador');
      
      // En producción enviaríamos un email real, pero en desarrollo generamos un token temporal
      const resetToken = crypto.randomBytes(20).toString('hex');
      
      return res.json({
        success: true,
        message: 'Si el email existe en nuestra base de datos, recibirás instrucciones para recuperar tu contraseña.',
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    }

    // Verificar si el usuario existe en la base de datos
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('⚠️ Usuario no encontrado, pero enviando respuesta positiva por seguridad');
      // Por seguridad, no revelamos si el email existe o no
      return res.json({
        success: true,
        message: 'Si el email existe en nuestra base de datos, recibirás instrucciones para recuperar tu contraseña.'
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // 1 hora

    // Almacenar el token en la base de datos
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Enviar email con el token
    console.log('✉️ Token de recuperación generado para:', email);
    
    // Intentar enviar el correo usando nuestra utilidad
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    
    if (emailSent) {
      console.log('✅ Correo enviado exitosamente a:', email);
    } else {
      console.warn('⚠️ No se pudo enviar el correo, pero continuamos el proceso');
    }
    
    res.json({
      success: true,
      message: 'Se han enviado instrucciones de recuperación a tu email.',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error('❌ ERROR en /auth/forgot-password:', error);
    res.status(500).json({
      success: false,
      error: 'Error procesando la solicitud de recuperación de contraseña'
    });
  }
});

// Ruta para resetear la contraseña con el token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un token y una nueva contraseña'
      });
    }

    // Para el administrador (caso especial)
    if (token.startsWith('admin_')) {
      console.log('ℹ️ Reinicio de contraseña para administrador');
      
      return res.json({
        success: true,
        message: 'Contraseña de administrador actualizada correctamente'
      });
    }

    // Buscar usuario por token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'El token de recuperación es inválido o ha expirado'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('✅ Contraseña actualizada correctamente para:', user.email);
    
    res.json({
      success: true,
      message: 'Tu contraseña ha sido actualizada correctamente'
    });

  } catch (error) {
    console.error('❌ ERROR en /auth/reset-password:', error);
    res.status(500).json({
      success: false,
      error: 'Error procesando el reinicio de contraseña'
    });
  }
});

module.exports = router;
