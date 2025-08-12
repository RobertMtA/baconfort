# Configuración de Pagos en Efectivo

## Descripción del Sistema

El sistema de gestión de Baconfort ha sido configurado para trabajar **exclusivamente con pagos en efectivo** para todas las reservas. Este documento explica las características principales de esta configuración.

## Características Implementadas

### 1. Backend (API)

- Se ha configurado el sistema para que todas las nuevas reservas utilicen automáticamente el método de pago "efectivo".
- Se ha creado una utilidad `paymentDefaults.js` que centraliza la configuración de pagos en efectivo.
- Se ha implementado un endpoint específico para que los administradores registren pagos en efectivo:
  ```
  PUT /api/reservations/admin/:id/register-cash-payment
  ```
- Se han deshabilitado otros métodos de pago como MercadoPago.

### 2. Frontend (React)

- Se ha actualizado el formulario de reserva para mostrar información clara sobre el pago en efectivo.
- Se ha creado una interfaz de administración para gestionar reservas y registrar pagos en efectivo.
- Se ha implementado una vista detallada de reservas donde los administradores pueden ver y actualizar el estado de pago.

## Flujo de Trabajo

1. **Usuario Final**:
   - Completa el formulario de reserva
   - Recibe instrucciones claras sobre el pago en efectivo
   - Recibe confirmación de la reserva pendiente

2. **Administrador**:
   - Accede al panel de gestión de reservas
   - Ve todas las reservas pendientes
   - Registra los pagos en efectivo recibidos
   - Actualiza el estado de las reservas

## Consideraciones Técnicas

- El campo `paymentInfo.provider` siempre se establece como "efectivo"
- El estado de pago `paymentStatus` puede ser "pending" o "approved"
- El estado de la reserva se actualiza a "confirmed" cuando se registra el pago en efectivo

## Mantenimiento Futuro

Si se requiere añadir nuevos métodos de pago en el futuro, será necesario:

1. Actualizar el modelo `Reservation` para incluir el nuevo método
2. Modificar la utilidad `paymentDefaults.js`
3. Crear los endpoints necesarios en la API
4. Actualizar la interfaz de usuario para mostrar las opciones de pago

## Notas Adicionales

Esta configuración de "solo efectivo" ha sido implementada siguiendo los requerimientos específicos del negocio para simplificar el proceso de pago y gestión financiera.
