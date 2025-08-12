const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5005;

// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors({
  origin: '*', // Permite cualquier origen
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));

// Middleware para parsear JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para probar que el servidor está funcionando
app.get('/', (req, res) => {
  console.log('Solicitud recibida en /');
  res.status(200).json({ message: '✅ Servidor de prueba funcionando correctamente' });
});

// Ruta para manejar solicitudes de recuperación de contraseña
app.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  
  console.log(`📧 Solicitud de recuperación recibida para: ${email}`);
  
  // Validación básica
  if (!email) {
    console.log('❌ Error: Email no proporcionado');
    return res.status(400).json({ 
      success: false, 
      error: 'Debe proporcionar un correo electrónico' 
    });
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ Error: Formato de email inválido');
    return res.status(400).json({ 
      success: false, 
      error: 'El formato del correo electrónico es inválido' 
    });
  }

  // Simulamos un token de recuperación (solo para pruebas)
  const resetToken = `test-token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  
  console.log(`✅ Token generado para ${email}: ${resetToken}`);
  
  // Enviamos respuesta exitosa
  res.status(200).json({
    success: true,
    message: 'Se han enviado instrucciones a tu correo electrónico para restablecer la contraseña',
    resetToken: resetToken // Esto solo se debe incluir en entorno de desarrollo
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor de prueba iniciado en http://localhost:${PORT}`);
  console.log(`✅ CORS configurado para permitir cualquier origen`);
});

console.log('🔧 Servidor configurado para recibir solicitudes de recuperación de contraseña');
console.log('📝 Ruta de recuperación: POST /auth/forgot-password');
