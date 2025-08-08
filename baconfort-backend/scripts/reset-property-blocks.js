/**
 * Script de emergencia para desbloquear todas las propiedades
 * Usar en caso de que todas las propiedades estén bloqueadas y no se puedan desbloquear desde la interfaz
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Configurar la conexión usando las mismas variables del .env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://BACONFORT:Masajista41@cluster0.lzugghn.mongodb.net/baconfort?retryWrites=true&w=majority&appName=Cluster0';

const propertySchema = new mongoose.Schema({
  id: String,
  title: String,
  isBlocked: { type: Boolean, default: false },
  blockReason: { type: String, default: null },
  blockedAt: { type: Date, default: null }
}, { 
  timestamps: true,
  strict: false // Permitir campos adicionales
});

const Property = mongoose.model('Property', propertySchema);

async function resetPropertyBlocks() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('🔍 Buscando propiedades bloqueadas...');
    const blockedProperties = await Property.find({ isBlocked: true });
    console.log(`📊 Encontradas ${blockedProperties.length} propiedades bloqueadas`);

    if (blockedProperties.length === 0) {
      console.log('✅ No hay propiedades bloqueadas');
      return;
    }

    console.log('🔓 Desbloqueando todas las propiedades...');
    const result = await Property.updateMany(
      { isBlocked: true },
      {
        $set: {
          isBlocked: false,
          blockReason: null,
          blockedAt: null
        }
      }
    );

    console.log(`✅ ${result.modifiedCount} propiedades desbloqueadas exitosamente`);

    // Verificar el resultado
    const stillBlocked = await Property.find({ isBlocked: true });
    console.log(`📊 Propiedades aún bloqueadas: ${stillBlocked.length}`);

    // Mostrar estado final
    const allProperties = await Property.find({}, 'id title isBlocked blockReason');
    console.log('\n📋 Estado final de las propiedades:');
    allProperties.forEach(prop => {
      console.log(`  ${prop.id}: ${prop.title} - ${prop.isBlocked ? '🔒 BLOQUEADA' : '✅ DISPONIBLE'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  resetPropertyBlocks()
    .then(() => {
      console.log('🎉 Script completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Script falló:', error);
      process.exit(1);
    });
}

module.exports = resetPropertyBlocks;
