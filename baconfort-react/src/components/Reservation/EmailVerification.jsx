import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContextAPI';
import './EmailVerification.css';

const EmailVerification = ({ 
  propertyName, 
  onVerificationSuccess, 
  onCancel,
  reservationData 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Tomar el email del usuario autenticado
  const userEmail = user?.email || '';

  useEffect(() => {
    if (!isAuthenticated || !userEmail) {
      setError('Usuario no autenticado o email no disponible');
      return;
    }
    // Enviar código automáticamente al montar el componente
    sendVerificationCode();
  }, [isAuthenticated, userEmail]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendVerificationCode = async () => {
    if (!userEmail) {
      setError('Email del usuario no disponible');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          email: userEmail,
          propertyName,
          reservationData
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsCodeSent(true);
        setCountdown(300); // 5 minutos
        console.log('✅ Código de verificación enviado');
      } else {
        setError(data.message || 'Error enviando código de verificación');
      }
    } catch (error) {
      console.error('Error enviando código:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Por favor ingresa el código de verificación');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          email: userEmail,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Email verificado exitosamente');
        onVerificationSuccess();
      } else {
        setError(data.message || 'Código de verificación incorrecto');
      }
    } catch (error) {
      console.error('Error verificando código:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="email-verification">
      <div className="verification-container">
        <div className="verification-header">
          <h2>📧 Verificación de Email</h2>
          <p>Hola <strong>{user?.name || 'Usuario'}</strong>, para confirmar tu reserva en <strong>{propertyName}</strong>, necesitamos verificar tu email.</p>
          <div className="user-info">
            <p><strong>Email registrado:</strong> {userEmail}</p>
          </div>
        </div>

        {!isCodeSent ? (
          <div className="sending-code">
            <div className="spinner"></div>
            <p>Enviando código de verificación a {userEmail}...</p>
          </div>
        ) : (
          <div className="verification-form">
            <div className="code-sent-info">
              <div className="success-icon">✅</div>
              <p>
                Hemos enviado un código de verificación de 6 dígitos a:<br />
                <strong>{userEmail}</strong>
              </p>
              <p className="check-spam">
                Si no lo recibes en unos minutos, revisa tu carpeta de spam.
              </p>
            </div>

            <div className="code-input-section">
              <label htmlFor="verification-code">Código de Verificación:</label>
              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="code-input"
                disabled={isLoading}
              />
              
              {countdown > 0 && (
                <p className="countdown">
                  Código válido por: <strong>{formatTime(countdown)}</strong>
                </p>
              )}
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="verification-actions">
              <button
                type="button"
                onClick={verifyCode}
                disabled={isLoading || !verificationCode.trim() || verificationCode.length !== 6}
                className="verify-btn"
              >
                {isLoading ? 'Verificando...' : 'Verificar Email'}
              </button>

              <button
                type="button"
                onClick={sendVerificationCode}
                disabled={isLoading || countdown > 240} // No permitir reenvío si quedan más de 4 minutos
                className="resend-btn"
              >
                {isLoading ? 'Enviando...' : 'Reenviar Código'}
              </button>
            </div>

            <div className="verification-help">
              <p><strong>¿Problemas con el código?</strong></p>
              <ul>
                <li>Verifica que el email sea correcto</li>
                <li>Revisa tu carpeta de spam</li>
                <li>El código expira en 5 minutos</li>
                <li>Puedes solicitar un nuevo código</li>
              </ul>
            </div>
          </div>
        )}

        <div className="verification-footer">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-verification-btn"
            disabled={isLoading}
          >
            Cancelar Reserva
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
