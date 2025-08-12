const fs = require('fs');
const path = require('path');

// Función para encontrar elementos sin id/name
function findElementsWithoutIdName(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Regex para encontrar etiquetas HTML que abren (form, input, button, select, textarea)
    // y verificar si tienen id o name en hasta 5 líneas después
    const lines = content.split('\n');
    const tagsToCheck = ['button', 'input', 'form', 'select', 'textarea'];
    const results = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const tag of tagsToCheck) {
        // Verificar si esta línea contiene la apertura de una etiqueta
        const tagOpenRegex = new RegExp(`<${tag}(\\s|>)`, 'i');
        if (tagOpenRegex.test(line) && !line.includes(`</${tag}`)) {
          // Encontramos la apertura de una etiqueta
          let hasIdOrName = false;
          let endTagFound = false;
          let fullTag = line;
          
          // Verificar la línea actual
          if (line.includes('id=') || line.includes('name=')) {
            hasIdOrName = true;
          }
          
          // Verificar si la etiqueta se cierra en la misma línea
          if (line.includes('>')) {
            endTagFound = true;
          }
          
          // Si no tiene id/name y la etiqueta no se cerró, revisar hasta 6 líneas más
          if (!hasIdOrName && !endTagFound) {
            for (let j = 1; j <= 6 && (i + j) < lines.length; j++) {
              const nextLine = lines[i + j];
              fullTag += '\n' + nextLine;
              
              if (nextLine.includes('id=') || nextLine.includes('name=')) {
                hasIdOrName = true;
              }
              
              if (nextLine.includes('>')) {
                endTagFound = true;
                break;
              }
            }
          }
          
          // Si la etiqueta se cerró y no tiene id/name, agregarlo a los resultados
          if (endTagFound && !hasIdOrName) {
            results.push({
              file: fileName,
              line: i + 1,
              tag,
              fullTag: fullTag.length > 100 ? fullTag.substring(0, 100) + '...' : fullTag
            });
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error al analizar ${filePath}: ${error.message}`);
    return [];
  }
}

// Función principal
async function main() {
  console.log('🔍 Iniciando diagnóstico de formularios...');
  
  // Directorio de los componentes de autenticación
  const authComponentsPath = path.join(__dirname, 'baconfort-react', 'src', 'components', 'Auth');
  
  // Obtener los archivos JSX en el directorio
  let jsxFiles = [];
  try {
    jsxFiles = fs.readdirSync(authComponentsPath)
      .filter(file => file.endsWith('.jsx'))
      .map(file => path.join(authComponentsPath, file));
    
    console.log(`📋 Encontrados ${jsxFiles.length} archivos JSX para analizar`);
    console.log('');
  } catch (error) {
    console.error(`Error al leer el directorio: ${error.message}`);
    process.exit(1);
  }
  
  // Analizar cada archivo
  const allResults = [];
  for (const file of jsxFiles) {
    const fileName = path.basename(file);
    console.log(`Analizando: ${fileName}`);
    const results = findElementsWithoutIdName(file);
    allResults.push(...results);
  }
  
  // Mostrar resultados
  if (allResults.length > 0) {
    console.log(`❌ Se encontraron ${allResults.length} elementos sin atributos id o name:`);
    console.table(allResults);
  } else {
    console.log('✅ No se encontraron problemas! Todos los elementos tienen atributos id o name.');
  }
}

main();
