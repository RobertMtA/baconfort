#!/bin/bash
# Script para actualizar todas las importaciones de AdminContext-STATEFUL a AdminContext-FIXED

echo "🛠️ Actualizando importaciones en componentes..."

# Reemplazar todas las importaciones de AdminContext-STATEFUL por AdminContext-FIXED
find ./src -type f -name "*.jsx" -exec sed -i 's/import { useAdmin } from '\''..\/..\/context\/AdminContext-STATEFUL'\''/import { useAdmin } from '\''..\/..\/context\/AdminContext-FIXED'\''/g' {} \;
find ./src -type f -name "*.jsx" -exec sed -i 's/import { AdminProvider } from '\''..\/..\/context\/AdminContext-STATEFUL'\''/import { AdminProvider } from '\''..\/..\/context\/AdminContext-FIXED'\''/g' {} \;
find ./src -type f -name "*.jsx" -exec sed -i 's/import { useAdmin } from '\''..\/context\/AdminContext-STATEFUL'\''/import { useAdmin } from '\''..\/context\/AdminContext-FIXED'\''/g' {} \;
find ./src -type f -name "*.jsx" -exec sed -i 's/import { AdminProvider } from '\''..\/context\/AdminContext-STATEFUL'\''/import { AdminProvider } from '\''..\/context\/AdminContext-FIXED'\''/g' {} \;

echo "✅ Importaciones actualizadas correctamente"
