// Script para verificar usuarios en la base de datos
const mongoose = require('mongoose');

// Conectar a la base de datos
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/baconfort';

async function checkUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB');
        
        // Definir el modelo User básico
        const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            emailVerified: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        });
        
        const User = mongoose.model('User', userSchema);
        
        // Buscar todos los usuarios
        const users = await User.find({}, 'name email emailVerified createdAt').sort({ createdAt: -1 });
        
        console.log('\n👥 USUARIOS EN LA BASE DE DATOS:');
        console.log('='.repeat(60));
        
        if (users.length === 0) {
            console.log('❌ No hay usuarios registrados en la base de datos');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name}`);
                console.log(`   📧 Email: ${user.email}`);
                console.log(`   ✅ Verificado: ${user.emailVerified ? 'SÍ' : 'NO'}`);
                console.log(`   📅 Registrado: ${user.createdAt.toLocaleDateString('es-ES')}`);
                console.log('   ' + '-'.repeat(40));
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
    }
}

checkUsers();
