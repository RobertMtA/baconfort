const fs = require('fs');
const path = require('path');

// Definir directorios
const authComponentsDir = path.join(__dirname, 'baconfort-react', 'src', 'components', 'Auth');
const userComponentsDir = path.join(__dirname, 'baconfort-react', 'src', 'components', 'User');
const fixes = [];

// Lista de archivos que queremos revisar
const filesToCheck = [
  path.join(authComponentsDir, 'LoginForm.jsx'),
  path.join(authComponentsDir, 'RegisterForm.jsx'),
  path.join(authComponentsDir, 'ResetPassword.jsx'),
  path.join(authComponentsDir, 'AuthModal.jsx')
];

// También intenta UserButton.jsx si existe
const userButtonPath = path.join(userComponentsDir, 'UserButton.jsx');
if (fs.existsSync(userButtonPath)) {
  filesToCheck.push(userButtonPath);
}

// Contador global
let totalButtonsFound = 0;
let totalButtonsFixed = 0;

// Procesamos cada archivo
filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Archivo no encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  console.log(`📄 Procesando ${fileName}...`);
  
  // Contador de botones encontrados y arreglados
  let buttonsFound = 0;
  let buttonsFixed = 0;

  // Regex para encontrar elementos button sin id o name
  const buttonRegex = /<button(?![^>]*\bid=|\bname=)[^>]*>/g;
  
  // Encontrar todos los matches
  let match;
  while ((match = buttonRegex.exec(content)) !== null) {
    buttonsFound++;
    totalButtonsFound++;
    const originalButton = match[0];
    
    // Determinar un id/name único basado en el contexto
    const contextRange = 100; // Caracteres para analizar antes del botón
    const buttonContext = content.substring(
      Math.max(0, match.index - contextRange), 
      match.index
    );
    
    // Tratar de identificar el propósito del botón
    let buttonPurpose = 'button';
    if (buttonContext.includes('login') || buttonContext.includes('iniciar')) {
      buttonPurpose = 'login';
    } else if (buttonContext.includes('register') || buttonContext.includes('registr')) {
      buttonPurpose = 'register';
    } else if (buttonContext.includes('password') || buttonContext.includes('contraseña')) {
      buttonPurpose = 'password';
    } else if (buttonContext.includes('close') || buttonContext.includes('cerrar')) {
      buttonPurpose = 'close';
    } else if (buttonContext.includes('toggle') || buttonContext.includes('mostrar')) {
      buttonPurpose = 'toggle';
    } else if (buttonContext.includes('submit') || buttonContext.includes('enviar')) {
      buttonPurpose = 'submit';
    }
    
    // Generar un identificador único para este botón
    const idBase = `${buttonPurpose}-button-${fileName.replace('.jsx', '')}`;
    const id = `${idBase}-${buttonsFound}`;
    
    // Crear el botón actualizado con id y name
    let updatedButton = originalButton.replace('>', ` id="${id}" name="${id}">`);
    
    // Reemplazar el botón original con el actualizado
    content = content.substring(0, match.index) + 
              updatedButton + 
              content.substring(match.index + originalButton.length);
    
    // Ajustar la posición del regex para el próximo match
    buttonRegex.lastIndex += (updatedButton.length - originalButton.length);
    
    buttonsFixed++;
    totalButtonsFixed++;
    fixes.push(`📝 Fixed in ${fileName}: Added id="${id}" and name="${id}" to button`);
  }

  console.log(`🔍 En ${fileName}: ${buttonsFound} botones encontrados, ${buttonsFixed} arreglados`);
  
  // Guardar los cambios si se hicieron modificaciones
  if (buttonsFixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`💾 Guardados cambios en ${fileName}`);
  }
});

console.log('\n✅ Resumen de correcciones:');
console.log(`Total: ${totalButtonsFound} botones encontrados, ${totalButtonsFixed} arreglados`);
fixes.forEach(fix => console.log(fix));
console.log('\n👉 Todos los botones ahora tienen id y name. Esto debería resolver las advertencias del navegador.');
