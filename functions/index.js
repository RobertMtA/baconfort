/**
 * Cloud Functions para el backend de Baconfort
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Express app
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Importaciones del backend original
// Nota: Tendremos que copiar los archivos necesarios del backend
const app = express();

// Configuraciones CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://baconfort.netlify.app',
    'https://confort-ba.web.app',
    'https://baconfort.web.app'
  ],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Configuración para MongoDB (deberás añadir la cadena de conexión real en un entorno seguro)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tu-usuario:tu-password@tucluster.mongodb.net/baconfort';

// Conexión a MongoDB (comentada temporalmente para este ejemplo)
// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => logger.info('MongoDB conectado'))
// .catch(err => logger.error('Error MongoDB:', err));

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API de Baconfort funcionando en Firebase Functions' });
});

// Aquí irían todas las rutas de tu backend
// app.use('/api/properties', propertiesRoutes);
// app.use('/api/reservations', reservationsRoutes);
// etc...

// Exportamos la función de API
exports.api = onRequest({ 
  cors: true,
  maxInstances: 10
}, app);
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
