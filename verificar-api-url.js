// Script para verificar la configuración de la API en tiempo real
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

console.log('=================================================');
console.log('🔍 BACONFORT - VERIFICADOR DE CONFIGURACIÓN DE API');
console.log('=================================================');
console.log('');

// 1. Verificar entorno
console.log('📋 INFORMACIÓN DE ENTORNO:');
console.log(`- Hostname: ${process.env.HOSTNAME || 'No disponible'}`);
console.log(`- Plataforma: ${process.platform}`);
console.log(`- Node.js: ${process.version}`);
console.log('');

// 2. Verificar archivos .env
console.log('📂 ARCHIVOS DE ENTORNO:');
const rootPath = path.resolve(__dirname);
const reactPath = path.join(rootPath, 'baconfort-react');

const envFiles = [
    { name: '.env (React)', path: path.join(reactPath, '.env') },
    { name: '.env.production (React)', path: path.join(reactPath, '.env.production') },
    { name: '.env.local (React)', path: path.join(reactPath, '.env.local') }
];

envFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
        console.log(`✅ ${file.name} encontrado`);
        
        // Leer y mostrar contenido relevante
        try {
            const envContent = fs.readFileSync(file.path, 'utf8');
            const envConfig = dotenv.parse(envContent);
            
            if (envConfig.VITE_API_URL) {
                console.log(`   - VITE_API_URL: ${envConfig.VITE_API_URL}`);
            } else {
                console.log(`   - VITE_API_URL no encontrado en el archivo`);
            }
        } catch (error) {
            console.log(`   - Error leyendo archivo: ${error.message}`);
        }
    } else {
        console.log(`❌ ${file.name} no encontrado`);
    }
});

console.log('');

// 3. Verificar puerto configurado en backend
console.log('🔧 CONFIGURACIÓN DEL BACKEND:');
const serverJsPath = path.join(rootPath, 'baconfort-backend', 'server.js');

if (fs.existsSync(serverJsPath)) {
    try {
        const serverContent = fs.readFileSync(serverJsPath, 'utf8');
        const portMatch = serverContent.match(/const PORT = process\.env\.PORT \|\| (\d+)/);
        
        if (portMatch && portMatch[1]) {
            console.log(`✅ Puerto del servidor: ${portMatch[1]}`);
        } else {
            console.log('❌ No se pudo detectar el puerto del servidor');
        }
    } catch (error) {
        console.log(`❌ Error leyendo server.js: ${error.message}`);
    }
} else {
    console.log('❌ server.js no encontrado');
}

// 4. Verificar scripts de inicio
console.log('');
console.log('🚀 SCRIPTS DE INICIO:');

const startScripts = [
    { name: 'INICIAR-SERVIDORES.bat', path: path.join(rootPath, 'INICIAR-SERVIDORES.bat') },
    { name: 'iniciar-todo.sh', path: path.join(rootPath, 'iniciar-todo.sh') }
];

startScripts.forEach(script => {
    if (fs.existsSync(script.path)) {
        try {
            const scriptContent = fs.readFileSync(script.path, 'utf8');
            
            // Buscar referencias a puertos
            const portReferences = scriptContent.match(/localhost:(\d+)/g) || [];
            
            console.log(`✅ ${script.name} contiene referencias a:`);
            if (portReferences.length > 0) {
                portReferences.forEach(ref => console.log(`   - ${ref}`));
            } else {
                console.log('   - No se encontraron referencias a puertos');
            }
        } catch (error) {
            console.log(`❌ Error leyendo ${script.name}: ${error.message}`);
        }
    } else {
        console.log(`❌ ${script.name} no encontrado`);
    }
});

// 5. Verificación en tiempo real de API_BASE_URL
console.log('');
console.log('🔄 VERIFICACIÓN EN TIEMPO REAL:');
console.log('En el navegador, abre la consola del desarrollador y ejecuta:');
console.log('```');
console.log('console.log("URL API usada:", import.meta.env.VITE_API_URL || "No disponible");');
console.log('```');

console.log('');
console.log('=================================================');
console.log('✅ VERIFICACIÓN COMPLETADA');
console.log('=================================================');
