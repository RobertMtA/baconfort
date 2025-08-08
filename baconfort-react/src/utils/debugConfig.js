// ===== CONFIGURACIÓN DE DEBUG LOGS =====
// Cambiar este valor a 'true' para habilitar logs de debug
// Cambiar a 'false' para una experiencia más limpia
export const DEBUG_ENABLED = false;

// Función helper para logs condicionales
export const debugLog = (message, data = null) => {
  if (DEBUG_ENABLED) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

export const debugError = (message, error = null) => {
  if (DEBUG_ENABLED) {
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }
};

export const debugWarn = (message, data = null) => {
  if (DEBUG_ENABLED) {
    if (data) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  }
};
