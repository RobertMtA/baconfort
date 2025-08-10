// test-api-connection.js
// Script para probar la conexión con la API

async function testApiConnection() {
    console.log('🧪 Iniciando prueba de conexión a la API...');
    
    const API_URL = 'https://baconfort-production-084d.up.railway.app/api';
    
    try {
        console.log(`📡 Conectando a ${API_URL}/properties...`);
        const response = await fetch(`${API_URL}/properties`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ Conexión exitosa! Propiedades recibidas: ${data.length || (data.data && data.data.length) || 'desconocido'}`);
        console.log('📊 Datos recibidos:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
        return true;
    } catch (error) {
        console.error(`❌ Error en la conexión:`, error);
        return false;
    }
}

// Ejecutar la prueba
testApiConnection().then(success => {
    console.log(`\n${success ? '✅ Prueba completada exitosamente!' : '❌ La prueba ha fallado!'}`);
});
