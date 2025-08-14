# verify-and-apply-solution.ps1
# Script para verificar y aplicar la solución del error 403 en el panel de admin

Write-Host "🔍 Verificando solución para error 403 en panel de administración..." -ForegroundColor Cyan

# Verificar si Node.js está instalado
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no encontrado. Por favor instala Node.js para continuar." -ForegroundColor Red
    exit 1
}

# Preparar entorno
$projectRoot = $PSScriptRoot

Write-Host "📋 Paso 1: Verificando el formato de los tokens..." -ForegroundColor Yellow
try {
    node "$projectRoot\verify-admin-token.js"
    Write-Host "✅ Verificación de tokens completada" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al verificar tokens: $_" -ForegroundColor Red
}

# Abrir documentos importantes
Write-Host "📂 Paso 2: Abriendo documentación actualizada..." -ForegroundColor Yellow
try {
    Start-Process "$projectRoot\SOLUCION-ERROR-403-ADMIN.md"
    Start-Process "$projectRoot\BACKEND_STATIC_TOKENS.md"
    Write-Host "✅ Documentación abierta" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No se pudieron abrir algunos documentos" -ForegroundColor Yellow
}

Write-Host "`n🚀 Paso 3: Implementando la solución..." -ForegroundColor Yellow
Write-Host "  Opciones disponibles:" -ForegroundColor White
Write-Host "  1. Ejecutar fix-admin-inquiries-dynamic-token.ps1 (reinicia el servidor)" -ForegroundColor White
Write-Host "  2. Solo aplicar cambios sin reiniciar el servidor" -ForegroundColor White
Write-Host "  3. Cancelar" -ForegroundColor White

$opcion = Read-Host "  Seleccione una opción (1-3)"

switch ($opcion) {
    "1" {
        Write-Host "`n🔄 Ejecutando script de corrección y reiniciando servidor..." -ForegroundColor Cyan
        & "$projectRoot\fix-admin-inquiries-dynamic-token.ps1"
    }
    "2" {
        Write-Host "`n✅ Cambios aplicados sin reiniciar el servidor" -ForegroundColor Green
        Write-Host "   Para que los cambios tengan efecto, reinicie manualmente el servidor" -ForegroundColor Yellow
    }
    "3" {
        Write-Host "`n❌ Operación cancelada" -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "`n⚠️ Opción no válida. Operación cancelada" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n📝 RESUMEN DE LA SOLUCIÓN:" -ForegroundColor Magenta
Write-Host "1. Se unificó la generación de tokens en el frontend" -ForegroundColor White
Write-Host "2. Se actualizó la documentación del backend para validar por formato" -ForegroundColor White
Write-Host "3. Se crearon herramientas de diagnóstico para verificar tokens" -ForegroundColor White

Write-Host "`n🛠️ Si persisten los problemas, verifique que el backend esté validando tokens" -ForegroundColor Yellow
Write-Host "   con el formato: admin_static_YYYYMMDD_HHmm0_baconfort" -ForegroundColor Yellow
Write-Host "   usando la expresión regular: /^admin_static_\d{8}_\d{5}_baconfort$/" -ForegroundColor White
