import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import './ForgotPassword.css';

const ForgotPassword = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'success'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, ingresa tu email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        setMessage(response.message);
        setStep('success');
        
        // En desarrollo, mostrar el token para facilitar testing
        if (response.resetToken) {
          console.log('🔑 Token de reseteo (desarrollo):', response.resetToken);
          setMessage(prev => `${prev}\n\nToken de desarrollo: ${response.resetToken}`);
        }
      }
    } catch (err) {
      console.error('Error en forgot password:', err);
      
      // Manejo específico de errores de conexión
      if (err.message === 'Failed to fetch' || err.message.includes('Network Error')) {
        setError('🔧 Servicio temporalmente no disponible.\n\n' +
                'El sistema de recuperación está siendo actualizado.\n' +
                'Por favor, inténtalo nuevamente en unos minutos o contacta al administrador.\n\n' +
                '📧 Email de contacto: robertogaona1985@gmail.com\n' +
                '📱 WhatsApp: +54 11 3002-1074');
      } else {
        setError(err.message || 'Error al enviar solicitud de recuperación');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setError('');
    setStep('email');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-modal">
        <div className="forgot-password-header">
          <h2>Recuperar Contraseña</h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="forgot-password-content">
          {step === 'email' && (
            <form onSubmit={handleSubmit}>
              <p className="forgot-password-description">
                Ingresa tu email y te enviaremos instrucciones para resetear tu contraseña.
              </p>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="success-step">
              <div className="success-icon">✅</div>
              <div className="success-message">
                {message}
              </div>
              <div className="form-actions">
                <button 
                  className="btn-primary"
                  onClick={handleClose}
                >
                  Entendido
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
