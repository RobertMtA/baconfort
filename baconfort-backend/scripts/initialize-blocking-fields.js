const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const propertySchema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.model('Property', propertySchema);

async function initializeBlockingFields() {
  try {
    console.log('🔄 Inicializando campos de bloqueo para todas las propiedades...');
    
    // Obtener todas las propiedades
    const properties = await Property.find({});
    console.log(`📊 Encontradas ${properties.length} propiedades`);
    
    let updatedCount = 0;
    
    for (const property of properties) {
      const needsUpdate = 
        property.isBlocked === undefined || 
        property.blockReason === undefined || 
        property.blockedAt === undefined;
      
      if (needsUpdate) {
        await Property.updateOne(
          { _id: property._id },
          {
            $set: {
              isBlocked: property.isBlocked || false,
              blockReason: property.blockReason || null,
              blockedAt: property.blockedAt || null
            }
          }
        );
        
        updatedCount++;
        console.log(`✅ Inicializado ${property.id || property.title}: isBlocked=${property.isBlocked || false}`);
      } else {
        console.log(`⏭️  ${property.id || property.title}: Ya tiene campos de bloqueo`);
      }
    }
    
    console.log(`\n🎉 Proceso completado: ${updatedCount} propiedades actualizadas`);
    
    // Mostrar estado final
    console.log('\n📋 Estado final de todas las propiedades:');
    const updatedProperties = await Property.find({});
    for (const prop of updatedProperties) {
      console.log(`   ${prop.id || prop.title}: isBlocked=${prop.isBlocked}, blockReason=${prop.blockReason}`);
    }
    
  } catch (error) {
    console.error('❌ Error al inicializar campos de bloqueo:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Ejecutar el script
initializeBlockingFields();
