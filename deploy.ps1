# Despliegue en PowerShell para Windows

# Salir si hay errores
$ErrorActionPreference = "Stop"

# Construir la aplicación de producción
Write-Host "🏗️ Construyendo la aplicación para GitHub Pages..." -ForegroundColor Green
cd baconfort-react
npm run build

# Navegar al directorio de construcción
cd dist

# Crear archivo .nojekyll para evitar procesamiento Jekyll
Write-Host "📝 Creando archivo .nojekyll..." -ForegroundColor Green
New-Item -Path ".nojekyll" -ItemType "file" -Force | Out-Null

# Volver a la raíz
cd ..
cd ..

# Verificar si existe el directorio .git
if (-not (Test-Path ".git")) {
    Write-Host "🔄 Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Inicializar repositorio"
}

# Verificar si existe la rama gh-pages
$ghPagesExists = git branch -a | Select-String "gh-pages"
if ($ghPagesExists) {
    Write-Host "✅ Rama gh-pages ya existe" -ForegroundColor Green
} else {
    Write-Host "🔄 Creando rama gh-pages..." -ForegroundColor Yellow
    git checkout -b gh-pages
    git checkout -
}

# Añadir los archivos compilados
Write-Host "🚀 Desplegando a GitHub Pages..." -ForegroundColor Cyan
git add -f baconfort-react/dist
$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Despliegue a GitHub Pages: $date"

# Mover contenido a la rama gh-pages
git subtree push --prefix baconfort-react/dist origin gh-pages

Write-Host "✅ ¡Despliegue completado!" -ForegroundColor Green
Write-Host "🌐 Tu sitio estará disponible en: https://TU_USUARIO.github.io/baconfort/" -ForegroundColor Cyan
