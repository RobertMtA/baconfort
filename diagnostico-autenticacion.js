/**
 * diagnostico-autenticacion.js
 * 
 * Script para diagnosticar problemas de autenticación de administrador en Baconfort
 * Este script verifica todas las posibles fuentes de error y proporciona correcciones.
 * 
 * Ejecutar con: node diagnostico-autenticacion.js
 */

// URL de la API
const API_URL = 'https://baconfort-production-084d.up.railway.app/api';
// Token correcto que sabemos que el backend acepta
const TOKEN_CORRECTO = 'admin_static_20250812_17200_baconfort';
// Token de emergencia para situaciones extremas
const TOKEN_EMERGENCIA = 'ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS';

// Importamos fetch para Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Colores para la consola
const colores = {
  verde: '\x1b[32m',
  rojo: '\x1b[31m',
  amarillo: '\x1b[33m',
  azul: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

/**
 * Función principal de diagnóstico
 */
async function ejecutarDiagnostico() {
  console.log(`${colores.azul}===================================================${colores.reset}`);
  console.log(`${colores.azul}🔍 DIAGNÓSTICO DE AUTENTICACIÓN BACONFORT${colores.reset}`);
  console.log(`${colores.azul}===================================================${colores.reset}`);
  console.log(`\nFecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
  console.log(`Verificando problemas de autenticación de administrador...\n`);

  // 1. Probar con token correcto
  await probarToken(TOKEN_CORRECTO, 'correcto hardcodeado');

  // 2. Probar con token de emergencia (bypass)
  await probarTokenEmergencia(TOKEN_EMERGENCIA);

  // 3. Generar un token dinámico con el formato correcto y probarlo
  const tokenDinamico = generarTokenDinamico();
  await probarToken(tokenDinamico, 'dinámico generado');

  // 4. Verificar una URL específica que sabemos que está fallando
  console.log(`\n${colores.amarillo}➡️ PRUEBA #4: Verificando endpoint específico de consultas${colores.reset}`);
  try {
    const respuestaInquiries = await fetch(
      `${API_URL}/inquiries/admin/all?admin=true&dev=true&_t=${Date.now()}`, 
      {
        headers: {
          'Authorization': `Bearer ${TOKEN_CORRECTO}`
        }
      }
    );
    
    const datosInquiries = await respuestaInquiries.json();
    if (respuestaInquiries.status === 200 && datosInquiries.success) {
      console.log(`${colores.verde}✅ ÉXITO: Endpoint de consultas responde correctamente${colores.reset}`);
      console.log(`   Cantidad de consultas: ${datosInquiries.data ? datosInquiries.data.length : 0}`);
    } else {
      console.log(`${colores.rojo}❌ ERROR: Endpoint de consultas falló con código ${respuestaInquiries.status}${colores.reset}`);
      console.log(`   Respuesta: ${JSON.stringify(datosInquiries)}`);
    }
  } catch (error) {
    console.log(`${colores.rojo}❌ ERROR: No se pudo conectar al endpoint de consultas${colores.reset}`);
    console.log(`   Error: ${error.message}`);
  }

  // 5. Mostrar recomendaciones para el navegador
  console.log(`\n${colores.azul}===================================================${colores.reset}`);
  console.log(`${colores.azul}🔧 RECOMENDACIONES PARA CORRECCIÓN${colores.reset}`);
  console.log(`${colores.azul}===================================================${colores.reset}`);
  
  console.log(`\n${colores.amarillo}📋 EJECUTAR EN LA CONSOLA DEL NAVEGADOR:${colores.reset}`);
  console.log(`
// Limpiar tokens antiguos en localStorage
localStorage.removeItem('baconfort-token');
localStorage.removeItem('baconfort_admin_session');
localStorage.removeItem('baconfort-user');
console.log('🧹 Tokens de localStorage eliminados');

// Establecer el token correcto
localStorage.setItem('baconfort-token', '${TOKEN_CORRECTO}');
console.log('✅ Token correcto establecido');

// Verificar token establecido
console.log('🔍 Token actual:', localStorage.getItem('baconfort-token'));

// [OPCIONAL] Configurar sesión de administrador
localStorage.setItem('baconfort_admin_session', JSON.stringify({
  token: '${TOKEN_CORRECTO}',
  role: 'admin',
  isAuthenticated: true
}));
console.log('👤 Sesión de administrador configurada');
  `);
  
  console.log(`\n${colores.azul}===================================================${colores.reset}`);
  console.log(`${colores.azul}🔍 RESUMEN DEL DIAGNÓSTICO${colores.reset}`);
  console.log(`${colores.azul}===================================================${colores.reset}`);
  console.log(`
1. Token hardcodeado (${TOKEN_CORRECTO.substring(0, 20)}...):
   Este token debería funcionar para todas las peticiones de administrador.
   
2. Revisa que ambos archivos usen el mismo token:
   - adminAuth.js: getAdminToken()
   - api.js: getAuthToken() y generateStaticAdminToken()
   
3. Asegúrate que el backend esté configurado para aceptar:
   - Tokens con formato: admin_static_YYYYMMDD_HHmm0_baconfort
   - Parámetros URL: admin=true&dev=true
   
4. Si nada funciona, usa el token de emergencia: ${TOKEN_EMERGENCIA}
   Con los parámetros adicionales: bypass=true&emergency=true
  `);
}

/**
 * Genera un token dinámico con el formato correcto
 */
function generarTokenDinamico() {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  
  const hora = String(ahora.getHours()).padStart(2, '0');
  const minutos = Math.floor(ahora.getMinutes() / 10) * 10;
  const minutosFormateados = String(minutos).padStart(2, '0') + '0';
  
  return `admin_static_${año}${mes}${dia}_${hora}${minutosFormateados}_baconfort`;
}

/**
 * Prueba un token específico contra la API
 */
async function probarToken(token, descripcion) {
  console.log(`\n${colores.amarillo}➡️ PRUEBA: Verificando token ${descripcion}${colores.reset}`);
  console.log(`   Token: ${token}`);
  
  try {
    // Probar con una ruta de propiedades (generalmente más permisiva)
    const respuesta = await fetch(`${API_URL}/properties?admin=true&dev=true`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const datos = await respuesta.json();
    if (respuesta.status === 200) {
      console.log(`${colores.verde}✅ ÉXITO: Petición exitosa con código ${respuesta.status}${colores.reset}`);
      console.log(`   El backend aceptó el token ${descripcion}`);
    } else {
      console.log(`${colores.rojo}❌ ERROR: Petición falló con código ${respuesta.status}${colores.reset}`);
      console.log(`   Mensaje: ${datos.error || JSON.stringify(datos)}`);
    }
  } catch (error) {
    console.log(`${colores.rojo}❌ ERROR: No se pudo realizar la petición${colores.reset}`);
    console.log(`   Error: ${error.message}`);
  }
}

/**
 * Prueba el token de emergencia con los parámetros especiales
 */
async function probarTokenEmergencia(token) {
  console.log(`\n${colores.amarillo}➡️ PRUEBA: Verificando token de emergencia${colores.reset}`);
  console.log(`   Token: ${token}`);
  
  try {
    // Probar con una ruta de propiedades y parámetros de emergencia
    const respuesta = await fetch(
      `${API_URL}/properties?admin=true&dev=true&bypass=true&emergency=true`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const datos = await respuesta.json();
    if (respuesta.status === 200) {
      console.log(`${colores.verde}✅ ÉXITO: Petición de emergencia exitosa con código ${respuesta.status}${colores.reset}`);
      console.log(`   El backend aceptó el token de emergencia`);
    } else {
      console.log(`${colores.rojo}❌ ERROR: Petición de emergencia falló con código ${respuesta.status}${colores.reset}`);
      console.log(`   Mensaje: ${datos.error || JSON.stringify(datos)}`);
    }
  } catch (error) {
    console.log(`${colores.rojo}❌ ERROR: No se pudo realizar la petición de emergencia${colores.reset}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Ejecutar el diagnóstico
ejecutarDiagnostico().catch(error => {
  console.log(`${colores.rojo}❌ ERROR FATAL: ${error.message}${colores.reset}`);
});
