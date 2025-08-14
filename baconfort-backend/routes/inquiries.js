const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { sendEmail, formatDateSafe } = require('../utils/emailNotifications');
const Inquiry = require('../models/Inquiry');

// Endpoint público para crear consultas (sin autenticación)
router.post('/', async (req, res) => {
  try {
    console.log('🌐 PUBLIC INQUIRY ENDPOINT: Nueva consulta pública recibida');
    console.log('📋 PUBLIC INQUIRY ENDPOINT: Datos recibidos:', req.body);
    
    const {
      propertyId,
      propertyTitle,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      guestName,
      guestEmail,
      guestPhone,
      guestDni,
      guestPassport,
      customMessage
    } = req.body;

    // Validación de campos requeridos
    if (!propertyId || !propertyTitle || !checkIn || !checkOut || !guests || !totalPrice || !guestName || !guestEmail) {
      console.log('❌ PUBLIC INQUIRY: Faltan campos requeridos');
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos',
        required: ['propertyId', 'propertyTitle', 'checkIn', 'checkOut', 'guests', 'totalPrice', 'guestName', 'guestEmail']
      });
    }

    // Función para parsear fechas en formato DD/MM/YYYY
    const parseDateFromDDMMYYYY = (dateString) => {
      console.log('🔍 PUBLIC INQUIRY - parseDateFromDDMMYYYY: Input:', dateString);
      
      if (!dateString) {
        console.log('❌ PUBLIC INQUIRY - parseDateFromDDMMYYYY: Fecha vacía');
        return null;
      }
      
      // Si ya es un objeto Date válido
      if (dateString instanceof Date && !isNaN(dateString)) {
        console.log('✅ PUBLIC INQUIRY - parseDateFromDDMMYYYY: Ya es Date válido');
        return dateString;
      }
      
      // Si es string en formato DD/MM/YYYY
      if (typeof dateString === 'string') {
        // Verificar formato DD/MM/YYYY
        const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const match = dateString.match(ddmmyyyyRegex);
        
        if (match) {
          const [, day, month, year] = match;
          const date = new Date(year, month - 1, day); // month - 1 porque JavaScript usa 0-indexing para meses
          console.log('✅ PUBLIC INQUIRY - parseDateFromDDMMYYYY: Parseado DD/MM/YYYY:', date);
          return date;
        }
        
        console.log('❌ PUBLIC INQUIRY - parseDateFromDDMMYYYY: Formato no reconocido');
        return null;
      }
      
      console.log('❌ PUBLIC INQUIRY - parseDateFromDDMMYYYY: Tipo no reconocido');
      return null;
    };

    // Procesar las fechas
    const checkInDate = parseDateFromDDMMYYYY(checkIn);
    const checkOutDate = parseDateFromDDMMYYYY(checkOut);

    if (!checkInDate || !checkOutDate) {
      console.log('❌ PUBLIC INQUIRY: Error procesando fechas');
      return res.status(400).json({
        success: false,
        error: 'Formato de fecha inválido. Use DD/MM/YYYY',
        checkIn: checkIn,
        checkOut: checkOut
      });
    }

    console.log('✅ PUBLIC INQUIRY: Fechas procesadas:', { checkInDate, checkOutDate });

    // Crear nueva consulta
    const newInquiry = new Inquiry({
      userId: 'public-inquiry', // Para consultas públicas sin autenticación
      propertyId,
      propertyTitle,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      guestName,
      guestEmail,
      guestPhone,
      guestDni,
      guestPassport,
      customMessage,
      status: 'pending',
      createdAt: new Date()
    });

    // Guardar en la base de datos
    const savedInquiry = await newInquiry.save();
    console.log('✅ PUBLIC INQUIRY: Consulta guardada en BD:', savedInquiry._id);

    // Preparar datos para los emails usando fechas procesadas

    // Email de confirmación al cliente
    const clientEmailSubject = `Confirmación de Consulta - ${propertyTitle}`;
    const clientEmailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0; border-radius: 12px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: rgba(255,255,255,0.95); padding: 30px; text-align: center; border-bottom: 3px solid #6c5ce7;">
          <!-- Logo -->
          <div style="margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 15px 25px; border-radius: 12px; display: inline-block; font-size: 24px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);">
              🏡 BACONFORT
            </div>
          </div>
          <h1 style="color: #2d3436; margin: 0; font-size: 28px; font-weight: bold;">🏡 ¡Gracias por tu Consulta!</h1>
          <p style="color: #636e72; margin: 10px 0 0 0; font-size: 16px;">Hemos recibido tu solicitud de disponibilidad</p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px;">
          <p style="color: #2d3436; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Hemos recibido tu consulta de disponibilidad para <strong style="color: #6c5ce7;">${propertyTitle}</strong>.<br>
            Nuestro equipo la revisará y te responderemos a la brevedad.
          </p>

          <!-- Details Card -->
          <div style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(116, 185, 255, 0.3);">
            <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">📋 Detalles de tu Consulta</h3>
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #0984e3;">🏠 Propiedad:</strong> ${propertyTitle}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #0984e3;">📅 Check-in:</strong> ${formatDateSafe(checkInDate)}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #0984e3;">📅 Check-out:</strong> ${formatDateSafe(checkOutDate)}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #0984e3;">👥 Huéspedes:</strong> ${guests}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 16px;"><strong style="color: #00b894;">💰 Precio Total:</strong> <span style="background: #00b894; color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold; white-space: nowrap; display: inline-block;">$${totalPrice} USD</span></p>
            </div>
          </div>

          ${customMessage ? `
            <div style="background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); padding: 20px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(253, 121, 168, 0.3);">
              <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; text-align: center;">💬 Tu Mensaje</h3>
              <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px;">
                <p style="color: #2d3436; font-style: italic; margin: 0; font-size: 15px; line-height: 1.5;">"${customMessage}"</p>
              </div>
            </div>
          ` : ''}

          <!-- Footer Info -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #6c5ce7;">
            <p style="color: #636e72; font-size: 14px; margin: 5px 0;">
              <strong style="color: #2d3436;">📋 Número de consulta:</strong> ${savedInquiry._id}
            </p>
            <p style="color: #636e72; font-size: 14px; margin: 5px 0;">
              <strong style="color: #2d3436;">📅 Fecha de consulta:</strong> ${new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #2d3436; padding: 20px; text-align: center;">
          <p style="color: #b2bec3; margin: 0; font-size: 14px;">
            🏡 <strong style="color: white;">BaconFort</strong> - Tu alojamiento perfecto te está esperando
          </p>
        </div>
      </div>
    `;

    // Email de notificación al administrador
    const adminEmailSubject = `Nueva consulta de disponibilidad - ${propertyTitle}`;
    const adminEmailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: linear-gradient(135deg, #ff7675 0%, #d63031 100%); padding: 0; border-radius: 12px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: rgba(255,255,255,0.95); padding: 30px; text-align: center; border-bottom: 3px solid #e17055;">
          <!-- Logo -->
          <div style="margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 15px 25px; border-radius: 12px; display: inline-block; font-size: 24px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);">
              🏡 BACONFORT
            </div>
          </div>
          <h1 style="color: #2d3436; margin: 0; font-size: 28px; font-weight: bold;">🚨 Nueva Consulta de Disponibilidad</h1>
          <p style="color: #636e72; margin: 10px 0 0 0; font-size: 16px;">Acción requerida del administrador</p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px;">
          
          <!-- Property Details -->
          <div style="background: linear-gradient(135deg, #e17055 0%, #d63031 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(225, 112, 85, 0.3);">
            <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">🏠 Detalles de la Reserva Solicitada</h3>
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #d63031;">🏠 Propiedad:</strong> ${propertyTitle}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #d63031;">📅 Check-in:</strong> ${formatDateSafe(checkInDate)}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #d63031;">📅 Check-out:</strong> ${formatDateSafe(checkOutDate)}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #d63031;">👥 Huéspedes:</strong> ${guests}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 16px;"><strong style="color: #00b894;">💰 Precio Total:</strong> <span style="background: #00b894; color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold; white-space: nowrap; display: inline-block;">$${totalPrice} USD</span></p>
            </div>
          </div>

          <!-- Client Info -->
          <div style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(116, 185, 255, 0.3);">
            <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">👤 Información del Cliente</h3>
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #0984e3;">👤 Nombre:</strong> ${guestName}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #0984e3;">📧 Email:</strong> ${guestEmail}</p>
              ${guestPhone ? `<p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #0984e3;">📱 Teléfono:</strong> ${guestPhone}</p>` : ''}
              ${guestDni ? `<p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #0984e3;">🆔 DNI:</strong> ${guestDni}</p>` : ''}
            </div>
          </div>

          ${customMessage ? `
            <div style="background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); padding: 20px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(253, 121, 168, 0.3);">
              <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; text-align: center;">💬 Mensaje del Cliente</h3>
              <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px;">
                <p style="color: #2d3436; font-style: italic; margin: 0; font-size: 15px; line-height: 1.5;">"${customMessage}"</p>
              </div>
            </div>
          ` : ''}

          <!-- Action Required -->
          <div style="background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(253, 203, 110, 0.3);">
            <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">⚡ Acciones Requeridas</h3>
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">✅ Revisar la disponibilidad de la propiedad</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">🔍 Verificar la información del cliente</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">📧 Responder al cliente confirmando o denegando</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">🏡 Si es aprobada, el cliente podrá reservar</p>
            </div>
          </div>

          <!-- Footer Info -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #e17055;">
            <p style="color: #636e72; font-size: 14px; margin: 5px 0;">
              <strong style="color: #2d3436;">📋 ID de consulta:</strong> ${savedInquiry._id}
            </p>
            <p style="color: #636e72; font-size: 14px; margin: 5px 0;">
              <strong style="color: #2d3436;">📅 Fecha de consulta:</strong> ${new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #2d3436; padding: 20px; text-align: center;">
          <p style="color: #b2bec3; margin: 0; font-size: 14px;">
            🏡 <strong style="color: white;">BaconFort Admin Panel</strong> - Panel de Administración
          </p>
        </div>
      </div>
    `;

    // Enviar emails
    try {
      console.log('📧 PUBLIC INQUIRY: Enviando emails...');
      
      // Email al cliente
      await sendEmail(guestEmail, clientEmailSubject, clientEmailBody);
      console.log('✅ PUBLIC INQUIRY: Email enviado al cliente');
      
      // Email al administrador
      if (process.env.ADMIN_EMAIL) {
        await sendEmail(process.env.ADMIN_EMAIL, adminEmailSubject, adminEmailBody);
        console.log('✅ PUBLIC INQUIRY: Email enviado al administrador');
      } else {
        console.log('⚠️ PUBLIC INQUIRY: No se envió email al admin: ADMIN_EMAIL no configurado');
      }
      
    } catch (emailError) {
      console.error('❌ PUBLIC INQUIRY: Error enviando emails:', emailError);
      // No fallar la respuesta por problemas de email
    }

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Consulta creada exitosamente',
      inquiry: {
        id: savedInquiry._id,
        propertyTitle,
        checkIn: formatDateSafe(checkInDate),
        checkOut: formatDateSafe(checkOutDate),
        guests,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('❌ PUBLIC INQUIRY: Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Crear una nueva consulta de disponibilidad (con autenticación)
router.post('/send', authenticateToken, async (req, res) => {
  try {
    console.log('🌐 INQUIRY ENDPOINT: Nueva solicitud recibida');
    console.log('🔍 INQUIRY ENDPOINT: Usuario autenticado:', req.user);
    console.log('📋 INQUIRY ENDPOINT: Datos recibidos:', req.body);
    
    const {
      propertyId,
      propertyTitle,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      guestName,
      guestEmail,
      guestPhone,
      guestDni,
      customMessage
    } = req.body;

    // Validar que todos los campos necesarios estén presentes
    if (!propertyId || !propertyTitle || !checkIn || !checkOut || !guests || !totalPrice || !guestName || !guestEmail) {
      console.log('❌ INQUIRY ENDPOINT: Faltan campos obligatorios');
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    console.log('✅ INQUIRY ENDPOINT: Validación de campos exitosa');

    // Función para parsear fechas en formato DD/MM/YYYY a objetos Date válidos
    const parseDateFromDDMMYYYY = (dateString) => {
      if (!dateString) {
        console.log('⚠️ PARSE DATE: Fecha vacía recibida');
        return null;
      }
      
      console.log('🗓️ PARSE DATE: Parseando fecha:', dateString);
      
      // Si viene en formato DD/MM/YYYY
      if (typeof dateString === 'string' && dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const [day, month, year] = dateString.split('/').map(num => parseInt(num, 10));
        const dateObj = new Date(year, month - 1, day); // Mes es 0-indexed
        console.log('✅ PARSE DATE: DD/MM/YYYY parseado:', dateString, '->', dateObj);
        return dateObj;
      }
      
      // Si viene en formato YYYY-MM-DD
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dateObj = new Date(dateString);
        console.log('✅ PARSE DATE: YYYY-MM-DD parseado:', dateString, '->', dateObj);
        return dateObj;
      }
      
      // Si ya es un objeto Date
      if (dateString instanceof Date) {
        console.log('✅ PARSE DATE: Ya es Date object:', dateString);
        return dateString;
      }
      
      // Intentar parseo estándar como fallback
      const fallbackDate = new Date(dateString);
      if (!isNaN(fallbackDate.getTime())) {
        console.log('✅ PARSE DATE: Fallback exitoso:', dateString, '->', fallbackDate);
        return fallbackDate;
      }
      
      console.error('❌ PARSE DATE: No se pudo parsear:', dateString);
      return null;
    };

    // Parsear las fechas correctamente
    const checkInDate = parseDateFromDDMMYYYY(checkIn);
    const checkOutDate = parseDateFromDDMMYYYY(checkOut);
    
    if (!checkInDate || !checkOutDate) {
      console.log('❌ INQUIRY ENDPOINT: Error parseando fechas');
      return res.status(400).json({
        success: false,
        message: 'Fechas inválidas'
      });
    }

    // Crear la consulta en la base de datos
    console.log('💾 INQUIRY ENDPOINT: Creando consulta en base de datos...');
    const inquiry = new Inquiry({
      userId: req.user.id,
      propertyId,
      propertyTitle,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: parseInt(guests),
      totalPrice: parseFloat(totalPrice),
      guestName,
      guestEmail,
      guestPhone: guestPhone || '',
      guestDni: guestDni || '',
      customMessage: customMessage || '',
      status: 'pending', // pending, approved, rejected
      createdAt: new Date()
    });

    console.log('💾 INQUIRY ENDPOINT: Objeto inquiry creado:', inquiry);
    await inquiry.save();
    console.log('✅ INQUIRY ENDPOINT: Consulta guardada exitosamente con ID:', inquiry._id);

    // Función para formatear fechas correctamente evitando problemas de zona horaria
    const formatDateSafe = (dateString) => {
      if (!dateString) return 'No especificada';
      
      console.log('🗓️ DEBUG: Formateando fecha:', dateString, 'tipo:', typeof dateString);
      
      // Si la fecha viene en formato YYYY-MM-DD, parsear directamente sin timezone
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        console.log('🗓️ DEBUG: Fecha parseada como string:', { year, month, day });
        return `${day}/${month}/${year}`;
      }
      
      // Para fechas de tipo Date object, extraer componentes sin usar timezone
      if (dateString instanceof Date) {
        const year = dateString.getFullYear();
        const month = String(dateString.getMonth() + 1).padStart(2, '0');
        const day = String(dateString.getDate()).padStart(2, '0');
        console.log('🗓️ DEBUG: Fecha parseada como Date:', { year, month, day });
        return `${day}/${month}/${year}`;
      }
      
      // Para otros formatos de string, intentar parsear
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        console.log('🗓️ DEBUG: Fecha parseada con UTC:', { year, month, day });
        return `${day}/${month}/${year}`;
      } catch (error) {
        console.error('❌ Error formateando fecha:', error);
        return 'Fecha inválida';
      }
    };

    // Enviar notificación por email al administrador
    const adminEmailSubject = `Nueva consulta de disponibilidad - ${propertyTitle}`;
    const adminEmailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%); padding: 0; border-radius: 12px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: rgba(255,255,255,0.95); padding: 30px; text-align: center; border-bottom: 3px solid #6c5ce7;">
          <!-- Logo -->
          <div style="margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 15px 25px; border-radius: 12px; display: inline-block; font-size: 24px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);">
              🏡 BACONFORT
            </div>
          </div>
          <h1 style="color: #2d3436; margin: 0; font-size: 28px; font-weight: bold;">🔔 Nueva Consulta de Disponibilidad</h1>
          <p style="color: #636e72; margin: 10px 0 0 0; font-size: 16px;">Panel de Administración - Usuario Autenticado</p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px;">
          
          <!-- Property Details -->
          <div style="background: linear-gradient(135deg, #6c5ce7 0%, #5a52d5 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);">
            <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">🏠 Detalles de la Reserva Solicitada</h3>
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #6c5ce7;">🏠 Propiedad:</strong> ${propertyTitle}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #6c5ce7;">📅 Check-in:</strong> ${formatDateSafe(checkInDate)}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #6c5ce7;">📅 Check-out:</strong> ${formatDateSafe(checkOutDate)}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #6c5ce7;">👥 Huéspedes:</strong> ${guests}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 16px;"><strong style="color: #00b894;">💰 Precio Total:</strong> <span style="background: #00b894; color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold; white-space: nowrap; display: inline-block;">$${totalPrice} USD</span></p>
            </div>
          </div>

          <!-- Client Info -->
          <div style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(116, 185, 255, 0.3);">
            <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">👤 Información del Cliente</h3>
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #0984e3;">👤 Nombre:</strong> ${guestName}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #0984e3;">📧 Email:</strong> ${guestEmail}</p>
              ${guestPhone ? `<p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #0984e3;">📱 Teléfono:</strong> ${guestPhone}</p>` : ''}
              ${guestDni ? `<p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #0984e3;">🆔 DNI:</strong> ${guestDni}</p>` : ''}
            </div>
          </div>

          ${customMessage ? `
            <div style="background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); padding: 20px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(253, 121, 168, 0.3);">
              <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; text-align: center;">💬 Mensaje del Cliente</h3>
              <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px;">
                <p style="color: #2d3436; font-style: italic; margin: 0; font-size: 15px; line-height: 1.5;">"${customMessage}"</p>
              </div>
            </div>
          ` : ''}

          <!-- Action Required -->
          <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(0, 184, 148, 0.3);">
            <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">⚡ Acciones Requeridas</h3>
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">1️⃣ Revisar la disponibilidad de la propiedad para las fechas solicitadas</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">2️⃣ Verificar la información del cliente</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">3️⃣ Responder al cliente por email confirmando o denegando la disponibilidad</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">4️⃣ Si es aprobada, el cliente podrá proceder con la reserva</p>
            </div>
          </div>

          <!-- Footer Info -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #6c5ce7;">
            <p style="color: #636e72; font-size: 14px; margin: 5px 0;">
              <strong style="color: #2d3436;">📋 ID de consulta:</strong> ${inquiry._id}
            </p>
            <p style="color: #636e72; font-size: 14px; margin: 5px 0;">
              <strong style="color: #2d3436;">📅 Fecha de solicitud:</strong> ${new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #2d3436; padding: 20px; text-align: center;">
          <p style="color: #b2bec3; margin: 0; font-size: 14px;">
            🏡 <strong style="color: white;">BaconFort Admin Panel</strong> - Panel de Administración Avanzado
          </p>
        </div>
      </div>
    `;

    const adminEmail = process.env.ADMIN_EMAIL;
    console.log('🎯 DEBUG: Enviando email al admin:', adminEmail);
    console.log('🎯 DEBUG: process.env.ADMIN_EMAIL =', process.env.ADMIN_EMAIL);
    console.log('🎯 DEBUG: process.env.EMAIL_USER =', process.env.EMAIL_USER);
    
    if (!adminEmail) {
      console.error('❌ ADMIN_EMAIL no está configurado en variables de entorno');
      // No fallar la consulta si no hay email de admin configurado
    }

    try {
      if (adminEmail) {
        await sendEmail(
          adminEmail,
          adminEmailSubject,
          adminEmailBody
        );
        console.log('✅ Email al admin enviado exitosamente');
      } else {
        console.log('⚠️ No se envió email al admin: ADMIN_EMAIL no configurado');
      }
    } catch (emailError) {
      console.error('❌ Error enviando email al admin:', emailError);
      // No fallar la consulta si el email falla
    }

    // Enviar confirmación al cliente    
    const clientEmailSubject = `Consulta de Disponibilidad Recibida - ${propertyTitle}`;
    const clientEmailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 0; border-radius: 12px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: rgba(255,255,255,0.95); padding: 30px; text-align: center; border-bottom: 3px solid #00b894;">
          <!-- Logo -->
          <div style="margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 15px 25px; border-radius: 12px; display: inline-block; font-size: 24px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);">
              🏡 BACONFORT
            </div>
          </div>
          <h1 style="color: #2d3436; margin: 0; font-size: 28px; font-weight: bold;">✅ ¡Consulta Recibida!</h1>
          <p style="color: #636e72; margin: 10px 0 0 0; font-size: 16px;">Tu solicitud está siendo procesada</p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px;">
          <p style="color: #2d3436; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Hola <strong style="color: #00b894;">${guestName}</strong>,<br><br>
            Hemos recibido tu consulta de disponibilidad para la siguiente reserva:
          </p>

          <!-- Details Card -->
          <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(0, 184, 148, 0.3);">
            <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">📋 Detalles de tu Consulta</h3>
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #00a085;">🏠 Propiedad:</strong> ${propertyTitle}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #00a085;">📅 Check-in:</strong> ${formatDateSafe(checkInDate)}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #00a085;">📅 Check-out:</strong> ${formatDateSafe(checkOutDate)}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #00a085;">👥 Huéspedes:</strong> ${guests}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 16px;"><strong style="color: #6c5ce7;">💰 Precio Total:</strong> <span style="background: #6c5ce7; color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold; white-space: nowrap; display: inline-block;">$${totalPrice} USD</span></p>
            </div>
          </div>

          ${customMessage ? `
            <div style="background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); padding: 20px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(253, 121, 168, 0.3);">
              <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; text-align: center;">💬 Tu Mensaje</h3>
              <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px;">
                <p style="color: #2d3436; font-style: italic; margin: 0; font-size: 15px; line-height: 1.5;">"${customMessage}"</p>
              </div>
            </div>
          ` : ''}

          <!-- Next Steps -->
          <div style="background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(253, 203, 110, 0.3);">
            <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">🔄 ¿Qué sigue?</h3>
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">📧 Revisaremos tu consulta y la disponibilidad de la propiedad</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">⏰ Te responderemos por email en un plazo máximo de 24 horas</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">✅ Si hay disponibilidad, te confirmaremos y podrás proceder con la reserva</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">❌ Si no hay disponibilidad, te sugeriremos fechas alternativas</p>
            </div>
          </div>

          <!-- Footer Info -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #00b894;">
            <p style="color: #636e72; font-size: 14px; margin: 5px 0;">
              <strong style="color: #2d3436;">📋 Número de consulta:</strong> ${inquiry._id}
            </p>
            <p style="color: #636e72; font-size: 14px; margin: 5px 0;">
              <strong style="color: #2d3436;">📅 Fecha de solicitud:</strong> ${new Date().toLocaleString('es-ES')}
            </p>
          </div>

          <p style="color: #00b894; font-size: 16px; text-align: center; margin-top: 25px; font-weight: bold;">
            ¡Gracias por elegirnos! 🏡
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #2d3436; padding: 20px; text-align: center;">
          <p style="color: #b2bec3; margin: 0; font-size: 14px;">
            🏡 <strong style="color: white;">BaconFort</strong> - Tu alojamiento perfecto te está esperando
          </p>
        </div>
      </div>
    `;

    try {
      await sendEmail(guestEmail, clientEmailSubject, clientEmailBody);
    } catch (emailError) {
      console.error('Error enviando email al cliente:', emailError);
      // No fallar la consulta si el email falla
    }

    res.json({
      success: true,
      message: 'Consulta enviada exitosamente. Te responderemos por email en breve.',
      inquiryId: inquiry._id
    });

  } catch (error) {
    console.error('❌ INQUIRY ENDPOINT: Error creando consulta:', error);
    console.error('❌ INQUIRY ENDPOINT: Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor. Por favor, intenta de nuevo.'
    });
  }
});

