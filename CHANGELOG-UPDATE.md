# Changelog - Correcciones adicionales

## [1.0.2] - 9 de agosto de 2025

### Correcciones
- Eliminada la doble declaración del contexto `AdminContext`
- Eliminada la doble declaración del hook `useAdmin`
- Añadida la exportación por defecto del contexto `AdminContext`

## [1.0.1] - 9 de agosto de 2025

### Correcciones
- Solucionado error de duplicación de función `logout` en el archivo `AdminContext-STATEFUL.jsx` que impedía la carga correcta de la aplicación
- Corregido error `setIsAuthenticated is not defined` que aparecía en la consola
- Corregido error de sintaxis en template string para generación de IDs de propiedad

### Mejoras
- Optimizada la gestión del estado de autenticación en el contexto de administración
