export const loadDepartamentoImages = (departamento) => {
    try {
      // Importar imágenes dinámicamente
      const images = import.meta.glob(`/public/images/departamentos/${departamento}/*.{jpg,png}`);
      
      const loadedImages = [];
      for (const path in images) {
        loadedImages.push(path.replace('/public', ''));
      }
      
      return loadedImages;
    } catch (error) {
      return [];
    }
  };