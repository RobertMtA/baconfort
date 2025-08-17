const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const router = express.Router();

// Middleware específico para desuscripción - bypass CORS
const allowDirectAccess = (req, res, next) => {
  // Permitir acceso directo desde navegadores para enlaces de desuscripción
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

// Esquema de Suscriptor
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastEmailSent: {
    type: Date,
    default: null
  }
});

// El índice en email ya se crea automáticamente por unique: true
// subscriberSchema.index({ email: 1 }); // Eliminado para evitar duplicado

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// Configuración de email (usa las mismas variables de entorno que el servidor principal)
let emailTransporter = null;

const setupEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('📧 Subscribers: Email credentials not configured - demo mode active');
    return;
  }

  try {
    emailTransporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      // Configuración optimizada
      pool: true,
      maxConnections: 1,
      maxMessages: 3
    });

    emailTransporter.verify((error, success) => {
      if (error) {
        console.log('📧 Subscribers: Email service temporarily unavailable - continuing without notifications');
        emailTransporter = null;
      } else {
        console.log('✅ Subscribers: Email notification service ready');
      }
    });
  } catch (error) {
    console.log('📧 Subscribers: Email setup incomplete - continuing without notifications');
    emailTransporter = null;
  }
};

// Inicializar transporter
setupEmailTransporter();

// Middleware de logging para suscriptores
router.use((req, res, next) => {
  console.log(`📧 SUBSCRIBERS: ${req.method} ${req.path}`);
  next();
});

// GET /api/subscribers - Obtener todos los suscriptores
router.get('/', async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    
    console.log(`📧 SUBSCRIBERS: Found ${subscribers.length} subscribers`);
    
    res.json({
      success: true,
      data: subscribers,
      count: subscribers.length
    });
  } catch (error) {
    console.error('❌ Error getting subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener suscriptores',
      error: error.message
    });
  }
});

// POST /api/subscribers - Crear nuevo suscriptor
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Verificar si ya existe
    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return res.status(409).json({
          success: false,
          message: 'Este email ya está suscrito'
        });
      } else {
        // Reactivar suscriptor inactivo
        existingSubscriber.active = true;
        await existingSubscriber.save();
        
        console.log(`📧 SUBSCRIBERS: Reactivated subscriber: ${email}`);
        
        return res.json({
          success: true,
          message: 'Suscripción reactivada exitosamente',
          subscriber: existingSubscriber
        });
      }
    }

    // Crear nuevo suscriptor
    const newSubscriber = new Subscriber({
      email: email.toLowerCase()
    });

    await newSubscriber.save();
    
    console.log(`📧 SUBSCRIBERS: New subscriber created: ${email}`);

    // Enviar email de bienvenida (opcional)
    if (emailTransporter) {
      try {
        await sendWelcomeEmail(email);
        console.log(`📧 SUBSCRIBERS: Welcome email sent to: ${email}`);
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError);
        // No fallar la suscripción por error de email
      }
    }

    res.status(201).json({
      success: true,
      message: 'Suscripción exitosa',
      subscriber: newSubscriber
    });

  } catch (error) {
    console.error('❌ Error creating subscriber:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar suscripción',
      error: error.message
    });
  }
});

// DELETE /api/subscribers/:id - Eliminar suscriptor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscriber = await Subscriber.findByIdAndDelete(id);
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Suscriptor no encontrado'
      });
    }

    console.log(`📧 SUBSCRIBERS: Deleted subscriber: ${subscriber.email}`);

    res.json({
      success: true,
      message: 'Suscriptor eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error deleting subscriber:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar suscriptor',
      error: error.message
    });
  }
});

