const fs = require('fs');
const path = require('path');

// Ruta al archivo UserButton.jsx
const userButtonPath = path.join(__dirname, 'baconfort-react', 'src', 'components', 'Auth', 'UserButton.jsx');

if (!fs.existsSync(userButtonPath)) {
  console.log(`⚠️ Archivo no encontrado: ${userButtonPath}`);
  process.exit(1);
}

// Leer el contenido del archivo
let content = fs.readFileSync(userButtonPath, 'utf8');
const fileName = path.basename(userButtonPath);
console.log(`📄 Procesando ${fileName}...`);

// Contador de botones encontrados y arreglados
let buttonsFound = 0;
let buttonsFixed = 0;
const fixes = [];

// Regex para encontrar elementos button sin id o name
const buttonRegex = /<button(?![^>]*\bid=|\bname=)[^>]*>/g;

// Encontrar todos los matches
let match;
while ((match = buttonRegex.exec(content)) !== null) {
  buttonsFound++;
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
  } else if (buttonContext.includes('profile') || buttonContext.includes('perfil')) {
    buttonPurpose = 'profile';
  } else if (buttonContext.includes('logout') || buttonContext.includes('salir')) {
    buttonPurpose = 'logout';
  } else if (buttonContext.includes('user') || buttonContext.includes('usuario')) {
    buttonPurpose = 'user';
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
  fixes.push(`📝 Fixed in ${fileName}: Added id="${id}" and name="${id}" to button`);
}

console.log(`🔍 En ${fileName}: ${buttonsFound} botones encontrados, ${buttonsFixed} arreglados`);

// Guardar los cambios si se hicieron modificaciones
if (buttonsFixed > 0) {
  fs.writeFileSync(userButtonPath, content, 'utf8');
  console.log(`💾 Guardados cambios en ${fileName}`);
}

console.log('\n✅ Resumen de correcciones:');
fixes.forEach(fix => console.log(fix));
console.log('\n👉 Todos los botones en UserButton.jsx ahora tienen id y name. Esto debería resolver las advertencias del navegador.');
