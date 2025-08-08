import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/VerifyEmail.css';

const VerifyEmail = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      // Extraer token de la URL
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no encontrado en la URL');
        return;
      }

      try {
        console.log('🔍 Verificando email con token:', token.substring(0, 8) + '...');
        
        const response = await fetch('http://localhost:5004/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          if (data.alreadyVerified) {
            setMessage('Tu email ya estaba verificado. Puedes iniciar sesión normalmente.');
          } else {
            setMessage('¡Email verificado exitosamente! Ya puedes iniciar sesión en tu cuenta.');
          }
          
          // Redirigir a la página principal después de 3 segundos
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Error al verificar el email');
        }
      } catch (error) {
        console.error('❌ Error en verificación:', error);
        setStatus('error');
        setMessage('Error de conexión. Verifica que el servidor esté funcionando.');
      }
    };

    verifyEmail();
  }, [location, navigate]);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        <div className="verify-email-card">
          {status === 'loading' && (
            <>
              <div className="spinner"></div>
              <h2>Verificando tu email...</h2>
              <p>Por favor espera mientras procesamos tu verificación.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h2>¡Verificación Exitosa!</h2>
              <p>{message}</p>
              <p className="redirect-message">Serás redirigido automáticamente en unos segundos...</p>
              <button className="btn-primary" onClick={handleBackToHome}>
                Ir a la página principal
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h2>Error en la Verificación</h2>
              <p>{message}</p>
              <div className="error-actions">
                <button className="btn-primary" onClick={handleBackToHome}>
                  Volver al inicio
                </button>
                <p className="help-text">
                  Si el problema persiste, contáctanos o solicita un nuevo email de verificación.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