// POST /api/subscribers/send-bulk-email - Enviar email masivo
router.post('/send-bulk-email', async (req, res) => {
  try {
    const { subscriberIds, subject, message } = req.body;

    if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un suscriptor'
      });
    }

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Asunto y mensaje son requeridos'
      });
    }

    if (!emailTransporter) {
      return res.status(503).json({
        success: false,
        message: 'Servicio de email no disponible'
      });
    }

    // Obtener suscriptores seleccionados
    const subscribers = await Subscriber.find({
      _id: { $in: subscriberIds },
      active: true
    });

    if (subscribers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron suscriptores activos'
      });
    }

    // Enviar emails
    const emailPromises = subscribers.map(subscriber => 
      sendBulkEmail(subscriber.email, subject, message)
    );

    const results = await Promise.allSettled(emailPromises);
    
    // Contar éxitos y fallos
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    // Actualizar fecha de último email enviado para suscriptores exitosos
    const successfulEmails = results
      .map((result, index) => result.status === 'fulfilled' ? subscribers[index].email : null)
      .filter(Boolean);

    if (successfulEmails.length > 0) {
      await Subscriber.updateMany(
        { email: { $in: successfulEmails } },
        { lastEmailSent: new Date() }
      );
    }

    console.log(`📧 SUBSCRIBERS: Bulk email sent - Success: ${successful}, Failed: ${failed}`);

    res.json({
      success: true,
      message: `Emails enviados exitosamente: ${successful}/${subscribers.length}`,
      statistics: {
        total: subscribers.length,
        successful,
        failed
      }
    });

  } catch (error) {
    console.error('❌ Error sending bulk email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar emails',
      error: error.message
    });
  }
});

// Función para enviar email de bienvenida
const sendWelcomeEmail = async (email) => {
  if (!emailTransporter) {
    throw new Error('Email transporter not available');
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: '¡Bienvenido/a a Baconfort! 🏠',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; border-radius: 15px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🏠 ¡Bienvenido/a a Baconfort!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Tu newsletter de alquileres temporales</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <h2 style="margin-top: 0; font-size: 20px;">📧 Suscripción Confirmada</h2>
          <p style="margin-bottom: 15px; line-height: 1.6;">
            Gracias por suscribirte a nuestro newsletter. Te mantendremos informado/a sobre:
          </p>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>🎁 Ofertas exclusivas y promociones</li>
            <li>🏠 Nuevos departamentos disponibles</li>
            <li>📅 Disponibilidad anticipada</li>
            <li>💡 Tips para tu estadía en Buenos Aires</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
             style="background: #f39c12; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            🏠 Explorar Propiedades
          </a>
        </div>
        
        <div style="text-align: center; opacity: 0.8; font-size: 14px;">
          <p style="margin: 0;">💜 Equipo Baconfort</p>
          <p style="margin: 5px 0 0 0;">© 2025 Baconfort - Alquileres Temporales</p>
          <p style="margin: 10px 0 0 0; font-size: 12px;">
            Si no deseas recibir más emails, puedes <a href="https://baconfort-production-084d.up.railway.app/api/subscribers/unsubscribe/${encodeURIComponent(email)}" style="color: #dc3545; text-decoration: underline;">darte de baja aquí</a>.
          </p>
        </div>
      </div>
    `
  };

  await emailTransporter.sendMail(mailOptions);
};

// Función para enviar email masivo
const sendBulkEmail = async (email, subject, message) => {
  if (!emailTransporter) {
    throw new Error('Email transporter not available');
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🏠 Baconfort</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Alquileres Temporales</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <div style="white-space: pre-wrap; line-height: 1.6; color: #333; font-size: 16px;">
${message}
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">💜 Equipo Baconfort</p>
          <p style="margin: 5px 0 0 0;">© 2025 Baconfort - Alquileres Temporales</p>
          <p style="margin: 10px 0 0 0; font-size: 12px;">
            Si no deseas recibir más emails, puedes <a href="https://baconfort-production-084d.up.railway.app/api/subscribers/unsubscribe/${encodeURIComponent(email)}" style="color: #dc3545; text-decoration: underline;">darte de baja aquí</a>.
          </p>
        </div>
      </div>
    `
  };

  await emailTransporter.sendMail(mailOptions);
};

