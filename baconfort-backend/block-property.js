// block-property.js
// Script para bloquear una propiedad específica

const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

const PROPERTY_ID_TO_BLOCK = 'convencion-1994';

async function blockProperty() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Conectado a MongoDB');
    
    // Buscar la propiedad
    const property = await Property.findOne({ 
      $or: [
        { id: PROPERTY_ID_TO_BLOCK },
        { slug: PROPERTY_ID_TO_BLOCK }
      ] 
    });
    
    if (!property) {
      console.error(`❌ Propiedad ${PROPERTY_ID_TO_BLOCK} no encontrada`);
      process.exit(1);
    }
    
    console.log(`🏠 Propiedad encontrada: ${property.title || property.id}`);
    console.log(`   - Estado actual: ${property.isBlocked ? 'Bloqueada' : 'Activa'}`);
    
    // Bloquear la propiedad
    property.isBlocked = true;
    await property.save();
    
    console.log(`🔒 Propiedad ${property.title || property.id} bloqueada exitosamente`);
    
    // Desconectar de MongoDB
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

blockProperty();
