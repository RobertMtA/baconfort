import { useRef, useEffect } from 'react';

/**
 * Componente de debug para contar renderizados
 * Solo se muestra en modo desarrollo
 */
export const RenderCounter = ({ componentName }) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  renderCount.current += 1;
  const currentTime = Date.now();
  const timeSinceLastRender = currentTime - lastRenderTime.current;
  lastRenderTime.current = currentTime;

  useEffect(() => {
    if (renderCount.current > 10) {
      console.warn(`⚠️ RENDER WARNING: ${componentName} ha renderizado ${renderCount.current} veces`);
    }
    
    if (timeSinceLastRender < 100) {
      console.warn(`⚠️ PERFORMANCE WARNING: ${componentName} renderizado muy rápido (${timeSinceLastRender}ms desde último render)`);
    }
  });

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: renderCount.current > 10 ? 'red' : 'green',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      {componentName}: {renderCount.current} renders
      {timeSinceLastRender < 100 && (
        <div>⚠️ Fast render: {timeSinceLastRender}ms</div>
      )}
    </div>
  );
};

export default RenderCounter;
