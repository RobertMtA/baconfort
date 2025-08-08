const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const verifyPasswords = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar usuarios
    const users = await User.find({}).select('+password');
    console.log(`👥 Encontrados ${users.length} usuarios:`);

    for (const user of users) {
      console.log(`\n📧 Email: ${user.email}`);
      console.log(`👤 Nombre: ${user.name}`);
      console.log(`🔑 Password hash: ${user.password.substring(0, 20)}...`);
      
      // Probar contraseñas comunes
      const testPasswords = ['admin123', 'guest123'];
      
      for (const testPassword of testPasswords) {
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`   🔒 "${testPassword}": ${isValid ? '✅ VÁLIDA' : '❌ inválida'}`);
      }
    }

    console.log('\n🔄 Regenerando contraseñas con hashes simples...');
    
    // Actualizar admin
    const admin = await User.findOne({ email: 'admin@baconfort.com' });
    if (admin) {
      admin.password = 'admin123';
      await admin.save();
      console.log('✅ Contraseña admin actualizada');
    }

    // Actualizar guest
    const guest = await User.findOne({ email: 'guest@example.com' });
    if (guest) {
      guest.password = 'guest123';
      await guest.save();
      console.log('✅ Contraseña guest actualizada');
    }

    console.log('\n✅ Contraseñas regeneradas correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Conexión cerrada');
  }
};

verifyPasswords();
