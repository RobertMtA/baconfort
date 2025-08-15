# Pasos para configurar dominio personalizado en Firebase

## 1. Acceder a Firebase Console
- Ve a https://console.firebase.google.com
- Selecciona tu proyecto "confort-ba"
- Ve a "Hosting" en el menú lateral

## 2. Agregar Dominio Personalizado
```bash
# En Firebase Console:
1. Click en "Add custom domain"
2. Ingresa: baconfort.com
3. Firebase te dará registros DNS para configurar
4. Copia los registros TXT para verificación
```

## 3. Comandos Firebase CLI (opcional)
```bash
# Conectar dominio via CLI
firebase hosting:customDomain:create baconfort.com --project confort-ba

# Ver status
firebase hosting:customDomain:list --project confort-ba
```

## 4. SSL Automático
Firebase automáticamente provee certificado SSL para dominios personalizados.
