#!/bin/bash
# Script para probar el bloqueo/desbloqueo de propiedades

# Verificar argumentos
if [ $# -lt 1 ]; then
    echo "Uso: $0 <propertyId> [block|unblock|toggle]"
    echo "Ejemplo: $0 moldes-1680 block"
    exit 1
fi

PROPERTY_ID=$1
ACTION=${2:-toggle}  # Si no se especifica, usar 'toggle'

echo "🔍 Probando propiedad $PROPERTY_ID"

# Cambiar al directorio del backend
cd "$(dirname "$0")/baconfort-backend"

# Ejecutar el script de bloqueo/desbloqueo
echo "🔒 Ejecutando toggle-property-block.js..."
node toggle-property-block.js $PROPERTY_ID $ACTION

# Mensaje informativo
case $ACTION in
    block)
        echo "🚫 La propiedad $PROPERTY_ID ahora está bloqueada"
        ;;
    unblock)
        echo "✅ La propiedad $PROPERTY_ID ahora está desbloqueada"
        ;;
    toggle)
        echo "🔄 El estado de bloqueo de la propiedad $PROPERTY_ID ha sido invertido"
        ;;
esac

echo "📱 Ahora puedes verificar en el frontend si los cambios se aplican correctamente"
