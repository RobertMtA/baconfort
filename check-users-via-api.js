// Script para verificar usuarios usando curl al backend
console.log('🔍 Verificando usuarios a través del backend...\n');

async function checkUsersViaAPI() {
    try {
        // Hacer una petición GET simple para ver si hay un endpoint que liste usuarios
        // Como no tenemos un endpoint público para esto, vamos a verificar de otra manera
        
        console.log('💡 Vamos a intentar registrar el usuario para ver si ya existe...\n');
        
        const response = await fetch('https://baconfort-production-084d.up.railway.app/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'minoequerida@gmail.com', 
                password: 'Mino123456!'
            })
        });

        const data = await response.json();
        console.log('📋 Resultado del intento de registro:', data);
        
        if (response.status === 400 && data.error === 'El email ya está registrado') {
            console.log('✅ CONFIRMADO: El usuario minoequerida@gmail.com YA EXISTE en la base de datos');
            console.log('📧 Ahora intentemos el login...\n');
            
            // Intentar login
            const loginResponse = await fetch('https://baconfort-production-084d.up.railway.app/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'minoequerida@gmail.com',
                    password: 'Mino123456!'
                })
            });

            const loginData = await loginResponse.json();
            console.log('🔐 Resultado del login:', loginData);
            
            if (loginData.needsEmailVerification) {
                console.log('✅ PERFECTO: El sistema está funcionando correctamente');
                console.log('📧 El usuario existe pero su email NO está verificado');
            } else if (loginData.success) {
                console.log('⚠️ El usuario ya está verificado');
            } else {
                console.log('❌ Error en login:', loginData.error);
            }
            
        } else if (data.success) {
            console.log('✅ Usuario registrado exitosamente (no existía antes)');
            console.log('📧 Se han enviado los emails de verificación y bienvenida');
        } else {
            console.log('❌ Error en registro:', data.error);
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

checkUsersViaAPI();

