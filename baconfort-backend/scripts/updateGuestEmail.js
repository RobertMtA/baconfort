const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function updateGuestEmail() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Buscar el usuario demo por email actual
        const user = await User.findOne({ email: 'guest@example.com' });
        
        if (user) {
            console.log(`👤 Usuario encontrado: ${user.name}`);
            
            // Actualizar el email
            user.email = 'guest@baconfort.com';
            await user.save();
            
            console.log('✅ Email actualizado a guest@baconfort.com');
        } else {
            console.log('❌ Usuario demo no encontrado');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📪 Conexión cerrada');
    }
}

updateGuestEmail();
