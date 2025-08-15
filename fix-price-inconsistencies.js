/**
 * Script para verificar y corregir inconsistencias en reservas existentes
 */

const mongoose = require('mongoose');
const { calculatePriceByProperty } = require('./baconfort-backend/utils/priceCalculator');

// Configurar la conexión a MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://robertomt:Roberto0207@cluster0.7hfiq.mongodb.net/baconfort?retryWrites=true&w=majority';

async function checkAndFixInconsistencies() {
  try {
    console.log('🔧 INICIANDO VERIFICACIÓN DE INCONSISTENCIAS');
    console.log('===============================================');

    // Conectar a MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB');

    // Importar el modelo de Reserva
    const Reservation = require('./baconfort-backend/models/Reservation');

    // Buscar todas las reservas
    const reservations = await Reservation.find({});
    console.log(`📋 Encontradas ${reservations.length} reservas para verificar`);

    let inconsistenciesFound = 0;
    let fixedReservations = 0;

    for (const reservation of reservations) {
      const reservationId = reservation._id;
      const propertyId = reservation.propertyId;
      const checkIn = reservation.checkIn;
      const checkOut = reservation.checkOut;

      console.log(`\n🔍 Verificando reserva ${reservationId}: ${propertyId}`);

      // Calcular el precio correcto usando el sistema actual
      const correctPriceInfo = calculatePriceByProperty(propertyId, checkIn, checkOut);
      
      // Verificar si hay inconsistencias
      const currentPaymentInfo = reservation.paymentInfo;
      let hasInconsistency = false;

      if (currentPaymentInfo && currentPaymentInfo.amount) {
        const currentAmount = currentPaymentInfo.amount;
        const correctAmount = correctPriceInfo.totalAmount;

        if (Math.abs(currentAmount - correctAmount) > 1) { // Tolerancia de $1
          console.log(`❌ INCONSISTENCIA en ${reservationId}:`);
          console.log(`   Monto actual: ${currentAmount} ${currentPaymentInfo.currency}`);
          console.log(`   Monto correcto: ${correctAmount} ${correctPriceInfo.currency}`);
          hasInconsistency = true;
          inconsistenciesFound++;
        }
      }

      // Verificar la estructura de priceInfo
      if (reservation.priceInfo) {
        const currentPriceInfo = reservation.priceInfo;
        
        // Verificar si los precios son coherentes
        if (currentPriceInfo.breakdown) {
          const breakdown = currentPriceInfo.breakdown;
          
          if (breakdown.type === 'weekly' && breakdown.weeklyPrice === 365) {
            console.log(`❌ PRECIO SEMANAL INCORRECTO en ${reservationId}: $365 (debería ser diferente)`);
            hasInconsistency = true;
            inconsistenciesFound++;
          }
          
          if (breakdown.type === 'weekly' && breakdown.dailyPrice === 52 && propertyId.includes('ugarteche')) {
            console.log(`❌ PRECIO DIARIO INCORRECTO en ${reservationId}: $52 para Ugarteche (debería ser $45)`);
            hasInconsistency = true;
            inconsistenciesFound++;
          }
        }
      }

      // Corregir si se encuentra inconsistencia
      if (hasInconsistency) {
        console.log(`🔧 Corrigiendo reserva ${reservationId}...`);
        
        // Actualizar priceInfo con el cálculo correcto
        reservation.priceInfo = {
          totalAmount: correctPriceInfo.totalAmount,
          currency: correctPriceInfo.currency,
          nights: correctPriceInfo.nights,
          breakdown: correctPriceInfo.breakdown,
          propertyPrices: correctPriceInfo.propertyPrices
        };

        // Actualizar paymentInfo si existe
        if (reservation.paymentInfo) {
          reservation.paymentInfo.amount = correctPriceInfo.totalAmount;
          reservation.paymentInfo.currency = correctPriceInfo.currency;
        }

        // Guardar los cambios
        await reservation.save();
        fixedReservations++;
        console.log(`✅ Reserva ${reservationId} corregida`);
      } else {
        console.log(`✅ Reserva ${reservationId} es consistente`);
      }
    }

    console.log('\n📊 RESUMEN DE LA VERIFICACIÓN');
    console.log('===============================');
    console.log(`📋 Total de reservas verificadas: ${reservations.length}`);
    console.log(`❌ Inconsistencias encontradas: ${inconsistenciesFound}`);
    console.log(`🔧 Reservas corregidas: ${fixedReservations}`);

    if (inconsistenciesFound === 0) {
      console.log('🎉 ¡No se encontraron inconsistencias!');
    } else {
      console.log('✅ Todas las inconsistencias han sido corregidas');
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la verificación
checkAndFixInconsistencies();
