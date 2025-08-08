import { useState } from 'react';
import { useAuth } from '../../context/AuthContextAPI';
import ForgotPassword from './ForgotPassword';
import './AuthForm.css';

function LoginForm({ onSwitchToRegister, onClose }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        onClose();
        alert(`¡Bienvenido/a ${result.user.name}!`);
      } else {
        // Manejo inteligente de errores
        if (result.suggestion === 'register') {
          // Usuario no existe - ofrecer registro
          const shouldRegister = window.confirm(`${result.message}\n\n¿Deseas ir al formulario de registro?`);
          if (shouldRegister) {
            onSwitchToRegister();
            return;
          }
        } else if (result.suggestion === 'verify-email') {
          // Email no verificado - mostrar instrucciones
          alert(`${result.message}\n\nSi no encuentras el email, revisa tu carpeta de spam o solicita un nuevo email de verificación.`);
          setErrors({ 
            general: 'Email no verificado. Revisa tu bandeja de entrada.',
            verification: true 
          });
        } else if (result.suggestion === 'retry') {
          // Error de conexión - mostrar info técnica
          setErrors({ 
            general: result.error,
            technical: result.technical 
          });
        } else {
          setErrors({ general: result.error });
        }
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión. Intenta nuevamente.' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-form login-mode">
      <div className="auth-header">
        <h3>
          <i className="fas fa-sign-in-alt"></i>
          Iniciar Sesión
        </h3>
        <p>Accede a tu cuenta o regístrate si es tu primera vez</p>
      </div>

      {errors.general && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i>
          {errors.general}
          {errors.technical && (
            <div style={{ marginTop: '10px', fontSize: '12px', opacity: '0.8' }}>
              <strong>Info técnica:</strong> {errors.technical}
            </div>
          )}
          {errors.verification && (
            <div style={{ marginTop: '15px' }}>
              <button 
                type="button" 
                className="btn-link" 
                onClick={async () => {
                  try {
                    // Solicitar reenvío de email de verificación
                    const response = await fetch('http://localhost:5004/api/auth/resend-verification', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ email: formData.email })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                      alert('Email de verificación reenviado. Revisa tu bandeja de entrada.');
                    } else {
                      alert('Error al reenviar email: ' + data.error);
                    }
                  } catch (error) {
                    alert('Error de conexión al reenviar email');
                  }
                }}
                style={{ fontSize: '14px', color: '#007bff', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <i className="fas fa-envelope"></i> Reenviar email de verificación
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-content">
        <div className="form-group">
          <label htmlFor="email">
            <i className="fas fa-envelope"></i>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            disabled={isLoading}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">
            <i className="fas fa-lock"></i>
            Contraseña
          </label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              disabled={isLoading}
              className={errors.password ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <button 
          type="button"
          className="auth-submit-btn"
          disabled={isLoading}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Si los campos están vacíos, no hacer nada
            if (!formData.email || !formData.password) {
              setErrors({ general: 'Por favor completa todos los campos' });
              return;
            }
            
            // Ejecutar el login
            setIsLoading(true);
            setErrors({});

            try {
              const result = await login(formData.email, formData.password);
              
              if (result.success) {
                onClose();
                alert(`¡Bienvenido/a ${result.user.name}!`);
              } else {
                setErrors({ general: result.error });
              }
            } catch (error) {
              setErrors({ general: 'Error de conexión. Intenta nuevamente.' });
            }
            
            setIsLoading(false);
          }}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Iniciando sesión...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i>
              Iniciar Sesión
            </>
          )}
        </button>

        <div className="forgot-password-section">
          <button 
            type="button" 
            className="forgot-password-link"
            onClick={() => setShowForgotPassword(true)}
            disabled={isLoading}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>

      <div className="auth-footer">
        <p>
          ¿No tienes cuenta?{' '}
          <button 
            type="button" 
            className="auth-link"
            onClick={onSwitchToRegister}
            disabled={isLoading}
          >
            Regístrate aquí
          </button>
        </p>
      </div>

      <ForgotPassword 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}

export default LoginForm;
