import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
// import { AdminProvider } from './context/AdminContext-SIMPLE'; // TENÍA useState QUE CAUSABA BUCLES
// import { AdminProvider } from './context/AdminContext-FUNCIONAL'; // ✅ VERSIÓN FUNCIONAL SIN ESTADO
import { AdminProvider } from './context/AdminContext-STATEFUL'; // ✅ VERSIÓN CON ESTADO ACTUALIZABLE
import { AuthProvider } from './context/AuthContextAPI';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminAccessRequired from './components/Admin/AdminAccessRequired';
import NewPropertyCreator from './components/Admin/NewPropertyCreator';
import NewPropertyManager from './components/Admin/NewPropertyManager';
// import DemoUserSetup from './components/DemoUserSetup';
// import RenderCounter from './components/Debug/RenderCounter';
import Home from './pages/Home';
import Moldes1680 from './pages/Moldes-1680';
import SantaFe3770 from './pages/SantaFe-3770';
import Dorrego1548 from './pages/Dorrego-1548';
import Convencion1994 from './pages/Convencion-1994';
import Ugarteche2824 from './pages/Ugarteche-2824';
import PromotionsPage from './pages/PromotionsPage';
import Admin from './pages/Admin';
import MyReservations from './components/MyReservations/MyReservations';
import PendingPayments from './components/PendingPayments/PendingPayments';
import UserProfile from './components/UserProfile/UserProfile';
import ResetPassword from './components/Auth/ResetPassword';
import VerifyEmail from './components/VerifyEmail';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import DynamicProperty from './pages/DynamicProperty';
import NotFound from './pages/NotFound';
import Loading from './components/Loading/Loading';
import Footer from './components/Footer/Footer';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        {/* <RenderCounter componentName="App" /> */}
        <Router>
          {/* <DemoUserSetup /> */}
          <div className="app">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/promociones" element={<PromotionsPage />} />
                <Route path="/departamentos/moldes-1680" element={<Moldes1680 />} />
                <Route path="/departamentos/santa-fe-3770" element={<SantaFe3770 />} />
                <Route path="/departamentos/dorrego-1548" element={<Dorrego1548 />} />
                <Route path="/departamentos/convencion-1994" element={<Convencion1994 />} />
                <Route path="/departamentos/ugarteche-2824" element={<Ugarteche2824 />} />
                <Route path="/departamentos/:propertyId" element={<DynamicProperty />} />
                <Route path="/my-reservations" element={<MyReservations />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failure" element={<PaymentFailure />} />
                <Route path="/admin/access-required" element={<AdminAccessRequired />} />
                <Route path="/admin/new-property" element={
                  <ProtectedRoute adminOnly={true}>
                    <NewPropertyCreator />
                  </ProtectedRoute>
                } />
                <Route path="/admin/manage-new-properties" element={
                  <ProtectedRoute adminOnly={true}>
                    <NewPropertyManager />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly={true}>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Footer />
          </div>
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
