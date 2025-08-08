// utils/emailService.js - Servicio de envío de emails
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transporter con Gmail
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

// Función para enviar email de verificación
const sendVerificationEmail = async (email, name, verificationToken) => {
  try {
    const transporter = createEmailTransporter();
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Baconfort <noreply@baconfort.com>',
      to: email,
      subject: '✅ Verificar tu cuenta en BACONFORT',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Verificación de Email - BACONFORT</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #FF6B6B; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
            .button { display: inline-block; background-color: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .button:hover { background-color: #FF5252; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
            .verification-code { background-color: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏠 BACONFORT</div>
              <h1>¡Bienvenido/a ${name}!</h1>
            </div>
            
            <p>Gracias por registrarte en <strong>BACONFORT</strong>, tu plataforma de alquileres temporarios de confianza.</p>
            
            <p>Para completar tu registro y activar tu cuenta, necesitas verificar tu dirección de email:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">✅ VERIFICAR MI EMAIL</a>
            </div>
            
            <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
            <div class="verification-code">${verificationUrl}</div>
            
            <p><strong>¿Por qué necesitas verificar tu email?</strong></p>
            <ul>
              <li>🔒 Garantiza la seguridad de tu cuenta</li>
              <li>📧 Te permite recibir confirmaciones de reservas</li>
              <li>🏠 Habilita todas las funciones de la plataforma</li>
              <li>💬 Permite dejar reviews y calificaciones</li>
            </ul>
            
            <p><em>Este enlace expira en 24 horas por razones de seguridad.</em></p>
            
            <div class="footer">
              <p>Este email fue enviado desde BACONFORT</p>
              <p>Si no te registraste en nuestra plataforma, puedes ignorar este mensaje.</p>
              <p>© 2025 BACONFORT - Alquileres Temporarios</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email de verificación enviado exitosamente:', email);
    console.log('📋 Message ID:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId
    };
    
  } catch (error) {
    console.error('❌ Error enviando email de verificación:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para enviar email de reenvío de verificación
const resendVerificationEmail = async (email, name, verificationToken) => {
  return await sendVerificationEmail(email, name, verificationToken);
};

// Función para enviar email de bienvenida (después de verificar)
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Baconfort <noreply@baconfort.com>',
      to: email,
      subject: '🎉 ¡Bienvenido/a a BACONFORT! Tu cuenta está activada',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>¡Cuenta Activada! - BACONFORT</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #FF6B6B; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
            .success { background-color: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; background-color: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏠 BACONFORT</div>
              <h1>¡Hola ${name}!</h1>
            </div>
            
            <div class="success">
              <h2>🎉 ¡Tu cuenta ha sido verificada exitosamente!</h2>
            </div>
            
            <p>Tu dirección de email <strong>${email}</strong> ha sido confirmada y tu cuenta está ahora completamente activada.</p>
            
            <p><strong>Ya puedes disfrutar de todas las funciones:</strong></p>
            <ul>
              <li>🏠 Explorar y reservar propiedades</li>
              <li>💬 Dejar reviews y calificaciones</li>
              <li>📧 Recibir confirmaciones de reservas</li>
              <li>🔔 Obtener notificaciones importantes</li>
              <li>⭐ Acceder a promociones exclusivas</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">🏠 EXPLORAR PROPIEDADES</a>
            </div>
            
            <p>¡Gracias por confiar en BACONFORT para tus alquileres temporarios!</p>
            
            <div class="footer">
              <p>© 2025 BACONFORT - Alquileres Temporarios</p>
              <p>Si tienes alguna pregunta, contáctanos respondiendo a este email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('🎉 Email de bienvenida enviado exitosamente:', email);
    
    return {
      success: true,
      messageId: result.messageId
    };
    
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para verificar la configuración del email
const testEmailConfiguration = async () => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    console.log('✅ Configuración de email verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  resendVerificationEmail,
  sendWelcomeEmail,
  testEmailConfiguration,
  createEmailTransporter
};
