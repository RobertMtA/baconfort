#!/bin/bash

echo "======================================"
echo "🚀 BACONFORT - VERIFICACIÓN DEL SISTEMA"
echo "======================================"
echo ""

# Verificar Git
echo "Verificando Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "✅ Git encontrado: $GIT_VERSION"
else
    echo "❌ Git no encontrado. Por favor instálalo."
fi

# Verificar Node.js
echo "Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js encontrado: $NODE_VERSION"
    
    # Verificar versión mínima
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | tr -d 'v')
    if [ "$NODE_MAJOR" -lt "16" ]; then
        echo "⚠️ Se recomienda Node.js 16 o superior (tienes versión $NODE_VERSION)"
    fi
else
    echo "❌ Node.js no encontrado. Por favor instálalo."
fi

# Verificar NPM
echo "Verificando NPM..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ NPM encontrado: $NPM_VERSION"
else
    echo "❌ NPM no encontrado. Por favor instálalo."
fi

# Verificar Firebase CLI
echo "Verificando Firebase CLI..."
if command -v firebase &> /dev/null; then
    FIREBASE_VERSION=$(firebase --version)
    echo "✅ Firebase CLI encontrado: $FIREBASE_VERSION"
else
    echo "❌ Firebase CLI no encontrado. Para instalarlo ejecuta:"
    echo "   npm install -g firebase-tools"
    echo "   Después inicia sesión con: firebase login"
fi

# Verificar Railway CLI
echo "Verificando Railway CLI..."
if command -v railway &> /dev/null; then
    RAILWAY_VERSION=$(railway version)
    echo "✅ Railway CLI encontrado: $RAILWAY_VERSION"
else
    echo "❌ Railway CLI no encontrado. Para instalarlo ejecuta:"
    echo "   npm i -g @railway/cli"
    echo "   Después inicia sesión con: railway login"
fi

# Verificar dependencias del proyecto
echo ""
echo "Verificando dependencias del proyecto..."

# Frontend
if [ -f "baconfort-react/package.json" ]; then
    echo "✅ Package.json del frontend encontrado"
    if [ -d "baconfort-react/node_modules" ]; then
        echo "✅ node_modules del frontend instalado"
    else
        echo "❌ node_modules del frontend NO encontrado"
        echo "   Para instalar las dependencias ejecuta:"
        echo "   cd baconfort-react && npm install"
    fi
else
    echo "❌ No se encuentra package.json del frontend"
fi

# Backend
if [ -f "baconfort-backend/package.json" ]; then
    echo "✅ Package.json del backend encontrado"
    if [ -d "baconfort-backend/node_modules" ]; then
        echo "✅ node_modules del backend instalado"
    else
        echo "❌ node_modules del backend NO encontrado"
        echo "   Para instalar las dependencias ejecuta:"
        echo "   cd baconfort-backend && npm install"
    fi
else
    echo "❌ No se encuentra package.json del backend"
fi

# Verificar archivos de configuración importantes
echo ""
echo "Verificando archivos de configuración importantes..."

# Firebase
if [ -f "firebase.json" ]; then
    echo "✅ Archivo firebase.json encontrado"
else
    echo "❌ No se encuentra firebase.json"
    echo "   Ejecuta 'firebase init' para inicializar Firebase Hosting"
fi

# Variables de entorno para Railway
if [ -f "baconfort-backend/railway.json" ]; then
    echo "✅ Archivo railway.json encontrado"
else
    echo "❌ No se encuentra railway.json"
    echo "   Ejecuta 'railway init' en la carpeta baconfort-backend"
fi

echo ""
echo "======================================"
echo "✅ VERIFICACIÓN COMPLETADA"
echo "======================================"
echo ""
echo "Para continuar con el despliegue, utiliza:"
echo "   ./commit-and-deploy.sh"
