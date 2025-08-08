const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function updateAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Buscar el administrador
        const admin = await User.findOne({ email: 'admin@baconfort.com' });
        
        if (admin) {
            console.log(`👤 Admin encontrado: ${admin.name}`);
            
            // Actualizar la contraseña
            admin.password = 'roccosa226';
            await admin.save();
            
            console.log('✅ Contraseña del administrador actualizada a "roccosa226"');
        } else {
            console.log('❌ Administrador no encontrado');
        }

        // Verificar todos los usuarios
        const users = await User.find({}).select('name email role');
        console.log('\n👥 Usuarios en la base de datos:');
        users.forEach(user => {
            console.log(`  📧 ${user.email} - 👤 ${user.name} - 🔑 ${user.role}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📪 Conexión cerrada');
    }
}

updateAdminPassword();
