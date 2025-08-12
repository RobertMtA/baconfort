// Utilidad para enviar correos electrónicos
const nodemailer = require('nodemailer');

/**
 * Envía un correo electrónico para recuperación de contraseña
 * @param {string} email - Dirección de correo del destinatario
 * @param {string} resetToken - Token de recuperación
 * @returns {Promise<boolean>} - true si el envío fue exitoso, false en caso contrario
 */
async function sendPasswordResetEmail(email, resetToken) {
  console.log('📧 Iniciando envío de correo a:', email);
  
  try {
    // Verificar si están configuradas las variables de entorno
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error('❌ ERROR: Variables de entorno de correo no configuradas');
      console.error('EMAIL_USER:', process.env.EMAIL_USER ? 'CONFIGURADO' : 'NO CONFIGURADO');
      console.error('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'CONFIGURADO' : 'NO CONFIGURADO');
      return false;
    }

    // Crear transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    console.log('✅ Transporter configurado con cuenta:', process.env.EMAIL_USER);
    
    // URL para restablecer la contraseña (ajustar según tu frontend)
    const resetUrl = process.env.NODE_ENV === 'production'
      ? `https://confort-ba.web.app/reset-password/${resetToken}`
      : `http://localhost:3001/reset-password/${resetToken}`;
    
    // Contenido del correo
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Confort BA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperación de Contraseña - Confort BA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Recuperación de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña en Confort BA.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p>
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">
              Restablecer Contraseña
            </a>
          </p>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">
            Este es un correo automático, por favor no respondas a este mensaje.
            <br>© ${new Date().getFullYear()} Confort BA. Todos los derechos reservados.
          </p>
        </div>
      `
    };
    
    // Verificar si estamos en modo desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 MODO DESARROLLO: Contenido del correo:');
      console.log('- Destinatario:', email);
      console.log('- URL de restablecimiento:', resetUrl);
    }
    
    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('📨 Correo enviado exitosamente:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar correo de recuperación:', error);
    return false;
  }
}

module.exports = sendPasswordResetEmail;
