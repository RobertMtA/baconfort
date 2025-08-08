import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextAPI';
import { AdminProvider } from './context/AdminContext-FUNCIONAL';
import Home from './pages/Home';
import Footer from './components/Footer/Footer'; // ✅ AGREGANDO Footer

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
            
            <Footer /> {/* ✅ AGREGANDO Footer real */}
          </div>
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
