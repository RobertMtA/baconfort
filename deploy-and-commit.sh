#!/bin/bash

# Script para desplegar la aplicación en Firebase y hacer commit en GitHub

echo "🛠️ Iniciando proceso de despliegue y commit..."

# 1. Ir al directorio del proyecto React
cd ./baconfort-react

# 2. Construir la aplicación con Vite
echo "📦 Construyendo la aplicación con npm run build..."
npm run build

# 3. Desplegar a Firebase
echo "🚀 Desplegando a Firebase..."
firebase deploy --only hosting

# 4. Volver al directorio principal para hacer commit
cd ..

# 5. Hacer commit de los cambios
echo "📝 Realizando commit de los cambios en GitHub..."
git add .
git commit -m "Fix: Corregido error de duplicación de función logout en AdminContext-STATEFUL"

# 6. Hacer push a GitHub
echo "🔼 Subiendo cambios a GitHub..."
git push origin main

echo "✅ ¡Proceso completado! La aplicación ha sido desplegada y los cambios han sido guardados en GitHub."
