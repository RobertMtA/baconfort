import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContextAPI'; // PASO 2
// import { AdminProvider } from './context/AdminContext-SIMPLE'; // PASO 3

// PASO 1: Solo Router básico
function App() {
  console.log('🔧 APP RENDER (Solo Router):', new Date().toLocaleTimeString());
  
  return (
    <Router>
      <div style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f0f0',
        minHeight: '100vh'
      }}>
        <h1>🔧 PASO 1: Router Testing</h1>
        <p>✅ Página simple funcionaba</p>
        <p>🔄 Ahora testing: Solo Router (sin Providers)</p>
        
        <Routes>
          <Route path="/" element={
            <div>
              <h2>Home Page</h2>
              <p>Si esta página es estable, el Router no es el problema.</p>
              <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
            </div>
          } />
        </Routes>
        
        <div style={{
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <h3>📊 Test Router:</h3>
          <p>✅ Si estable → Router OK, problema en Providers</p>
          <p>❌ Si bucles → Router configuration problemática</p>
        </div>
      </div>
    </Router>
  );
}

export default App;
