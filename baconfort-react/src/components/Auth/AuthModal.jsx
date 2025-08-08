import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [currentMode, setCurrentMode] = useState(initialMode);

  console.log('🔍 AUTHMODAL: Rendering with isOpen:', isOpen, 'mode:', initialMode);

  // Resetear al modo inicial cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 AUTHMODAL: Modal abierto, modo:', initialMode);
      setCurrentMode(initialMode);
      // Evitar scroll del body
      document.body.classList.add('modal-open');
    } else {
      console.log('🔍 AUTHMODAL: Modal cerrado');
      // Restaurar scroll del body
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup al desmontar
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    console.log('🔍 AUTHMODAL: Backdrop clicked, closing modal');
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e) => {
    console.log('🔍 AUTHMODAL: Modal content clicked, preventing close');
    e.preventDefault();
    e.stopPropagation();
  };

  const switchToRegister = () => {
    setCurrentMode('register');
  };

  const switchToLogin = () => {
    setCurrentMode('login');
  };

  return createPortal(
    <div className="auth-modal-overlay" onClick={handleBackdropClick}>
      <div className="auth-modal" onClick={handleModalClick}>
        <div className="auth-modal-header">
          <div className="modal-brand">
            <img 
              src="/img/logo.jpg" 
              alt="BACONFORT Logo" 
              className="modal-logo"
            />
            <span className="modal-brand-text">BACONFORT</span>
          </div>
          <button 
            className="auth-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="auth-modal-content">
          {currentMode === 'login' ? (
            <LoginForm 
              onSwitchToRegister={switchToRegister}
              onClose={onClose}
            />
          ) : (
            <RegisterForm 
              onSwitchToLogin={switchToLogin}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AuthModal;
