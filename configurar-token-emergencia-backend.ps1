# Configurar token de emergencia en el backend
$ErrorActionPreference = "Stop"

Write-Host "🔧 Configurando token de emergencia en el backend..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor Cyan

# Encontrar la carpeta del backend
Write-Host "🔍 Buscando carpetas potenciales del backend..." -ForegroundColor Yellow
$potentialFolders = Get-ChildItem -Path $PSScriptRoot -Directory | Where-Object { 
    $_.Name -like "*api*" -or $_.Name -like "*express*" -or $_.Name -like "*backend*" -or $_.Name -like "*server*"
}

$backendPath = $null

if ($potentialFolders.Count -eq 0) {
    Write-Host "⚠️ No se encontraron carpetas potenciales del backend." -ForegroundColor Yellow
    Write-Host "Intente ejecutar manualmente este script desde la carpeta que contiene el backend." -ForegroundColor Yellow
} else {
    Write-Host "Seleccione la carpeta del backend:" -ForegroundColor White
    for ($i=0; $i -lt $potentialFolders.Count; $i++) {
        Write-Host "[$i] $($potentialFolders[$i].Name)" -ForegroundColor White
    }
    
    $selection = Read-Host "Ingrese el número de la carpeta (o 'S' para omitir)"
    
    if ($selection -ne "S" -and $selection -ne "s") {
        try {
            $backendPath = $potentialFolders[[int]$selection].FullName
            Write-Host "✅ Carpeta del backend seleccionada: $backendPath" -ForegroundColor Green
        } catch {
            Write-Host "❌ Selección no válida." -ForegroundColor Red
        }
    }
}

if ($backendPath) {
    # Buscar archivos de autenticación
    Write-Host "🔍 Buscando archivos de autenticación..." -ForegroundColor Yellow
    $authFiles = Get-ChildItem -Path $backendPath -Recurse -Include "*auth*.js", "*middleware*.js", "*token*.js" 
    
    if ($authFiles.Count -eq 0) {
        Write-Host "❌ No se encontraron archivos de autenticación." -ForegroundColor Red
    } else {
        Write-Host "Encontrados $($authFiles.Count) archivos potenciales:" -ForegroundColor White
        foreach ($file in $authFiles) {
            Write-Host "- $($file.FullName)" -ForegroundColor White
            
            # Buscar contenido relevante
            $content = Get-Content $file.FullName -Raw
            
            # Verificar si el archivo contiene código relacionado con tokens
            if ($content -match "token|auth|verify|jwt") {
                Write-Host "  ✅ Este archivo parece contener código de autenticación" -ForegroundColor Green
                
                # Verificar si ya contiene el token de emergencia
                if ($content -match "ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS") {
                    Write-Host "  ✅ Ya contiene el token de emergencia" -ForegroundColor Green
                } else {
                    # Hacer copia de seguridad
                    Copy-Item -Path $file.FullName -Destination "$($file.FullName).bak" -Force
                    Write-Host "  📝 Creada copia de seguridad: $($file.FullName).bak" -ForegroundColor Yellow
                    
                    try {
                        # Modificar el archivo para agregar el token de emergencia
                        $newContent = $content
                        
                        # Buscar un punto adecuado para insertar el código
                        if ($content -match "verifyToken|authenticate|authorization|Bearer") {
                            # Identificar el patrón para agregar el código de bypass
                            $bypassCode = @"
            
  // Token de emergencia para bypass de autenticación
  if (req.query.bypass === 'true' && req.query.emergency === 'true') {
    if (token === 'ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS') {
      console.log('⚠️ Usando token de emergencia para bypass de autenticación');
      req.user = { role: 'admin', bypassEmergency: true };
      return next();
    }
  }

"@
                            
                            # Intentar insertar después de la verificación del token
                            if ($content -match "const token = authHeader\.split\(' '\)\[1\];") {
                                $newContent = $content -replace "const token = authHeader\.split\(' '\)\[1\];", "const token = authHeader.split(' ')[1];$bypassCode"
                            }
                            # Si no funciona, intentar otro patrón
                            elseif ($content -match "return res\.status\(401\)") {
                                $newContent = $content -replace "(return res\.status\(401\)[^;]+;)", "$bypassCode`$1"
                            }
                            
                            if ($newContent -ne $content) {
                                Set-Content -Path $file.FullName -Value $newContent
                                Write-Host "  ✅ Agregado código de bypass de autenticación" -ForegroundColor Green
                            } else {
                                Write-Host "  ⚠️ No se pudo modificar automáticamente. Revise el archivo manualmente." -ForegroundColor Yellow
                            }
                        }
                    } catch {
                        Write-Host "  ❌ Error al modificar el archivo: $_" -ForegroundColor Red
                    }
                }
            }
        }
    }
} else {
    Write-Host "ℹ️ Operación omitida." -ForegroundColor Blue
}

Write-Host ""
Write-Host "📋 Pasos siguientes:" -ForegroundColor Cyan
Write-Host "1. Si no se encontró o modificó el backend, deberá modificar manualmente los archivos de autenticación" -ForegroundColor White
Write-Host "2. Reinicie el servidor backend para aplicar los cambios" -ForegroundColor White
Write-Host "3. Pruebe la autenticación con las modificaciones realizadas" -ForegroundColor White
