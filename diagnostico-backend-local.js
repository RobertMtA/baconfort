/**
 * diagnostico-backend-local.js
 * 
 * Este script está diseñado para diagnosticar problemas específicos con el backend local
 * y la validación de tokens de administrador.
 * 
 * Ejecutar con: node diagnostico-backend-local.js
 */

// Importar módulos necesarios
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs').promises;
const path = require('path');

// URL del backend local
const API_URL = 'http://localhost:5004/api';

// Tokens a probar
const tokens = [
  // Token estático hardcodeado que estamos usando actualmente
  { 
    token: 'admin_static_20250812_17200_baconfort', 
    descripcion: 'Token hardcodeado actual'
  },
  
  // Token dinámico generado con la fecha actual (siguiendo el formato documentado)
  { 
    token: generarTokenDinamico(), 
    descripcion: 'Token dinámico generado con fecha actual'
  },
  
  // Token dinámico con fecha futura
  { 
    token: generarTokenConFecha(new Date(2025, 11, 25)), 
    descripcion: 'Token dinámico con fecha futura (25/12/2025)'
  },
  
  // Token de emergencia
  { 
    token: 'ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS', 
    descripcion: 'Token de emergencia para bypass'
  },
  
  // Token usado en scripts de prueba
  { 
    token: 'BACONFORT_ADMIN_2025_7D3F9K2L', 
    descripcion: 'Token usado en scripts de prueba (check-properties.js)'
  }
];

// Endpoints a probar
const endpoints = [
  { path: '/properties', descripcion: 'Listado de propiedades' },
  { path: '/properties/ugarteche-2824', descripcion: 'Detalle de una propiedad' },
  { path: '/auth/me', descripcion: 'Información del usuario actual' },
  { path: '/inquiries/admin/all', descripcion: 'Todas las consultas (admin)', params: 'admin=true&dev=true' },
  { path: '/inquiries/my-inquiries', descripcion: 'Consultas del usuario' }
];

// Colores para la consola
const colores = {
  verde: '\x1b[32m',
  rojo: '\x1b[31m',
  amarillo: '\x1b[33m',
  azul: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  gris: '\x1b[90m'
};

/**
 * Función principal
 */
