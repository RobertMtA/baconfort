// Script para verificar la propiedad departamento-en-retiro
console.log('🔍 Verificando localStorage...');

// Verificar localStorage
const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
console.log('📊 Datos admin en localStorage:', adminData);

if (adminData.properties) {
  const departamentoRetiro = adminData.properties.find(p => p.id === 'departamento-en-retiro');
  
  if (departamentoRetiro) {
    console.log('🏠 Propiedad encontrada en localStorage:');
    console.log('   - Título:', departamentoRetiro.title);
    console.log('   - ID:', departamentoRetiro.id);
    console.log('   - Imágenes en galleryImages:', departamentoRetiro.galleryImages?.length || 0);
    
    if (departamentoRetiro.galleryImages?.length > 0) {
      departamentoRetiro.galleryImages.forEach((img, index) => {
        const preview = typeof img === 'string' ? 
          img.substring(0, 60) + '...' : 
          (img.url?.substring(0, 60) + '...' || 'Sin URL');
        console.log(`   Imagen ${index + 1}: ${preview}`);
      });
    }
    
    console.log('📸 Cover image:', departamentoRetiro.coverImage ? 'Sí' : 'No');
    console.log('📍 Location:', departamentoRetiro.location);
  } else {
    console.log('❌ No se encontró departamento-en-retiro en localStorage');
  }
} else {
  console.log('❌ No hay propiedades en localStorage');
}

// Verificar también el AdminContext si está disponible
console.log('🔍 Verificando AdminContext...');
window.addEventListener('load', () => {
  const contextCheck = window.localStorage.getItem('baconfort_admin_properties');
  if (contextCheck) {
    console.log('📊 Datos AdminContext:', JSON.parse(contextCheck));
  }
});
