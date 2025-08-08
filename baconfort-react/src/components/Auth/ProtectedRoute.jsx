import { useAuth } from '../../context/AuthContextAPI';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import { Navigate } from 'react-router-dom';
import { verifyAdminAccess } from '../../security/AdminGuard';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, loading } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdmin();
  
  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  // Si es ruta de admin
  if (adminOnly) {
    // Verificar acceso de seguridad primero
    const { isAuthorized } = verifyAdminAccess();
    
    if (!isAuthorized) {
      return <Navigate to="/admin/access-required" replace />;
    }
    
    // Si no está autenticado como admin, mostrar login
    if (!isAdminAuthenticated) {
      return children; // Permitir mostrar AdminLogin
    }
    
    return children;
  }
  
  // Para rutas normales de usuario
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
