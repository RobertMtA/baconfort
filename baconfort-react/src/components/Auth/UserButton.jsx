import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContextAPI';
import AuthModal from './AuthModal';
import './UserButton.css';

function UserButton() {
  const { user, logout, isAuthenticated, isAdmin, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleRegisterClick = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const isUserAuthenticated = isAuthenticated();

  // Mostrar indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="user-button-group">
        <button className="user-btn" disabled>
          <i className="fas fa-spinner fa-spin"></i>
          <span className="btn-text">Cargando...</span>
        </button>
      </div>
    );
  }

  if (!isUserAuthenticated) {
    return (
      <>
        <div className="user-button-group">
          <button 
            className="user-btn login-btn"
            onClick={handleLoginClick}
            type="button"
          >
            <i className="fas fa-sign-in-alt"></i>
            <span className="btn-text">Login</span>
          </button>
          <button 
            className="user-btn register-btn"
            onClick={handleRegisterClick}
            type="button"
          >
            <i className="fas fa-user-plus"></i>
            <span className="btn-text">Registro</span>
          </button>
        </div>

        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </>
    );
  }

  return (
    <>
      <div className="user-button-group">
        <div className="user-dropdown" ref={dropdownRef}>
          <button 
            className="user-profile-btn"
            onClick={toggleDropdown}
            type="button"
          >
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <span className="user-name">{user.name}</span>
            <i className={`fas fa-chevron-down dropdown-arrow ${showDropdown ? 'up' : ''}`}></i>
          </button>

          {showDropdown && (
            <div className="user-dropdown-menu">
              <div className="dropdown-header">
                <div className="user-info">
                  <div className="user-avatar-large">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="user-details">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                    {isAdmin() && (
                      <span className="admin-badge">
                        <i className="fas fa-crown"></i>
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="dropdown-section">
                <a href="/profile" className="dropdown-item">
                  <i className="fas fa-user-edit"></i>
                  Mi Perfil
                </a>
                <a href="/my-reservations" className="dropdown-item">
                  <i className="fas fa-calendar-check"></i>
                  Mis Reservas
                </a>
                {isAdmin() && (
                  <a href="/admin" className="dropdown-item admin-link">
                    <i className="fas fa-cog"></i>
                    Panel Admin
                  </a>
                )}
              </div>

              <div className="dropdown-section">
                <button 
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                  type="button"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Botón de logout directo visible */}
        <button 
          className="user-btn logout-btn-direct"
          onClick={handleLogout}
          type="button"
          title="Cerrar Sesión"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span className="btn-text">Logout</span>
        </button>
      </div>
    </>
  );
}

export default UserButton;
