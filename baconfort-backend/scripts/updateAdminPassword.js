const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function updateAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Email del administrador y nueva contraseña
        const adminEmail = 'baconfort.centro@gmail.com';
        const newPassword = 'Baconfort2025!';

        // Buscar el administrador por email
        const admin = await User.findOne({ email: adminEmail });
        
        if (admin) {
            console.log(`👤 Admin encontrado: ${admin.name}`);
            
            // Hash de la nueva contraseña
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            
            // Actualizar la contraseña y verificación de email
            admin.password = hashedPassword;
            admin.emailVerified = true;
            admin.role = 'admin';
            await admin.save();
            
            console.log(`✅ Contraseña del administrador actualizada: ${newPassword}`);
        } else {
            console.log(`❌ Administrador con email ${adminEmail} no encontrado. Creando nuevo usuario...`);
            
            // Hash de la nueva contraseña
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            
            // Crear nuevo usuario administrador
            const newAdmin = new User({
                name: 'Administrador Baconfort',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            await newAdmin.save();
            console.log(`✅ Nuevo administrador creado: ${adminEmail} con contraseña: ${newPassword}`);
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
