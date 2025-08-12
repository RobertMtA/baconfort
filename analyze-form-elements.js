const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Buscar en todos los archivos JSX de la aplicación
function scanForFormElements() {
  console.log('🔍 Escaneando componentes React en busca de elementos de formulario sin id/name...');

  // Directorios a escanear
  const componentDirs = [
    path.join(__dirname, 'baconfort-react', 'src', 'components', 'Auth'),
    path.join(__dirname, 'baconfort-react', 'src', 'components', 'User')
  ];
  
  // Archivos JSX a analizar
  const jsxFiles = [];
  
  // Obtener todos los archivos JSX
  componentDirs.forEach(dir => {
    try {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
          if (file.endsWith('.jsx')) {
            jsxFiles.push(path.join(dir, file));
          }
        });
      }
    } catch (err) {
      console.error(`Error al leer directorio ${dir}:`, err);
    }
  });
  
  console.log(`📄 Encontrados ${jsxFiles.length} archivos JSX para analizar`);
  
  // Problemas encontrados
  const problemsFound = [];
  
  // Analizar cada archivo
  jsxFiles.forEach(filePath => {
    try {
      const fileName = path.basename(filePath);
      console.log(`\nAnalizando: ${fileName}`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Encontrar todas las etiquetas de apertura de formularios y elementos de formulario
      const formTagRegex = /<(form|input|select|textarea|button)([^>]*)>/g;
      let match;
      
      while ((match = formTagRegex.exec(content)) !== null) {
        const tagName = match[1]; // form, input, etc.
        const attributes = match[2]; // Todos los atributos
        const lineNumber = getLineNumber(content, match.index);
        
        // Verificar si tiene id o name
        if (!attributes.includes('id=') && !attributes.includes('name=')) {
          // Buscar contexto (5 líneas alrededor)
          const context = getContext(content, match.index);
          
          problemsFound.push({
            file: fileName,
            line: lineNumber,
            tag: tagName,
            attributes: attributes.trim(),
            context
          });
          
          console.log(`❌ Línea ${lineNumber}: <${tagName}> sin id/name`);
        }
      }
      
    } catch (err) {
      console.error(`Error al analizar ${filePath}:`, err);
    }
  });
  
  // Mostrar resultados
  if (problemsFound.length > 0) {
    console.log(`\n❌ Se encontraron ${problemsFound.length} elementos sin atributos id o name:`);
    
    problemsFound.forEach((problem, index) => {
      console.log(`\n--- Problema #${index + 1} ---`);
      console.log(`Archivo: ${problem.file}`);
      console.log(`Línea: ${problem.line}`);
      console.log(`Etiqueta: <${problem.tag}>`);
      console.log(`Atributos: ${problem.attributes}`);
      console.log(`Contexto:\n${problem.context}`);
    });
  } else {
    console.log('\n✅ No se encontraron problemas! Todos los elementos tienen atributos id o name.');
  }
}

// Obtener el número de línea para una posición en el archivo
function getLineNumber(content, position) {
  const lines = content.substring(0, position).split('\n');
  return lines.length;
}

// Obtener contexto alrededor de una posición
function getContext(content, position, contextLines = 3) {
  const lines = content.split('\n');
  const lineNumber = getLineNumber(content, position);
  
  const startLine = Math.max(0, lineNumber - contextLines - 1);
  const endLine = Math.min(lines.length, lineNumber + contextLines);
  
  return lines.slice(startLine, endLine).map((line, i) => 
    `${startLine + i + 1}: ${line}`
  ).join('\n');
}

// Ejecutar el escaneo
scanForFormElements();
