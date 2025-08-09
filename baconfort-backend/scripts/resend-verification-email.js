// Script para reenviar el email de verificación a un usuario
const mongoose = require('mongoose');
const User = require('../models/User');
const { resendVerificationEmail } = require('../utils/emailService');
require('dotenv').config();

// Email al que reenviar la verificación
const EMAIL_TO_VERIFY = 'minoequerida@gmail.com';

// Configuración personalizada - dejar en blanco para usar los valores del .env
const OVERRIDE_FRONTEND_URL = 'https://confort-ba.web.app';

async function resendVerification() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ No se ha proporcionado MONGODB_URI. Configurar el archivo .env.');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Conectado a MongoDB');
    console.log(`🔍 Buscando usuario con email: ${EMAIL_TO_VERIFY}`);

    // Buscar usuario por email
    const user = await User.findOne({ email: EMAIL_TO_VERIFY.toLowerCase() });
    
    if (!user) {
      console.error(`❌ No se encontró ningún usuario con el email: ${EMAIL_TO_VERIFY}`);
      await mongoose.disconnect();
      return;
    }
    
    console.log(`✅ Usuario encontrado: ${user.name} (${user._id})`);
    console.log(`📧 Estado actual de verificación: ${user.emailVerified ? 'Verificado' : 'No verificado'}`);
    
    if (user.emailVerified) {
      console.log('✅ El email ya está verificado. No es necesario reenviar.');
    } else {
      if (!user.verificationToken) {
        console.error('❌ El usuario no tiene un token de verificación. Debe generarse uno nuevo.');
        await mongoose.disconnect();
        return;
      }
      
      // Guardar el frontend URL actual para mostrarlo después
      const currentFrontendUrl = process.env.FRONTEND_URL;
      
      // Temporalmente sobrescribir FRONTEND_URL si se especificó uno personalizado
      if (OVERRIDE_FRONTEND_URL) {
        console.log(`🔄 Sobrescribiendo FRONTEND_URL: ${currentFrontendUrl} -> ${OVERRIDE_FRONTEND_URL}`);
        process.env.FRONTEND_URL = OVERRIDE_FRONTEND_URL;
      }
      
      // Construir manualmente la URL de verificación
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${user.verificationToken}`;
      console.log(`🔗 URL de verificación: ${verificationUrl}`);
      
      // Reenviar el email de verificación
      const emailResult = await resendVerificationEmail(user.email, user.name, user.verificationToken);
      
      // Restaurar el valor original de FRONTEND_URL
      if (OVERRIDE_FRONTEND_URL && currentFrontendUrl) {
        process.env.FRONTEND_URL = currentFrontendUrl;
      }
      
      if (emailResult.success) {
        console.log('🎉 Email de verificación reenviado con éxito.');
        console.log('📋 Message ID:', emailResult.messageId);
      } else {
        console.error('❌ Error al reenviar email:', emailResult.error);
      }
    }
    
    console.log('🔄 Desconectando de MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Error al desconectar de MongoDB:', disconnectError);
    }
  }
}

resendVerification();
