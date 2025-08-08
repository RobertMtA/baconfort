// check-properties.js
const API_URL = 'http://localhost:5004/api';

async function checkProperties() {
  try {
    const response = await fetch(`${API_URL}/properties`, {
      headers: {
        'Authorization': 'Bearer BACONFORT_ADMIN_2025_7D3F9K2L'
      }
    });
    
    const data = await response.json();
    console.log('📊 ESTRUCTURA DE PROPIEDADES:', typeof data, Array.isArray(data));
    console.log('📊 CONTENIDO:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkProperties();
