// Script para verificar manualmente el email de un usuario
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Email a verificar
const EMAIL_TO_VERIFY = 'minoequerida@gmail.com';

async function verifyEmail() {
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
      console.log('✅ El email ya está verificado. No se requiere ninguna acción.');
    } else {
      // Marcar email como verificado
      user.emailVerified = true;
      user.verificationToken = null;
      await user.save();
      
      console.log('🎉 Email verificado manualmente con éxito.');
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

verifyEmail();
