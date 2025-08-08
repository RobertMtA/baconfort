import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import PropertyEditor from './PropertyEditor';
import Dashboard from './Dashboard';
import PromotionManager from './PromotionManager';
import AmenitiesManagerSimple from './AmenitiesManagerSimple';
import ReviewsAdmin from './ReviewsAdmin';
import SimpleUserManager from './SimpleUserManager';
import AdminReservations from './AdminReservations';
import AdminInquiries from './AdminInquiries';
import AdminSubscribers from './AdminSubscribers';
import AdminSessionInfo from './AdminSessionInfo';
import './AdminPanel.css';
import './AdminResponsive.css';

function AdminPanel() {
  const { logout, getAllProperties, debugStoredProperties, addProperty } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProperty, setSelectedProperty] = useState(null);

  const properties = getAllProperties();

  const handleEditProperty = (propertyId) => {
    setSelectedProperty(propertyId);
    setActiveTab('edit');
  };

  const handleTestProperty = async () => {
    console.log('🧪 TESTING: Creating test property...');
    
    const testProperty = {
      id: 'test-debugging-property',
      title: 'Test Debugging Property',
      address: 'Test Address 123',
      city: 'Test City',
      price: 100,
      description: 'This is a test property for debugging purposes'
    };
    
    try {
      await addProperty(testProperty);
      console.log('🧪 TESTING: Test property created, running debug...');
      debugStoredProperties();
    } catch (error) {
      console.error('🧪 TESTING: Error creating test property:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onEditProperty={handleEditProperty} />;
      case 'reservations':
        return <AdminReservations />;
      case 'inquiries':
        return <AdminInquiries />;
      case 'subscribers':
        return <AdminSubscribers />;
      case 'reviews':
        return <ReviewsAdmin />;
      case 'users':
        return <SimpleUserManager />;
      case 'promotions':
        return <PromotionManager />;
      case 'amenities':
        return <AmenitiesManagerSimple />;
      case 'add-property':
        return (
          <PropertyEditor 
            propertyId={null} // null indica nueva propiedad
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'edit':
        return selectedProperty ? (
          <PropertyEditor 
            propertyId={selectedProperty} 
            onBack={() => setActiveTab('dashboard')}
          />
        ) : (
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle"></i>
            Selecciona una propiedad para editar
          </div>
        );
      default:
        return <Dashboard onEditProperty={handleEditProperty} />;
    }
  };

  return (
    <div className="admin-panel">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-brand">
            <i className="fas fa-shield-alt"></i>
            <h1>Panel de Administración - BACONFORT</h1>
          </div>
          <button className="btn btn-outline-light" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="admin-content">
        {/* Información de sesión */}
        <AdminSessionInfo />
        
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button 
              className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <i className="fas fa-chart-line"></i>
              Dashboard
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'reservations' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservations')}
            >
              <i className="fas fa-calendar-check"></i>
              Gestión Reservas
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'inquiries' ? 'active' : ''}`}
              onClick={() => setActiveTab('inquiries')}
            >
              <i className="fas fa-envelope"></i>
              Consultas
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'subscribers' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscribers')}
            >
              <i className="fas fa-envelope-open"></i>
              Suscriptores
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <i className="fas fa-star"></i>
              Reseñas
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="fas fa-users"></i>
              Usuarios
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'promotions' ? 'active' : ''}`}
              onClick={() => setActiveTab('promotions')}
            >
              <i className="fas fa-percent"></i>
              Promociones
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'amenities' ? 'active' : ''}`}
              onClick={() => setActiveTab('amenities')}
            >
              <i className="fas fa-cog"></i>
              Comodidades
            </button>
            
            <div className="admin-nav-section">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4>Propiedades</h4>
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => setActiveTab('add-property')}
                  title="Agregar nueva propiedad"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              
              <button 
                className={`admin-nav-item ${activeTab === 'add-property' ? 'active' : ''}`}
                onClick={() => setActiveTab('add-property')}
              >
                <i className="fas fa-plus-circle"></i>
                Agregar Propiedad
              </button>
              
              {Object.values(properties).map(property => (
                <button
                  key={property.id}
                  className={`admin-nav-item property-item ${
                    selectedProperty === property.id && activeTab === 'edit' ? 'active' : ''
                  }`}
                  onClick={() => handleEditProperty(property.id)}
                >
                  <i className="fas fa-building"></i>
                  {property.title}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;
