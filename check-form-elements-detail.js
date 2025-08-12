const fs = require('fs');
const path = require('path');

// Función para analizar el archivo JSX en busca de elementos HTML sin atributos id o name
function analyzeJSXFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Dividir por líneas para análisis más detallado
    const lines = content.split('\n');
    const tags = ['button', 'input', 'form', 'select', 'textarea'];
    const elementsWithoutIdOrName = [];
    
    // Recorrer cada línea del archivo
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      const lineNumber = lineNum + 1; // Las líneas son 1-indexed en editores
      
      // Para cada tipo de elemento que nos interesa
      for (const tag of tags) {
        // Regex para encontrar etiqueta sin id o name
        // Buscamos <tag y no seguido de atributos id= o name= hasta >
        if (line.includes(`<${tag}`) && !line.includes(`</${tag}`) && 
            !line.includes('id=') && !line.includes('name=')) {
          
          // Verificar si es una apertura de tag completa o parte de una tag multilínea
          if (line.includes('>')) {
            // Es una etiqueta completa en una sola línea
            elementsWithoutIdOrName.push({
              file: fileName,
              line: lineNumber,
              tag,
              fullTag: line.trim(),
              codeContext: lines.slice(Math.max(0, lineNum - 3), Math.min(lines.length, lineNum + 3)).join('\n')
            });
          } else {
            // Podría ser parte de una etiqueta multilínea
            // Buscar hacia adelante hasta encontrar un cierre de etiqueta o id/name
            let multilLineTag = line;
            let currentLine = lineNum + 1;
            let hasIdOrName = false;
            let foundClose = false;
            
            while (currentLine < Math.min(lines.length, lineNum + 10)) {
              const nextLine = lines[currentLine];
              multilLineTag += '\n' + nextLine;
              
              if (nextLine.includes('id=') || nextLine.includes('name=')) {
                hasIdOrName = true;
                break;
              }
              
              if (nextLine.includes('>')) {
                foundClose = true;
                break;
              }
              
              currentLine++;
            }
            
            if (foundClose && !hasIdOrName) {
              elementsWithoutIdOrName.push({
                file: fileName,
                line: lineNumber,
                tag,
                fullTag: multilLineTag,
                codeContext: lines.slice(Math.max(0, lineNum - 3), Math.min(lines.length, currentLine + 3)).join('\n')
              });
            }
          }
        }
      }
    }
    
    return elementsWithoutIdOrName;
  } catch (error) {
    console.error(`Error al analizar ${filePath}:`, error.message);
    return [];
  }
}

// Función principal
async function main() {
  console.log('🔍 Iniciando diagnóstico detallado de formularios...');
  
  // Rutas de los componentes en la aplicación
  const authComponentsPath = path.join(__dirname, 'baconfort-react', 'src', 'components', 'Auth');
  
  // Obtener todos los archivos JSX en el directorio de componentes Auth
  let jsxFiles = [];
  try {
    const authFiles = fs.readdirSync(authComponentsPath)
      .filter(file => file.endsWith('.jsx'))
      .map(file => path.join(authComponentsPath, file));
    jsxFiles = [...authFiles];
  } catch (error) {
    console.error('Error al leer directorio:', error.message);
    process.exit(1);
  }
  
  console.log(`📋 Encontrados ${jsxFiles.length} archivos JSX para analizar\n`);
  
  // Analizar cada archivo
  const elementsWithoutIdOrName = [];
  
  for (const file of jsxFiles) {
    const fileName = path.basename(file);
    console.log(`Analizando: ${fileName}`);
    const fileElements = analyzeJSXFile(file);
    elementsWithoutIdOrName.push(...fileElements);
  }
  
  // Mostrar resultados
  if (elementsWithoutIdOrName.length > 0) {
    console.log(`\n❌ Se encontraron ${elementsWithoutIdOrName.length} elementos sin atributos id o name:`);
    
    elementsWithoutIdOrName.forEach((item, index) => {
      console.log(`\n---------- Elemento #${index + 1} ----------`);
      console.log(`Archivo: ${item.file}`);
      console.log(`Línea: ${item.line}`);
      console.log(`Tipo de elemento: <${item.tag}>`);
      console.log(`\nContexto del código:\n${item.codeContext}`);
      console.log('\n------------------------------------');
    });
  } else {
    console.log('\n✅ No se encontraron problemas! Todos los elementos tienen atributos id o name.');
  }
}

main();
