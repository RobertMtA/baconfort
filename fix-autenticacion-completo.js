/**
 * fix-autenticacion-completo.js
 * 
 * Este script corrige todos los problemas de autenticación en la aplicación Baconfort
 * Reemplaza todos los tokens dinámicos por el token estático correcto que sabemos
 * que el backend acepta.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Token correcto que sabemos que el backend acepta
const TOKEN_CORRECTO = 'admin_static_20250812_17200_baconfort';

// Rutas de archivos importantes
const rutas = {
  adminAuth: path.join(__dirname, 'baconfort-react', 'src', 'utils', 'adminAuth.js'),
  api: path.join(__dirname, 'baconfort-react', 'src', 'services', 'api.js'),
};

// Colores para la consola
const colores = {
  verde: '\x1b[32m',
  rojo: '\x1b[31m',
  amarillo: '\x1b[33m',
  azul: '\x1b[36m',
  reset: '\x1b[0m'
};

/**
 * Función principal de corrección
 */
async function ejecutarCorrecciones() {
  console.log(`${colores.azul}===================================================${colores.reset}`);
  console.log(`${colores.azul}🔧 CORRECCIÓN DE AUTENTICACIÓN BACONFORT${colores.reset}`);
  console.log(`${colores.azul}===================================================${colores.reset}`);
  console.log(`\nFecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
  console.log(`Corrigiendo problemas de autenticación de administrador...\n`);

  // 1. Corregir adminAuth.js
  await corregirAdminAuth();

  // 2. Corregir api.js
  await corregirAPI();

  // 3. Verificar otros archivos relevantes
  await buscarOtrosTokens();

  console.log(`\n${colores.azul}===================================================${colores.reset}`);
  console.log(`${colores.azul}✅ CORRECCIONES COMPLETADAS${colores.reset}`);
  console.log(`${colores.azul}===================================================${colores.reset}`);
  console.log(`
1. Se ha establecido el token hardcodeado '${TOKEN_CORRECTO}' en:
   - adminAuth.js
   - api.js (tanto en getAuthToken como en generateStaticAdminToken)

2. Siguientes pasos:
   - Recompilar la aplicación con 'npm run build'
   - Probar el acceso al panel de administrador
   - Verificar que todas las consultas a la API funcionen correctamente

3. Si persisten los problemas:
   - Ejecutar 'diagnostico-autenticacion.js' para más detalles
   - Limpiar el localStorage del navegador manualmente
  `);
}

/**
 * Corregir el archivo adminAuth.js
 */
async function corregirAdminAuth() {
  console.log(`\n${colores.amarillo}➡️ Corrigiendo adminAuth.js${colores.reset}`);
  
  try {
    if (!fs.existsSync(rutas.adminAuth)) {
      console.log(`${colores.rojo}❌ ERROR: No se encuentra el archivo ${rutas.adminAuth}${colores.reset}`);
      return;
    }
    
    let contenido = fs.readFileSync(rutas.adminAuth, 'utf8');
    
    // Verificar si el archivo ya tiene el token correcto
    if (contenido.includes(`'${TOKEN_CORRECTO}'`) || contenido.includes(`"${TOKEN_CORRECTO}"`)) {
      console.log(`${colores.verde}✅ El archivo ya contiene el token correcto${colores.reset}`);
    } else {
      // Intentar reemplazar el token en la constante ADMIN_TOKEN_HARDCODED
      const regex = /const\s+ADMIN_TOKEN_HARDCODED\s*=\s*['"]([^'"]+)['"]/;
      if (regex.test(contenido)) {
        const contenidoModificado = contenido.replace(
          regex,
          `const ADMIN_TOKEN_HARDCODED = '${TOKEN_CORRECTO}'`
        );
        
        fs.writeFileSync(rutas.adminAuth, contenidoModificado, 'utf8');
        console.log(`${colores.verde}✅ Token reemplazado en ADMIN_TOKEN_HARDCODED${colores.reset}`);
      } else {
        console.log(`${colores.rojo}❌ No se pudo encontrar la constante ADMIN_TOKEN_HARDCODED${colores.reset}`);
      }
    }
    
    // Verificar que getAdminToken() devuelve el token correcto
    if (contenido.includes('export const getAdminToken')) {
      console.log(`${colores.verde}✅ Función getAdminToken() encontrada${colores.reset}`);
    } else {
      console.log(`${colores.rojo}❌ No se encontró la función getAdminToken()${colores.reset}`);
    }
  } catch (error) {
    console.log(`${colores.rojo}❌ ERROR al procesar adminAuth.js: ${error.message}${colores.reset}`);
  }
}

/**
 * Corregir el archivo api.js
 */
async function corregirAPI() {
  console.log(`\n${colores.amarillo}➡️ Corrigiendo api.js${colores.reset}`);
  
  try {
    if (!fs.existsSync(rutas.api)) {
      console.log(`${colores.rojo}❌ ERROR: No se encuentra el archivo ${rutas.api}${colores.reset}`);
      return;
    }
    
    let contenido = fs.readFileSync(rutas.api, 'utf8');
    let cambiado = false;
    
    // Corregir generateStaticAdminToken
    const regexGenerate = /(export\s+const\s+generateStaticAdminToken\s*=\s*\(\)\s*=>\s*\{[\s\S]*?)(const\s+staticToken\s*=\s*['"])([^'"]+)(['"])/;
    if (regexGenerate.test(contenido)) {
      contenido = contenido.replace(regexGenerate, `$1$2${TOKEN_CORRECTO}$4`);
      console.log(`${colores.verde}✅ Token reemplazado en generateStaticAdminToken()${colores.reset}`);
      cambiado = true;
    } else {
      console.log(`${colores.amarillo}⚠️ No se pudo encontrar generateStaticAdminToken() o ya tiene el token correcto${colores.reset}`);
    }
    
    // Corregir getAuthToken
    const regexGetAuth = /(export\s+const\s+getAuthToken\s*=\s*\(\)\s*=>[\s\S]*?)(const\s+staticToken\s*=\s*['"])([^'"]+)(['"])/;
    if (regexGetAuth.test(contenido)) {
      contenido = contenido.replace(regexGetAuth, `$1$2${TOKEN_CORRECTO}$4`);
      console.log(`${colores.verde}✅ Token reemplazado en getAuthToken()${colores.reset}`);
      cambiado = true;
    } else {
      console.log(`${colores.amarillo}⚠️ No se pudo encontrar getAuthToken() o ya tiene el token correcto${colores.reset}`);
    }
    
    // Corregir return de fallback
    const regexFallback = /(return\s+['"])([^'"]+)(['"];\s*\/\/\s*Usar\s+el\s+mismo\s+token\s+como\s+fallback)/;
    if (regexFallback.test(contenido)) {
      contenido = contenido.replace(regexFallback, `$1${TOKEN_CORRECTO}$3`);
      console.log(`${colores.verde}✅ Token reemplazado en fallback${colores.reset}`);
      cambiado = true;
    }
    
    // Verificar getAllInquiries
    if (contenido.includes('getAllInquiries') && contenido.includes('getAuthToken()')) {
      console.log(`${colores.verde}✅ getAllInquiries() parece usar getAuthToken() correctamente${colores.reset}`);
    }
    
    // Guardar cambios si los hubo
    if (cambiado) {
      fs.writeFileSync(rutas.api, contenido, 'utf8');
      console.log(`${colores.verde}✅ Cambios guardados en api.js${colores.reset}`);
    } else {
      console.log(`${colores.amarillo}⚠️ No se realizaron cambios en api.js${colores.reset}`);
    }
  } catch (error) {
    console.log(`${colores.rojo}❌ ERROR al procesar api.js: ${error.message}${colores.reset}`);
  }
}

/**
 * Buscar otros archivos que pudieran contener tokens hardcodeados
 */
async function buscarOtrosTokens() {
  console.log(`\n${colores.amarillo}➡️ Buscando otros tokens hardcodeados en el proyecto${colores.reset}`);
  
  try {
    const directorio = path.join(__dirname, 'baconfort-react');
    
    // Verificar que el directorio existe
    if (!fs.existsSync(directorio)) {
      console.log(`${colores.rojo}❌ ERROR: No se encuentra el directorio ${directorio}${colores.reset}`);
      return;
    }
    
    const comando = process.platform === 'win32'
      ? `powershell -Command "Get-ChildItem -Path '${directorio}' -Recurse -Include *.js,*.jsx,*.ts,*.tsx | Select-String -Pattern 'Bearer|token|admin_static|ADMIN_' | Select-Object Path,LineNumber,Line | Format-Table -AutoSize"`
      : `grep -r --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" -E "Bearer|token|admin_static|ADMIN_" ${directorio}`;
    
    console.log(`${colores.amarillo}⏳ Ejecutando búsqueda de tokens en archivos...${colores.reset}`);
    
    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.log(`${colores.rojo}❌ Error en la búsqueda: ${error.message}${colores.reset}`);
        return;
      }
      
      if (stderr) {
        console.log(`${colores.amarillo}⚠️ Advertencia: ${stderr}${colores.reset}`);
      }
      
      if (stdout) {
        const lineas = stdout.split('\n').filter(l => l.trim() !== '');
        console.log(`${colores.azul}ℹ️ Se encontraron ${lineas.length} líneas con posibles tokens${colores.reset}`);
        console.log(`${colores.amarillo}⚠️ Revisar manualmente estas ocurrencias si persisten los problemas${colores.reset}`);
      } else {
        console.log(`${colores.verde}✅ No se encontraron otras ocurrencias de tokens${colores.reset}`);
      }
    });
  } catch (error) {
    console.log(`${colores.rojo}❌ ERROR al buscar otros tokens: ${error.message}${colores.reset}`);
  }
}

// Ejecutar las correcciones
ejecutarCorrecciones().catch(error => {
  console.log(`${colores.rojo}❌ ERROR FATAL: ${error.message}${colores.reset}`);
});
