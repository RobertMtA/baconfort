/**
 * Script para verificar el estado de bloqueo de todas las propiedades
 * Uso: node check-blocked-properties.js
 */

const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

// Conectarse a MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/baconfort';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('📊 MongoDB conectado');
    return true;
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  }
};

// Función principal
const checkBlockedProperties = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Obtener todas las propiedades
    const properties = await Property.find({});
    
    console.log(`\n🏠 Total de propiedades encontradas: ${properties.length}\n`);
    
    // Contar propiedades bloqueadas
    const blockedProperties = properties.filter(prop => prop.isBlocked === true);
    
    console.log(`🔒 Propiedades bloqueadas: ${blockedProperties.length} / ${properties.length}\n`);
    
    if (blockedProperties.length > 0) {
      console.log('📋 Lista de propiedades bloqueadas:');
      blockedProperties.forEach(prop => {
        console.log(`   - ${prop.title || prop.name} (ID: ${prop.id})`);
      });
    }
    
    console.log('\n📋 Lista de todas las propiedades:');
    properties.forEach(prop => {
      const status = prop.isBlocked ? '🚫 BLOQUEADA' : '✅ Disponible';
      console.log(`   - ${status}: ${prop.title || prop.name} (ID: ${prop.id})`);
    });
    
    // Desconectar de la base de datos
    await mongoose.disconnect();
    console.log('\n📊 Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Ejecutar la función principal
checkBlockedProperties();
