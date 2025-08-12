// Archivo: proxy-routes.js
// Este archivo agrega redirecciones de rutas para mantener compatibilidad
// con clientes que no usan el prefijo /api

const express = require('express');
const router = express.Router();

// Función para crear una redirección desde una ruta sin prefijo /api a una con prefijo
function createRedirect(routePath) {
    // Configuramos la ruta sin prefijo para redireccionar a la versión con prefijo /api
    router.all(`/${routePath}`, (req, res) => {
        console.log(`🔀 Redirigiendo: /${routePath} → /api/${routePath}`);
        
        // Redirección transparente a la ruta con prefijo /api
        // Este enfoque preserva el método HTTP y los datos de la solicitud
        req.url = `/api/${routePath}${req.url.substring(routePath.length + 1)}`;
        console.log(`🔀 URL modificada a: ${req.url}`);
        
        // Continúa el flujo de middleware
        req.app._router.handle(req, res);
    });
}

// Lista de redirecciones para mantener compatibilidad
const routesToRedirect = [
    'properties',
    'auth/login',
    'auth/register',
    'auth/verify',
    'auth/forgot-password',
    'auth/reset-password',
    'users',
    'reservations',
    'reviews',
    'inquiries',
    'subscribers',
    'payments'
];

// Configuramos todas las redirecciones
routesToRedirect.forEach(route => {
    createRedirect(route);
});

// Redirección especial para rutas que terminan en ID o parámetros
router.all('/:resource/:id', (req, res, next) => {
    const resource = req.params.resource;
    
    // Si la ruta base está en nuestra lista de redirecciones, redirigimos
    if (routesToRedirect.includes(resource)) {
        console.log(`🔀 Redirigiendo ruta con ID: /${resource}/${req.params.id} → /api/${resource}/${req.params.id}`);
        req.url = `/api${req.url}`;
        console.log(`🔀 URL modificada a: ${req.url}`);
        req.app._router.handle(req, res);
    } else {
        // Si no es una ruta de API conocida, continuamos con el siguiente middleware
        next();
    }
});

module.exports = router;
