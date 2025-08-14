/**
 * simple-auth-proxy.js
 * 
 * Un proxy simple que intercepta peticiones al backend local
 * y modifica los tokens de autenticación para rutas específicas.
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Configuración
const LISTEN_PORT = 5005;
const TARGET_HOST = 'localhost';
const TARGET_PORT = 5004;
const VERBOSE = true; // Mostrar mensajes detallados

// Mensaje inicial
console.log('\n============================================');
console.log('🔄 PROXY DE AUTENTICACIÓN PARA BACKEND LOCAL');
console.log('============================================\n');
console.log(`📡 Escuchando en: localhost:${LISTEN_PORT}`);
console.log(`📡 Redirigiendo a: ${TARGET_HOST}:${TARGET_PORT}\n`);

// Crear servidor HTTP
const server = http.createServer((clientReq, clientRes) => {
    const parsedUrl = url.parse(clientReq.url);
    const isAuthPath = parsedUrl.pathname.includes('/auth/');
    const isInquiriesPath = parsedUrl.pathname.includes('/inquiries');
    const isAdminPath = parsedUrl.pathname.includes('/admin');
    
    // Manejar solicitudes OPTIONS para CORS
    if (clientReq.method === 'OPTIONS') {
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': 86400
        };
        clientRes.writeHead(200, headers);
        return clientRes.end();
    }
    
    // Mostrar información sobre la petición
    if (VERBOSE) {
        console.log(`\n🔄 ${clientReq.method} ${clientReq.url}`);
    }
    
    // Opciones de la petición al servidor destino
    const options = {
        hostname: TARGET_HOST,
        port: TARGET_PORT,
        path: parsedUrl.path,
        method: clientReq.method,
        headers: clientReq.headers
    };
    
    // Información especial para solicitudes de login
    if (parsedUrl.pathname === '/api/auth/login' && clientReq.method === 'POST') {
        console.log('\n🔐 Solicitud de login detectada');
        console.log('🔍 Comprobando el formato de la solicitud...');

        // Recolectar datos de la solicitud POST para analizarlos
        let body = [];
        clientReq.on('data', (chunk) => {
            body.push(chunk);
        });
        
        clientReq.on('end', () => {
            try {
                body = Buffer.concat(body).toString();
                const contentType = clientReq.headers['content-type'] || '';
                
                if (contentType.includes('application/json')) {
                    try {
                        const data = JSON.parse(body);
                        console.log('📧 Email proporcionado:', data.email || 'No encontrado');
                        console.log('🔑 Contraseña proporcionada:', data.password ? '******' : 'No encontrada');
                    } catch (e) {
                        console.log('❌ Error al parsear JSON:', e.message);
                        console.log('📄 Cuerpo de la solicitud:', body);
                    }
                } else {
                    console.log('📄 Cuerpo de la solicitud (no es JSON):', body);
                }
            } catch (e) {
                console.log('❌ Error al procesar cuerpo de la solicitud:', e.message);
            }
        });
    }
    
    // Manejar token para rutas protegidas
    if (isAuthPath || isInquiriesPath || isAdminPath) {
        const authHeader = clientReq.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        
        // Si el token tiene el formato esperado (token estático)
        if (token === 'admin_static_20250812_17200_baconfort') {
            if (VERBOSE) {
                console.log('🔑 Ruta protegida detectada, modificando token...');
            }
            
            // Crear token con fecha actual
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hour = String(now.getHours()).padStart(2, '0');
            const minutes = Math.floor(now.getMinutes() / 10) * 10;
            const minutesFmt = String(minutes).padStart(2, '0') + '0';
            
            const dynamicToken = `admin_static_${year}${month}${day}_${hour}${minutesFmt}_baconfort`;
            
            // Modificar encabezados
            options.headers.authorization = `Bearer ${dynamicToken}`;
            
            if (VERBOSE) {
                console.log(`🔑 Token original: ${token}`);
                console.log(`🔑 Token dinámico: ${dynamicToken}`);
            }
            
            // Añadir parámetros admin y dev a la URL
            const separator = parsedUrl.path.includes('?') ? '&' : '?';
            options.path = `${parsedUrl.path}${separator}admin=true&dev=true&timestamp=${Date.now()}`;
            
            if (VERBOSE) {
                console.log(`🔄 URL modificada: ${options.path}`);
            }
        }
    }
    
    // Realizar la petición al servidor destino
    const proxyReq = http.request(options, (proxyRes) => {
        // Establecer los encabezados CORS para la respuesta
        proxyRes.headers['access-control-allow-origin'] = '*';
        proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization';
        
        // Transferir encabezados y código de estado
        clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
        
        // Mostrar información sobre la respuesta
        if (VERBOSE) {
            const statusColor = proxyRes.statusCode < 400 ? '\x1b[32m' : '\x1b[31m';
            console.log(`${statusColor}✓ Respuesta: ${proxyRes.statusCode}\x1b[0m`);
        }
        
        // Transmitir datos del servidor destino al cliente
        proxyRes.pipe(clientRes, { end: true });
    });
    
    // Manejar errores de la petición
    proxyReq.on('error', (err) => {
        console.error('\x1b[31m❌ Error al conectar con el servidor destino:\x1b[0m', err.message);
        clientRes.writeHead(502, { 'Content-Type': 'application/json' });
        clientRes.end(JSON.stringify({ 
            error: 'Error al conectar con el servidor destino', 
            details: err.message,
            targetHost: TARGET_HOST,
            targetPort: TARGET_PORT
        }));
    });
    
    // Transmitir datos del cliente al servidor destino
    clientReq.pipe(proxyReq, { end: true });
    
    // Manejar errores del cliente
    clientReq.on('error', (err) => {
        console.error('\x1b[31m❌ Error en la conexión del cliente:\x1b[0m', err.message);
    });
});

// Iniciar servidor
server.listen(LISTEN_PORT, () => {
    console.log('\x1b[32m✅ Proxy iniciado correctamente\x1b[0m\n');
    console.log('Para usar este proxy:');
    console.log('1. Asegúrate de que tu backend esté en ejecución en', `${TARGET_HOST}:${TARGET_PORT}`);
    console.log('2. En la consola del navegador, ejecuta:');
    console.log('\x1b[33m   localStorage.setItem("baconfort-api-url", "http://localhost:5005/api");\x1b[0m');
    console.log('\x1b[33m   console.log("✅ URL de API cambiada temporalmente. Recarga la página.");\x1b[0m\n');
    console.log('Presiona Ctrl+C para detener el proxy');
    console.log('============================================\n');
});

// Manejar cierre del servidor
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('\x1b[31m❌ Error: El puerto ' + LISTEN_PORT + ' ya está en uso.\x1b[0m');
        console.error('Intenta cerrar cualquier otra instancia del proxy o usar un puerto diferente.');
    } else {
        console.error('\x1b[31m❌ Error al iniciar el proxy:\x1b[0m', err.message);
    }
    process.exit(1);
});

// Manejar cierre del proceso
process.on('SIGINT', () => {
    console.log('\n\x1b[33m⏹️ Deteniendo el proxy...\x1b[0m');
    server.close(() => {
        console.log('\x1b[32m✅ Proxy detenido correctamente\x1b[0m');
        process.exit(0);
    });
});
