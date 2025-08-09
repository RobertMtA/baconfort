#!/bin/sh
# Script para desplegar la aplicación con cambios de emergencia

echo "🛠️ Construyendo la aplicación con los cambios de emergencia..."
cd baconfort-react

# Construir la aplicación con Vite
npm run build

# Desplegar la aplicación a Firebase
echo "🚀 Desplegando a Firebase..."
firebase deploy --only hosting

echo "✅ Despliegue completado!"