// Obtener consultas del usuario autenticado
router.get('/my-inquiries', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 MY-INQUIRIES: Obteniendo consultas para usuario:', req.user);
    console.log('🔍 MY-INQUIRIES: Buscando por userId:', req.user.id);
    
    // Buscar consultas por userId (consultas autenticadas)
    const inquiriesByUserId = await Inquiry.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    // También buscar consultas por email (consultas públicas del mismo usuario)
    const inquiriesByEmail = await Inquiry.find({ 
      guestEmail: req.user.email,
      userId: { $ne: req.user.id } // Evitar duplicados
    }).sort({ createdAt: -1 });
    
    // Combinar ambos resultados
    const allInquiries = [...inquiriesByUserId, ...inquiriesByEmail]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10); // Limitar a 10 resultados

    console.log('✅ MY-INQUIRIES: Consultas por userId encontradas:', inquiriesByUserId.length);
    console.log('✅ MY-INQUIRIES: Consultas por email encontradas:', inquiriesByEmail.length);
    console.log('✅ MY-INQUIRIES: Total consultas:', allInquiries.length);

    res.json({
      success: true,
      inquiries: allInquiries,
      debug: {
        userId: req.user.id,
        userEmail: req.user.email,
        foundByUserId: inquiriesByUserId.length,
        foundByEmail: inquiriesByEmail.length,
        totalInquiries: allInquiries.length
      }
    });
  } catch (error) {
    console.error('❌ MY-INQUIRIES: Error obteniendo consultas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo consultas'
    });
  }
});

