/**
 * Rutas de despliegue para la API de BaconFort
 * Proporciona endpoints para gestionar y verificar despliegues
 */

const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Variable para almacenar información del último despliegue
let lastDeployment = {
  timestamp: new Date().toISOString(),
  status: 'initialized',
  details: {},
  logs: []
};

/**
 * Endpoint para verificar estado del despliegue
 * GET /api/deployment/status
 * Público - No requiere autenticación
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    deployment: {
      ...lastDeployment,
      // Eliminar información sensible para respuestas públicas
      logs: lastDeployment.logs.slice(-10) // Solo últimos 10 logs
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      railway: process.env.RAILWAY_PUBLIC_DOMAIN ? true : false
    }
  });
});

/**
 * Endpoint para ejecutar un script de despliegue
 * POST /api/deployment/trigger
 * Privado - Requiere autenticación de admin
 */
router.post('/trigger', requireAuth, requireAdmin, (req, res) => {
  const { script = 'deploy-update.sh', args = [] } = req.body;

  // Validar el script solicitado (lista blanca)
  const allowedScripts = ['deploy-update.sh', 'verify-deployment.sh', 'sync-database.sh'];
  
  if (!allowedScripts.includes(script)) {
    return res.status(400).json({
      success: false,
      message: `Script no permitido: ${script}. Scripts válidos: ${allowedScripts.join(', ')}`
    });
  }

  // Path al script (asegurando que esté dentro del proyecto)
  const scriptPath = path.resolve(__dirname, '../scripts', script);
  
  // Verificar si existe
  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({
      success: false,
      message: `Script no encontrado: ${script}`
    });
  }

  // Actualizar estado
  lastDeployment = {
    timestamp: new Date().toISOString(),
    status: 'running',
    script,
    args,
    requestedBy: req.user.email || req.user.id,
    logs: [`[${new Date().toISOString()}] Iniciando script: ${script}`]
  };

  // Ejecutar el script
  const process = exec(`sh ${scriptPath} ${args.join(' ')}`, (error, stdout, stderr) => {
    if (error) {
      lastDeployment.status = 'error';
      lastDeployment.error = error.message;
      lastDeployment.logs.push(`[${new Date().toISOString()}] Error: ${error.message}`);
      return;
    }
    
    if (stderr) {
      lastDeployment.logs.push(`[${new Date().toISOString()}] STDERR: ${stderr}`);
    }
    
    lastDeployment.status = 'completed';
    lastDeployment.completedAt = new Date().toISOString();
    lastDeployment.logs.push(`[${new Date().toISOString()}] Completado exitosamente`);
  });

  // Capturar salida en tiempo real
  process.stdout.on('data', (data) => {
    lastDeployment.logs.push(`[${new Date().toISOString()}] ${data.toString().trim()}`);
  });

  // Responder inmediatamente
  res.json({
    success: true,
    message: `Script ${script} iniciado correctamente`,
    deploymentId: lastDeployment.timestamp
  });
});

/**
 * Endpoint para registrar un despliegue completado
 * POST /api/deployment/register
 * Privado - Requiere autenticación de admin
 */
router.post('/register', requireAuth, requireAdmin, (req, res) => {
  const { platforms, version, details } = req.body;
  
  lastDeployment = {
    timestamp: new Date().toISOString(),
    status: 'registered',
    platforms: platforms || { frontend: true },
    version: version || process.env.npm_package_version || '1.0.0',
    details: details || {},
    registeredBy: req.user.email || req.user.id
  };
  
  // Guardar en archivo para persistencia
  try {
    const deploymentInfo = {
      ...lastDeployment,
      history: fs.existsSync('./deployment-history.json') 
        ? JSON.parse(fs.readFileSync('./deployment-history.json')).slice(0, 10) 
        : []
    };
    
    deploymentInfo.history.unshift({
      timestamp: lastDeployment.timestamp,
      status: lastDeployment.status,
      platforms: lastDeployment.platforms,
      version: lastDeployment.version
    });
    
    fs.writeFileSync('./deployment-history.json', JSON.stringify(deploymentInfo, null, 2));
  } catch (err) {
    console.error('Error saving deployment history:', err);
  }

  res.json({
    success: true,
    message: 'Despliegue registrado correctamente',
    deployment: lastDeployment
  });
});

module.exports = router;
