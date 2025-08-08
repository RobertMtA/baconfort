// Script temporal para setear token de usuario demo en localStorage
// Ejecutar en la consola del navegador

const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZW1vX3VzZXJfMTIzIiwiaWF0IjoxNzUyMjY2NzY0LCJleHAiOjE3NTI4NzE1NjR9.XA4cr8wCQB8LIjRVZIS8sy_5Ci2A3cuOS6fmjZ6bLkU';

// Setear token
localStorage.setItem('baconfort-token', demoToken);

// Setear datos del usuario demo
const demoUser = {
  id: 'demo_user_123',
  email: 'demo@baconfort.com',
  name: 'Usuario Demo',
  role: 'user'
};

// También podemos setear el usuario en el contexto si es necesario
console.log('✅ Token y usuario demo configurados:');
console.log('Token:', demoToken.substring(0, 30) + '...');
console.log('User:', demoUser);
console.log('');
console.log('🔄 Ahora recarga la página para que el contexto de autenticación detecte el token.');
console.log('🏠 Luego navega a la sección "Mis Reservas" para ver las reservas demo.');
