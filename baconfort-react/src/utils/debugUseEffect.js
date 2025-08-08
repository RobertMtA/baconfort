// Utility para detectar bucles infinitos en useEffect
let effectExecutions = new Map();

export const debugUseEffect = (effectName, dependencies = []) => {
  const key = `${effectName}-${JSON.stringify(dependencies)}`;
  const now = Date.now();
  
  if (!effectExecutions.has(key)) {
    effectExecutions.set(key, []);
  }
  
  const executions = effectExecutions.get(key);
  executions.push(now);
  
  // Mantener solo las últimas 10 ejecuciones
  if (executions.length > 10) {
    executions.shift();
  }
  
  // Detectar ejecuciones muy rápidas (más de 5 en 1 segundo)
  const oneSecondAgo = now - 1000;
  const recentExecutions = executions.filter(time => time > oneSecondAgo);
  
  if (recentExecutions.length >= 5) {
    console.error(`🚨 INFINITE LOOP DETECTED: ${effectName} ejecutado ${recentExecutions.length} veces en el último segundo!`);
    console.error('Dependencias:', dependencies);
    console.error('Tiempos de ejecución recientes:', recentExecutions.map(time => new Date(time).toLocaleTimeString()));
    
    // Limpiar el mapa para evitar spam de logs
    effectExecutions.delete(key);
    
    return true; // Indica que se detectó un bucle
  }
  
  return false; // No hay bucle detectado
};

// Función para limpiar el monitoreo
export const clearEffectDebug = () => {
  effectExecutions.clear();
};

// Función para obtener estadísticas
export const getEffectStats = () => {
  const stats = {};
  for (const [key, executions] of effectExecutions.entries()) {
    stats[key] = {
      totalExecutions: executions.length,
      lastExecution: new Date(executions[executions.length - 1]).toLocaleTimeString(),
      frequency: executions.length > 1 ? 
        Math.round((executions[executions.length - 1] - executions[0]) / executions.length) : 0
    };
  }
  return stats;
};

// Hacer disponible en consola para debugging
if (typeof window !== 'undefined') {
  window.getEffectStats = getEffectStats;
  window.clearEffectDebug = clearEffectDebug;
}