// Actualizar el estado de una consulta (para admin)
router.patch('/:inquiryId/status', authenticateToken, async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { status, adminResponse } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      inquiryId,
      { 
        status,
        adminResponse: adminResponse || '',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }

    // Función para formatear fechas correctamente evitando problemas de zona horaria
    const formatDateSafe = (dateString) => {
      if (!dateString) return 'No especificada';
      
      // Si la fecha viene en formato YYYY-MM-DD, parsear directamente
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Para otros formatos, usar Date pero agregando timezone offset
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      // Agregar offset de timezone para evitar cambios de día
      const offsetDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      return offsetDate.toLocaleDateString('es-ES');
    };

    // Enviar email al cliente con la respuesta
    const statusText = status === 'approved' ? 'APROBADA' : 'RECHAZADA';
    const statusColor = status === 'approved' ? '#27ae60' : '#e74c3c';
    
    const clientEmailSubject = `Respuesta a tu Consulta - ${inquiry.propertyTitle}`;
    const clientEmailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); padding: 0; border-radius: 12px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: rgba(255,255,255,0.95); padding: 30px; text-align: center; border-bottom: 3px solid ${statusColor};">
          <!-- Logo -->
          <div style="margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 15px 25px; border-radius: 12px; display: inline-block; font-size: 24px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);">
              🏡 BACONFORT
            </div>
          </div>
          <h1 style="color: ${statusColor}; margin: 0; font-size: 28px; font-weight: bold;">
            ${status === 'approved' ? '✅' : '❌'} Consulta ${statusText}
          </h1>
          <p style="color: #636e72; margin: 10px 0 0 0; font-size: 16px;">Respuesta a tu solicitud de disponibilidad</p>
        </div>

        <!-- Saludo -->
        <div style="background: white; padding: 30px 30px 20px 30px;">
          <p style="color: #2d3436; font-size: 16px; margin: 0;">Hola <strong style="color: ${statusColor};">${inquiry.guestName}</strong>,</p>
          <p style="color: #636e72; font-size: 16px; margin: 15px 0;">Hemos revisado tu consulta de disponibilidad y tenemos una respuesta:</p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 0 30px 30px 30px;">
          
          <!-- Property Details -->
          <div style="background: linear-gradient(135deg, #6c5ce7 0%, #5a52d5 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);">
            <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">🏠 Detalles de tu Consulta</h3>
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #6c5ce7;">🏠 Propiedad:</strong> ${inquiry.propertyTitle}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #6c5ce7;">📅 Check-in:</strong> ${formatDateSafe(inquiry.checkIn)}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #6c5ce7;">📅 Check-out:</strong> ${formatDateSafe(inquiry.checkOut)}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 15px;"><strong style="color: #6c5ce7;">👥 Huéspedes:</strong> ${inquiry.guests}</p>
              <p style="color: #2d3436; margin: 8px 0; font-size: 16px;"><strong style="color: #00b894;">💰 Precio Total:</strong> <span style="background: #00b894; color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold; white-space: nowrap; display: inline-block;">$${inquiry.totalPrice} USD</span></p>
            </div>
          </div>

          <!-- Status Response -->
          <div style="background: linear-gradient(135deg, ${status === 'approved' ? '#00b894, #00a085' : '#e17055, #d63031'}); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px ${status === 'approved' ? 'rgba(0, 184, 148, 0.3)' : 'rgba(225, 112, 85, 0.3)'};">
            <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
              ${status === 'approved' ? '✅' : '❌'} Estado: ${statusText}
            </h3>
            ${adminResponse ? `
              <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px; margin-top: 15px;">
                <h4 style="color: #2d3436; margin: 0 0 10px 0; font-size: 16px;">💬 Mensaje del administrador:</h4>
                <p style="color: #2d3436; font-style: italic; margin: 0; font-size: 15px; line-height: 1.5;">"${adminResponse}"</p>
              </div>
            ` : ''}
          </div>

          <!-- Next Steps -->
          ${status === 'approved' ? `
            <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(0, 184, 148, 0.3);">
              <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">🎉 ¡Excelente! ¿Qué sigue?</h3>
              <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
                <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">✅ Tu consulta ha sido aprobada</p>
                <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">🏠 La propiedad está disponible para las fechas solicitadas</p>
                <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">💳 Ahora puedes proceder con la reserva en nuestro sitio web</p>
                <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">📞 Si tienes alguna pregunta, no dudes en contactarnos</p>
              </div>
            </div>
          ` : `
            <div style="background: linear-gradient(135deg, #e17055 0%, #d63031 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(225, 112, 85, 0.3);">
              <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; text-align: center;">😔 Lo sentimos</h3>
              <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
                <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">❌ Lamentablemente no hay disponibilidad para las fechas solicitadas</p>
                <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">📅 Te sugerimos revisar fechas alternativas en nuestro sitio web</p>
                <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">📞 Contáctanos para explorar otras opciones disponibles</p>
                <p style="color: #2d3436; margin: 8px 0; font-size: 15px;">🏡 Tenemos muchas otras propiedades que podrían interesarte</p>
              </div>
            </div>
          `}

          <!-- Footer Info -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid ${statusColor};">
            <p style="color: #636e72; font-size: 14px; margin: 5px 0;">
              <strong style="color: #2d3436;">📋 Número de consulta:</strong> ${inquiry._id}
            </p>
            <p style="color: #636e72; font-size: 14px; margin: 5px 0;">
              <strong style="color: #2d3436;">📅 Fecha de respuesta:</strong> ${new Date().toLocaleString('es-ES')}
            </p>
          </div>

          <p style="color: ${statusColor}; font-size: 16px; text-align: center; margin-top: 25px; font-weight: bold;">
            ¡Gracias por elegirnos! 🏡
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #2d3436; padding: 20px; text-align: center;">
          <p style="color: #b2bec3; margin: 0; font-size: 14px;">
            🏡 <strong style="color: white;">BaconFort</strong> - Tu alojamiento perfecto te está esperando
          </p>
        </div>
      </div>
    `;

    try {
      await sendEmail(inquiry.guestEmail, clientEmailSubject, clientEmailBody);
    } catch (emailError) {
      console.error('Error enviando email de respuesta:', emailError);
    }

    res.json({
      success: true,
      message: 'Estado actualizado y cliente notificado',
      inquiry
    });

  } catch (error) {
    console.error('Error actualizando consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando consulta'
    });
  }
});

// Obtener todas las consultas (para admin)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    console.log('🎯 ADMIN INQUIRIES: Obteniendo todas las consultas');
    console.log('🎯 ADMIN INQUIRIES: Usuario:', req.user);
    
    // Verificar que el usuario sea admin
    const isAdminEmail = req.user && (req.user.email === 'admin@baconfort.com' || req.user.email === 'baconfort.centro@gmail.com');
    const isAdminRole = req.user && req.user.role === 'admin';
    
    console.log('🔍 ADMIN INQUIRIES: Verificación acceso:', {
      user: req.user?.email,
      role: req.user?.role,
      isAdminEmail,
      isAdminRole
    });
    
    if (!req.user || (!isAdminEmail && !isAdminRole)) {
      console.log('❌ ADMIN INQUIRIES: Acceso denegado para usuario:', req.user);
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores pueden ver todas las consultas.',
        debug: {
          hasUser: !!req.user,
          email: req.user?.email,
          role: req.user?.role,
          isAdminEmail,
          isAdminRole
        }
      });
    }

    console.log('✅ ADMIN INQUIRIES: Usuario admin verificado:', req.user.email);

    // Obtener consultas con paginación opcional
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status; // pending, approved, rejected
    
    let filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    
    const inquiries = await Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalInquiries = await Inquiry.countDocuments(filter);
    
    console.log(`✅ ADMIN INQUIRIES: Encontradas ${inquiries.length} consultas`);

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalInquiries / limit),
        totalInquiries,
        hasNext: page * limit < totalInquiries,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ ADMIN INQUIRIES: Error obteniendo consultas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo consultas'
    });
  }
});

// Eliminar una consulta (solo para admins)
router.delete('/:inquiryId', authenticateToken, async (req, res) => {
  try {
    console.log('🗑️ DELETE INQUIRY: Solicitud de eliminación recibida');
    console.log('🔍 DELETE INQUIRY: Usuario:', req.user);
    console.log('📋 DELETE INQUIRY: ID de consulta:', req.params.inquiryId);
    
    const { inquiryId } = req.params;

    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      console.log('❌ DELETE INQUIRY: Usuario no es administrador');
      console.log('🔍 DELETE INQUIRY: Usuario role:', req.user?.role);
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden eliminar consultas'
      });
    }

    // Buscar la consulta
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      console.log('❌ DELETE INQUIRY: Consulta no encontrada');
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }

    console.log('✅ DELETE INQUIRY: Consulta encontrada, eliminando...');
    
    // Eliminar la consulta
    await Inquiry.findByIdAndDelete(inquiryId);
    
    console.log('✅ DELETE INQUIRY: Consulta eliminada exitosamente');
    
    res.json({
      success: true,
      message: 'Consulta eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ DELETE INQUIRY: Error eliminando consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
