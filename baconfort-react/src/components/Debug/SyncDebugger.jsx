import React, { useState, useEffect } from 'react';

const SyncDebugger = ({ propertyId }) => {
  const [debugInfo, setDebugInfo] = useState({
    properties: {},
    property: null,
    localStorage: null
  });

  useEffect(() => {
    // Leer datos directamente de localStorage
    const savedData = localStorage.getItem('baconfort_data');
    let properties = {};
    let property = null;
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        properties = parsedData.properties || {};
        property = propertyId ? properties[propertyId] : null;
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }
    }

    setDebugInfo({
      properties,
      property,
      localStorage: !!savedData
    });
  }, [propertyId]);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const { properties, property, localStorage: hasLocalStorage } = debugInfo;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 99999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>🔍 Sync Debugger</h4>
      
      <div><strong>Property ID:</strong> {propertyId}</div>
      <div><strong>LocalStorage:</strong> {hasLocalStorage ? '✅ Available' : '❌ Empty'}</div>
      <div><strong>Property Found:</strong> {property ? '✅ Yes' : '❌ No'}</div>
      
      {property && (
        <>
          <div><strong>Title:</strong> {property.title}</div>
          <div><strong>Is Blocked:</strong> {property.isBlocked ? '🔒 YES' : '🔓 NO'}</div>
          {property.isBlocked && (
            <>
              <div><strong>Block Reason:</strong> {property.blockReason}</div>
              <div><strong>Blocked At:</strong> {new Date(property.blockedAt).toLocaleString()}</div>
            </>
          )}
          {/* Mostrar TODOS los campos de bloqueo para debug */}
          <div style={{ fontSize: '10px', marginTop: '5px', padding: '5px', background: 'rgba(255,255,255,0.1)' }}>
            <div><strong>All Blocking Fields:</strong></div>
            <div>isBlocked: {JSON.stringify(property.isBlocked)}</div>
            <div>blockReason: {JSON.stringify(property.blockReason)}</div>
            <div>blockedAt: {JSON.stringify(property.blockedAt)}</div>
          </div>
        </>
      )}
      
      <hr style={{ margin: '10px 0', border: '1px solid #333' }} />
      
      <div><strong>Total Properties:</strong> {Object.keys(properties).length}</div>
      <div style={{ fontSize: '10px', opacity: 0.7 }}>
        {Object.keys(properties).join(', ') || 'None loaded'}
      </div>
      
      {/* Botón para forzar refresh */}
      <button 
        onClick={() => window.location.reload()} 
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '10px'
        }}
      >
        🔄 Refresh Page
      </button>
    </div>
  );
};

export default SyncDebugger;
