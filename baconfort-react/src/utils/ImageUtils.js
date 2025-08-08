// Utilidades para manejo de imágenes y videos
export const ImageUtils = {
  // Verificar si una string es base64
  isBase64Image: (str) => {
    if (!str || typeof str !== 'string') return false;
    return str.startsWith('data:image/');
  },

  // Verificar si una string es base64 de video
  isBase64Video: (str) => {
    if (!str || typeof str !== 'string') return false;
    return str.startsWith('data:video/');
  },

  // Verificar si es base64 (imagen o video)
  isBase64Media: (str) => {
    return ImageUtils.isBase64Image(str) || ImageUtils.isBase64Video(str);
  },

  // Obtener la fuente correcta para una imagen
  getImageSrc: (imageSrc) => {
    if (!imageSrc) return '';
    
    // Si es un objeto de imagen (del MultipleImageUploader)
    if (typeof imageSrc === 'object' && imageSrc.src) {
      return imageSrc.src;
    }
    
    // Si es base64, devolverlo tal como está
    if (ImageUtils.isBase64Image(imageSrc)) {
      return imageSrc;
    }
    
    // Si es una URL relativa, devolverla tal como está
    if (imageSrc.startsWith('/')) {
      return imageSrc;
    }
    
    // Si es una URL completa, devolverla tal como está
    if (imageSrc.startsWith('http')) {
      return imageSrc;
    }
    
    // Si no tiene prefijo, asumir que es una ruta relativa a /img/
    return `/img/${imageSrc}`;
  },

  // Obtener la fuente correcta para un video
  getVideoSrc: (videoSrc) => {
    if (!videoSrc) return '';
    
    // Si es un objeto de video (similar al MultipleImageUploader)
    if (typeof videoSrc === 'object' && videoSrc.src) {
      return videoSrc.src;
    }
    
    // Si es base64, devolverlo tal como está
    if (ImageUtils.isBase64Video(videoSrc)) {
      return videoSrc;
    }
    
    // Si es una URL relativa, devolverla tal como está
    if (videoSrc.startsWith('/')) {
      return videoSrc;
    }
    
    // Si es una URL completa, devolverla tal como está
    if (videoSrc.startsWith('http')) {
      return videoSrc;
    }
    
    // Si no tiene prefijo, asumir que es una ruta relativa a /video/
    return `/video/${videoSrc}`;
  },

  // Validar que una imagen se puede cargar
  validateImageSrc: (imageSrc) => {
    return new Promise((resolve) => {
      if (ImageUtils.isBase64Image(imageSrc)) {
        // Las imágenes base64 no necesitan validación adicional
        resolve(true);
        return;
      }
      
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = ImageUtils.getImageSrc(imageSrc);
    });
  }
};

export default ImageUtils;
