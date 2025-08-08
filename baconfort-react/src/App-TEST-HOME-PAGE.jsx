import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextAPI';
import { AdminProvider } from './context/AdminContext-FUNCIONAL';
import Home from './pages/Home'; // ✅ AGREGANDO Home page

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
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Home />} />
            </Routes>
            
            {/* Footer ultra-básico */}
            <footer style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              textAlign: 'center',
              marginTop: '40px'
            }}>
              <p>© 2025 BA-CONFORT - Testing con Home page</p>
            </footer>
          </div>
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
