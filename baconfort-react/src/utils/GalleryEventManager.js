// Sistema de eventos para sincronizar cambios entre admin y frontend
// Usa localStorage events para comunicación entre pestañas/ventanas
class GalleryEventManager {
  constructor() {
    this.listeners = new Map();
    this.setupCrossTabCommunication();
  }

  // Configurar comunicación entre pestañas
  setupCrossTabCommunication() {
    // Escuchar cambios en localStorage (se dispara en otras pestañas)
    window.addEventListener('storage', (event) => {
      if (event.key === 'baconfort-gallery-update') {
        const propertyId = event.newValue;
        if (propertyId) {
          this.triggerLocalListeners(propertyId);
          // Limpiar el evento después de procesarlo
          setTimeout(() => {
            localStorage.removeItem('baconfort-gallery-update');
          }, 100);
        }
      }
    });
  }

  // Disparar listeners locales
  triggerLocalListeners(propertyId) {
    if (this.listeners.has(propertyId)) {
      this.listeners.get(propertyId).forEach(callback => {
        try {
          callback();
        } catch (error) {
          // Error silencioso
        }
      });
    }
  }

  // Registrar un listener para cambios de galería
  subscribe(propertyId, callback) {
    if (!this.listeners.has(propertyId)) {
      this.listeners.set(propertyId, new Set());
    }
    this.listeners.get(propertyId).add(callback);

    // Devolver función para desuscribirse
    return () => {
      if (this.listeners.has(propertyId)) {
        this.listeners.get(propertyId).delete(callback);
      }
    };
  }

  // Notificar que la galería de una propiedad ha cambiado
  notifyGalleryChanged(propertyId) {
    // Disparar listeners en la pestaña actual
    this.triggerLocalListeners(propertyId);
    
    // Notificar a otras pestañas usando localStorage
    localStorage.setItem('baconfort-gallery-update', propertyId);
    
    // También disparar un evento personalizado para la pestaña actual
    window.dispatchEvent(new CustomEvent('baconfort-gallery-changed', {
      detail: { propertyId }
    }));
  }

  // Limpiar todos los listeners
  clear() {
    this.listeners.clear();
  }

  // Obtener cantidad de listeners
  getListenerCount(propertyId) {
    return this.listeners.get(propertyId)?.size || 0;
  }
}

// Instancia global
const galleryEventManager = new GalleryEventManager();

export default galleryEventManager;
