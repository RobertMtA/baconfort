// Script para corregir inconsistencias en fechas de consultas
// Guardar como fix-inquiry-date-format.js en la carpeta baconfort-backend/scripts

const mongoose = require('mongoose');
require('dotenv').config();
const Inquiry = require('../models/Inquiry');

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado a MongoDB correctamente');
  fixInquiryDateFormats();
}).catch(err => {
  console.error('❌ Error conectando a MongoDB:', err);
  process.exit(1);
});

// Función para normalizar fechas en todas las consultas
async function fixInquiryDateFormats() {
  try {
    console.log('🔄 Obteniendo todas las consultas...');
    const inquiries = await Inquiry.find({});
    
    console.log(`📊 Se encontraron ${inquiries.length} consultas`);
    
    // Contador de cambios
    let updatedCount = 0;
    
    // Iterar por cada consulta y normalizar fechas
    for (const inquiry of inquiries) {
      let hasChanges = false;
      
      // Verificar y corregir checkInDate
      if (inquiry.checkInDate) {
        const originalCheckIn = inquiry.checkInDate;
        const checkInDate = new Date(originalCheckIn);
        
        // Si la fecha es válida y diferente del formato estándar
        if (!isNaN(checkInDate.getTime()) && originalCheckIn !== checkInDate.toISOString().split('T')[0]) {
          inquiry.checkInDate = checkInDate.toISOString().split('T')[0];
          hasChanges = true;
          console.log(`🔶 Corrigiendo checkInDate: ${originalCheckIn} -> ${inquiry.checkInDate}`);
        }
      }
      
      // Verificar y corregir checkOutDate
      if (inquiry.checkOutDate) {
        const originalCheckOut = inquiry.checkOutDate;
        const checkOutDate = new Date(originalCheckOut);
        
        // Si la fecha es válida y diferente del formato estándar
        if (!isNaN(checkOutDate.getTime()) && originalCheckOut !== checkOutDate.toISOString().split('T')[0]) {
          inquiry.checkOutDate = checkOutDate.toISOString().split('T')[0];
          hasChanges = true;
          console.log(`🔶 Corrigiendo checkOutDate: ${originalCheckOut} -> ${inquiry.checkOutDate}`);
        }
      }
      
      // Verificar consistencia entre checkIn/checkOut y checkInDate/checkOutDate
      if (!inquiry.checkInDate && inquiry.checkIn) {
        const checkInDate = new Date(inquiry.checkIn);
        if (!isNaN(checkInDate.getTime())) {
          inquiry.checkInDate = checkInDate.toISOString().split('T')[0];
          hasChanges = true;
          console.log(`🔶 Copiando checkIn a checkInDate: ${inquiry.checkIn} -> ${inquiry.checkInDate}`);
        }
      }
      
      if (!inquiry.checkOutDate && inquiry.checkOut) {
        const checkOutDate = new Date(inquiry.checkOut);
        if (!isNaN(checkOutDate.getTime())) {
          inquiry.checkOutDate = checkOutDate.toISOString().split('T')[0];
          hasChanges = true;
          console.log(`🔶 Copiando checkOut a checkOutDate: ${inquiry.checkOut} -> ${inquiry.checkOutDate}`);
        }
      }
      
      // Guardar si hay cambios
      if (hasChanges) {
        await inquiry.save();
        updatedCount++;
      }
    }
    
    console.log(`✅ Proceso completado. Se corrigieron ${updatedCount} de ${inquiries.length} consultas.`);
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}
