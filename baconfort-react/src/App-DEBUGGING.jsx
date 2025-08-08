import React from 'react';

// VERSIÓN ULTRA MINIMALISTA PARA DEBUGGING
function App() {
  console.log('🚨 APP RENDER:', new Date().toLocaleTimeString());
  
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1>🔧 DEBUGGING MODE - BUCLES INFINITOS</h1>
      <p>Si esta página se actualiza constantemente, el problema está en:</p>
      <ul>
        <li>• Algún Provider de contexto</li>
        <li>• Router configuration</li>
        <li>• StrictMode en main.jsx</li>
        <li>• Vite configuration</li>
      </ul>
      
      <div style={{
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h3>📊 Tests:</h3>
        <p>✅ Si esta página está estable → El problema estaba en los componentes complejos</p>
        <p>❌ Si esta página sigue actualizándose → El problema está en la configuración base</p>
      </div>
      
      <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

export default App;
