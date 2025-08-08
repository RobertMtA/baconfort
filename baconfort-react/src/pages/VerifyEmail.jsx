// pages/VerifyEmail.jsx - Página de verificación de email
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no encontrado en la URL');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3002/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.alreadyVerified 
            ? 'Tu email ya estaba verificado anteriormente' 
            : '¡Email verificado exitosamente! Ya puedes usar todas las funciones de BACONFORT'
          );
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Error desconocido al verificar el email');
        }
      } catch (error) {
        console.error('Error:', error);
        setStatus('error');
        setMessage('Error de conexión. Intenta nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleResendEmail = async () => {
    const email = prompt('Ingresa tu email para reenviar la verificación:');
    if (!email) return;

    try {
      const response = await fetch('http://localhost:3002/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Email de verificación reenviado exitosamente. Revisa tu bandeja de entrada.');
      } else {
        alert(data.error || 'Error al reenviar el email');
      }
    } catch (error) {
      alert('Error de conexión. Intenta nuevamente más tarde.');
    }
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <div className="verify-email-header">
          <h1 className="logo">🏠 BACONFORT</h1>
          <h2>Verificación de Email</h2>
        </div>

        <div className="verify-email-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Verificando tu email...</p>
            </div>
          ) : (
            <>
              {status === 'success' && (
                <div className="success-state">
                  <div className="success-icon">✅</div>
                  <h3>¡Verificación Exitosa!</h3>
                  <p>{message}</p>
                  <div className="redirect-info">
                    <p>Serás redirigido automáticamente en unos segundos...</p>
                    <button 
                      onClick={() => navigate('/')}
                      className="btn-primary"
                    >
                      Ir al Inicio Ahora
                    </button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="error-state">
                  <div className="error-icon">❌</div>
                  <h3>Error de Verificación</h3>
                  <p>{message}</p>
                  <div className="error-actions">
                    <button 
                      onClick={handleResendEmail}
                      className="btn-secondary"
                    >
                      📧 Reenviar Email de Verificación
                    </button>
                    <button 
                      onClick={() => navigate('/')}
                      className="btn-primary"
                    >
                      🏠 Volver al Inicio
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="verify-email-footer">
          <p>© 2025 BACONFORT - Alquileres Temporarios</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
