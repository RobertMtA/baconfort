const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        const users = await User.find({}).select('name email role isActive createdAt lastLogin');
        
        console.log(`\n👥 Total de usuarios: ${users.length}\n`);
        
        users.forEach((user, index) => {
            console.log(`Usuario ${index + 1}:`);
            console.log(`  📧 Email: ${user.email}`);
            console.log(`  👤 Nombre: ${user.name}`);
            console.log(`  🔑 Rol: ${user.role}`);
            console.log(`  ✅ Activo: ${user.isActive}`);
            console.log(`  📅 Creado: ${user.createdAt}`);
            console.log(`  🕒 Último login: ${user.lastLogin || 'Nunca'}`);
            console.log('  ---');
        });

        // Verificar específicamente el admin
        const admin = await User.findOne({ email: 'admin@baconfort.com' });
        if (admin) {
            console.log('\n🔍 Verificación del Administrador:');
            console.log(`  Rol actual: "${admin.role}"`);
            console.log(`  ¿Es admin?: ${admin.role === 'admin'}`);
            console.log(`  Método isAdmin(): ${admin.isAdmin ? admin.isAdmin() : 'Método no disponible'}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📪 Conexión cerrada');
    }
}

checkUsers();
