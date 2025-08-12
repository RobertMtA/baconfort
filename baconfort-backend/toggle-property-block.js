// toggle-property-block.js
const mongoose = require('mongoose');
require('dotenv').config();

// Obtener ID de propiedad desde argumentos de línea de comando
const propertyId = process.argv[2];
const action = process.argv[3] || 'toggle'; // 'block', 'unblock' o 'toggle' (por defecto)

if (!propertyId) {
  console.error('❌ Error: Debe especificar un ID de propiedad');
  console.log('Uso: node toggle-property-block.js [propertyId] [block|unblock|toggle]');
  console.log('Ejemplo: node toggle-property-block.js moldes-1680 block');
  process.exit(1);
}

const run = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Obtener la propiedad actual
    const collection = mongoose.connection.collection('properties');
    const property = await collection.findOne({ id: propertyId });
    
    if (!property) {
      console.error(`❌ Propiedad no encontrada con ID: ${propertyId}`);
      process.exit(1);
    }
    
    const currentStatus = property.isBlocked === true;
    console.log(`📊 Estado actual de ${property.title || propertyId}: ${currentStatus ? 'Bloqueado' : 'Desbloqueado'}`);
    
    // Determinar el nuevo estado según la acción
    let newBlockedStatus;
    if (action === 'block') {
      newBlockedStatus = true;
    } else if (action === 'unblock') {
      newBlockedStatus = false;
    } else {
      // toggle - invertir estado actual
      newBlockedStatus = !currentStatus;
    }
    
    // Actualizar la propiedad
    const result = await collection.updateOne(
      { id: propertyId },
      { $set: { isBlocked: newBlockedStatus } }
    );
    
    if (result.modifiedCount === 1) {
      const actionText = newBlockedStatus ? 'bloqueada' : 'desbloqueada';
      console.log(`✅ Propiedad ${property.title || propertyId} ${actionText} exitosamente`);
    } else {
      console.log(`⚠️ No se modificó ningún documento. La propiedad ya estaba ${newBlockedStatus ? 'bloqueada' : 'desbloqueada'}`);
    }
    
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    process.exit(0);
  }
};

run();
