// utils/emailNotifications.js
const nodemailer = require('nodemailer');

let emailTransporter = null;

// Función para inicializar el transporter de email
const initializeEmailTransporter = async () => {
  console.log('📧 EMAILNOTIFICATIONS: Inicializando...');
  
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_APP_PASSWORD;
  
  console.log('📧 EMAILNOTIFICATIONS: EMAIL_USER =', emailUser ? 'CONFIGURADO' : 'NO CONFIGURADO');
  console.log('📧 EMAILNOTIFICATIONS: EMAIL_APP_PASSWORD =', emailPass ? 'CONFIGURADO' : 'NO CONFIGURADO');
  
  if (!emailUser || !emailPass) {
    console.error('❌ EMAILNOTIFICATIONS: Variables de entorno EMAIL_USER y EMAIL_APP_PASSWORD no están configuradas');
    return false;
  }

  try {
    emailTransporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    
    console.log('✅ EMAILNOTIFICATIONS: Transporter configurado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ EMAILNOTIFICATIONS: Error configurando transporter:', error);
    return false;
  }
};

// Función helper para formatear fechas con zona horaria de Argentina (Buenos Aires)
const formatDateSafe = (dateValue) => {
  console.log('🗓️ formatDateSafe: Entrada:', dateValue, typeof dateValue);
  
  try {
    if (!dateValue) {
      console.warn('⚠️ formatDateSafe: Fecha vacía o undefined');
      return 'Fecha no especificada';
    }
    
    let dateObj;
    
    // Si la fecha viene en formato ISO (YYYY-MM-DD), crear fecha en zona de Argentina
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      dateObj = new Date(dateValue + 'T12:00:00-03:00');
      console.log('🗓️ formatDateSafe: Fecha ISO convertida para Argentina:', dateObj);
    } else if (dateValue instanceof Date) {
      dateObj = dateValue;
      console.log('🗓️ formatDateSafe: Ya es Date object:', dateObj);
    } else {
      // Intentar convertir a Date
      dateObj = new Date(dateValue);
      console.log('🗓️ formatDateSafe: Forced conversion:', dateValue, '->', dateObj);
    }
    
    // Verificar que es una fecha válida
    if (isNaN(dateObj.getTime())) {
      console.warn('⚠️ formatDateSafe: Fecha inválida después del parseo:', dateValue, '->', dateObj);
      return 'Fecha inválida';
    }
    
    // Formatear usando zona horaria de Argentina
    const formatted = dateObj.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    console.log('✅ formatDateSafe: Resultado final Argentina:', dateValue, '->', formatted);
    return formatted;
    
  } catch (error) {
    console.error('❌ formatDateSafe: Error formateando fecha:', error, dateValue);
    return 'Error en fecha';
  }
};

