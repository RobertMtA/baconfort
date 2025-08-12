const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const updateUserDates = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar usuarios con fechas muy antiguas (antes de 2025)
    const oldUsers = await User.find({
      createdAt: { $lt: new Date('2025-01-01') }
    });

    console.log(`👥 Encontrados ${oldUsers.length} usuarios con fechas antigas:`);

    for (const user of oldUsers) {
      console.log(`\n📧 Email: ${user.email}`);
      console.log(`👤 Nombre: ${user.name}`);
      console.log(`📅 Fecha antigua: ${user.createdAt}`);
      
      // Generar una fecha realista en 2025
      // Roberto suscrito en junio, admin en enero, otros usuarios entre febrero y junio
      let newDate;
      
      if (user.email === 'baconfort.centro@gmail.com') {
        newDate = new Date('2025-06-15T09:30:00.000Z');
      } else if (user.email === 'admin@baconfort.com' || user.role === 'admin') {
        newDate = new Date('2025-01-15T08:00:00.000Z');
      } else {
        // Para otros usuarios, generar fechas entre febrero y junio 2025
        const randomMonth = Math.floor(Math.random() * 5) + 2; // 2-6 (feb-jun)
        const randomDay = Math.floor(Math.random() * 28) + 1; // 1-28
        const randomHour = Math.floor(Math.random() * 24);
        const randomMinute = Math.floor(Math.random() * 60);
        newDate = new Date(`2025-${randomMonth.toString().padStart(2, '0')}-${randomDay.toString().padStart(2, '0')}T${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}:00.000Z`);
      }
      
      // Actualizar fecha
      user.createdAt = newDate;
      await user.save();
      
      console.log(`✅ Fecha actualizada a: ${newDate}`);
    }

    console.log('\n🎉 Todas las fechas han sido actualizadas a 2025');
    
    // Mostrar resumen final
    const totalUsers = await User.countDocuments();
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date('2025-01-01') }
    });
    
    console.log(`\n📊 Resumen:`);
    console.log(`   Total usuarios: ${totalUsers}`);
    console.log(`   Usuarios con fechas 2025: ${recentUsers}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Conexión cerrada');
  }
};

// Ejecutar el script
updateUserDates();
