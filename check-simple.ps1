# Script simplificado para verificar el sistema
Write-Host "======================================" 
Write-Host "BACONFORT - VERIFICACION DEL SISTEMA" 
Write-Host "======================================" 
Write-Host ""

# Verificar Git
Write-Host "Verificando Git..."
try {
    $gitVersion = git --version
    Write-Host "Git encontrado: $gitVersion"
} catch {
    Write-Host "Git no encontrado. Por favor instalalo."
}

# Verificar Node.js
Write-Host "Verificando Node.js..."
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion"
} catch {
    Write-Host "Node.js no encontrado. Por favor instalalo."
}

# Verificar NPM
Write-Host "Verificando NPM..."
try {
    $npmVersion = npm --version
    Write-Host "NPM encontrado: $npmVersion"
} catch {
    Write-Host "NPM no encontrado. Por favor instalalo."
}

# Verificar Firebase CLI
Write-Host "Verificando Firebase CLI..."
try {
    $firebaseVersion = firebase --version
    Write-Host "Firebase CLI encontrado: $firebaseVersion"
} catch {
    Write-Host "Firebase CLI no encontrado. Para instalarlo ejecuta:"
    Write-Host "   npm install -g firebase-tools"
}

# Verificar Railway CLI
Write-Host "Verificando Railway CLI..."
try {
    $railwayVersion = railway
    Write-Host "Railway CLI encontrado: $railwayVersion"
} catch {
    Write-Host "Railway CLI no encontrado. Para instalarlo ejecuta:"
    Write-Host "   npm i -g @railway/cli"
}

Write-Host ""
Write-Host "======================================" 
Write-Host "VERIFICACION COMPLETADA" 
Write-Host "======================================" 
Write-Host ""
Write-Host "Para continuar con el despliegue, utiliza:" 
Write-Host "   .\commit-and-deploy.ps1"
