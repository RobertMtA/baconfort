# Script para exportar variables de entorno a Railway en PowerShell

# Primero eliminamos las variables que queremos actualizar
railway variables delete EMAIL_USER
railway variables delete EMAIL_APP_PASSWORD
railway variables delete ADMIN_EMAIL
railway variables delete EMAIL_FROM

# Ahora agregamos las variables con los valores correctos
railway variables set EMAIL_USER=baconfort.centro@gmail.com
railway variables set EMAIL_APP_PASSWORD="ttcp snhq vhde dhmt"
railway variables set ADMIN_EMAIL=baconfort.centro@gmail.com
railway variables set EMAIL_FROM="Baconfort <baconfort.centro@gmail.com>"
