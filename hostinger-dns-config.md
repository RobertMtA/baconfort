# Configuración DNS para baconfort.com en Hostinger

## Registros DNS a configurar:

### Dominio Principal (Frontend)
```
Tipo: CNAME
Nombre: www
Destino: confort-ba.web.app
TTL: 14400
```

```
Tipo: A
Nombre: @
IP: 151.101.1.195 (IP de Firebase Hosting)
TTL: 14400
```

### Subdominio API (Backend)
```
Tipo: CNAME  
Nombre: api
Destino: baconfort-production-084d.up.railway.app
TTL: 14400
```

### Opcional: Subdominio Admin
```
Tipo: CNAME
Nombre: admin  
Destino: confort-ba.web.app
TTL: 14400
```

## Resultado:
- baconfort.com → Frontend Firebase
- www.baconfort.com → Frontend Firebase  
- api.baconfort.com → Backend Railway
- admin.baconfort.com → Panel Admin Firebase
