// Test CORS Fix - Verificar conexión desde baconfort.web.app
const testApiUrl = 'https://baconfort-production.up.railway.app/api/health';

console.log('🧪 Probando conexión desde baconfort.web.app al backend de Railway...');
console.log('🔗 URL de prueba:', testApiUrl);

fetch(testApiUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log('✅ Respuesta recibida:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Datos recibidos:', data);
    console.log('✅ CORS Test EXITOSO - La conexión funciona correctamente');
  })
  .catch(error => {
    console.error('❌ Error en CORS Test:', error);
    console.log('❌ La corrección de CORS no funcionó correctamente');
  });

// También probar el endpoint de propiedades
const propertiesUrl = 'https://baconfort-production.up.railway.app/api/properties';

console.log('\n🏠 Probando endpoint de propiedades...');
console.log('🔗 URL de prueba:', propertiesUrl);

fetch(propertiesUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log('✅ Propiedades - Respuesta recibida:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Propiedades - Datos recibidos:', data?.properties?.length || 0, 'propiedades');
    console.log('✅ Test de Propiedades EXITOSO');
  })
  .catch(error => {
    console.error('❌ Error en test de propiedades:', error);
  });
