import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextAPI';

// ✅ PASO 2: Router + AuthProvider (SIN AdminProvider)
function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎯 PASO 2: Router + AuthProvider Testing</h1>
      <p>✅ Router funcionaba correctamente</p>
      <p>🔄 Ahora testing: Router + AuthProvider (SIN AdminProvider)</p>
      <br />
      
      <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px' }}>
        <h2>Home Page</h2>
        <p>Si esta página es estable, AuthProvider no es el problema.</p>
        <br />
        <p><strong>Timestamp: {new Date().toLocaleTimeString()}</strong></p>
      </div>
      
      <br />
      <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
        <h3>📊 Test AuthProvider:</h3>
        <p>✅ Si estable → AuthProvider OK, problema en AdminProvider</p>
        <p>❌ Si bucles → AuthProvider problemático</p>
      </div>
    </div>
  );
}

function About() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>About Page</h1>
      <p>Testing AuthProvider con navegación</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
