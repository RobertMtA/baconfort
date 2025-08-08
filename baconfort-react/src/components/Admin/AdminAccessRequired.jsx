import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAdminAccess } from '../../security/AdminGuard';
import './AdminAccessRequired.css';

const AdminAccessRequired = () => {
  const [step, setStep] = useState(1);
  const [accessCode, setAccessCode] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAccessCodeSubmit = (e) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      setError('Ingresa el código de acceso');
      return;
    }
    
    // Verificar formato del código
    if (!accessCode.includes('BACONFORT') && !accessCode.includes('SECURE') && !accessCode.includes('ADMIN')) {
      setError('Formato de código inválido');
      return;
    }
    
    setError('');
    setStep(2);
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await requestAdminAccess(accessCode, credentials);
      
      // Redirigir al panel de admin
      navigate('/admin');
      window.location.reload(); // Forzar recarga para aplicar cambios
      
    } catch (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  const getHint = () => {
    const hints = [
      'El código contiene "BACONFORT", año actual y caracteres alfanuméricos',
      'Contacta al administrador: roberto@baconfort.com',
      'WhatsApp: +54 11 3002-1074'
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  };

  return (
    <div className="access-required-container">
      <div className="access-required-card">
        <div className="access-header">
          <i className="fas fa-shield-alt"></i>
          <h1>Acceso Restringido</h1>
          <p>Panel de Administración - BACONFORT</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleAccessCodeSubmit} className="access-form">
            <div className="security-notice">
              <i className="fas fa-exclamation-triangle"></i>
              <p>Esta área está protegida. Se requiere código de acceso autorizado.</p>
            </div>

            {error && (
              <div className="alert alert-danger">
                <i className="fas fa-times-circle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="accessCode">
                <i className="fas fa-key"></i>
                Código de Acceso
              </label>
              <input
                type="password"
                id="accessCode"
                className="form-control"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Ingresa el código de acceso autorizado"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              <i className="fas fa-unlock"></i>
              Verificar Código
            </button>

            <div className="access-hint">
              <p><strong>Pista:</strong> {getHint()}</p>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCredentialsSubmit} className="access-form">
            <div className="step-indicator">
              <i className="fas fa-check-circle"></i>
              <p>Código verificado. Ingresa credenciales administrativas.</p>
            </div>

            {error && (
              <div className="alert alert-danger">
                <i className="fas fa-times-circle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Email Administrativo
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                placeholder="admin@baconfort.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Contraseña Administrativa
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                placeholder="Contraseña segura"
                required
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                <i className="fas fa-arrow-left"></i>
                Volver
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Verificando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Acceder
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="security-footer">
          <p>
            <i className="fas fa-info-circle"></i>
            Si necesitas acceso, contacta al administrador del sistema.
          </p>
          <div className="contact-info">
            <p>📧 roberto@baconfort.com</p>
            <p>📱 +54 11 3002-1074</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccessRequired;
