import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContextAPI';
import { useAllOccupiedDates } from '../../hooks/useAllOccupiedDates';
import AuthModal from '../Auth/AuthModal';
import { sendInquiry, sendAuthenticatedInquiry } from '../../services/api';
import DatePickerWithAvailability from '../DatePickerWithAvailability/DatePickerWithAvailability';
import './AvailabilityInquiryForm.css';

const AvailabilityInquiryForm = ({ apartmentName, propertyId }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Hook para obtener fechas ocupadas (reservas + bloqueos manuales)
  const { occupiedDates, loading: datesLoading } = useAllOccupiedDates(propertyId);
  
  // DEBUG: Verificar fechas ocupadas en el formulario
  React.useEffect(() => {
    console.log(`🏗️ [AvailabilityInquiryForm] ${propertyId} - Fechas ocupadas:`, occupiedDates);
    if (occupiedDates.includes('2025-07-29') || occupiedDates.includes('2025-07-30')) {
      console.log(`✅ [AvailabilityInquiryForm] Fechas 29-30 julio detectadas en el formulario!`);
    }
  }, [occupiedDates, propertyId]);
  
  const [formData, setFormData] = useState({
    checkIn: '', // Cambiado a string vacío para DatePicker
    checkOut: '', // Cambiado a string vacío para DatePicker
    guests: '1',
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dni: '',
    passport: '',
    customMessage: `Hola, me interesa consultar disponibilidad para ${apartmentName}. ¿Está disponible para las fechas indicadas? Por favor contactarme a mi email o teléfono. Saludos.`
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [validationErrors, setValidationErrors] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [selectedIdType, setSelectedIdType] = useState(''); // 'dni' o 'passport'

  // Fecha mínima (hoy) como string para DatePicker
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para DNI - solo números
    if (name === 'dni') {
      const numericValue = value.replace(/\D/g, ''); // Remover caracteres no numéricos
      if (numericValue.length <= 8) { // Máximo 8 dígitos
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
      
      // Limpiar errores al cambiar
      if (validationErrors[name]) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: null
        }));
      }
      return;
    }
    
    // Validación especial para Pasaporte - letras y números, máximo 20 caracteres
    if (name === 'passport') {
      const alphanumericValue = value.replace(/[^A-Za-z0-9]/g, ''); // Solo letras y números
      if (alphanumericValue.length <= 20) { // Máximo 20 caracteres
        setFormData(prev => ({
          ...prev,
          [name]: alphanumericValue.toUpperCase()
        }));
      }
      
      // Limpiar errores al cambiar
      if (validationErrors[name]) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: null
        }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores al cambiar
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.checkIn) {
      errors.checkIn = 'Fecha de entrada requerida';
    }

    if (!formData.checkOut) {
      errors.checkOut = 'Fecha de salida requerida';
    }

    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      if (checkOutDate <= checkInDate) {
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

    if (!formData.customMessage.trim()) {
      errors.customMessage = 'Mensaje requerido';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Validar que las fechas no sean vacías
      if (!formData.checkIn || !formData.checkOut) {
        throw new Error('Las fechas de check-in y check-out son requeridas');
      }

      // Convertir strings de fecha a objetos Date para cálculos
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);

      console.log('🔍 DEBUG: checkIn string:', formData.checkIn);
      console.log('🔍 DEBUG: checkOut string:', formData.checkOut);
      console.log('🔍 DEBUG: checkInDate object:', checkInDate);
      console.log('🔍 DEBUG: checkOutDate object:', checkOutDate);

      // Calcular precio estimado (simplificado)
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const estimatedPrice = nights * 70; // Precio base estimado

      // Formatear fechas en formato DD/MM/YYYY para consistencia con el backend
      const formatDate = (dateString) => {
        if (!dateString) {
          console.warn('⚠️ formatDate: Fecha string es vacía');
          return '';
        }
        
        // Crear objeto Date desde string YYYY-MM-DD
        const dateObj = new Date(dateString);
        
        // Verificar que sea un objeto Date válido
        if (isNaN(dateObj.getTime())) {
          console.error('❌ formatDate: No se pudo crear Date válido desde:', dateString);
          return '';
        }
        
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        const formatted = `${day}/${month}/${year}`;
        console.log('✅ formatDate: Fecha formateada:', `${dateString} -> ${formatted}`);
        return formatted;
      };

      const inquiryData = {
        propertyId,
        propertyTitle: apartmentName,
        checkIn: formatDate(formData.checkIn),
        checkOut: formatDate(formData.checkOut),
        guests: parseInt(formData.guests),
        totalPrice: estimatedPrice,
        guestName: formData.fullName,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        guestDni: formData.dni,
        guestPassport: formData.passport,
        customMessage: formData.customMessage
      };

      console.log('🔄 Enviando consulta de disponibilidad...');
      console.log('📋 Datos de consulta:', inquiryData);
      console.log('🔐 Usuario autenticado:', isAuthenticated);

      // Usar el endpoint correcto según el estado de autenticación
      const response = isAuthenticated 
        ? await sendAuthenticatedInquiry(inquiryData)
        : await sendInquiry(inquiryData);

      console.log('✅ Respuesta de consulta:', response);

      if (response.success) {
        setSubmitStatus('success');
      } else {
        throw new Error(response.message || 'Error al enviar la consulta');
      }

    } catch (error) {
      console.error('Error enviando consulta:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitStatus(null);
    setFormData({
      checkIn: '',
      checkOut: '',
      guests: '1',
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dni: '',
      passport: '',
      customMessage: `Hola, me interesa consultar disponibilidad para ${apartmentName}. ¿Está disponible para las fechas indicadas? Por favor contactarme a mi email o teléfono. Saludos.`
    });
    setValidationErrors({});
  };

  if (submitStatus === 'success') {
    return (
      <div className="inquiry-form-container">
        <div className="success-message">
          <div className="success-content">
            <i className="fas fa-check-circle"></i>
            <h4>¡Consulta enviada exitosamente!</h4>
            <p>Tu consulta de disponibilidad ha sido enviada y está siendo revisada por nuestro equipo.</p>
            <p>Te notificaremos por email tan pronto como tengamos una respuesta.</p>
            
            <div className="success-details">
              <h5>Detalles de tu consulta:</h5>
              <ul>
                <li><strong>Propiedad:</strong> {apartmentName}</li>
                <li><strong>Check-in:</strong> {formData.checkIn ? new Date(formData.checkIn).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'No especificado'}</li>
                <li><strong>Check-out:</strong> {formData.checkOut ? new Date(formData.checkOut).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'No especificado'}</li>
                <li><strong>Huéspedes:</strong> {formData.guests}</li>
                <li><strong>Estado:</strong> Pendiente de respuesta</li>
              </ul>
            </div>

            <div className="next-steps">
              <h5>¿Qué sigue?</h5>
              <ol>
                <li>Nuestro equipo revisará tu consulta</li>
                <li>Verificaremos la disponibilidad de las fechas</li>
                <li>Te enviaremos un email con la respuesta</li>
                <li>Si está disponible, podrás proceder con la reserva</li>
              </ol>
            </div>

            <button 
              className="new-inquiry-btn"
              onClick={resetForm}
            >
              <i className="fas fa-plus"></i>
              Nueva consulta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitStatus === 'error') {
    return (
      <div className="inquiry-form-container">
        <div className="error-message">
          <div className="error-content">
            <i className="fas fa-exclamation-triangle"></i>
            <h4>Error al enviar la consulta</h4>
            <p>Hubo un problema al procesar tu consulta. Por favor, intenta nuevamente.</p>
            
            <button 
              className="retry-btn"
              onClick={() => setSubmitStatus(null)}
            >
              <i className="fas fa-redo"></i>
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inquiry-form-container">
      <div className="form-header">
        <h3 className="inquiry-title">
          <i className="fas fa-calendar-check"></i>
          Consultar Disponibilidad
        </h3>
        <p className="form-description">
          Envía una consulta para verificar si {apartmentName} está disponible en las fechas que necesitas.
          Te responderemos por email lo antes posible.
        </p>
      </div>

      {!isAuthenticated() ? (
        <div className="auth-required">
          <div className="auth-required-content">
            <i className="fas fa-user-lock"></i>
            <h4>Regístrate o inicia sesión para consultar disponibilidad</h4>
            <p>Para enviar consultas de disponibilidad y recibir respuestas por email, necesitas tener una cuenta registrada.</p>
            
            <div className="auth-benefits">
              <h5>¿Por qué necesitas una cuenta?</h5>
              <ul>
                <li><i className="fas fa-check"></i> Recibir respuestas directamente en tu email</li>
                <li><i className="fas fa-check"></i> Historial de tus consultas y reservas</li>
                <li><i className="fas fa-check"></i> Comunicación segura y personalizada</li>
                <li><i className="fas fa-check"></i> Acceso a ofertas exclusivas</li>
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
      ) : (
        <form onSubmit={handleSubmit} className="inquiry-form">
          <div className="date-row">
            <div className="form-group">
              <DatePickerWithAvailability
                id="checkIn"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                min={today}
                occupiedDates={occupiedDates} // Usar fechas ocupadas reales
                className={validationErrors.checkIn ? 'error' : ''}
                required
                label="Fecha de entrada *"
              />
              {validationErrors.checkIn && (
                <span className="error-text">{validationErrors.checkIn}</span>
              )}
            </div>

            <div className="form-group">
              <DatePickerWithAvailability
                id="checkOut"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                min={formData.checkIn || today}
                occupiedDates={occupiedDates} // Usar fechas ocupadas reales
                className={validationErrors.checkOut ? 'error' : ''}
                required
                label="Fecha de salida *"
              />
              {validationErrors.checkOut && (
                <span className="error-text">{validationErrors.checkOut}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="guests">Número de huéspedes</label>
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

          <div className="form-group identification-dropdown" style={{ marginBottom: '20px' }}>
            <label htmlFor="idType" style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
              Tipo de documento (opcional)
            </label>
            
            {/* Select simple para tipo de documento */}
            <select 
              id="idType"
              name="idType"
              value={selectedIdType}
              onChange={(e) => {
                const newType = e.target.value;
                setSelectedIdType(newType);
                // Limpiar el campo opuesto
                if (newType === 'dni') {
                  setFormData(prev => ({ ...prev, passport: '' }));
                } else if (newType === 'passport') {
                  setFormData(prev => ({ ...prev, dni: '' }));
                } else {
                  // Si selecciona vacío, limpiar ambos campos
                  setFormData(prev => ({ ...prev, dni: '', passport: '' }));
                }
              }}
              style={{ marginBottom: '10px' }}
            >
              <option value="">Sin documento (opcional)</option>
              <option value="dni">🇦🇷 DNI - Documento Nacional de Identidad</option>
              <option value="passport">🌍 Pasaporte - Documento Internacional</option>
            </select>
            
            {/* Campo de entrada según la selección */}
            {selectedIdType === 'dni' && (
              <div>
                <input 
                  type="text" 
                  id="dni" 
                  name="dni" 
                  value={formData.dni} 
                  onChange={handleChange}
                  placeholder="Ej: 12345678"
                  maxLength="8"
                  pattern="[0-9]*"
                  autoComplete="off"
                />
                <small style={{ fontSize: '11px', color: '#666', marginTop: '5px', display: 'block' }}>
                  Solo números, 7 u 8 dígitos
                </small>
              </div>
            )}
            
            {selectedIdType === 'passport' && (
              <div>
                <input 
                  type="text" 
                  id="passport" 
                  name="passport" 
                  value={formData.passport} 
                  onChange={handleChange}
                  placeholder="Ej: A12345678"
                  maxLength="20"
                  autoComplete="off"
                  style={{ textTransform: 'uppercase' }}
                />
                <small style={{ fontSize: '11px', color: '#666', marginTop: '5px', display: 'block' }}>
                  Letras y números, mínimo 6 caracteres
                </small>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="customMessage">Mensaje personalizado *</label>
            <textarea
              id="customMessage"
              name="customMessage"
              value={formData.customMessage}
              onChange={handleChange}
              rows="4"
              placeholder="Escribe tu consulta sobre disponibilidad..."
              className={validationErrors.customMessage ? 'error' : ''}
              required
            />
            {validationErrors.customMessage && (
              <span className="error-text">{validationErrors.customMessage}</span>
            )}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Enviando consulta...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Enviar consulta de disponibilidad
              </>
            )}
          </button>

          <div className="form-note">
            <i className="fas fa-info-circle"></i>
            <span>Esta es una consulta de disponibilidad. Te responderemos por email si las fechas están disponibles.</span>
          </div>
        </form>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
};

export default AvailabilityInquiryForm;
