const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { authenticateToken, adminAuth } = require('../middleware/auth');
const { sendUserReservationNotification, sendAdminReservationNotification, sendUserCancellationNotification, sendAdminCancellationNotification } = require('../utils/emailNotifications');
const { createCashPaymentInfo } = require('../utils/paymentDefaults');
const { calculatePriceByProperty } = require('../utils/priceCalculator');

// @route   GET /api/reservations/test
// @desc    Endpoint de prueba para verificar conectividad
// @access  Public
router.get('/test', (req, res) => {
  console.log('🧪 RESERVATIONS TEST: Endpoint de reservas funcionando');
  res.json({
    success: true,
    message: 'Sistema de reservas funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// @route   POST /api/reservations
// @desc    Crear una nueva reserva
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('📝 RESERVATIONS: Iniciando creación de reserva');
    console.log('📝 RESERVATIONS: Datos recibidos:', req.body);
    console.log('📝 RESERVATIONS: Usuario autenticado:', req.user);
    console.log('🔍 DEBUG FULLNAME: fullName recibido =', req.body.fullName);
    console.log('🔍 DEBUG USER: userName del token =', req.user?.name);
    
    const {
      propertyId,
      propertyName,
      checkIn,
      checkOut,
      guests,
      fullName,
      email,
      phone,
      dni,
      idType,
      message,
      paymentInfo,
      priceInfo,
      status
    } = req.body;

    // Validaciones básicas
    if (!propertyId || !propertyName || !checkIn || !checkOut || !guests || !fullName || !email || !dni || !message) {
      console.log('❌ RESERVATIONS: Faltan campos obligatorios');
      return res.status(400).json({
        message: 'Todos los campos obligatorios deben ser completados'
      });
    }
    
    console.log('✅ RESERVATIONS: Validación básica exitosa');

    // Validar fechas
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        message: 'La fecha de check-in no puede ser anterior a hoy'
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        message: 'La fecha de check-out debe ser posterior al check-in'
      });
    }

    // Determinar el estado inicial
    // TODAS las nuevas reservas deben ser 'pending' hasta que el admin las apruebe
    const initialStatus = 'pending';  // Cambiado: siempre pending para nueva reserva
    
    // Calcular precio usando el sistema específico por propiedad
    const completePriceInfo = calculatePriceByProperty(propertyId, checkInDate, checkOutDate);
    
    console.log('💰 PRECIO DEBUG - propertyId:', propertyId);
    console.log('💰 PRECIO DEBUG - completePriceInfo:', completePriceInfo);
    console.log('💰 PRECIO DEBUG - totalAmount:', completePriceInfo?.totalAmount);
    console.log('💰 PRECIO DEBUG - currency:', completePriceInfo?.currency);
    
    // Procesar información de precio y configurar pago en efectivo
    let finalPaymentInfo;
    
    if (completePriceInfo && completePriceInfo.totalAmount > 0) {
      // Crear información de pago en efectivo con el precio calculado
      finalPaymentInfo = createCashPaymentInfo(
        completePriceInfo.totalAmount,
        completePriceInfo.currency || 'USD'
      );
      console.log('💰 PRECIO DEBUG - Usando precio calculado:', completePriceInfo.totalAmount);
    } else if (paymentInfo && paymentInfo.amount > 0) {
      // Si ya viene información de pago, asegurarnos de que sea en efectivo
      finalPaymentInfo = {
        ...paymentInfo,
        provider: 'efectivo',
        paymentMethod: 'efectivo'
      };
      console.log('💰 PRECIO DEBUG - Usando paymentInfo:', paymentInfo.amount);
    } else {
      // Información de pago en efectivo por defecto
      finalPaymentInfo = createCashPaymentInfo(0, 'USD');
      console.log('⚠️ PRECIO DEBUG - FALLBACK - Sin precio válido, usando 0');
    }
    
    console.log('💳 RESERVATIONS: Configurando pago en efectivo');
    console.log('💰 RESERVATIONS: Información de precio calculada:', completePriceInfo);
    console.log('💰 RESERVATIONS: priceInfo presente:', !!priceInfo);
    console.log('📊 RESERVATIONS: Estado inicial:', initialStatus);

    // Crear la reserva
    const reservation = new Reservation({
      userId: req.user.id || req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      propertyId,
      propertyName,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      fullName,
      email,
      phone,
      dni,
      idType: idType || 'dni',
      message,
      status: status || initialStatus,
      paymentInfo: finalPaymentInfo,
      priceInfo: completePriceInfo // AGREGAR información de precio calculada
    });

    await reservation.save();
    console.log('✅ RESERVATIONS: Reserva guardada exitosamente con ID:', reservation._id);

    // Enviar notificaciones por email
    try {
      console.log('📧 Enviando notificaciones de email...');
      console.log('🏠 Property name received:', propertyName);
      console.log('💳 Payment info:', paymentInfo);
      
      // Datos para los emails
      const emailData = {
        fullName,
        email,
        phone,
        dni,
        idType: idType || 'dni',
        propertyName,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        message,
        paymentInfo: finalPaymentInfo,
        priceInfo: completePriceInfo, // Usamos la información de precio mejorada
        status: initialStatus
      };

      // Enviar email al usuario (no bloquear si falla)
      sendUserReservationNotification(emailData).catch(error => {
        console.error('Error enviando email al usuario:', error);
      });

      // Enviar email al admin (no bloquear si falla)
      sendAdminReservationNotification(emailData).catch(error => {
        console.error('Error enviando email al admin:', error);
      });

      console.log('✅ Notificaciones de email programadas');
    } catch (error) {
      console.error('❌ Error programando emails:', error);
      // No fallar la reserva si hay error con los emails
    }

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reservation: {
        id: reservation._id,
        propertyName: reservation.propertyName,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guests: reservation.guests,
        status: reservation.status,
        createdAt: reservation.createdAt
      }
    });

  } catch (error) {
    console.error('Error creando reserva:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/reservations/my/pending-payment
// @desc    Obtener reservas del usuario que están pendientes de pago
// @access  Private
router.get('/my/pending-payment', authenticateToken, async (req, res) => {
  try {
    let reservations = [];

    // Si no hay conexión a MongoDB, usar datos de demo
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<cluster-url>')) {
      console.log('🧪 DEMO MODE: Usando reservas de prueba para pagos pendientes');
      
      // Datos de demo para reservas pendientes de pago
      reservations = [
        {
          _id: "demo_reservation_1",
          userId: req.user.id || req.user._id,
          userEmail: req.user.email,
          userName: req.user.name,
          propertyId: "ugarteche-2824",
          propertyName: "Ugarteche 2824",
          checkIn: new Date('2025-08-15'),
          checkOut: new Date('2025-08-18'),
          guests: 2,
          fullName: "Juan Pérez",
          email: "juan.perez@demo.com",
          phone: "+54 11 1234-5678",
          message: "Reserva para fin de semana romántico",
          status: "payment_pending",
          createdAt: new Date(),
          updatedAt: new Date(),
          approvedAt: new Date()
        },
        {
          _id: "demo_reservation_2", 
          userId: req.user.id || req.user._id,
          userEmail: req.user.email,
          userName: req.user.name,
          propertyId: "dorrego-1548",
          propertyName: "Dorrego 1548",
          checkIn: new Date('2025-09-01'),
          checkOut: new Date('2025-09-05'),
          guests: 4,
          fullName: "María González",
          email: "maria.gonzalez@demo.com",
          phone: "+54 11 9876-5432",
          message: "Vacaciones familiares",
          status: "confirmed",
          createdAt: new Date(),
          updatedAt: new Date(),
          approvedAt: new Date()
          // Sin paymentInfo - aparece como pendiente de pago
        }
      ];
    } else {
      // Modo normal con base de datos
      reservations = await Reservation.find({ 
        userId: req.user.id || req.user._id,
        $or: [
          { status: 'payment_pending' },
          { status: 'confirmed', paymentInfo: { $exists: false } },
          { status: 'confirmed', paymentInfo: null }
        ]
      }).sort({ approvedAt: -1 }); // Más recientemente aprobadas primero
    }

    res.json({
      success: true,
      data: reservations,
      count: reservations.length,
      message: reservations.length > 0 ? 'Tienes reservas pendientes de pago' : 'No tienes reservas pendientes de pago'
    });

  } catch (error) {
    console.error('Error obteniendo reservas pendientes de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/reservations/my
// @desc    Obtener todas las reservas del usuario autenticado
// @access  Private
router.get('/my', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 USER RESERVATIONS: Obteniendo reservas del usuario');
    console.log('🔍 USER RESERVATIONS: Usuario autenticado:', {
      id: req.user.id || req.user._id,
      email: req.user.email,
      name: req.user.name
    });
    
    const reservations = await Reservation.find({ userId: req.user.id || req.user._id })
      .sort({ createdAt: -1 }); // Más recientes primero

    console.log('🔍 USER RESERVATIONS: Reservas encontradas:', reservations.length);
    console.log('🔍 USER RESERVATIONS: Detalles de reservas:');
    reservations.forEach((reservation, index) => {
      console.log(`  ${index + 1}. ${reservation.propertyName} - Estado: ${reservation.status} - PaymentInfo: ${reservation.paymentInfo ? 'SÍ' : 'NO'}`);
    });

    res.json(reservations);

  } catch (error) {
    console.error('Error obteniendo reservas del usuario:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/reservations
// @desc    Obtener todas las reservas del usuario autenticado
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 RESERVATIONS: Obteniendo reservas del usuario');
    console.log('🔍 RESERVATIONS: req.user:', JSON.stringify(req.user, null, 2));
    
    // Buscar por diferentes campos de ID según el tipo de token
    const userId = req.user.userId || req.user.id || req.user._id;
    console.log('🔍 RESERVATIONS: Buscando reservas con userId:', userId);
    
    if (!userId) {
      console.log('❌ RESERVATIONS: No se encontró userId en el token');
      return res.status(400).json({
        success: false,
        message: 'Usuario no identificado en el token'
      });
    }
    
    const reservations = await Reservation.find({ userId: userId })
      .sort({ createdAt: -1 }); // Más recientes primero

    console.log('✅ RESERVATIONS: Encontradas', reservations.length, 'reservas');
    
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });

  } catch (error) {
    console.error('❌ RESERVATIONS: Error obteniendo reservas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/reservations/:id
// @desc    Obtener una reserva específica del usuario
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      userId: req.user.id || req.user._id
    });

    if (!reservation) {
      return res.status(404).json({
        message: 'Reserva no encontrada'
      });
    }

    res.json(reservation);

  } catch (error) {
    console.error('Error obteniendo reserva:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/reservations/:id/cancel
// @desc    Cancelar una reserva
// @access  Private
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      userId: req.user.id || req.user._id
    });

    if (!reservation) {
      return res.status(404).json({
        message: 'Reserva no encontrada'
      });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        message: 'La reserva ya está cancelada'
      });
    }

    if (reservation.status === 'completed') {
      return res.status(400).json({
        message: 'No se puede cancelar una reserva completada'
      });
    }

    reservation.status = 'cancelled';
    reservation.cancelledAt = new Date();
    await reservation.save();

    // Enviar notificaciones por email
    console.log('📧 Enviando notificaciones de cancelación...');
    
    // Preparar datos para las notificaciones
    const notificationData = {
      _id: reservation._id,
      fullName: reservation.fullName,
      email: reservation.email,
      propertyName: reservation.propertyName,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      guests: reservation.guests,
      cancelledAt: reservation.cancelledAt
    };

    // Enviar email al usuario (no bloquear si falla)
    try {
      await sendUserCancellationNotification(notificationData);
    } catch (emailError) {
      console.error('❌ Error enviando email al usuario:', emailError);
    }

    // Enviar email al admin (no bloquear si falla)
    try {
      await sendAdminCancellationNotification(notificationData);
    } catch (emailError) {
      console.error('❌ Error enviando email al admin:', emailError);
    }

    res.json({
      message: 'Reserva cancelada exitosamente',
      reservation
    });

  } catch (error) {
    console.error('Error cancelando reserva:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/reservations/admin/all
// @desc    Obtener todas las reservas (solo admin)
// @access  Private (Admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    console.log('🔍 ADMIN RESERVATIONS: Obteniendo todas las reservas');
    console.log('🔍 ADMIN RESERVATIONS: Admin autenticado:', {
      id: req.user.id || req.user._id,
      email: req.user.email,
      role: req.user.role
    });
    
    // Verificar que sea admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Acceso denegado. Solo administradores pueden ver todas las reservas.'
      });
    }

    const reservations = await Reservation.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    console.log('🔍 ADMIN RESERVATIONS: Total reservas encontradas:', reservations.length);
    console.log('🔍 ADMIN RESERVATIONS: Detalles de reservas:');
    reservations.forEach((reservation, index) => {
      console.log(`  ${index + 1}. ${reservation.propertyName} - Usuario: ${reservation.fullName} - Estado: ${reservation.status} - PaymentInfo: ${reservation.paymentInfo ? 'SÍ' : 'NO'}`);
      if (reservation.paymentInfo) {
        console.log(`     Pago: ${reservation.paymentInfo.provider} - ${reservation.paymentInfo.amount} ${reservation.paymentInfo.currency}`);
      }
    });

    res.json(reservations);

  } catch (error) {
    console.error('Error obteniendo todas las reservas:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/reservations/admin/:id/status
// @desc    Actualizar estado de una reserva (solo admin)
// @access  Private/Admin
router.put('/admin/:id/status', adminAuth, async (req, res) => {
  try {
    console.log('🔄 UPDATE STATUS: Iniciando actualización de estado');
    console.log('🔄 UPDATE STATUS: ID:', req.params.id);
    console.log('🔄 UPDATE STATUS: Body:', req.body);
    console.log('🔄 UPDATE STATUS: User:', req.user);
    
    // Verificar que el usuario sea admin
    if (req.user.role !== 'admin') {
      console.log('❌ UPDATE STATUS: Usuario no es admin');
      return res.status(403).json({
        message: 'Acceso denegado. Solo administradores pueden cambiar estados.'
      });
    }

    const { status, adminNotes, rejectedReason } = req.body;
    const validStatuses = ['pending', 'approved', 'payment_pending', 'confirmed', 'cancelled', 'completed', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Estado inválido. Estados válidos: pending, approved, payment_pending, confirmed, cancelled, completed, rejected'
      });
    }

    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        message: 'Reserva no encontrada'
      });
    }

    // Actualizar estado y metadatos según el nuevo estado
    reservation.status = status;
    reservation.updatedAt = new Date();
    
    if (adminNotes) {
      reservation.adminNotes = adminNotes;
    }

    // Si se aprueba la reserva
    if (status === 'approved') {
      reservation.approvedAt = new Date();
      reservation.approvedBy = req.user.name || req.user.email;
      // Cambiar automáticamente a payment_pending para que el usuario pueda pagar
      reservation.status = 'payment_pending';
    }

    // Si se rechaza la reserva
    if (status === 'rejected') {
      reservation.rejectedAt = new Date();
      reservation.rejectedReason = rejectedReason || 'No especificado';
    }

    // Si se completa la reserva, marcar pago como aprobado automáticamente
    if (status === 'completed' || status === 'completada') {
      reservation.paymentStatus = 'approved';
      reservation.paidAt = new Date();
      console.log(`💰 PAYMENT AUTO-UPDATE: Pago marcado como aprobado para reserva completada ${reservation._id}`);
    }

    await reservation.save();

    // Enviar notificación al usuario según el estado
    try {
      await sendStatusChangeNotification(reservation, status);
    } catch (emailError) {
      console.error('❌ Error enviando notificación de cambio de estado:', emailError);
    }

    console.log(`✅ ADMIN: Estado de reserva ${reservation._id} cambiado a: ${reservation.status}`);

    res.json({
      message: 'Estado de reserva actualizado exitosamente',
      reservation: {
        id: reservation._id,
        status: reservation.status,
        updatedAt: reservation.updatedAt,
        approvedAt: reservation.approvedAt,
        approvedBy: reservation.approvedBy
      }
    });
  } catch (error) {
    console.error('❌ UPDATE STATUS: Error actualizando estado de reserva:', error);
    console.error('❌ UPDATE STATUS: Stack trace:', error.stack);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// @route   DELETE /api/reservations/admin/:id
// @desc    Eliminar una reserva (solo admin)
// @access  Private (Admin only)
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    console.log('🗑️ ADMIN: Eliminando reserva:', req.params.id);
    
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        message: 'Reserva no encontrada'
      });
    }
    
    // Guardar información de la reserva antes de eliminarla
    const reservationInfo = {
      id: reservation._id,
      propertyName: reservation.propertyName,
      userName: reservation.fullName || reservation.userName,
      userEmail: reservation.email || reservation.userEmail,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut
    };
    
    // Eliminar la reserva
    await Reservation.findByIdAndDelete(req.params.id);
    
    console.log('✅ ADMIN: Reserva eliminada exitosamente:', reservationInfo);
    
    res.json({
      message: 'Reserva eliminada exitosamente',
      deletedReservation: reservationInfo
    });
    
  } catch (error) {
    console.error('❌ ADMIN: Error eliminando reserva:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/reservations/property/:propertyId
// @desc    Obtener reservas de una propiedad específica (para mostrar fechas ocupadas)
// @access  Public (sin autenticación para mostrar disponibilidad)
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    console.log(`📅 Solicitando reservas para propiedad: ${propertyId}`);
    
    // Obtener solo reservas confirmadas y pendientes para mostrar fechas ocupadas
    const reservations = await Reservation.find({
      propertyId: propertyId,
      status: { $in: ['confirmed', 'pending'] },
      checkOut: { $gte: new Date() } // Solo reservas futuras o actuales
    }).select('checkIn checkOut status propertyId propertyName createdAt');
    
    console.log(`📅 Encontradas ${reservations.length} reservas activas para ${propertyId}`);
    
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
    
  } catch (error) {
    console.error('Error obteniendo reservas de la propiedad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/reservations/:id/payment
// @desc    Procesar pago de una reserva
// @access  Private
router.put('/:id/payment', authenticateToken, async (req, res) => {
  try {
    console.log('💳 PAYMENT: Procesando pago para reserva:', req.params.id);
    console.log('💳 PAYMENT: Datos de pago recibidos:', req.body);
    
    const { paymentInfo, status } = req.body;
    const reservationId = req.params.id;
    const userId = req.user.userId || req.user.id || req.user._id;

    // Buscar la reserva
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      console.log('❌ PAYMENT: Reserva no encontrada:', reservationId);
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar que la reserva pertenece al usuario
    if (reservation.userId !== userId) {
      console.log('❌ PAYMENT: Acceso denegado - La reserva no pertenece al usuario');
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }

    // Actualizar la reserva con la información de pago
    reservation.paymentInfo = {
      provider: paymentInfo.method,
      paymentId: paymentInfo.paymentId,
      amount: paymentInfo.amount,
      currency: paymentInfo.currency,
      paymentMethod: paymentInfo.method,
      processedAt: new Date(),
      status: paymentInfo.status
    };
    
    reservation.status = status || 'confirmed';
    reservation.updatedAt = new Date();

    await reservation.save();

    console.log('✅ PAYMENT: Pago procesado exitosamente para reserva:', reservationId);

    // Aquí podrías enviar notificaciones por email
    try {
      console.log('📧 PAYMENT: Enviando notificación de pago confirmado...');
      // sendPaymentConfirmationEmail(reservation);
    } catch (emailError) {
      console.log('⚠️ PAYMENT: Error enviando email (no crítico):', emailError.message);
    }

    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      reservation: reservation
    });

  } catch (error) {
    console.error('❌ PAYMENT: Error procesando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/reservations/:id/payment-status
// @desc    Obtener estado de pago de una reserva
// @access  Private
router.get('/:id/payment-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar que el usuario sea el propietario de la reserva
    if (reservation.userId.toString() !== req.user.id && reservation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver esta reserva'
      });
    }

    res.json({
      success: true,
      reservation: {
        id: reservation._id,
        status: reservation.status,
        paymentInfo: reservation.paymentInfo || null,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estado de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Función auxiliar para enviar email de confirmación de pago
function sendUserPaymentConfirmation(emailData) {
  // Esta función se implementaría según tu sistema de emails existente
  console.log('📧 Enviando confirmación de pago a:', emailData.email);
  return Promise.resolve();
}

// Función auxiliar para enviar notificaciones de cambio de estado
async function sendStatusChangeNotification(reservation, newStatus) {
  const emailData = {
    fullName: reservation.fullName,
    email: reservation.email,
    propertyName: reservation.propertyName,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: reservation.guests,
    reservationId: reservation._id,
    status: newStatus,
    adminNotes: reservation.adminNotes
  };

  switch(newStatus) {
    case 'approved':
    case 'payment_pending':
      console.log('📧 Enviando notificación de aprobación y solicitud de pago a:', emailData.email);
      // Aquí implementarías el email específico para solicitar pago
      break;
    
    case 'confirmed':
      console.log('📧 Enviando confirmación final de reserva a:', emailData.email);
      break;
    
    case 'rejected':
      console.log('📧 Enviando notificación de rechazo a:', emailData.email);
      break;
    
    default:
      console.log('📧 Enviando notificación de cambio de estado a:', emailData.email, 'Nuevo estado:', newStatus);
  }
  
  return Promise.resolve();
}

// @route   PUT /api/reservations/admin/:id/reset-payment
// @desc    Resetear una reserva confirmada sin pago a payment_pending
// @access  Private/Admin
router.put('/admin/:id/reset-payment', adminAuth, async (req, res) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Acceso denegado. Solo administradores pueden resetear pagos.'
      });
    }

    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        message: 'Reserva no encontrada'
      });
    }

    // Solo permitir reset si está confirmada pero sin información de pago
    if (reservation.status === 'confirmed' && !reservation.paymentInfo) {
      reservation.status = 'payment_pending';
      reservation.updatedAt = new Date();
      await reservation.save();

      console.log(`✅ ADMIN: Reserva ${reservation._id} reseteada a payment_pending`);

      res.json({
        message: 'Reserva reseteada a pendiente de pago exitosamente',
        reservation: {
          id: reservation._id,
          status: reservation.status,
          updatedAt: reservation.updatedAt
        }
      });
    } else {
      res.status(400).json({
        message: 'Solo se pueden resetear reservas confirmadas sin información de pago'
      });
    }

  } catch (error) {
    console.error('Error reseteando reserva:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/reservations/admin/:id/register-cash-payment
// @desc    Registrar un pago en efectivo para una reserva
// @access  Private/Admin
router.put('/admin/:id/register-cash-payment', adminAuth, async (req, res) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Acceso denegado. Solo administradores pueden registrar pagos en efectivo.'
      });
    }

    const { amount, notes } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: 'El monto del pago es requerido'
      });
    }

    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        message: 'Reserva no encontrada'
      });
    }

    // Registrar el pago en efectivo
    reservation.paymentInfo = {
      provider: 'efectivo',
      amount: parseFloat(amount),
      currency: 'ARS',
      paymentMethod: 'efectivo',
      paidAt: new Date(),
      paymentStatus: 'approved',
      transactionId: `CASH-${Date.now()}`
    };

    // Actualizar estado de la reserva a confirmada
    reservation.status = 'confirmed';
    reservation.updatedAt = new Date();
    
    // Si hay notas, agregarlas
    if (notes) {
      reservation.adminNotes = reservation.adminNotes 
        ? `${reservation.adminNotes}\n\n[${new Date().toISOString()}] Pago en efectivo: ${notes}`
        : `[${new Date().toISOString()}] Pago en efectivo: ${notes}`;
    }

    await reservation.save();

    console.log(`✅ ADMIN: Pago en efectivo registrado para la reserva ${reservation._id}`);

    res.json({
      message: 'Pago en efectivo registrado exitosamente',
      reservation: {
        id: reservation._id,
        status: reservation.status,
        paymentInfo: reservation.paymentInfo,
        updatedAt: reservation.updatedAt
      }
    });
  } catch (error) {
    console.error('Error registrando pago en efectivo:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
