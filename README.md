# Baconfort Sistema de Gestión

Sistema de gestión para propiedades de alquiler turístico con sistema de reservas.

## Configuraciones Importantes

### Sistema de Pagos

El sistema está configurado para aceptar **solo pagos en efectivo** para las reservas.

Características:
- Toda reserva se configura automáticamente para pago en efectivo.
- Los administradores pueden registrar pagos en efectivo recibidos mediante el panel de administración.
- El frontend muestra información clara sobre el método de pago en efectivo para los usuarios.

### API para Registrar Pagos en Efectivo

Para registrar un pago en efectivo (solo disponible para administradores):

```
PUT /api/reservations/admin/:id/register-cash-payment
```

Parámetros del cuerpo:
- `amount`: Monto recibido en efectivo
- `notes`: Notas opcionales sobre el pago

### Estructura del Sistema

El sistema está compuesto por:

1. **Frontend React**: Panel de administración y sitio web para usuarios
2. **Backend Node.js/Express**: API REST para la gestión de datos
3. **Base de Datos MongoDB**: Almacenamiento de datos

## Instalación y Configuración

### Requisitos
- Node.js (v14+)
- MongoDB
- Firebase (configuración opcional)

### Instalación

1. Clonar el repositorio
2. Instalar dependencias en el backend:
   ```
   cd baconfort-backend
   npm install
   ```
3. Instalar dependencias en el frontend:
   ```
   cd baconfort-react
   npm install
   ```

### Iniciar los servidores

Utilice los scripts de inicio proporcionados:

- Windows: `INICIAR-TODO.bat`
- Linux/Mac: `iniciar-todo.sh`

## Información Adicional

Para más información sobre el sistema, consulte:

- `DEPLOY_GUIDE.md` para guía de despliegue
- `CHANGELOG.md` para historial de cambios