async function ejecutarDiagnostico() {
  console.log(`${colores.azul}===================================================${colores.reset}`);
  console.log(`${colores.azul}🔍 DIAGNÓSTICO DE BACKEND LOCAL${colores.reset}`);
  console.log(`${colores.azul}===================================================${colores.reset}`);
  
  console.log(`\n📡 Servidor: ${API_URL}`);
  console.log(`📅 Fecha: ${new Date().toLocaleString()}\n`);
  
  // Verificar si el servidor está en ejecución
  try {
    console.log(`${colores.amarillo}➡️ Verificando si el servidor local está en ejecución...${colores.reset}`);
    const respuesta = await fetch(`${API_URL}/health`);
    
    if (respuesta.ok) {
      console.log(`${colores.verde}✅ El servidor local está en ejecución${colores.reset}`);
      console.log(`   Código de respuesta: ${respuesta.status}`);
    } else {
      console.log(`${colores.amarillo}⚠️ El servidor respondió con código: ${respuesta.status}${colores.reset}`);
    }
  } catch (error) {
    console.log(`${colores.rojo}❌ No se pudo conectar al servidor local${colores.reset}`);
    console.log(`   Error: ${error.message}`);
    console.log(`\n${colores.rojo}Asegúrate de que el servidor backend esté en ejecución en http://localhost:5004${colores.reset}`);
    return;
  }
  
  // Prueba de tokens
  console.log(`\n${colores.azul}===================================================${colores.reset}`);
  console.log(`${colores.azul}🔐 PRUEBA DE TOKENS${colores.reset}`);
  console.log(`${colores.azul}===================================================${colores.reset}`);
  
  // Matriz para almacenar resultados
  const resultados = [];
  
  // Probar cada combinación de token y endpoint
  for (const token of tokens) {
    console.log(`\n${colores.magenta}📝 Probando token: ${token.token.substring(0, 15)}...${colores.reset}`);
    console.log(`   Descripción: ${token.descripcion}`);
    
    const resultadosToken = [];
    
    for (const endpoint of endpoints) {
      const url = `${API_URL}${endpoint.path}${endpoint.params ? `?${endpoint.params}` : ''}`;
      console.log(`\n   ${colores.gris}📌 Endpoint: ${endpoint.path} (${endpoint.descripcion})${colores.reset}`);
      
      try {
        const respuesta = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token.token}`
          }
        });
        
        const datos = await respuesta.json().catch(() => ({ error: 'No se pudo parsear la respuesta JSON' }));
        
        const exito = respuesta.status === 200 && (!datos.success || datos.success === true);
        
        if (exito) {
          console.log(`   ${colores.verde}✅ Éxito (${respuesta.status})${colores.reset}`);
        } else {
          console.log(`   ${colores.rojo}❌ Error (${respuesta.status}): ${datos.error || JSON.stringify(datos)}${colores.reset}`);
        }
        
        resultadosToken.push({
          endpoint: endpoint.path,
          status: respuesta.status,
          exito,
          mensaje: datos.error || ''
        });
      } catch (error) {
        console.log(`   ${colores.rojo}❌ Error: ${error.message}${colores.reset}`);
        resultadosToken.push({
          endpoint: endpoint.path,
          status: 0,
          exito: false,
          mensaje: error.message
        });
      }
    }
    
    resultados.push({
      token: token.token,
      descripcion: token.descripcion,
      resultados: resultadosToken,
      exitosos: resultadosToken.filter(r => r.exito).length,
      total: resultadosToken.length
    });
  }
  
  // Mostrar resumen
  console.log(`\n${colores.azul}===================================================${colores.reset}`);
  console.log(`${colores.azul}📊 RESUMEN DE RESULTADOS${colores.reset}`);
  console.log(`${colores.azul}===================================================${colores.reset}\n`);
  
  // Encontrar el mejor token
  const mejorToken = resultados.reduce((mejor, actual) => 
    actual.exitosos > mejor.exitosos ? actual : mejor, resultados[0]);
  
  console.log(`${colores.verde}🏆 Mejor token: ${mejorToken.token}${colores.reset}`);
  console.log(`   Descripción: ${mejorToken.descripcion}`);
  console.log(`   Tasa de éxito: ${mejorToken.exitosos}/${mejorToken.total} endpoints\n`);
  
  // Mostrar matriz de resultados
  console.log(`${colores.amarillo}📈 Matriz de resultados (endpoint vs token)${colores.reset}`);
  
  // Cabecera
  let tabla = '| Endpoint | ' + tokens.map(t => t.descripcion.substring(0, 15)).join(' | ') + ' |\n';
  tabla += '| ' + '-'.repeat(8) + ' | ' + tokens.map(() => '-'.repeat(15)).join(' | ') + ' |\n';
  
  // Filas
  for (const endpoint of endpoints) {
    tabla += `| ${endpoint.path.padEnd(8)} | `;
    
    for (const token of tokens) {
      const resultado = resultados
        .find(r => r.token === token.token).resultados
        .find(e => e.endpoint === endpoint.path);
        
      if (resultado.exito) {
        tabla += '✅ '.padEnd(15) + ' | ';
      } else {
        tabla += '❌ '.padEnd(15) + ' | ';
      }
    }
    
    tabla += '\n';
  }
  
  console.log(tabla);
  
  // Recomendaciones
  console.log(`\n${colores.azul}===================================================${colores.reset}`);
  console.log(`${colores.azul}🔧 RECOMENDACIONES${colores.reset}`);
  console.log(`${colores.azul}===================================================${colores.reset}\n`);
  
  // Detectar si ningún token funciona
  if (mejorToken.exitosos === 0) {
    console.log(`${colores.rojo}❗ PROBLEMA CRÍTICO: Ningún token funciona con el backend local${colores.reset}`);
    console.log(`
1. Verifica el código de validación de tokens en el backend local
2. Revisa los logs del servidor para entender por qué rechaza todos los tokens
3. Considera configurar un token específico para desarrollo en el backend
    `);
  }
  // Si hay un token que funciona mejor que el resto
  else if (mejorToken.token !== 'admin_static_20250812_17200_baconfort' && mejorToken.exitosos > 0) {
    console.log(`${colores.verde}💡 Se ha encontrado un token que funciona mejor que el actual${colores.reset}`);
    console.log(`
1. Actualiza el token en tu código:
   - En adminAuth.js: ADMIN_TOKEN_HARDCODED = '${mejorToken.token}'
   - En api.js: getAuthToken() y generateStaticAdminToken()
   
2. Ejecuta el siguiente código en la consola del navegador:
   localStorage.setItem('baconfort-token', '${mejorToken.token}');
   console.log('✅ Token actualizado a: ${mejorToken.token}');
   
3. También limpia otros tokens en localStorage:
   localStorage.removeItem('baconfort_admin_session');
   localStorage.removeItem('baconfort-user');
   console.log('🧹 Caché de sesión limpiada');
    `);
  }
  // Si el token actual funciona parcialmente
  else if (mejorToken.token === 'admin_static_20250812_17200_baconfort' && mejorToken.exitosos < mejorToken.total) {
    console.log(`${colores.amarillo}⚠️ El token actual funciona parcialmente (${mejorToken.exitosos}/${mejorToken.total} endpoints)${colores.reset}`);
    console.log(`
1. Revisa los logs del servidor para entender por qué ciertos endpoints fallan
2. Verifica si estos endpoints requieren parámetros adicionales:
   - admin=true
   - dev=true
   - bypass=true&emergency=true (para tokens de emergencia)
   
3. Considera enviar el email de usuario junto con el token
    `);
  }
  // Si todo funciona bien
  else if (mejorToken.exitosos === mejorToken.total) {
    console.log(`${colores.verde}✅ El token actual funciona correctamente para todos los endpoints${colores.reset}`);
  }

  // Verificar el archivo de configuración del backend
  try {
    console.log(`\n${colores.amarillo}🔍 Buscando archivos de configuración del backend...${colores.reset}`);
    const backendPath = path.join(__dirname, 'baconfort-backend');
    
    // Intentar leer configuración
    let configs = [];
    
    // Buscar en archivos comunes de configuración
    const filesToCheck = [
      'server.js', 
      'config/auth.js', 
      'config/tokens.js',
      'utils/auth.js',
      'middleware/authMiddleware.js'
    ];
    
    for (const file of filesToCheck) {
      const filePath = path.join(backendPath, file);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        if (content.includes('token') || content.includes('auth')) {
          configs.push({ file, path: filePath });
          console.log(`   ${colores.verde}✓ Encontrado archivo potencial: ${file}${colores.reset}`);
        }
      } catch (e) {
        // Archivo no encontrado, ignorar
      }
    }
    
    if (configs.length > 0) {
      console.log(`\n${colores.amarillo}💡 Considera revisar estos archivos para ver la validación de tokens:${colores.reset}`);
      configs.forEach(config => {
        console.log(`   - ${config.file}`);
      });
    } else {
      console.log(`${colores.amarillo}⚠️ No se encontraron archivos de configuración obvios${colores.reset}`);
    }
  } catch (error) {
    console.log(`${colores.rojo}❌ Error al buscar configuración: ${error.message}${colores.reset}`);
  }
}

/**
 * Genera un token dinámico con el formato correcto basado en la fecha actual
 */
function generarTokenDinamico() {
  return generarTokenConFecha(new Date());
}

/**
 * Genera un token con una fecha específica
 */
function generarTokenConFecha(fecha) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  
  const hora = String(fecha.getHours()).padStart(2, '0');
  const minutos = Math.floor(fecha.getMinutes() / 10) * 10;
  const minutosFormateados = String(minutos).padStart(2, '0') + '0';
  
  return `admin_static_${año}${mes}${dia}_${hora}${minutosFormateados}_baconfort`;
}

// Ejecutar el diagnóstico
ejecutarDiagnostico().catch(error => {
  console.error(`${colores.rojo}❌ ERROR FATAL: ${error.message}${colores.reset}`);
  console.error(error.stack);
});
