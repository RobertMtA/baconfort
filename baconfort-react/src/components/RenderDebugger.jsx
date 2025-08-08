import React, { useEffect, useRef } from 'react';

/**
 * Componente de debugging para detectar re-renders excesivos
 * Agregar a cualquier página donde sospeches bucles infinitos
 */
export const RenderDebugger = ({ name = 'Component' }) => {
  const renderCount = useRef(0);
  const lastRender = useRef(Date.now());
  
  renderCount.current += 1;
  const now = Date.now();
  const timeSinceLastRender = now - lastRender.current;
  lastRender.current = now;
  
  useEffect(() => {
    if (renderCount.current > 5 && timeSinceLastRender < 100) {
      console.error(`🚨 BUCLE DETECTADO en ${name}:`, {
        renderCount: renderCount.current,
        timeSinceLastRender: timeSinceLastRender + 'ms',
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (renderCount.current > 1) {
      console.log(`🔄 Re-render ${name}:`, {
        count: renderCount.current,
        interval: timeSinceLastRender + 'ms'
      });
    } else {
      console.log(`✨ Primer render ${name}`);
    }
  });
  
  // Renderizar indicador visual solo en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const isLoop = renderCount.current > 5 && timeSinceLastRender < 100;
  
  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: isLoop ? '#ff4444' : '#44ff44',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      opacity: 0.8
    }}>
      {name}: {renderCount.current} {isLoop ? '🚨' : '✅'}
    </div>
  );
};

// Hook para debugging de useEffect
export const useEffectDebugger = (effect, deps, name = 'useEffect') => {
  const depsPrevious = useRef(deps);
  const depsChanged = useRef([]);
  
  useEffect(() => {
    if (depsPrevious.current) {
      const changedDeps = deps.map((dep, i) => {
        if (dep !== depsPrevious.current[i]) {
          return {
            index: i,
            before: depsPrevious.current[i],
            after: dep
          };
        }
        return null;
      }).filter(Boolean);
      
      if (changedDeps.length > 0) {
        console.log(`🔄 ${name} triggered by:`, changedDeps);
        depsChanged.current = changedDeps;
      }
    }
    
    depsPrevious.current = deps;
    return effect();
  }, deps);
  
  return depsChanged.current;
};

export default RenderDebugger;
