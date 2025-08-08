import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextAPI';
import { AdminProvider } from './context/AdminContext-FUNCIONAL';

// PÁGINA DE HOME ULTRA-BÁSICA SIN HOOKS COMPLEJOS
function SimpleHome() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏠 BA-CONFORT - Versión Ultra-Básica</h1>
      <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h2>✅ BUCLES ELIMINADOS</h2>
        <p><strong>Sin componentes complejos que causen bucles</strong></p>
        <p>Timestamp: {new Date().toLocaleTimeString()}</p>
      </div>
      
      <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>🎯 App Funcional Básica</h3>
        <ul>
          <li>✅ Router funcionando</li>
          <li>✅ AuthProvider activo</li>
          <li>✅ AdminProvider funcional activo</li>
          <li>❌ SIN ReservationForm</li>
          <li>❌ SIN componentes con useEffect</li>
        </ul>
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
            {/* Header ultra-básico */}
            <nav style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              padding: '15px',
              textAlign: 'center'
            }}>
              <h2>🏠 BA-CONFORT</h2>
              <p>Departamentos temporarios en Buenos Aires</p>
            </nav>
            
            <Routes>
              <Route path="/" element={<SimpleHome />} />
              <Route path="*" element={<SimpleHome />} />
            </Routes>
            
            {/* Footer ultra-básico */}
            <footer style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              textAlign: 'center',
              marginTop: '40px'
            }}>
              <p>© 2025 BA-CONFORT - Versión estable sin bucles</p>
            </footer>
          </div>
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
