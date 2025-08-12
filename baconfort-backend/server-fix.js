// Función para inicializar el servidor de forma segura
const startServer = () => {
  // Iniciar el servidor con mejor manejo de errores
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('🌍 Host: 0.0.0.0');
    console.log('🔍 Healthcheck URLs:');
    console.log(`  - http://localhost:${PORT}/health`);
    console.log(`  - http://localhost:${PORT}/api/health`);
    console.log('✅ Server ready');
    
    // Conectar a servicios después de que el servidor esté en funcionamiento
    initializeServices();
  });
  
  // Manejar errores durante el inicio del servidor
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ ERROR: El puerto ${PORT} ya está en uso.`);
      console.error(`🔄 Sugerencias para solucionar el problema:`);
      console.error(`   1. Ejecuta el script 'restart-server.ps1' para detectar y cerrar procesos`);
      console.error(`   2. Usa un puerto alternativo: PORT=5005 npm start`);
      console.error(`   3. O ejecuta: .\\start-alternative-port.ps1 -Puerto 5005`);
    } else {
      console.error('❌ Error al iniciar el servidor:', error);
    }
    process.exit(1);
  });
  
  return server;
};

// Función separada para inicializar servicios
const initializeServices = async () => {
  try {
    // Conectar a MongoDB
    connectDB().catch(err => {
      console.error('⚠️ MongoDB connection error:', err.message);
      console.log('🔄 Continuing in demo mode...');
    });
    
    // Configurar email transporter
    try {
      setupEmailTransporter();
    } catch (emailError) {
      console.error('⚠️ Email setup error:', emailError.message);
    }
    
    // Inicializar email transporter de notificaciones
    try {
      const { initializeEmailTransporter } = require('./utils/emailNotifications');
      initializeEmailTransporter();
    } catch (notifError) {
      console.error('⚠️ Notification setup error:', notifError.message);
    }
    
    console.log('✅ All services initialized successfully');
    
  } catch (error) {
    console.error('❌ Error during service initialization:', error.message);
    console.log('🔄 Some services may be in demo mode...');
  }
};

// Inicializar servidor
startServer();
