import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextAPI';
import { AdminProvider } from './context/AdminContext-ULTRA-BASIC';

// ✅ TEST: AuthProvider + AdminProvider ULTRA-BÁSICO
function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔬 TEST: AdminProvider ULTRA-BÁSICO</h1>
      <p>✅ AuthProvider funcionaba solo</p>
      <p>🔄 Ahora testing: AuthProvider + AdminProvider ULTRA-BÁSICO</p>
      <br />
      
      <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px' }}>
        <h2>Test de Compatibilidad</h2>
        <p><strong>Timestamp: {new Date().toLocaleTimeString()}</strong></p>
        <p>AdminProvider SIN useState, SIN useEffect, SIN nada</p>
      </div>
      
      <br />
      <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px' }}>
        <h3>🔍 Debugging ULTRA-BÁSICO:</h3>
        <p>• AuthProvider + AdminProvider ULTRA-BÁSICO</p>
        <p>• AdminProvider sin estado, sin efectos</p>
        <p>• Si funciona → problema en AdminContext-SIMPLE</p>
        <p>• Si bucles → incompatibilidad entre Providers</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <div>
            <nav style={{ padding: '10px', backgroundColor: '#c8e6c9' }}>
              <h3>🔬 ULTRA-BASIC TEST</h3>
            </nav>
            
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </div>
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
