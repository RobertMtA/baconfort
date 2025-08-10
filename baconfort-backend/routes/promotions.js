const express = require('express');
const router = express.Router();
const Promotion = require('../models/Promotion');
const Property = require('../models/Property');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { optionalAuth, adminAuth } = require('../middleware/auth');

// Configuración de email para promociones
let emailTransporter = null;

const setupEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('⚠️ Promotions: Email credentials not provided');
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

    emailTransporter.verify((error, success) => {
      if (error) {
        console.error('❌ Promotions: Email transporter error:', error.message);
        emailTransporter = null;
      } else {
        console.log('✅ Promotions: Email transporter ready for promotion notifications');
      }
    });
  } catch (error) {
    console.error('❌ Promotions: Error setting up email transporter:', error.message);
    emailTransporter = null;
  }
};

// Inicializar transporter para promociones
setupEmailTransporter();

// Importar modelo de Suscriptor existente (no redefinir)
const Subscriber = mongoose.model('Subscriber');

// Función para enviar promoción a suscriptores
const sendPromotionToSubscribers = async (promotion) => {
  console.log('🔄 sendPromotionToSubscribers: Iniciando función...');
  
  if (!emailTransporter) {
    console.log('⚠️ Promotions: Email transporter not available, skipping subscriber notification');
    return;
  }

  try {
    // Obtener todos los suscriptores activos
    console.log('📧 Promotions: Buscando suscriptores activos...');
    const subscribers = await Subscriber.find({ active: true });
    
    console.log(`📧 Promotions: Encontrados ${subscribers.length} suscriptores en total`);
    
    if (subscribers.length === 0) {
      console.log('📧 Promotions: No active subscribers found');
      return;
    }

    console.log(`📧 Promotions: Sending promotion "${promotion.title}" to ${subscribers.length} subscribers`);
    console.log('📧 Promotions: Lista de suscriptores:');
    subscribers.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.email} (activo: ${sub.active})`);
    });

    // Enviar emails a todos los suscriptores
    console.log('📧 Promotions: Iniciando envío de emails...');
    const emailPromises = subscribers.map(async (subscriber, index) => {
      try {
        console.log(`📤 Enviando email ${index + 1}/${subscribers.length} a: ${subscriber.email}`);
        
        // Crear el HTML del email personalizado para cada suscriptor
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🎉 Nueva Promoción - Baconfort</title>
            <style>
              body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .promotion-card { border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 20px 0; background: #f8f9ff; }
              .price-section { display: flex; align-items: center; gap: 15px; margin: 15px 0; }
              .original-price { text-decoration: line-through; color: #999; font-size: 1.2rem; }
              .promo-price { color: #e74c3c; font-weight: bold; font-size: 1.8rem; }
              .discount-badge { background: #e74c3c; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.9rem; }
              .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
              .validity { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 15px 0; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9rem; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 ¡Nueva Promoción Disponible!</h1>
                <p>Aprovecha esta oferta exclusiva para nuestros suscriptores</p>
              </div>
              
              <div class="content">
                <div class="promotion-card">
                  <h2 style="color: #333; margin-top: 0;">${promotion.title}</h2>
                  <p style="color: #666; line-height: 1.6;">${promotion.description}</p>
                  
                  <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong style="color: #2c3e50;">🏢 Propiedad: ${promotion.propertyName}</strong>
                  </div>
                  
                  <div class="price-section">
                    <span class="original-price">$${promotion.originalPrice.toLocaleString()}</span>
                    <span class="promo-price">$${promotion.promotionalPrice.toLocaleString()}</span>
                    <span class="discount-badge">
                      ${promotion.discountType === 'percentage' ? 
                        `${promotion.discountValue}% OFF` : 
                        `$${promotion.discountValue.toLocaleString()} OFF`}
                    </span>
                  </div>
                  
                  <div class="validity">
                    <strong>⏰ Válido desde:</strong> ${new Date(promotion.validFrom).toLocaleDateString('es-ES')} 
                    <strong>hasta:</strong> ${new Date(promotion.validTo).toLocaleDateString('es-ES')}
                  </div>
                  
                  ${promotion.terms ? `
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 0.9rem;">
                      <strong>📋 Términos y condiciones:</strong><br>
                      ${promotion.terms}
                    </div>
                  ` : ''}
                  
                  <div style="text-align: center; margin: 25px 0;">
                    <a href="https://baconfort.com/departamentos" class="cta-button">
                      Ver Promoción Completa
                    </a>
                  </div>
                </div>
                
                <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #74b9ff, #0984e3); border-radius: 10px; color: white;">
                  <h3 style="margin: 0 0 10px 0;">🔥 ¡Oferta por Tiempo Limitado!</h3>
                  <p style="margin: 0; opacity: 0.9;">Esta promoción es exclusiva para suscriptores y tiene disponibilidad limitada.</p>
                </div>
              </div>
              
              <div class="footer">
                <p><strong>Baconfort - Departamentos de Lujo</strong></p>
                <p>📧 Email: baconfort.centro@gmail.com | 🌐 Web: baconfort.com</p>
                <p style="font-size: 0.8rem; margin-top: 15px;">
                  Recibiste este email porque estás suscrito a nuestras promociones.<br>
                  Si no deseas recibir más emails, puedes <a href="https://baconfort-production-084d.up.railway.app/api/subscribers/unsubscribe/${encodeURIComponent(subscriber.email)}" style="color: #dc3545; text-decoration: underline;">darte de baja aquí</a>.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: subscriber.email,
          subject: `🎉 Nueva Promoción: ${promotion.title} - Baconfort`,
          html: emailHtml
        });

        // Actualizar fecha del último email enviado
        await Subscriber.findByIdAndUpdate(subscriber._id, {
          lastEmailSent: new Date()
        });

        console.log(`✅ Promotion email sent successfully to: ${subscriber.email}`);
        return { success: true, email: subscriber.email };
      } catch (error) {
        console.error(`❌ Error sending promotion email to ${subscriber.email}:`, error.message);
        console.error(`❌ Error details:`, error);
        return { success: false, email: subscriber.email, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    
    // Contar resultados
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`📊 Promotions: Resumen de envío:`);
    console.log(`   ✅ Exitosos: ${successful}`);
    console.log(`   ❌ Fallaron: ${failed}`);
    
    if (failed > 0) {
      console.log(`❌ Emails que fallaron:`);
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.email}: ${r.error}`);
      });
    }
    
    console.log(`✅ Promotions: Promotion "${promotion.title}" processing completed`);
    
    // Devolver los resultados del envío
    return {
      totalAttempts: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      errors: results.filter(r => !r.success).map(r => `${r.email}: ${r.error}`)
    };

  } catch (error) {
    console.error('❌ Promotions: Error sending promotion to subscribers:', error);
    console.error('❌ Promotions: Error stack:', error.stack);
    
    // Devolver error en formato consistente
    return {
      totalAttempts: 0,
      successful: 0,
      failed: 1,
      errors: [error.message]
    };
  }
};

