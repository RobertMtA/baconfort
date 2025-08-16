const { default: fetch } = require('node-fetch');

async function testReservationWithPrice() {
  const backendUrl = 'https://baconfort-backend-production.up.railway.app';
  
  try {
    console.log('🔐 Obteniendo token de acceso...');
    
    // Primero necesitamos hacer login para obtener un token
    const loginResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'robertogaona1985@gmail.com',
        password: 'Roberto1985!'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Error en login:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Token obtenido exitosamente');
    
    // Crear reserva con todos los datos necesarios
    const reservationData = {
      propertyId: 'ugarteche-2824',
      propertyName: 'Ugarteche 2824',
      checkIn: '2025-08-19',
      checkOut: '2025-08-29', // 10 noches
      guests: 1,
      fullName: 'Roberto Gaona Test Debug',
      email: 'robertogaona1985@gmail.com',
      phone: '+541141766377',
      dni: '34352377',
      idType: 'dni',
      message: 'Prueba de reserva para verificar que aparezca el precio calculado automáticamente en el email del admin.',
      paymentMethod: 'efectivo'
    };
    
    console.log('\n📝 Creando reserva de prueba...');
    console.log('Datos:', reservationData);
    
    const reservationResponse = await fetch(`${backendUrl}/api/reservations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reservationData)
    });
    
    const result = await reservationResponse.text();
    console.log('\n📧 Respuesta del servidor:');
    console.log(result);
    
    if (reservationResponse.ok) {
      console.log('\n✅ ¡RESERVA CREADA! Revisa tu email para ver si aparece el precio calculado.');
      console.log('\n🔍 DEBERÍA APARECER:');
      console.log('- 💰 Monto calculado: US$450 (10 noches × $45)');
      console.log('- 🔒 Seña (30%): US$135');
      console.log('- ⏳ Status: PENDIENTE DE CONFIRMACIÓN');
    } else {
      console.log('❌ Error creando reserva:', result);
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

// Esperar un poco para que Railway esté listo y ejecutar
setTimeout(testReservationWithPrice, 3000);
