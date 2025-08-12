// Revisar elementos del formulario sin atributos id o name
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

// Configuración
const AUTH_COMPONENTS_PATH = path.join(__dirname, 'baconfort-react/src/components/Auth');
const PATTERN_ELEMENT = /<(input|button|form|select|textarea)([^>]*)>/g;
const PATTERN_ID_NAME = /\s(id|name)=["'][^"']*["']/g;

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

async function checkFile(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return [];
  
  console.log(`Analizando: ${path.basename(filePath)}`);
  const content = await readFile(filePath, 'utf8');
  const issues = [];
  
  // Encuentra todos los elementos
  let match;
  while ((match = PATTERN_ELEMENT.exec(content)) !== null) {
    const [fullTag, tagType, attrs] = match;
    const position = match.index;
    const line = content.substring(0, position).split('\n').length;
    
    // Ignora los iconos (que suelen tener aria-hidden="true")
    if (attrs.includes('aria-hidden="true"')) continue;
    
    // Verifica si tiene id o name
    const hasId = attrs.match(/\sid=["'][^"']*["']/);
    const hasName = attrs.match(/\sname=["'][^"']*["']/);
    
    // Para elementos que deberían tener id o name
    if ((tagType === 'input' || tagType === 'button' || 
         tagType === 'form' || tagType === 'select' || 
         tagType === 'textarea') && 
        !hasId && !hasName) {
      
      issues.push({
        file: path.basename(filePath),
        line,
        tag: tagType,
        fullTag: fullTag.substring(0, 40) + (fullTag.length > 40 ? '...' : '')
      });
    }
  }
  
  return issues;
}

async function main() {
  try {
    console.log('🔍 Iniciando diagnóstico de formularios...');
    
    // Busca en carpeta de Auth
    const files = await getFiles(AUTH_COMPONENTS_PATH);
    const jsxFiles = files.filter(file => file.endsWith('.jsx'));
    
    console.log(`📋 Encontrados ${jsxFiles.length} archivos JSX para analizar\n`);
    
    // Revisa cada archivo
    let allIssues = [];
    for (const file of jsxFiles) {
      const issues = await checkFile(file);
      if (issues.length > 0) {
        allIssues = [...allIssues, ...issues];
      }
    }
    
    // Muestra resultados
    if (allIssues.length === 0) {
      console.log('✅ No se encontraron problemas! Todos los elementos tienen atributos id o name.');
    } else {
      console.log(`❌ Se encontraron ${allIssues.length} elementos sin atributos id o name:`);
      console.table(allIssues);
    }
  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  }
}

main();