// @route   GET /api/promotions
// @desc    Obtener todas las promociones activas
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      limit = 50, 
      page = 1, 
      featured = false,
      propertyId,
      active = true 
    } = req.query;

    const filter = {};
    
    // Manejar filtro de estado activo
    if (active === 'true') {
      filter.isActive = true;
    } else if (active === 'false') {
      filter.isActive = false;
    }
    // Si active === 'all', no agregamos filtro de isActive
    
    if (featured === 'true') filter.isFeatured = true;
    if (propertyId) filter.propertyId = propertyId;

    // Solo mostrar promociones vigentes al público
    if (!req.user || req.user.role !== 'admin') {
      const now = new Date();
      filter.validFrom = { $lte: now };
      filter.validTo = { $gte: now };
    }

    console.log('🔍 Buscando promociones con filtro:', filter);
    console.log('👤 Usuario:', req.user ? `${req.user.email} (${req.user.role})` : 'Sin autenticar');

    const promotions = await Promotion.find(filter)
      .sort({ priority: -1, isFeatured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Promotion.countDocuments(filter);
    
    console.log(`📊 Promociones encontradas: ${promotions.length} de ${total} total`);
    console.log('📋 IDs de promociones:', promotions.map(p => `${p._id} (${p.title} - ${p.isActive ? 'ACTIVA' : 'INACTIVA'})`));

    res.json({
      success: true,
      data: promotions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error obteniendo promociones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/promotions/admin
// @desc    Obtener todas las promociones para administración
// @access  Admin
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const { 
      limit = 20, 
      page = 1, 
      status = 'all',
      propertyId 
    } = req.query;

    const filter = {};
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (status === 'expired') {
      filter.validTo = { $lt: new Date() };
    }
    if (propertyId && propertyId !== 'all') filter.propertyId = propertyId;

    const promotions = await Promotion.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Promotion.countDocuments(filter);

    console.log(`✅ ADMIN PROMOTIONS: Encontradas ${promotions.length} promociones`);

    res.json({
      success: true,
      data: promotions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ ADMIN PROMOTIONS: Error obteniendo promociones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/promotions
// @desc    Crear nueva promoción
// @access  Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      propertyId,
      discountType,
      discountValue,
      originalPrice,
      validFrom,
      validTo,
      image,
      terms,
      priority,
      isFeatured,
      maxRedemptions
    } = req.body;

    // Verificar que la propiedad existe
    const property = await Property.findOne({ id: propertyId });
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }

    // Calcular precio promocional
    let promotionalPrice = originalPrice;
    if (discountType === 'percentage') {
      promotionalPrice = originalPrice - (originalPrice * (discountValue / 100));
    } else if (discountType === 'fixed') {
      promotionalPrice = originalPrice - discountValue;
    }

    const promotion = new Promotion({
      title,
      description,
      propertyId,
      propertyName: property.title,
      discountType,
      discountValue,
      originalPrice,
      promotionalPrice: Math.round(promotionalPrice),
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      image,
      terms: terms || '',
      priority: priority || 0,
      isFeatured: isFeatured || false,
      maxRedemptions,
      createdBy: req.user?.id || 'admin'
    });

    await promotion.save();

    console.log(`✅ PROMOTION CREATED: ${promotion.title} para ${promotion.propertyName}`);

    // Enviar promoción a suscriptores automáticamente si está activa y es destacada
    let emailResults = null;
    if (promotion.isActive && promotion.isFeatured) {
      console.log(`📧 PROMOTIONS: Sending featured promotion "${promotion.title}" to subscribers...`);
      console.log(`📧 PROMOTIONS: isActive=${promotion.isActive}, isFeatured=${promotion.isFeatured}`);
      
      try {
        // Enviar inmediatamente y obtener resultados
        console.log(`📧 PROMOTIONS: Calling sendPromotionToSubscribers...`);
        emailResults = await sendPromotionToSubscribers(promotion);
        console.log(`📧 PROMOTIONS: Email sending completed with results:`, emailResults);
      } catch (error) {
        console.error('❌ PROMOTIONS: Error sending emails:', error);
        emailResults = {
          totalAttempts: 0,
          successful: 0,
          failed: 1,
          errors: [error.message]
        };
      }
    } else {
      console.log(`📧 PROMOTIONS: Promotion "${promotion.title}" not sent to subscribers`);
      console.log(`📧 PROMOTIONS: isActive=${promotion.isActive}, isFeatured=${promotion.isFeatured}`);
    }

    res.status(201).json({
      success: true,
      message: 'Promoción creada exitosamente',
      data: promotion,
      emailSent: promotion.isActive && promotion.isFeatured,
      emailResults: emailResults
    });

  } catch (error) {
    console.error('❌ Error creando promoción:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/promotions/:id/send-to-subscribers
// @desc    Enviar promoción específica a todos los suscriptores
// @access  Admin
router.post('/:id/send-to-subscribers', adminAuth, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promoción no encontrada'
      });
    }

    console.log(`📧 MANUAL SEND: Sending promotion "${promotion.title}" to subscribers...`);
    
    // Enviar promoción a suscriptores
    await sendPromotionToSubscribers(promotion);
    
    res.json({
      success: true,
      message: `Promoción "${promotion.title}" enviada a suscriptores exitosamente`
    });

  } catch (error) {
    console.error('❌ Error enviando promoción a suscriptores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/promotions/:id
// @desc    Actualizar promoción
// @access  Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promoción no encontrada'
      });
    }

    const updates = { ...req.body };
    
    console.log(`🔧 ACTUALIZANDO PROMOCIÓN ${req.params.id}:`);
    console.log('📝 Datos recibidos:', updates);
    
    // Solo recalcular precio promocional si:
    // 1. Se están actualizando campos de descuento Y
    // 2. NO se está enviando un precio promocional explícito
    const isUpdatingDiscountFields = !!(updates.originalPrice || updates.discountType || updates.discountValue);
    const isManualPriceUpdate = updates.hasOwnProperty('promotionalPrice');
    
    console.log('🔍 ¿Actualizando campos de descuento?', isUpdatingDiscountFields);
    console.log('🔍 ¿Precio promocional manual?', isManualPriceUpdate);
    
    if (isUpdatingDiscountFields && !isManualPriceUpdate) {
      console.log('🔢 Recalculando precio promocional automáticamente...');
      const originalPrice = updates.originalPrice || promotion.originalPrice;
      const discountType = updates.discountType || promotion.discountType;
      const discountValue = updates.discountValue || promotion.discountValue;

      if (discountType === 'percentage') {
        updates.promotionalPrice = Math.round(originalPrice - (originalPrice * (discountValue / 100)));
        console.log(`💰 Precio calculado (${discountValue}%): ${updates.promotionalPrice}`);
      } else if (discountType === 'fixed') {
        updates.promotionalPrice = Math.round(originalPrice - discountValue);
        console.log(`💰 Precio calculado (-$${discountValue}): ${updates.promotionalPrice}`);
      }
    } else if (isManualPriceUpdate) {
      console.log(`💰 Usando precio promocional manual: ${updates.promotionalPrice}`);
    } else {
      console.log('📝 Sin cambios en precios');
    }

    Object.assign(promotion, updates);
    await promotion.save();

    console.log(`✅ PROMOTION UPDATED: ${promotion.title}`);
    console.log(`💰 Precios finales - Original: $${promotion.originalPrice}, Promocional: $${promotion.promotionalPrice}`);
    console.log('📋 Datos completos guardados:', {
      title: promotion.title,
      originalPrice: promotion.originalPrice,
      promotionalPrice: promotion.promotionalPrice,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue
    });

    res.json({
      success: true,
      message: 'Promoción actualizada exitosamente',
      data: promotion
    });

  } catch (error) {
    console.error('❌ Error actualizando promoción:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/promotions/:id
// @desc    Eliminar promoción
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promoción no encontrada'
      });
    }

    await Promotion.findByIdAndDelete(req.params.id);

    console.log(`✅ PROMOTION DELETED: ${promotion.title}`);

    res.json({
      success: true,
      message: 'Promoción eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando promoción:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/promotions/:id/toggle-status
// @desc    Activar/desactivar promoción
// @access  Admin
router.put('/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promoción no encontrada'
      });
    }

    promotion.isActive = !promotion.isActive;
    await promotion.save();

    console.log(`✅ PROMOTION STATUS: ${promotion.title} - ${promotion.isActive ? 'Activada' : 'Desactivada'}`);

    res.json({
      success: true,
      message: `Promoción ${promotion.isActive ? 'activada' : 'desactivada'} exitosamente`,
      data: promotion
    });

  } catch (error) {
    console.error('❌ Error cambiando estado de promoción:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/promotions/:id/priority
// @desc    Actualizar prioridad de promoción
// @access  Admin
router.put('/:id/priority', adminAuth, async (req, res) => {
  try {
    const { priority } = req.body;
    
    if (priority === undefined || priority === null) {
      return res.status(400).json({
        success: false,
        error: 'Prioridad es requerida'
      });
    }

    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promoción no encontrada'
      });
    }

    const oldPriority = promotion.priority;
    promotion.priority = parseInt(priority);
    await promotion.save();

    console.log(`✅ PROMOTION PRIORITY: ${promotion.title} - ${oldPriority} → ${promotion.priority}`);

    res.json({
      success: true,
      message: 'Prioridad actualizada exitosamente',
      data: promotion
    });

  } catch (error) {
    console.error('❌ Error actualizando prioridad de promoción:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;

