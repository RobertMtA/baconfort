#!/bin/bash
# deploy-update.sh - Script para actualizar el despliegue del backend en Railway

echo "Iniciando actualización de despliegue en Railway..."
echo "Fecha: $(date)"

# Verificar si estamos en Railway
if [ -n "$RAILWAY_STATIC_URL" ]; then
    echo "Detectado entorno Railway"
    RAILWAY_ENV=true
else
    echo "Ejecutando en entorno local"
    RAILWAY_ENV=false
fi

# Verificar si hay cambios en el repositorio (solo si no estamos en Railway)
if [ "$RAILWAY_ENV" = false ]; then
    echo "Verificando cambios en el repositorio Git..."
    git fetch
    
    UPSTREAM=${1:-'@{u}'}
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse "$UPSTREAM")
    
    if [ $LOCAL = $REMOTE ]; then
        echo "Repositorio local está actualizado, no hay cambios para aplicar"
    else
        echo "Hay cambios disponibles, actualizando repositorio local..."
        git pull
    fi
fi

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ] || [ "$1" = "--force-install" ]; then
    echo "Instalando dependencias..."
    npm install
else
    echo "Omitiendo instalación de dependencias (ya existen)"
fi

# Realizar tareas de mantenimiento
echo "Limpiando archivos temporales..."
rm -rf ./tmp/*
echo "Verificando conexión a la base de datos..."
node -e "
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/baconfort';

mongoose.connect(uri)
  .then(() => {
    console.log('Conexión a MongoDB establecida correctamente');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err);
    process.exit(1);
  });
"

# Reiniciar servicio (solo si no estamos en Railway)
if [ "$RAILWAY_ENV" = false ]; then
    echo "Reiniciando servicio..."
    if command -v pm2 &> /dev/null; then
        pm2 restart server.js
    else
        echo "PM2 no encontrado, reinicio manual requerido"
    fi
fi

echo "Actualización de despliegue completada"
echo "Fecha de finalización: $(date)"
exit 0
