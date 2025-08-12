const express = require('express');
const cors = require('cors');

// Este archivo es una versión simplificada para probar la recuperación de contraseña
// Se enfoca en configurar CORS adecuadamente para permitir solicitudes desde archivos locales

const app = express();
const port = process.env.PORT || 5005; // Usar un puerto diferente para no interferir con el servidor principal

// Configuración CORS muy permisiva para pruebas
app.use(cors({
  origin: '*', // Permitir cualquier origen
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json());

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'API de prueba funcionando correctamente' });
});

// Ruta para recuperación de contraseña
app.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  console.log('📧 Solicitud de recuperación para:', email);
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Se requiere un email válido'
    });
  }
  
  // Simular procesamiento exitoso
  res.json({
    success: true,
    message: 'Se han enviado instrucciones de recuperación a tu email.',
    resetToken: 'test-token-123456' // Solo para pruebas
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor de prueba ejecutándose en el puerto ${port}`);
  console.log('✅ CORS configurado para permitir cualquier origen');
});