// Función para enviar notificación de reserva al usuario
const sendUserReservationNotification = async (reservationData) => {
  console.log('📧 SENDUSER: Iniciando envío de email al usuario...');
  console.log('📧 SENDUSER: Datos recibidos:', reservationData);
  
  if (!emailTransporter) {
    console.error('Email transporter no configurado');
    return false;
  }

  const { fullName, email, phone, dni, idType, propertyName, checkIn, checkOut, guests, message, paymentInfo, priceInfo, status } = reservationData;
  
  // Asegurar que propertyName tenga un valor
  const displayPropertyName = propertyName || 'Departamento no especificado';
  
  const checkInDate = formatDateSafe(checkIn);
  const checkOutDate = formatDateSafe(checkOut);

  // Determinar el tipo de reserva
  const isConfirmed = status === 'confirmed' && paymentInfo;
  const statusText = isConfirmed ? 'CONFIRMADA' : 'PENDIENTE DE APROBACIÓN';
  const statusColor = isConfirmed ? '#27ae60' : '#f39c12';
  const statusIcon = isConfirmed ? '✅' : '⏳';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${statusIcon} Reserva ${statusText} - ${displayPropertyName} | BaconFort`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: ${statusColor}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: white; text-align: center; margin-bottom: 10px;">
            ${statusIcon} BaconFort - Reserva ${statusText}
          </h2>
          <p style="text-align: center; color: white; margin: 0;">
            ${isConfirmed ? '¡Tu reserva está confirmada!' : 'Hemos recibido tu solicitud de reserva'}
          </p>
        </div>
        
        <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #3498db; margin-bottom: 20px;">¡Hola ${fullName}!</h3>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #2c3e50; margin-bottom: 15px;">📋 Detalles de tu Reserva:</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                <strong style="color: #3498db;">🏠 Propiedad:</strong> ${displayPropertyName}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                <strong style="color: #3498db;">📅 Check-in:</strong> ${checkInDate}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                <strong style="color: #3498db;">📅 Check-out:</strong> ${checkOutDate}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                <strong style="color: #3498db;">👥 Huéspedes:</strong> ${guests} persona(s)
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                <strong style="color: #3498db;">👤 Nombre:</strong> ${fullName}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                <strong style="color: #3498db;">📧 Email:</strong> ${email}
              </li>
              ${phone ? `
                <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                  <strong style="color: #3498db;">📱 Teléfono:</strong> ${phone}
                </li>
              ` : ''}
              <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                <strong style="color: #3498db;">🆔 ${idType === 'passport' ? 'Pasaporte' : 'DNI'}:</strong> ${dni}
              </li>
              ${(() => {
                // Calcular noches
                const checkInDateObj = new Date(checkIn);
                const checkOutDateObj = new Date(checkOut);
                const nights = Math.ceil((checkOutDateObj - checkInDateObj) / (1000 * 60 * 60 * 24));
                
                if (priceInfo && priceInfo.totalAmount > 0) {
                  const currency = priceInfo.currency === 'USD' ? 'US$' : '$';
                  const totalAmount = priceInfo.totalAmount;
                  const deposit = Math.round(totalAmount * 0.3);
                  
                  return `
                    <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                      <strong style="color: #3498db;">�️ Duración:</strong> ${nights} noches
                    </li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                      <strong style="color: #3498db;">💰 Monto total:</strong> ${currency}${totalAmount.toLocaleString()}
                    </li>
                    <li style="padding: 8px 0;">
                      <strong style="color: #3498db;">🔒 Seña requerida:</strong> ${currency}${deposit.toLocaleString()} (30% del total)
                    </li>
                  `;
                } else {
                  return `
                    <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                      <strong style="color: #3498db;">🗓️ Duración:</strong> ${nights} noches
                    </li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                      <strong style="color: #3498db;">💰 Monto total:</strong> A confirmar según disponibilidad
                    </li>
                    <li style="padding: 8px 0;">
                      <strong style="color: #3498db;">🔒 Seña requerida:</strong> 30% del total para confirmar reserva
                    </li>
                  `;
                }
              })()}
            </ul>
          </div>
          
          ${priceInfo && priceInfo.totalAmount > 0 ? `
            <div style="background-color: #e8f5e8; border-left: 4px solid #27ae60; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #27ae60; margin-bottom: 15px;">💳 Información de Pago</h4>
              <p style="margin: 10px 0; color: #2c3e50;">
                <strong>✅ Seña requerida:</strong> ${priceInfo.currency === 'USD' ? 'US$' : '$'}${Math.round(priceInfo.totalAmount * 0.3).toLocaleString()} (30% del total) para validar la reserva.
              </p>
              <p style="margin: 10px 0; color: #2c3e50;">
                <strong>📞 Próximos pasos:</strong> El administrador se pondrá en contacto contigo dentro de las próximas 24 horas para confirmar disponibilidad y proporcionarte los datos para realizar el depósito del 30%.
              </p>
            </div>
          ` : `
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #856404; margin-bottom: 15px;">💳 Información de Pago</h4>
              <p style="margin: 10px 0; color: #2c3e50;">
                <strong>✅ Seña requerida:</strong> El 30% del monto total deberá ser abonado para validar la reserva.
              </p>
              <p style="margin: 10px 0; color: #2c3e50;">
                <strong>📞 Próximo paso:</strong> Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo dentro de las próximas 24 horas para confirmar disponibilidad y proporcionarte los datos para realizar el depósito del 30%.
              </p>
            </div>
          `}
          
          <div style="background-color: #e8f8ff; border-left: 4px solid #3498db; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #3498db; margin-bottom: 15px;">🏦 Información de Pago</h4>
            <p style="margin: 10px 0; color: #2c3e50;">
              <strong>⚠️ Importante:</strong> El administrador se pondrá en contacto contigo para proporcionarte los datos bancarios para realizar la transferencia de la seña.
            </p>
            <p style="margin: 10px 0; color: #2c3e50;">
              Una vez recibas los datos, realiza la transferencia y envía el comprobante de pago al correo <strong>baconfort.centro@gmail.com</strong> o al WhatsApp <strong>+54 11 3002-1074</strong>.
            </p>
            <p style="margin: 10px 0; color: #2c3e50;">
              <strong>💡 Recuerda incluir tu nombre y fechas de reserva en el mensaje.</strong>
            </p>
          </div>
          
          <div style="background-color: #f0f8ff; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #17a2b8; margin-bottom: 15px;">📞 Próximos pasos:</h4>
            <p style="margin: 10px 0; color: #2c3e50;">
              El administrador te contactará con los datos para realizar la transferencia de la seña. Una vez recibidos, realiza el pago y envía el comprobante.
            </p>
            <p style="margin: 10px 0; color: #2c3e50;">
              <strong>⏱️ Tiempo de respuesta:</strong> El administrador se pondrá en contacto contigo dentro de las próximas 24 horas.
            </p>
          </div>
          
          ${message ? `
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #27ae60; margin-bottom: 10px;">💬 Tu mensaje:</h4>
              <p style="color: #2c3e50; margin: 0; font-style: italic;">"${message}"</p>
            </div>
          ` : ''}
            </ul>
          </div>
        </div>
      </div>
    `
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email enviado al usuario:', email);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email al usuario:', error);
    return false;
  }
};

