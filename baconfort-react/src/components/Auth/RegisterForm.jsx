import { useState } from 'react';
import { useAuth } from '../../context/AuthContextAPI';
import ForgotPassword from './ForgotPassword';
import './AuthForm.css';

function RegisterForm({ onSwitchToLogin, onClose }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'El email no tiene un formato válido';
      }
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return newErrors;
  };

  // Función para autocompletar datos de prueba
  const fillTestData = () => {
    const randomId = Math.floor(Math.random() * 1000);
    setFormData({
      name: `Usuario Test ${randomId}`,
      email: `test${randomId}@ejemplo.com`,
      password: 'test123',
      confirmPassword: 'test123'
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validar formulario
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      if (result.success) {
        if (result.requiresEmailVerification) {
          // Registro exitoso pero requiere verificación de email
          onClose();
          alert(`¡Registro exitoso! Hemos enviado un email de verificación a ${formData.email.trim()}.\n\nDebes verificar tu email haciendo clic en el enlace que te enviamos. Después de verificar recibirás un email de bienvenida.`);
        } else {
          // Registro exitoso con login automático
          onClose();
          alert(`¡Bienvenido/a ${result.user.name}! Tu cuenta ha sido creada exitosamente.`);
        }
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión. Intenta nuevamente.' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-form register-mode">
      <div className="auth-header">
        <h3>
          <i className="fas fa-user-plus"></i>
          Crear Cuenta Nueva
        </h3>
        <p>Únete a la comunidad BACONFORT - Es gratis y rápido</p>
      </div>

      {errors.general && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-content">
        <div className="form-group">
          <label htmlFor="name">
            <i className="fas fa-user"></i>
            Nombre completo
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            disabled={isLoading}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

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
              placeholder="Mínimo 6 caracteres"
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

        <div className="form-group">
          <label htmlFor="confirmPassword">
            <i className="fas fa-lock"></i>
            Confirmar contraseña
          </label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              disabled={isLoading}
              className={errors.confirmPassword ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
            </button>
          </div>
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <button 
          type="button"
          className="auth-submit-btn"
          disabled={isLoading}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Validar que los campos no estén vacíos
            if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
              setErrors({ general: 'Por favor completa todos los campos' });
              return;
            }
            
            // Ejecutar el registro
            setIsLoading(true);
            setErrors({});

            // Validar formulario
            const validationErrors = validateForm();
            if (Object.keys(validationErrors).length > 0) {
              setErrors(validationErrors);
              setIsLoading(false);
              return;
            }

            try {
              const result = await register({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password
              });
              
              if (result.success) {
                onClose();
                alert(`¡Bienvenido/a ${result.user.name}! Tu cuenta ha sido creada exitosamente.`);
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
              Creando cuenta...
            </>
          ) : (
            <>
              <i className="fas fa-user-plus"></i>
              Crear Cuenta
            </>
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          ¿Ya tienes cuenta?{' '}
          <button 
            type="button" 
            className="auth-link"
            onClick={onSwitchToLogin}
            disabled={isLoading}
          >
            Inicia sesión aquí
          </button>
        </p>
        
        <div className="help-section">
          <small className="help-text">
            <i className="fas fa-info-circle"></i>
            Si ya tienes cuenta pero olvidaste tu contraseña:
          </small>
          <div className="help-actions">
            <button 
              type="button" 
              className="help-link"
              onClick={onSwitchToLogin}
              disabled={isLoading}
            >
              Ir al Login
            </button>
            <span className="help-separator">o</span>
            <button 
              type="button" 
              className="help-link"
              onClick={() => setShowForgotPassword(true)}
              disabled={isLoading}
            >
              Recuperar Contraseña Directamente
            </button>
          </div>
        </div>
      </div>

      <ForgotPassword 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}

export default RegisterForm;
