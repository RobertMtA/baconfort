import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextAPI';

// ✅ EMERGENCY: Solo Router + AuthProvider (SIN AdminProvider)
function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚨 EMERGENCY MODE: Sin AdminProvider</h1>
      <p>Si esta página sigue recargándose, el problema NO es AdminProvider</p>
      <br />
      
      <div style={{ backgroundColor: '#ffebee', padding: '15px', borderRadius: '8px' }}>
        <h2>Test de Estabilidad</h2>
        <p><strong>Timestamp: {new Date().toLocaleTimeString()}</strong></p>
        <p>Si este timestamp cambia solo, hay bucles en AuthProvider o Router</p>
      </div>
      
      <br />
      <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px' }}>
        <h3>🔍 Debugging:</h3>
        <p>• Solo AuthProvider activo</p>
        <p>• AdminProvider completamente eliminado</p>
        <p>• Si sigue recargando → problema en AuthProvider</p>
        <p>• Si es estable → problema era AdminProvider</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <nav style={{ padding: '10px', backgroundColor: '#ffcdd2' }}>
            <h3>🚨 EMERGENCY MODE</h3>
          </nav>
          
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
