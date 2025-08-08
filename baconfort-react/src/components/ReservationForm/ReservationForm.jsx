import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContextAPI';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import { usePriceCalculator } from '../../hooks/usePriceCalculator';
import AuthModal from '../Auth/AuthModal';
import { API_URL } from '../../services/api';
import './ReservationForm.css';

function ReservationForm({ apartmentName = "este departamento" }) {
  const { user, isAuthenticated } = useAuth();
  const { getPropertyByName } = useAdmin();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [selectedIdType, setSelectedIdType] = useState('dni');
  const [propertyPrices, setPropertyPrices] = useState(null);
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '1',
    fullName: '',
    email: '',
    phone: '',
    dni: '',
    message: `Hola, me interesa reservar ${apartmentName}. ¿Está disponible para las fechas indicadas? Por favor contactarme a mi email o teléfono. Saludos.`
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Calcular precio usando el hook
  const priceCalculation = usePriceCalculator(
    propertyPrices?.prices,
    formData.checkIn,
    formData.checkOut
  );

  // Configurar fechas mínimas
  const today = new Date().toISOString().split('T')[0];
  
  // Obtener precios de la propiedad
  useEffect(() => {
    const loadPropertyPrices = async () => {
      try {
        const property = await getPropertyByName(apartmentName);
        if (property && property.prices) {
          setPropertyPrices(property);
          console.log('💰 Precios cargados para:', apartmentName, property.prices);
        }
      } catch (error) {
        console.error('Error cargando precios:', error);
      }
    };

    if (apartmentName && apartmentName !== "este departamento") {
      loadPropertyPrices();
    }
  }, [apartmentName, getPropertyByName]);
  
  useEffect(() => {
    // Auto-completar check-in con mañana si está vacío
    if (!formData.checkIn) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        checkIn: tomorrow.toISOString().split('T')[0]
      }));
    }
  }, []);

  // Autocompletar datos del usuario autenticado solo si los campos están vacíos
  useEffect(() => {
    if (user && isAuthenticated()) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user, isAuthenticated]);

  // Validación básica
  const validateForm = () => {
    const errors = {};
    
    if (!formData.checkIn) {
      errors.checkIn = 'Fecha de entrada requerida';
    }
    
    if (!formData.checkOut) {
      errors.checkOut = 'Fecha de salida requerida';
    }
    
    if (formData.checkIn && formData.checkOut) {
      if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
        errors.checkOut = 'La fecha de salida debe ser posterior a la entrada';
      }
    }
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Nombre completo requerido';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.dni.trim()) {
      errors.dni = selectedIdType === 'dni' ? 'DNI requerido' : 'Pasaporte requerido';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Mensaje requerido';
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Limpiar errores de validación al cambiar
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Auto-completar check-out si se selecciona check-in
    if (name === 'checkIn' && value && !formData.checkOut) {
      const checkOutDate = new Date(value);
      checkOutDate.setDate(checkOutDate.getDate() + 2); // 2 noches por defecto
      setFormData(prevState => ({
        ...prevState,
        checkOut: checkOutDate.toISOString().split('T')[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar que el usuario esté autenticado
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para hacer una reserva');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Obtener el token de autenticación
      const token = localStorage.getItem('baconfort-token');
      
      if (!token) {
        alert('Debes iniciar sesión para hacer una reserva');
        setAuthMode('login');
        setShowAuthModal(true);
        return;
      }
      
      // Obtener propertyId desde la URL actual
      const path = window.location.pathname;
      const propertyId = path.split('/').pop(); // Último segmento de la URL
      
      // Calcular precio si hay datos disponibles
      const nights = priceCalculation.nights;
      const calculatedTotal = priceCalculation.totalPrice;
      const currency = priceCalculation.currency;
      
      // Preparar datos limpios para enviar
      const dataToSend = {
        propertyId,
        propertyName: apartmentName,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone || '',
        dni: formData.dni.trim(),
        idType: selectedIdType,
        message: formData.message.trim(),
        // Agregar información de precio si está disponible
        ...(calculatedTotal > 0 && {
          priceInfo: {
            totalAmount: calculatedTotal,
            currency: currency,
            nights: nights,
            period: priceCalculation.period,
            breakdown: priceCalculation.breakdown,
            pricePerNight: priceCalculation.pricePerDay
          }
        })
      };
      
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        console.log('Reserva creada:', data);
      } else {
        setSubmitStatus('error');
        alert(data.message || 'Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error enviando reserva:', error);
      setSubmitStatus('error');
      alert('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reservation-form-container">
      <h3 className="reservation-title">Reserva este departamento</h3>
      
      {!isAuthenticated() ? (
        <div className="auth-required">
          <div className="auth-required-content">
            <i className="fas fa-user-lock"></i>
            <h4>Inicia sesión para hacer una reserva</h4>
            <p>Para procesar tu reserva de manera segura y mantener un historial de tus reservas, necesitas estar registrado.</p>
            
            <div className="auth-benefits">
              <h4>Beneficios de registrarte:</h4>
              <ul>
                <li><i className="fas fa-check"></i> Datos autocompletados para reservas más rápidas</li>
                <li><i className="fas fa-check"></i> Historial de todas tus reservas</li>
                <li><i className="fas fa-check"></i> Comunicación directa y segura</li>
                <li><i className="fas fa-check"></i> Ofertas y descuentos exclusivos</li>
              </ul>
            </div>
            
            <div className="auth-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
              >
                <i className="fas fa-sign-in-alt"></i>
                Iniciar Sesión
              </button>
              
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
              >
                <i className="fas fa-user-plus"></i>
                Registrarse Gratis
              </button>
            </div>
          </div>
        </div>
      ) : submitStatus === 'success' ? (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <h4>¡Solicitud de reserva enviada exitosamente!</h4>
          
          <div className="success-content">
            <div className="success-info">
              <p><strong>Tu solicitud ha sido procesada correctamente.</strong></p>
              <p>Te hemos enviado un email de confirmación con todos los detalles.</p>
              <p><strong>⚠️ La seña correspondiente deberá ser abonada para validar la reserva.</strong></p>
            </div>
            
            <div className="reservation-summary">
              <h5>📋 Resumen de tu reserva:</h5>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">📅 Check-in:</span>
                  <span className="value">{formData.checkIn}</span>
                </div>
                <div className="summary-item">
                  <span className="label">📅 Check-out:</span>
                  <span className="value">{formData.checkOut}</span>
                </div>
                <div className="summary-item">
                  <span className="label">👥 Huéspedes:</span>
                  <span className="value">{formData.guests} persona(s)</span>
                </div>
                <div className="summary-item">
                  <span className="label">👤 Nombre:</span>
                  <span className="value">{formData.fullName}</span>
                </div>
                <div className="summary-item">
                  <span className="label">📧 Email:</span>
                  <span className="value">{formData.email}</span>
                </div>
                {formData.phone && (
                  <div className="summary-item">
                    <span className="label">📱 Teléfono:</span>
                    <span className="value">{formData.phone}</span>
                  </div>
                )}
                <div className="summary-item">
                  <span className="label">🆔 {selectedIdType === 'dni' ? 'DNI' : 'Pasaporte'}:</span>
                  <span className="value">{formData.dni}</span>
                </div>
                <div className="summary-item">
                  <span className="label">💰 Monto total:</span>
                  <span className="value">
                    {priceCalculation.totalPrice > 0 
                      ? `${priceCalculation.currency === 'USD' ? 'US$' : '$'}${priceCalculation.totalPrice.toLocaleString()}`
                      : 'A confirmar según disponibilidad'
                    }
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">🔒 Seña requerida:</span>
                  <span className="value">
                    {priceCalculation.totalPrice > 0 
                      ? `${priceCalculation.currency === 'USD' ? 'US$' : '$'}${Math.round(priceCalculation.totalPrice * 0.3).toLocaleString()} (30%)`
                      : '30% del total para confirmar reserva'
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="next-steps">
              <h5>📋 Próximos pasos:</h5>
              <div className="steps-list">
                <div className="step">
                  <span className="step-icon">✅</span>
                  <span>Confirmaremos disponibilidad y precio en las próximas 24 horas</span>
                </div>
                <div className="step">
                  <span className="step-icon">📧</span>
                  <span>Revisa tu email para detalles de pago y monto total</span>
                </div>
                <div className="step">
                  <span className="step-icon">💳</span>
                  <span>Abona la seña del 30% para confirmar tu reserva</span>
                </div>
                <div className="step">
                  <span className="step-icon">🏠</span>
                  <span>¡Disfruta tu estadía una vez confirmado el pago!</span>
                </div>
              </div>
              
              <div className="payment-info">
                <h6>💡 Información importante:</h6>
                <ul>
                  <li>La seña del 30% confirma tu reserva</li>
                  <li>El saldo restante se abona al check-in</li>
                  <li>Aceptamos transferencia bancaria y efectivo</li>
                  <li>Los datos para transferencia llegaran por email</li>
                </ul>
              </div>
            </div>
          </div>
          
          <button 
            type="button" 
            className="reset-btn"
            onClick={() => setSubmitStatus(null)}
          >
            <i className="fas fa-plus"></i>
            Hacer otra reserva
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="reservation-form">
          <div className="date-row">
            <div className="form-group">
              <label htmlFor="checkIn">Check-in</label>
              <input 
                type="date" 
                id="checkIn" 
                name="checkIn" 
                value={formData.checkIn} 
                onChange={handleChange} 
                min={today}
                className={validationErrors.checkIn ? 'error' : ''}
                required 
              />
              {validationErrors.checkIn && (
                <span className="error-text">{validationErrors.checkIn}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="checkOut">Check-out</label>
              <input 
                type="date" 
                id="checkOut" 
                name="checkOut" 
                value={formData.checkOut} 
                onChange={handleChange} 
                min={formData.checkIn || today}
                className={validationErrors.checkOut ? 'error' : ''}
                required 
              />
              {validationErrors.checkOut && (
                <span className="error-text">{validationErrors.checkOut}</span>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="guests">Huéspedes</label>
            <select 
              id="guests" 
              name="guests" 
              value={formData.guests} 
              onChange={handleChange} 
              required
            >
              <option value="1">1 huésped</option>
              <option value="2">2 huéspedes</option>
              <option value="3">3 huéspedes</option>
              <option value="4">4 huéspedes</option>
              <option value="5">5 huéspedes</option>
              <option value="6">6+ huéspedes</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="fullName">Nombre completo *</label>
            <input 
              type="text" 
              id="fullName" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              placeholder="Tu nombre completo"
              className={validationErrors.fullName ? 'error' : ''}
              required 
            />
            {validationErrors.fullName && (
              <span className="error-text">{validationErrors.fullName}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="tu@email.com"
              className={validationErrors.email ? 'error' : ''}
              required 
            />
            {validationErrors.email && (
              <span className="error-text">{validationErrors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="idType">Tipo de documento *</label>
            <select 
              id="idType" 
              name="idType" 
              value={selectedIdType} 
              onChange={(e) => setSelectedIdType(e.target.value)}
              required
            >
              <option value="dni">DNI</option>
              <option value="passport">Pasaporte</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="dni">{selectedIdType === 'dni' ? 'DNI' : 'Pasaporte'} *</label>
            <input 
              type="text" 
              id="dni" 
              name="dni" 
              value={formData.dni} 
              onChange={handleChange} 
              placeholder={selectedIdType === 'dni' ? 'Tu número de DNI' : 'Tu número de pasaporte'}
              className={validationErrors.dni ? 'error' : ''}
              required 
            />
            {validationErrors.dni && (
              <span className="error-text">{validationErrors.dni}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Teléfono (opcional)</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="+54 9 11 1234-5678"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Mensaje *</label>
            <textarea 
              id="message" 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              rows="4"
              placeholder="Escribe tu consulta sobre disponibilidad..."
              className={validationErrors.message ? 'error' : ''}
              required 
            ></textarea>
            {validationErrors.message && (
              <span className="error-text">{validationErrors.message}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando reserva...' : 'Reservar'}
          </button>
          
          <p className="disclaimer">No se realizará ningún cargo hasta confirmar la disponibilidad</p>
        </form>
      )}

      {/* Modal de autenticación */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default ReservationForm;