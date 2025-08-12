// Script para verificar todos los elementos de formulario en la aplicación actual
// Este script debe ser ejecutado en la consola del navegador

(function() {
  console.log('🔍 Iniciando verificación de elementos de formulario sin id o name');
  
  // Obtener todos los elementos de formulario
  const formElements = document.querySelectorAll('input, select, textarea, form, button');
  const elementsWithoutIdOrName = [];
  
  // Verificar cada elemento
  formElements.forEach((element, index) => {
    if (!element.id && !element.name) {
      // Obtener información sobre el elemento
      let parentInfo = '';
      let ancestorClasses = [];
      let ancestorIds = [];
      
      // Verificar hasta 3 ancestros para obtener contexto
      let parent = element.parentElement;
      let depth = 0;
      while (parent && depth < 3) {
        if (parent.id) ancestorIds.push(parent.id);
        if (parent.className) ancestorClasses.push(parent.className);
        parent = parent.parentElement;
        depth++;
      }
      
      // Crear info del elemento
      const elementInfo = {
        tagName: element.tagName.toLowerCase(),
        type: element.type || 'N/A',
        classes: element.className || 'N/A',
        ancestorIds: ancestorIds.join(', ') || 'N/A',
        ancestorClasses: ancestorClasses.join(', ') || 'N/A',
        html: element.outerHTML.substring(0, 100) + '...',
        element // Referencia al elemento para poder identificarlo en la página
      };
      
      elementsWithoutIdOrName.push(elementInfo);
    }
  });
  
  // Mostrar resultados
  if (elementsWithoutIdOrName.length > 0) {
    console.log(`❌ Se encontraron ${elementsWithoutIdOrName.length} elementos sin atributos id o name:`);
    console.table(elementsWithoutIdOrName, ['tagName', 'type', 'classes', 'ancestorIds', 'ancestorClasses']);
    
    // Resaltar elementos en la página para facilitar identificación
    elementsWithoutIdOrName.forEach((info, index) => {
      const element = info.element;
      const originalBackground = element.style.backgroundColor;
      const originalBorder = element.style.border;
      
      // Destacar el elemento
      element.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
      element.style.border = '2px solid red';
      
      console.log(`Elemento #${index + 1}:`, element);
      
      // Restaurar después de 5 segundos
      setTimeout(() => {
        element.style.backgroundColor = originalBackground;
        element.style.border = originalBorder;
      }, 5000);
    });
  } else {
    console.log('✅ ¡Todos los elementos tienen atributos id o name!');
  }
})();
