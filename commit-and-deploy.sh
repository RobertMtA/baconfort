#!/bin/bash
# Script para realizar commit y despliegue a Firebase y Railway

echo "====================================="
echo "🚀 BACONFORT - COMMIT Y DESPLIEGUE"
echo "====================================="
echo ""

# Ejecutar primero el script de configuración
echo "📝 Ejecutando script de configuración..."
bash ./deploy.sh

# Verificar que la compilación fue exitosa
DIST_FOLDER="./baconfort-react/dist"
if [ ! -d "$DIST_FOLDER" ]; then
    echo "❌ La compilación falló. No se encuentra la carpeta dist."
    exit 1
fi

echo "✅ Compilación exitosa"

# Preparar el commit
echo ""
echo "🔧 Preparando commit..."
COMMIT_MESSAGE="Configuración para Firebase y Railway - $(date '+%Y-%m-%d %H:%M')"

# Verificar si git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git no encontrado. Por favor instala Git para continuar."
    exit 1
else
    GIT_VERSION=$(git --version)
    echo "✓ Git detectado: $GIT_VERSION"
fi

# Verificar si estamos en un repositorio git
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo "⚠️ No estás dentro de un repositorio Git. Inicializando..."
    git init
    echo "✅ Repositorio Git inicializado"
fi

# Realizar commit
echo "📦 Agregando archivos al commit..."
git add .

echo "✍️ Realizando commit: '$COMMIT_MESSAGE'"
git commit -m "$COMMIT_MESSAGE"

# Verificar si hay un remote configurado
REMOTES=$(git remote)
if [ -n "$REMOTES" ]; then
    BRANCH=$(git branch --show-current)
    
    echo "🔄 Subiendo cambios al repositorio remoto (rama: $BRANCH)..."
    git push origin $BRANCH
    
    echo "✅ Cambios subidos correctamente"
else
    echo "⚠️ No hay repositorio remoto configurado. Solo se ha realizado el commit local."
    echo "   Para configurar un repositorio remoto, ejecuta:"
    echo "   git remote add origin URL_DE_TU_REPOSITORIO"
    echo "   git push -u origin main"
fi

# Desplegar a Firebase
echo ""
echo "🔥 ¿Deseas desplegar a Firebase ahora? (S/N)"
read DEPLOY_FIREBASE
if [ "$DEPLOY_FIREBASE" = "S" ] || [ "$DEPLOY_FIREBASE" = "s" ]; then
    echo "🔥 Desplegando a Firebase..."
    firebase deploy
    
    echo "✅ Despliegue a Firebase completado"
    
    # Obtener URL de Firebase
    echo "📋 Verifica la URL de tu aplicación en Firebase Hosting:"
    echo "   https://console.firebase.google.com/project/_/hosting/sites"
else
    echo "⏭️ Despliegue a Firebase omitido"
    echo "   Para desplegar más tarde, ejecuta:"
    echo "   firebase deploy"
fi

# Desplegar a Railway
echo ""
echo "🚂 ¿Deseas desplegar el backend a Railway ahora? (S/N)"
read DEPLOY_RAILWAY
if [ "$DEPLOY_RAILWAY" = "S" ] || [ "$DEPLOY_RAILWAY" = "s" ]; then
    # Verificar si railway CLI está instalado
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI no encontrado. Instalalo con:"
        echo "   npm i -g @railway/cli"
        echo "   Luego inicia sesión con: railway login"
    else
        RAILWAY_VERSION=$(railway --version)
        echo "✓ Railway CLI detectado: $RAILWAY_VERSION"
        
        echo "🚂 Desplegando backend a Railway..."
        cd baconfort-backend || exit
        railway up
        cd ..
        
        echo "✅ Despliegue a Railway completado"
    fi
else
    echo "⏭️ Despliegue a Railway omitido"
    echo "   Para desplegar más tarde, ejecuta:"
    echo "   cd baconfort-backend && railway up"
fi

echo ""
echo "====================================="
echo "✅ PROCESO COMPLETADO"
echo "====================================="
