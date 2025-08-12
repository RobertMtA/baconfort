// Script para corregir el formulario en ForgotPassword.jsx
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'baconfort-react', 'src', 'components', 'Auth', 'ForgotPassword.jsx');

console.log('🔧 Corrigiendo formulario en ForgotPassword.jsx...');

// Leer el archivo
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('❌ Error al leer el archivo:', err);
    return;
  }

  // Buscar el formulario sin atributos y reemplazarlo
  const originalFormPattern = /<form onSubmit={handleSubmit}>/g;
  const correctedForm = '<form onSubmit={handleSubmit} id="forgot-password-form" name="forgot-password-form">';
  
  // Realizar la sustitución
  const updatedContent = data.replace(originalFormPattern, correctedForm);
  
  // Verificar si se realizó algún cambio
  if (data === updatedContent) {
    console.log('⚠️ No se encontró el formulario para corregir');
    return;
  }
  
  // Escribir el archivo actualizado
  fs.writeFile(filePath, updatedContent, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('❌ Error al escribir el archivo:', writeErr);
      return;
    }
    console.log('✅ Formulario corregido exitosamente');
  });
});
