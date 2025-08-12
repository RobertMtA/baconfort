const fetch = require('node-fetch');

// Configuración
const API_URL = 'http://localhost:5004/api';
const EMAIL = process.argv[2] || 'ejemplo@gmail.com'; // Usa el email pasado como argumento
const ACTION = process.argv[3] || 'test'; // 'test', 'request', 'reset'
const TOKEN = process.argv[4]; // Token para resetear (solo necesario para action=reset)
const NEW_PASSWORD = process.argv[5] || 'Nueva123#'; // Nueva contraseña para reset

/**
 * Solicitar recuperación de contraseña
 */
async function requestPasswordReset(email) {
    try {
        console.log(`📧 Enviando solicitud de recuperación para: ${email}`);
        
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Solicitud enviada correctamente');
            console.log('📤 Revisa tu correo para el enlace de recuperación');
            console.log(data);
        } else {
            console.error('❌ Error al solicitar recuperación:', data);
        }
        
        return data;
    } catch (error) {
        console.error('❌ Error de red:', error.message);
    }
}

/**
 * Resetear contraseña con token
 */
async function resetPassword(token, newPassword) {
    try {
        console.log(`🔑 Reseteando contraseña con token: ${token.substring(0, 10)}...`);
        
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, newPassword }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Contraseña reseteada correctamente');
            console.log('🔓 Ya puedes iniciar sesión con la nueva contraseña');
            console.log(data);
        } else {
            console.error('❌ Error al resetear contraseña:', data);
        }
        
        return data;
    } catch (error) {
        console.error('❌ Error de red:', error.message);
    }
}

/**
 * Probar la conexión a la API
 */
async function testApiConnection() {
    try {
        console.log('🔄 Verificando conexión con API...');
        
        const response = await fetch(`${API_URL}/health`);
        
        if (response.ok) {
            console.log('✅ Conexión con API establecida correctamente');
            const data = await response.json();
            console.log(data);
        } else {
            console.error('❌ Error al conectar con API. Código:', response.status);
            try {
                const errorData = await response.text();
                console.error(errorData);
            } catch (e) {
                console.error('No se pudo leer respuesta');
            }
        }
    } catch (error) {
        console.error('❌ Error de red al conectar con API:', error.message);
        console.error('Verifica que el servidor backend esté ejecutándose en:', API_URL);
    }
}

// Ejecución principal
async function main() {
    console.log('===========================================');
    console.log('  Test de Recuperación de Contraseña');
    console.log('===========================================');
    
    if (ACTION === 'test') {
        await testApiConnection();
    } else if (ACTION === 'request') {
        await requestPasswordReset(EMAIL);
    } else if (ACTION === 'reset') {
        if (!TOKEN) {
            console.error('❌ Error: Se necesita un token para resetear la contraseña');
            console.error('Uso: node test-reset-password.js correo@ejemplo.com reset TOKEN_AQUI NuevaContraseña');
            process.exit(1);
        }
        await resetPassword(TOKEN, NEW_PASSWORD);
    } else {
        console.error('❌ Acción no reconocida. Usa: "test", "request" o "reset"');
        console.error('Ejemplos:');
        console.error('- Probar conexión: node test-reset-password.js');
        console.error('- Solicitar recuperación: node test-reset-password.js correo@ejemplo.com request');
        console.error('- Resetear contraseña: node test-reset-password.js correo@ejemplo.com reset TOKEN_AQUI NuevaContraseña');
    }
}

// Ejecutar
main();
