import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de reseteo no encontrado');
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.resetPassword(token, formData.newPassword);
      
      if (response.success) {
        setSuccess(true);
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Error en reset password:', err);
      
      // Manejo específico de errores de conexión
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        setError('Error de conexión. Verifica tu conexión a internet y que el servidor esté disponible.');
      } else if (err.message.includes('Token inválido') || err.message.includes('Token') || err.message.includes('expirado')) {
        setError('El enlace de reseteo ha expirado o no es válido. Solicita un nuevo enlace de recuperación.');
      } else {
        setError(err.message || 'Error al resetear la contraseña. Inténtalo nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-state">
            <h1>Token no válido</h1>
            <p>El enlace de reseteo de contraseña no es válido o ha expirado.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="success-state">
            <div className="success-icon">✅</div>
            <h1>¡Contraseña actualizada!</h1>
            <p>Tu contraseña ha sido actualizada exitosamente.</p>
            <p>Serás redirigido al login en unos segundos...</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              Ir al Login Ahora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1>Resetear Contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Repite la contraseña"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>

          <div className="form-footer">
            <button 
              type="button"
              className="btn-link"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              Volver al Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
