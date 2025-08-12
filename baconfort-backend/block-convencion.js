// block-convencion.js
const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Usar directamente mongoose para actualizar
    const result = await mongoose.connection.collection('properties').updateOne(
      { id: 'convencion-1994' }, 
      { $set: { isBlocked: true } }
    );
    
    console.log('Resultado:', result);
    console.log(`🔒 Propiedad bloqueada: ${result.modifiedCount} documentos actualizados`);
    
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    process.exit(0);
  }
};

run();