// GET /api/subscribers/unsubscribe/:email - Página de baja
router.get('/unsubscribe/:email', allowDirectAccess, async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log(`📧 UNSUBSCRIBE: Request for email: ${email}`);
    
    // Buscar el suscriptor
    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email no encontrado - Baconfort</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; text-align: center; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏢 Baconfort</h1>
              <p>Departamentos de Lujo</p>
            </div>
            <div class="content">
              <h2>❓ Email no encontrado</h2>
              <p>El email <strong>${email}</strong> no está en nuestra lista de suscriptores.</p>
              <p>Es posible que ya hayas sido dado de baja anteriormente.</p>
              <a href="https://baconfort.com" class="btn">Volver al sitio web</a>
            </div>
          </div>
        </body>
        </html>
      `);
    }
    
    if (!subscriber.active) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ya dado de baja - Baconfort</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; text-align: center; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏢 Baconfort</h1>
              <p>Departamentos de Lujo</p>
            </div>
            <div class="content">
              <h2>✅ Ya estás dado de baja</h2>
              <p>El email <strong>${email}</strong> ya está dado de baja de nuestros emails.</p>
              <p>No recibirás más comunicaciones de nosotros.</p>
              <a href="https://baconfort.com" class="btn">Volver al sitio web</a>
            </div>
          </div>
        </body>
        </html>
      `);
    }
    
    // Mostrar página de confirmación
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Confirmar baja - Baconfort</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; text-align: center; }
          .btn { display: inline-block; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 10px; font-weight: bold; cursor: pointer; border: none; font-size: 16px; }
          .btn-danger { background: #dc3545; color: white; }
          .btn-secondary { background: #6c757d; color: white; }
          .btn:hover { opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏢 Baconfort</h1>
            <p>Departamentos de Lujo</p>
          </div>
          <div class="content">
            <h2>📧 Confirmar baja de suscripción</h2>
            <p>¿Estás seguro de que quieres darte de baja de nuestros emails?</p>
            <p>Email: <strong>${email}</strong></p>
            <p>Ya no recibirás ofertas especiales, promociones exclusivas ni novedades de nuestros departamentos.</p>
            
            <form method="POST" action="/api/subscribers/unsubscribe/${encodeURIComponent(email)}" style="margin: 20px 0;">
              <button type="submit" class="btn btn-danger">✅ Sí, darme de baja</button>
            </form>
            
            <a href="https://baconfort.com" class="btn btn-secondary">❌ Cancelar</a>
          </div>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('❌ Error in unsubscribe page:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// POST /api/subscribers/unsubscribe/:email - Procesar baja
router.post('/unsubscribe/:email', allowDirectAccess, async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log(`📧 UNSUBSCRIBE: Processing unsubscribe for: ${email}`);
    
    // Desactivar el suscriptor
    const result = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { active: false },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).send('Suscriptor no encontrado');
    }
    
    console.log(`✅ UNSUBSCRIBE: Successfully unsubscribed: ${email}`);
    
    // Mostrar página de confirmación
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Baja confirmada - Baconfort</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; text-align: center; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Baja confirmada</h1>
            <p>Te hemos dado de baja exitosamente</p>
          </div>
          <div class="content">
            <h2>📧 ${email}</h2>
            <p>Has sido dado de baja de nuestra lista de emails.</p>
            <p>Ya no recibirás promociones ni comunicaciones de Baconfort.</p>
            <p>Si cambias de opinión, puedes volver a suscribirte en cualquier momento desde nuestro sitio web.</p>
            <p>¡Gracias por haber sido parte de nuestra comunidad!</p>
            <a href="https://baconfort.com" class="btn">Volver al sitio web</a>
          </div>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('❌ Error processing unsubscribe:', error);
    res.status(500).send('Error interno del servidor');
  }
});

module.exports = router;

