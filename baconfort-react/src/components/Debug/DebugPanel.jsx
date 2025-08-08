import React from 'react';
import './DebugPanel.css';

const DebugPanel = () => {
  const handleDebugLocalStorage = () => {
    if (window.debugLocalStorage) {
      window.debugLocalStorage();
    } else {
      console.log('debugLocalStorage function not available');
    }
  };

  const handleTestMoldes = () => {
    if (window.testMoldesKey) {
      window.testMoldesKey();
    } else {
      console.log('testMoldesKey function not available');
    }
  };

  const handleForceSyncMoldes = () => {
    if (window.forceSyncMoldes) {
      window.forceSyncMoldes();
    } else {
      console.log('forceSyncMoldes function not available');
    }
  };

  const handleTestFullFlow = () => {
    if (window.testFullFlow) {
      window.testFullFlow();
    } else {
      console.log('testFullFlow function not available');
    }
  };

  const handleDebugAdminSave = () => {
    const testDates = ['2024-01-25', '2024-01-26'];
    if (window.debugAdminSave) {
      window.debugAdminSave('moldes-1680', testDates);
    } else {
      console.log('debugAdminSave function not available');
    }
  };

  const handleClearAllManualOccupancy = () => {
    const keys = Object.keys(localStorage);
    const manualKeys = keys.filter(key => key.includes('manual_occupancy'));
    
    console.log('Limpiando claves de manual_occupancy:', manualKeys);
    manualKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Eliminada: ${key}`);
    });
    
    console.log('Todas las claves de manual_occupancy han sido eliminadas');
    console.log('Recarga la página para ver los cambios');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="debug-panel">
      <h3>🐛 Panel de Debug - localStorage</h3>
      <p><strong>Abre la consola del navegador (F12) para ver los resultados</strong></p>
      
      <div className="debug-buttons">
        <button onClick={handleDebugLocalStorage} className="debug-btn primary">
          📋 Ver Todo localStorage
        </button>
        
        <button onClick={handleTestMoldes} className="debug-btn warning">
          🏠 Test Específico Moldes 1680
        </button>
        
        <button onClick={handleForceSyncMoldes} className="debug-btn info">
          🔄 Forzar Sync Moldes
        </button>
        
        <button onClick={handleTestFullFlow} className="debug-btn success">
          ⚡ Test Flujo Completo
        </button>
        
        <button onClick={handleDebugAdminSave} className="debug-btn secondary">
          👨‍💼 Simular Guardado Admin
        </button>
        
        <button onClick={handleClearAllManualOccupancy} className="debug-btn danger">
          🗑️ Limpiar Todo Manual Occupancy
        </button>
        
        <button onClick={handleReload} className="debug-btn neutral">
          🔄 Recargar Página
        </button>
      </div>
      
      <div className="debug-info">
        <h4>Instrucciones:</h4>
        <ol>
          <li><strong>Ver Todo localStorage:</strong> Muestra todas las claves en localStorage</li>
          <li><strong>Test Específico Moldes:</strong> Verifica la clave específica de Moldes 1680</li>
          <li><strong>Forzar Sync Moldes:</strong> Intenta crear/sincronizar la clave de Moldes</li>
          <li><strong>Test Flujo Completo:</strong> Simula el flujo admin → usuario completo</li>
          <li><strong>Simular Guardado Admin:</strong> Simula que el admin guarda fechas</li>
          <li><strong>Limpiar Todo:</strong> Elimina todas las claves de manual_occupancy</li>
          <li><strong>Recargar:</strong> Recarga la página para aplicar cambios</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugPanel;
