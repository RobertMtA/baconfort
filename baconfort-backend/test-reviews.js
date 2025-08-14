// Prueba simple para verificar el endpoint de reviews
const fetch = require('node-fetch');

const testReviewsEndpoint = async () => {
  console.log('🔍 Probando endpoint de reviews...');
  
  const url = 'http://localhost:5004/api/reviews/admin?status=pending&limit=20&page=1&sort=-createdAt&admin=true&dev=true&bypass=true&emergency=true';
  
  const headers = {
    'Authorization': 'Bearer admin_static_20250812_17300_baconfort',
    'x-admin-emergency-token': 'ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS',
    'x-admin-access': 'admin',
    'x-token-override': 'emergency',
    'Content-Type': 'application/json'
  };
  
  console.log('📤 URL:', url);
  console.log('📤 Headers:', headers);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    
    console.log('📥 Status:', response.status);
    console.log('📥 Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('📥 Response Body:', responseText);
    
    if (response.ok) {
      console.log('✅ Request exitoso');
    } else {
      console.log('❌ Request falló');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testReviewsEndpoint();
