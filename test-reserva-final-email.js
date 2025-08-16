// Test final: crear reserva con precio y verificar email
const https = require('https');

const reservationData = {
  "propertyId": "ugarteche-2824",
  "propertyName": "Ugarteche 2824",
  "checkIn": "2025-09-20",
  "checkOut": "2025-09-30", 
  "guests": 2,
  "fullName": "TEST FINAL",
  "email": "baconfort.centro@gmail.com",
  "phone": "+541141766377",
  "dni": "34352377",
  "idType": "dni",
  "message": "TEST FINAL: Verificar que email muestre precio USD $535 y seña USD $161",
  "priceInfo": {
    "totalAmount": 535,
    "currency": "USD",
    "nights": 10,
    "breakdown": {
      "type": "weekly",
      "weeks": 1,
      "weeklyPrice": 400,
      "weeklyTotal": 400,
      "extraDays": 3,
      "dailyPrice": 45,
      "extraDaysTotal": 135
    },
    "checkIn": "2025-09-20T00:00:00.000Z",
    "checkOut": "2025-09-30T00:00:00.000Z",
    "propertyPrices": {
      "daily": 45,
      "weekly": 400,
      "monthly": 991,
      "currency": "USD"
    }
  },
  "paymentInfo": {
    "method": "efectivo",
    "depositRequired": 161,
    "currency": "USD"
  }
};

const postData = JSON.stringify(reservationData);

const options = {
  hostname: 'baconfort-production.up.railway.app',
  port: 443,
  path: '/api/reservations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': 'Bearer admin_token_1755375279363'
  }
};

console.log('🧪 ENVIANDO TEST DE RESERVA CON PRECIO...');
console.log('💰 Precio esperado: USD $535');
console.log('🔒 Seña esperada: USD $161');
console.log('📧 Email destino:', reservationData.email);
console.log('📤 Enviando a Railway...\n');

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log('📬 Respuesta del servidor:');
    console.log(JSON.stringify(JSON.parse(data), null, 2));
    
    if (res.statusCode === 201) {
      console.log('\n✅ RESERVA CREADA EXITOSAMENTE');
      console.log('📧 Verifica tu email para confirmar que muestre:');
      console.log('   💰 Precio Total: USD $535');
      console.log('   🔒 Seña requerida: USD $161');
      console.log('   📅 10 noches (20 al 30 sep 2025)');
    } else {
      console.log('\n❌ Error al crear reserva');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error en la petición:', e.message);
});

req.write(postData);
req.end();
