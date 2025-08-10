# Corrección de Importaciones de AdminContext - 2025-08-10 16:11

## Problema
El error "useAdmin must be used within an AdminProvider" persistía porque algunos componentes
estaban importando useAdmin desde diferentes versiones del AdminContext.

## Cambios realizados
- Se actualizaron las importaciones en 7 archivos
- Todas las importaciones de useAdmin ahora apuntan a AdminContext-FIXED.jsx
- Componentes afectados:
  - src/pages/Convencion-1994.jsx
  - src/pages/Dorrego-1548.jsx
  - src/pages/Ugarteche-2824.jsx
  - src/hooks/useProperty.js
  - src/hooks/usePropertyFromContext.js

## Importaciones estandarizadas
`jsx
// Formato correcto
import { useAdmin } from '../context/AdminContext-FIXED';
// O
import { useAdmin } from '../../context/AdminContext-FIXED';
`

## Próximos pasos
- Considerar consolidar todos los archivos de contexto en uno solo
- Remover versiones antiguas y duplicadas de los contextos