// Función para enviar notificación de reserva al admin
const sendAdminReservationNotification = async (reservationData) => {
  if (!emailTransporter) {
    console.error('Email transporter no configurado');
    return false;
  }

  const { fullName, email, phone, dni, idType, propertyName, checkIn, checkOut, guests, message, paymentInfo, priceInfo, status } = reservationData;
  
  console.log('🔍 DEBUG EMAIL ADMIN: fullName recibido en emailNotifications =', fullName);
  console.log('🔍 DEBUG EMAIL ADMIN: reservationData completo =', reservationData);
  
  // Asegurar que propertyName tenga un valor
  const displayPropertyName = propertyName || 'Departamento no especificado';
  
  const checkInDate = formatDateSafe(checkIn);
  const checkOutDate = formatDateSafe(checkOut);

  // Determinar el tipo de reserva y el mensaje para ADMIN
  // LÓGICA SIMPLIFICADA: Solo mostrar CONFIRMADA CON PAGO si explícitamente está pagado
  let statusText, statusColor, statusIcon, headerMessage;
  
  // Condiciones muy estrictas para CONFIRMADA CON PAGO
  if (status === 'confirmed' && 
      paymentInfo && 
      paymentInfo.paymentStatus === 'approved' && 
      paymentInfo.status === 'completed') {
    statusText = 'CONFIRMADA CON PAGO';
    statusColor = '#27ae60';
    statusIcon = '✅';
    headerMessage = 'Pago confirmado - Reserva lista para gestionar';
  } else if (status === 'approved' || status === 'payment_pending') {
    statusText = 'APROBADA - PAGO PENDIENTE';
    statusColor = '#f39c12';
    statusIcon = '💰';
    headerMessage = 'Reserva aprobada - Esperando confirmación de pago (30% seña requerida)';
  } else {
    // TODOS LOS DEMÁS CASOS (incluyendo nuevas reservas)
    statusText = 'PENDIENTE DE CONFIRMACIÓN';
    statusColor = '#3498db';
    statusIcon = '⏳';
    headerMessage = 'Nueva solicitud que requiere revisión y aprobación';
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `${statusIcon} ${statusText} - ${displayPropertyName} | BaconFort Admin`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: ${statusColor}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: white; text-align: center; margin-bottom: 10px;">
            ${statusIcon} Reserva ${statusText}
          </h2>
          <p style="text-align: center; color: white; margin: 0;">
            ${headerMessage}
          </p>
        </div>
        
        <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #e74c3c; margin-bottom: 20px;">📋 Detalles de la Reserva:</h3>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #2c3e50; margin-bottom: 15px;">🏠 Información de la Propiedad:</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                <strong style="color: #e74c3c;">Propiedad:</strong> ${displayPropertyName}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                <strong style="color: #e74c3c;">Check-in:</strong> ${checkInDate}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                <strong style="color: #e74c3c;">Check-out:</strong> ${checkOutDate}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                <strong style="color: #e74c3c;">Huéspedes:</strong> ${guests} persona(s)
              </li>
              ${(() => {
                // Calcular noches
                const checkInDateObj = new Date(checkIn);
                const checkOutDateObj = new Date(checkOut);
                const nights = Math.ceil((checkOutDateObj - checkInDateObj) / (1000 * 60 * 60 * 24));
                
                if (priceInfo && priceInfo.totalAmount > 0) {
                  const currency = priceInfo.currency === 'USD' ? 'US$' : '$';
                  const totalAmount = priceInfo.totalAmount;
                  const deposit = Math.round(totalAmount * 0.3);
                  
                  return `
                    <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                      <strong style="color: #e74c3c;">�️ Duración:</strong> ${nights} noche(s)
                    </li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                      <strong style="color: #e74c3c;">💰 Precio Total:</strong> ${currency}${totalAmount.toLocaleString()}
                    </li>
                    <li style="padding: 8px 0;">
                      <strong style="color: #e74c3c;">🔒 Seña requerida (30%):</strong> ${currency}${deposit.toLocaleString()}
                    </li>
                  `;
                } else {
                  return `
                    <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                      <strong style="color: #e74c3c;">�️ Duración:</strong> ${nights} noche(s)
                    </li>
                    <li style="padding: 8px 0;">
                      <strong style="color: #e74c3c;">⚠️ Precio:</strong> No especificado - confirmar manualmente
                    </li>
                  `;
                }
              })()}
            </ul>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #27ae60; margin-bottom: 15px;">👤 Información del Cliente:</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #d5e8d5;">
                <strong style="color: #27ae60;">Nombre:</strong> ${fullName}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #d5e8d5;">
                <strong style="color: #27ae60;">Email:</strong> ${email}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #d5e8d5;">
                <strong style="color: #27ae60;">📱 Teléfono:</strong> ${phone || 'No proporcionado'}
              </li>
              <li style="padding: 8px 0;">
                <strong style="color: #27ae60;">🆔 ${idType === 'passport' ? 'Pasaporte' : 'DNI'}:</strong> ${dni || 'No proporcionado'}
              </li>
            </ul>
          </div>
          
          ${message ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #856404; margin-bottom: 10px;">💬 Mensaje del Cliente:</h4>
              <p style="color: #2c3e50; margin: 0; font-style: italic; border-left: 3px solid #ffc107; padding-left: 15px;">"${message}"</p>
            </div>
          ` : ''}
        </div>
      </div>
    `
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email enviado al admin:', adminEmail);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email al admin:', error);
    return false;
  }
};

// Función genérica para enviar emails
const sendEmail = async (to, subject, htmlBody) => {
  console.log('📧 SENDEMAIL: Enviando email...');
  console.log('📧 SENDEMAIL: Destinatario:', to);
  console.log('📧 SENDEMAIL: Asunto:', subject);
  
  if (!emailTransporter) {
    console.error('❌ SENDEMAIL: Email transporter no configurado');
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: htmlBody
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    console.log('✅ SENDEMAIL: Email enviado exitosamente a:', to);
    return true;
  } catch (error) {
    console.error('❌ SENDEMAIL: Error enviando email:', error);
    return false;
  }
};

// Funciones placeholder para compatibilidad
const sendPasswordResetEmail = async () => { return true; };
const sendUserCancellationNotification = async () => { return true; };
const sendAdminCancellationNotification = async () => { return true; };

module.exports = {
  initializeEmailTransporter,
  sendUserReservationNotification,
  sendAdminReservationNotification,
  sendPasswordResetEmail,
  sendUserCancellationNotification,
  sendAdminCancellationNotification,
  sendEmail,
  formatDateSafe
};
