const mongoose = require('mongoose');
require('dotenv').config();

// Esquema de promoción
const promotionSchema = new mongoose.Schema({
  title: String,
  description: String,
  propertyId: String,
  propertyName: String,
  discountType: String,
  discountValue: Number,
  originalPrice: Number,
  promotionalPrice: Number,
  validFrom: Date,
  validTo: Date,
  durationType: String,
  durationValue: Number,
  image: String,
  terms: String,
  priority: Number,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  maxRedemptions: Number,
  currentRedemptions: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Promotion = mongoose.model('Promotion', promotionSchema);

async function disableAllPromotions() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('📋 Buscando todas las promociones...');
    const promotions = await Promotion.find({});
    console.log(`📊 Total de promociones encontradas: ${promotions.length}`);

    // Mostrar las promociones encontradas
    promotions.forEach((promo, index) => {
      console.log(`${index + 1}. "${promo.title}" - Estado: ${promo.isActive ? 'ACTIVA' : 'INACTIVA'}`);
    });

    console.log('\n🛑 Desactivando TODAS las promociones...');
    const result = await Promotion.updateMany(
      {}, // Sin filtro = todas las promociones
      { $set: { isActive: false } } // Establecer isActive a false
    );

    console.log(`✅ Operación completada!`);
    console.log(`📊 Promociones modificadas: ${result.modifiedCount}`);
    console.log(`📊 Promociones que coincidieron: ${result.matchedCount}`);

    // Verificar el resultado
    const updatedPromotions = await Promotion.find({});
    const activeCount = updatedPromotions.filter(p => p.isActive).length;
    const inactiveCount = updatedPromotions.filter(p => !p.isActive).length;

    console.log('\n📈 Resumen final:');
    console.log(`🟢 Promociones activas: ${activeCount}`);
    console.log(`🔴 Promociones inactivas: ${inactiveCount}`);
    console.log(`📊 Total: ${updatedPromotions.length}`);

    if (activeCount === 0) {
      console.log('🎉 ¡TODAS las promociones han sido desactivadas exitosamente!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
disableAllPromotions();
