// Utilidad de seguridad para BACONFORT Admin
// Este archivo debe mantenerse privado

class SecurityUtils {
  // Generar hash simple (no usar en producción real)
  static simpleHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    return hash.toString(36);
  }

  // Verificar credenciales con ofuscación
  static verifyCredentials(username, password) {
    // Ofuscar las credenciales (no es seguridad real, solo ofuscación)
    const validUser = this.decode('YWRtaW4='); // base64 de 'admin'
    const validPass = this.decode('YWRtaW4xMjM='); // base64 de 'admin123' - ACTUALIZADO
    const validEmail = 'admin@baconfort.com'; // También permitir email
    
    return (username === validUser || username === validEmail) && password === validPass;
  }

  // Decodificar base64
  static decode(encoded) {
    try {
      return atob(encoded);
    } catch (e) {
      return '';
    }
  }

  // Generar token de sesión
  static generateSessionToken() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}_${random}`;
  }

  // Verificar si el token de sesión es válido (básico)
  static isValidSession(token) {
    if (!token) return false;
    
    const [timestamp] = token.split('_');
    const tokenTime = parseInt(timestamp);
    const currentTime = Date.now();
    const hourInMs = 60 * 60 * 1000; // 1 hora
    
    return (currentTime - tokenTime) < (4 * hourInMs); // Válido por 4 horas
  }
}

export default SecurityUtils;
