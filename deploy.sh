#!/bin/bash

# Script de despliegue para GitHub Pages

# Salir si hay errores
set -e

# Construir la aplicación de producción
echo "🏗️ Construyendo la aplicación para GitHub Pages..."
npm run build

# Navegar al directorio de construcción
cd dist

# Crear archivo .nojekyll para evitar procesamiento Jekyll
echo "📝 Creando archivo .nojekyll..."
touch .nojekyll

# Si ya tenemos una rama gh-pages, asegurarnos de que estamos en la rama principal
echo "🔄 Preparando el repositorio Git..."
cd ..

# Inicializar Git si no existe
if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "Inicializar repositorio"
fi

# Verificar si existe la rama gh-pages
if git branch -a | grep -q "gh-pages"; then
  echo "✅ Rama gh-pages ya existe"
else
  echo "🔄 Creando rama gh-pages..."
  git checkout -b gh-pages
  git checkout -
fi

# Añadir los archivos compilados a la rama gh-pages
echo "🚀 Desplegando a GitHub Pages..."
git add dist -f
git commit -m "Despliegue a GitHub Pages: $(date)"

# Mover contenido a la rama gh-pages
git subtree push --prefix dist origin gh-pages

echo "✅ ¡Despliegue completado!"
echo "🌐 Tu sitio estará disponible en: https://{TU_USUARIO}.github.io/baconfort/"
