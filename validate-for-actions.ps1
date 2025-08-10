# Script de validación para GitHub Actions
# Este script comprueba que todos los archivos necesarios estén presentes
# y crea la estructura de directorios adecuada si falta

$ErrorActionPreference = "Stop"

Write-Host "📋 Iniciando validación de estructura para GitHub Actions..." -ForegroundColor Cyan

# Definir directorios y archivos importantes
$reactDir = Join-Path $PSScriptRoot "baconfort-react"
$packageJson = Join-Path $reactDir "package.json"
$packageLockJson = Join-Path $reactDir "package-lock.json"
$nodeModulesDir = Join-Path $reactDir "node_modules"
$distDir = Join-Path $reactDir "dist"
$githubDir = Join-Path $PSScriptRoot ".github"
$workflowsDir = Join-Path $githubDir "workflows"
$deployYml = Join-Path $workflowsDir "deploy.yml"

# Verificar y crear estructura básica si es necesario
if (-not (Test-Path $reactDir)) {
    Write-Host "❌ No se encuentra el directorio baconfort-react. Esto es crítico y no puede ser corregido automáticamente." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $packageJson)) {
    Write-Host "❌ No se encuentra package.json. Esto es crítico y no puede ser corregido automáticamente." -ForegroundColor Red
    exit 1
}

# Crear directorios de GitHub Actions si no existen
if (-not (Test-Path $githubDir)) {
    Write-Host "🔨 Creando directorio .github..." -ForegroundColor Yellow
    New-Item -Path $githubDir -ItemType Directory | Out-Null
}

if (-not (Test-Path $workflowsDir)) {
    Write-Host "🔨 Creando directorio .github/workflows..." -ForegroundColor Yellow
    New-Item -Path $workflowsDir -ItemType Directory | Out-Null
}

# Validar el archivo de flujo de trabajo
if (-not (Test-Path $deployYml)) {
    Write-Host "🔨 Creando archivo de flujo de trabajo deploy.yml..." -ForegroundColor Yellow
    
    $deployContent = @"
# Workflow para desplegar automáticamente a GitHub Pages

name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - master

# Permisos necesarios para el despliegue
permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3

      - name: Configurar Node.js 📦
        uses: actions/setup-node@v3
        with:
          node-version: 18
          # Sin caché para evitar problemas

      - name: Verificar estructura de directorios 📂
        run: |
          ls -la
          ls -la baconfort-react || true

      - name: Instalar dependencias 🔧
        run: |
          cd baconfort-react
          npm ci

      - name: Construir el proyecto 🏗️
        run: |
          cd baconfort-react
          npm run build
        env:
          NODE_ENV: production

      - name: Desplegar a GitHub Pages 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: baconfort-react/dist
          branch: gh-pages
          clean: true
"@
    
    Set-Content -Path $deployYml -Value $deployContent
}
else {
    Write-Host "✅ El archivo deploy.yml existe." -ForegroundColor Green
}

# Verificar archivos críticos
if (-not (Test-Path $packageLockJson)) {
    Write-Host "⚠️ No se encuentra package-lock.json. Se creará al instalar las dependencias." -ForegroundColor Yellow
}

if (-not (Test-Path $nodeModulesDir)) {
    Write-Host "⚠️ No se encuentra node_modules. Se creará al instalar las dependencias." -ForegroundColor Yellow
}

if (-not (Test-Path $distDir)) {
    Write-Host "⚠️ No se encuentra directorio dist. Se creará durante el build." -ForegroundColor Yellow
}

Write-Host "✅ Validación completada. La estructura está lista para GitHub Actions." -ForegroundColor Green

# Verificar las dependencias en package.json
try {
    $packageJsonContent = Get-Content -Path $packageJson -Raw | ConvertFrom-Json
    
    # Verificar si las dependencias necesarias están presentes
    $dependencies = $packageJsonContent.dependencies
    $devDependencies = $packageJsonContent.devDependencies
    
    $criticalDeps = @("react", "react-dom", "vite")
    foreach ($dep in $criticalDeps) {
        if (-not $dependencies.$dep -and -not $devDependencies.$dep) {
            Write-Host "⚠️ Advertencia: No se encontró la dependencia '$dep' en package.json" -ForegroundColor Yellow
        }
    }
} 
catch {
    Write-Host "⚠️ Error al analizar package.json: $_" -ForegroundColor Yellow
}

# Resumen final
Write-Host @"

📋 Resumen:
- Directorio baconfort-react: $([bool](Test-Path $reactDir) ? "✅ Existe" : "❌ Falta")
- package.json: $([bool](Test-Path $packageJson) ? "✅ Existe" : "❌ Falta")
- .github/workflows/deploy.yml: $([bool](Test-Path $deployYml) ? "✅ Existe" : "❌ Falta")
- node_modules: $([bool](Test-Path $nodeModulesDir) ? "✅ Existe" : "⚠️ Falta (se instalará)")
- dist: $([bool](Test-Path $distDir) ? "✅ Existe" : "⚠️ Falta (se creará)")

"@ -ForegroundColor Cyan
