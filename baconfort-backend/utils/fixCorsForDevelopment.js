const express = require('express');
const cors = require('cors');

/**
 * Función para modificar la configuración CORS y hacerla más permisiva
 * @param {Express.Application} app - La instancia de aplicación Express
 */
function fixCorsForDevelopment(app) {
  console.log('\n🔧 Aplicando corrección CORS para desarrollo...');
  
  // Sobrescribir la configuración CORS existente con una más permisiva
  app.use(cors({
    origin: function(origin, callback) {
      // Permitir solicitudes desde cualquier origen en desarrollo
      console.log('✅ CORS: Recibida solicitud desde origen:', origin || 'Sin origen (acceso directo)');
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Cache-Control', 'Pragma', 'Expires'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
  
  // Middleware para mostrar todas las solicitudes
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
    next();
  });
  
  console.log('✅ Configuración CORS modificada para permitir todas las solicitudes');
  console.log('⚠️ ADVERTENCIA: Esta configuración sólo debe usarse en desarrollo\n');
}

module.exports = fixCorsForDevelopment;
