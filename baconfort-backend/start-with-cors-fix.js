// Script para iniciar el servidor con configuración CORS más permisiva para desarrollo
console.log('🚀 Iniciando servidor en modo desarrollo con CORS permisivo');

// Hacer que la variable de entorno NODE_ENV sea desarrollo
process.env.NODE_ENV = 'development';

// Agregar variable para activar el fix de CORS
process.env.ENABLE_CORS_FIX = 'true';

// Cargar el servidor principal
require('./server.js');
