# Guía de Responsividad para BAconfort

## Introducción

Este documento describe las mejoras de responsividad implementadas en el proyecto BAconfort para asegurar que la aplicación se visualice correctamente en todo tipo de dispositivos: móviles, tablets y escritorios.

## Mejoras Implementadas

### 1. Sistema Base Responsive

- **Variables CSS Responsive**: Se han añadido variables CSS para breakpoints, tamaños de contenedores y espaciados, facilitando la consistencia en todo el proyecto.
- **Media Queries Base**: Se han establecido media queries base para los diferentes tamaños de pantalla (xs, sm, md, lg, xl).
- **Sistema de Grid Responsive**: Se ha implementado un sistema de columnas flexible que se adapta a diferentes tamaños de pantalla.

### 2. Componentes Responsive

- **ResponsiveImage**: Componente para manejo de imágenes que adapta su tamaño según el dispositivo y proporciona soporte para diferentes ratios y formatos.
- **ResponsiveCard**: Componente para tarjetas que se adapta a diferentes tamaños de pantalla, con opciones para layout horizontal en pantallas grandes y vertical en pantallas pequeñas.
- **Header Mejorado**: Navegación mejorada que se transforma en menú hamburguesa en dispositivos móviles.

### 3. Estilos Responsive para Departamentos

- Las tarjetas de departamentos ahora son completamente responsivas, ajustando su tamaño, fuentes e imágenes según el dispositivo.
- Se mantiene la proporción de las imágenes independientemente del tamaño de pantalla.

### 4. Utilidades Responsive

- **Clases de Utilidad**: Se han agregado clases para controlar la visibilidad de elementos según el tamaño de pantalla (d-none, d-sm-block, etc.).
- **Alineación de Texto Responsive**: Clases para cambiar la alineación del texto según el dispositivo (text-center, text-md-left, etc.).
- **Espaciado Responsive**: Márgenes y paddings que se ajustan automáticamente según el tamaño del dispositivo.

## Cómo Usar los Componentes Responsive

### ResponsiveImage

```jsx
import ResponsiveImage from '../components/ResponsiveImage/ResponsiveImage';

// Uso básico
<ResponsiveImage 
  src="/img/departamento-lg.jpg" 
  alt="Departamento" 
/>

// Uso avanzado con diferentes imágenes para cada dispositivo
<ResponsiveImage 
  src="/img/departamento-lg.jpg" 
  smallSrc="/img/departamento-sm.jpg"
  mediumSrc="/img/departamento-md.jpg"
  alt="Departamento" 
  className="ratio-16-9"
/>
```

### ResponsiveCard

```jsx
import ResponsiveCard, { CardHeader, CardBody, CardFooter, CardImage } from '../components/ResponsiveCard/ResponsiveCard';

// Uso básico
<ResponsiveCard>
  <CardBody>
    Contenido de la tarjeta
  </CardBody>
</ResponsiveCard>

// Uso completo
<ResponsiveCard variant="primary" elevated={true} className="horizontal">
  <CardImage src="/img/departamento.jpg" alt="Departamento" position="top" />
  <div className="card-content">
    <CardHeader>Título de la Tarjeta</CardHeader>
    <CardBody>
      Contenido de la tarjeta
    </CardBody>
    <CardFooter>
      <button className="btn-primary">Ver más</button>
    </CardFooter>
  </div>
</ResponsiveCard>
```

## Breakpoints

Los breakpoints definidos para el proyecto son:

- **Extra pequeño (xs)**: < 576px (Móviles)
- **Pequeño (sm)**: ≥ 576px (Tablets pequeñas)
- **Medio (md)**: ≥ 768px (Tablets)
- **Grande (lg)**: ≥ 992px (Escritorios pequeños)
- **Extra grande (xl)**: ≥ 1200px (Escritorios grandes)

## Consideraciones para Desarrollo

1. **Mobile First**: Siempre desarrollar primero para móviles y luego añadir media queries para pantallas más grandes.
2. **Pruebas**: Probar en múltiples dispositivos y utilizar las herramientas de desarrollo del navegador para simular diferentes tamaños de pantalla.
3. **Imágenes Optimizadas**: Utilizar el componente `ResponsiveImage` para servir imágenes apropiadas según el dispositivo.
4. **Rendimiento**: Minimizar el uso de JavaScript pesado en dispositivos móviles.

## Tips para Debugging Responsive

1. Usar las herramientas de desarrollo del navegador (F12) y activar la vista de dispositivo.
2. Verificar los breakpoints usando las clases de utilidad como `d-none d-md-block`.
3. Utilizar `console.log(window.innerWidth)` para debug en JavaScript.

---

Con estas mejoras, BAconfort ahora ofrece una experiencia de usuario óptima en todo tipo de dispositivos, desde smartphones hasta pantallas de escritorio grandes.
