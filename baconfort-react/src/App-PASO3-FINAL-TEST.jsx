import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextAPI';
import { AdminProvider } from './context/AdminContext-SIMPLE';

// ✅ PASO 3: Router + AuthProvider + AdminProvider
function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎯 PASO 3: TESTING FINAL - AdminProvider</h1>
      <p>✅ Router funcionaba correctamente</p>
      <p>✅ AuthProvider funcionaba correctamente</p>
      <p>🔄 Ahora testing: Router + AuthProvider + AdminProvider</p>
      <br />
      
      <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px' }}>
        <h2>Home Page</h2>
        <p>Si esta página es estable, AdminProvider-SIMPLE funciona.</p>
        <p>Si aparecen bucles, AdminProvider original era el problema.</p>
        <br />
        <p><strong>Timestamp: {new Date().toLocaleTimeString()}</strong></p>
      </div>
      
      <br />
      <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px' }}>
        <h3>📊 Test FINAL:</h3>
        <p>✅ Si estable → AdminProvider-SIMPLE funciona</p>
        <p>❌ Si bucles → Problema en AdminProvider-SIMPLE</p>
        <p>🎯 Si estable → Podemos restaurar la app completa</p>
      </div>
    </div>
  );
}

function About() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>About Page</h1>
      <p>Testing AuthProvider + AdminProvider con navegación</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <div>
            <nav style={{ padding: '10px', backgroundColor: '#e9ecef' }}>
              <a href="/" style={{ marginRight: '20px' }}>Home</a>
              <a href="/about">About</a>
            </nav>
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
