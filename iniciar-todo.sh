# 🚀 BACONFORT - Iniciar Sistema Completo

echo "============================================"
echo "🚀 BACONFORT - Iniciando Sistema Completo"
echo "============================================"
echo ""

echo "🔄 Paso 1: Limpiando procesos existentes..."
pkill -f "node.*server" 2>/dev/null || echo "ℹ️  No hay procesos Node.js ejecutándose"

echo ""
echo "🔄 Paso 2: Iniciando Backend..."
cd "$(dirname "$0")/baconfort-backend"
echo "📂 Directorio actual: $(pwd)"

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    npm install
fi

echo "🚀 Iniciando servidor backend en puerto 5001..."
echo "⏳ Espera unos segundos para que inicie completamente..."
echo ""
echo "🌐 Backend estará disponible en: http://localhost:5001"
echo "📊 Frontend debería estar en: http://localhost:3000"
echo ""
echo "⚡ Para detener el servidor: Ctrl+C"
echo "============================================"
echo ""

# Iniciar backend en segundo plano
npm start &
BACKEND_PID=$!

echo ""
echo "🔄 Paso 3: Esperando que el backend inicie..."
sleep 5

echo ""
echo "🔄 Paso 4: Iniciando Frontend..."
cd "../baconfort-react"
echo "📂 Directorio frontend: $(pwd)"

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    npm install
fi

echo "🚀 Iniciando frontend en modo desarrollo..."
echo "🌐 Frontend estará disponible en: http://localhost:3000"
echo ""

# Iniciar frontend en segundo plano
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "✅ SISTEMA INICIADO COMPLETAMENTE"
echo "============================================"
echo ""
echo "🎯 URLs para probar:"
echo "   Backend:  http://localhost:5001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "🔧 Para probar las mejoras:"
echo "   1. Ve a: http://localhost:3000/my-reservations"
echo "   2. Ve a: http://localhost:3000/admin (PropertyEditor)"
echo "   3. Haz una reserva completa con pago"
echo ""
echo "📋 Archivos de ayuda:"
echo "   - GUIA-INICIO-RAPIDO.md"
echo "   - SOLUCION-TOKEN-RESERVAS.md"
echo "   - MEJORAS-PROPERTY-EDITOR-Y-PAGOS.md"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Para detener todo: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Esperar a que el usuario presione una tecla
read -p "Presiona Enter para continuar o Ctrl+C para detener..."
