// Prueba simple del flujo de verificación
console.log('🔍 Prueba SIMPLE del flujo de verificación...\n');

async function simpleTest() {
    try {
        console.log('1. Probando login con usuario no verificado...');
        
        const response = await fetch('http://localhost:5004/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'minoequerida@gmail.com',
                password: 'Mino123456!'
            })
        });

        const data = await response.json();
        console.log('📋 Respuesta:', JSON.stringify(data, null, 2));
        
        if (data.needsEmailVerification) {
            console.log('\n✅ ÉXITO: El sistema ahora rechaza correctamente los logins sin verificación');
        } else if (data.success) {
            console.log('\n⚠️ El usuario ya está verificado o hay otro problema');
        } else {
            console.log('\n❓ Otro error:', data.error);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

simpleTest();
