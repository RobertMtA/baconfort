const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔐 Probando login de admin...');
    
    const response = await fetch('http://localhost:5005/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'baconfort.centro@gmail.com',
        password: 'roccosa226'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ LOGIN ADMIN EXITOSO!');
      console.log('Usuario:', result.user.name);
      console.log('Role:', result.user.role);
      console.log('');
      console.log('🎉 CREDENCIALES DE ADMIN FUNCIONANDO:');
      console.log('   Email: baconfort.centro@gmail.com');
      console.log('   Contraseña: roccosa226');
    } else {
      console.log('❌ Error:', result.error);
    }
    
    console.log('\n🔄 Probando login de usuario regular...');
    
    const userResponse = await fetch('http://localhost:5005/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'robertogaona1985@gmail.com',
        password: 'roberto123'
      })
    });
    
    const userResult = await userResponse.json();
    
    if (userResult.success) {
      console.log('✅ LOGIN USUARIO EXITOSO!');
      console.log('Usuario:', userResult.user.name);
      console.log('Role:', userResult.user.role);
      console.log('');
      console.log('🎉 CREDENCIALES DE USUARIO FUNCIONANDO:');
      console.log('   Email: robertogaona1985@gmail.com');
      console.log('   Contraseña: roberto123');
    } else {
      console.log('❌ Error usuario:', userResult.error);
      console.log('');
      console.log('💡 SOLUCIÓN RECOMENDADA:');
      console.log('   Usar credenciales de admin temporalmente:');
      console.log('   Email: baconfort.centro@gmail.com');
      console.log('   Contraseña: roccosa226');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
