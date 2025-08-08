import { useAdmin } from '../context/AdminContext-STATEFUL';
import { useAdminGuard } from '../security/AdminGuard';
import AdminLogin from '../components/Admin/AdminLogin';
import AdminPanel from '../components/Admin/AdminPanel';
import Loading from '../components/Loading/Loading';

function Admin() {
  const { isAuthenticated } = useAdmin();
  const { isAuthorized, isChecking } = useAdminGuard();

  // Mostrar loading mientras verifica acceso
  if (isChecking) {
    return (
      <div className="admin-page">
        <Loading />
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Verificando acceso autorizado...
        </div>
      </div>
    );
  }

  // Si no está autorizado, el guard ya redirigió a /admin/access-required
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="admin-page">
      {isAuthenticated ? <AdminPanel /> : <AdminLogin />}
    </div>
  );
}

export default Admin;
