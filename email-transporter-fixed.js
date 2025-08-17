// Email transporter configuration - VERSIÓN MEJORADA
let emailTransporter = null;

const setupEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('⚠️ Email credentials not provided, email features disabled');
    return;
  }

  try {
    emailTransporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      // Configuración mejorada para Railway
      pool: true,
      maxConnections: 1,
      maxMessages: 3
    });

    // Verificar conexión con manejo mejorado de errores
    emailTransporter.verify((error, success) => {
      if (error) {
        console.log('⚠️ Email service currently unavailable:', error.code || 'CONNECTION_ERROR');
        console.log('💡 Email features will be disabled but app continues running normally');
        emailTransporter = null;
      } else {
        console.log('✅ Email service ready and verified');
      }
    });
  } catch (error) {
    console.log('⚠️ Email configuration error:', error.message);
    console.log('💡 App continues without email features');
    emailTransporter = null;
  }
};
