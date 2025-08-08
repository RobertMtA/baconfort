import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import { useAuth } from '../../context/AuthContextAPI';
import { reviewsAPI } from '../../services/api';
import AuthModal from '../Auth/AuthModal';
import './GuestReviewForm.css';

function GuestReviewForm({ propertyId, propertyTitle, onReviewSubmitted }) {
  const { data } = useAdmin();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [guestReview, setGuestReview] = useState({
    guestName: '',
    rating: 5,
    comment: '',
    date: new Date().toISOString().split('T')[0],
    verified: false,
    highlight: false,
    status: 'pending'
  });

  // Autocompletar el nombre si el usuario está logueado, solo si está vacío
  useEffect(() => {
    if (user && user.name) {
      setGuestReview(prev => ({
        ...prev,
        guestName: prev.guestName || user.name,
        userId: user._id,
        userEmail: user.email
      }));
    }
  }, [user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    // Verificar que el usuario esté registrado
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para dejar una reseña');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    
    if (!guestReview.guestName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }

    if (!guestReview.comment.trim()) {
      alert('Por favor escribe tu comentario');
      return;
    }

    if (guestReview.comment.length < 10) {
      alert('Por favor escribe un comentario más detallado (mínimo 10 caracteres)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para enviar al backend
      const reviewData = {
        propertyId: propertyId,
        guestName: guestReview.guestName.trim(),
        guestEmail: user?.email || '', // Usar email del usuario logueado
        rating: guestReview.rating,
        comment: guestReview.comment.trim(),
        stayDates: guestReview.date ? [guestReview.date] : [],
        language: 'es'
      };

      console.log('📝 REVIEW: Enviando reseña al backend:', reviewData);

      // Enviar reseña al backend
      const response = await reviewsAPI.submitReview(reviewData);
      
      if (response.success) {
        console.log('✅ REVIEW: Reseña enviada exitosamente al backend');
        
        // Llamar callback si existe para actualizar la lista de reseñas
        if (onReviewSubmitted && response.data) {
          onReviewSubmitted(response.data);
        }
        
        // También llamar a la función callback para actualizar la lista local
        if (onReviewSubmitted) {
          const localReview = {
            id: Date.now().toString(),
            ...guestReview,
            createdAt: new Date().toISOString(),
            isGuestSubmission: true,
            verified: false,
            status: 'pending',
            highlight: false
          };
          
          onReviewSubmitted(localReview);
        }
        
        // Mostrar mensaje de agradecimiento
        setShowThankYou(true);
        
        // Resetear formulario después de 3 segundos
        setTimeout(() => {
          setGuestReview({
            guestName: '',
            rating: 5,
            comment: '',
            date: new Date().toISOString().split('T')[0],
            verified: false,
            highlight: false,
            status: 'pending'
          });
          setShowThankYou(false);
        }, 3000);
      }
      
    } catch (error) {
      console.error('❌ REVIEW: Error enviando reseña:', error);
      alert(`Error al enviar la reseña: ${error.message}. Por favor intenta nuevamente.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className={`guest-stars ${interactive ? 'interactive' : ''}`}>
        {[1, 2, 3, 4, 5].map(star => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? 'filled' : 'empty'}`}
            onClick={interactive && onChange ? () => onChange(star) : null}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />
        ))}
      </div>
    );
  };

  if (showThankYou) {
    return (
      <div className="guest-review-form">
        <div className="thank-you-message">
          <div className="thank-you-content">
            <i className="fas fa-check-circle"></i>
            <h3>¡Gracias por tu reseña{user ? `, ${user.name}` : ''}!</h3>
            <p>Tu opinión es muy importante para nosotros y otros huéspedes.</p>
            {user ? (
              <p>Como usuario registrado, tu reseña será procesada más rápidamente.</p>
            ) : (
              <p>Tu reseña será visible en breve.</p>
            )}
            {user && (
              <small className="user-info">
                <i className="fas fa-user-check"></i>
                Reseña enviada por: {user.email}
              </small>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guest-review-form">
      {!isAuthenticated() ? (
        <div className="auth-required">
          <div className="auth-required-content">
            <i className="fas fa-user-lock"></i>
            <h3>Inicia sesión para dejar una reseña</h3>
            <p>Para mantener la calidad y autenticidad de nuestras reseñas, solo usuarios registrados pueden dejar comentarios.</p>
            
            <div className="auth-benefits">
              <h4>Beneficios de registrarte:</h4>
              <ul>
                <li><i className="fas fa-check"></i> Dejar reseñas verificadas</li>
                <li><i className="fas fa-check"></i> Hacer reservas más rápido</li>
                <li><i className="fas fa-check"></i> Historial de reservas</li>
                <li><i className="fas fa-check"></i> Ofertas exclusivas</li>
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
                Registrarse
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="form-header">
            <h3>
              <i className="fas fa-star"></i>
              Deja tu Reseña
            </h3>
            <p>
              Comparte tu experiencia en {propertyTitle}
            </p>
          </div>

          <form onSubmit={handleSubmitReview} className="review-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="guestName">
              Tu nombre *
              {user && (
                <span className="user-badge">
                  <i className="fas fa-user-check"></i>
                  Usuario registrado
                </span>
              )}
            </label>
            <input
              id="guestName"
              type="text"
              value={guestReview.guestName}
              onChange={(e) => setGuestReview(prev => ({ ...prev, guestName: e.target.value }))}
              placeholder={user ? "Nombre autocompletado" : "Ej: María González"}
              required
              maxLength={50}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Tu calificación *</label>
            <div className="rating-container">
              {renderStars(guestReview.rating, true, (rating) => 
                setGuestReview(prev => ({ ...prev, rating }))
              )}
              <span className="rating-text">({guestReview.rating}/5)</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="guestComment">Tu experiencia *</label>
          <textarea
            id="guestComment"
            value={guestReview.comment}
            onChange={(e) => setGuestReview(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Cuéntanos sobre tu estadía: ¿qué te gustó más? ¿recomendarías este lugar? ¿alguna sugerencia?"
            rows="4"
            required
            maxLength={500}
            disabled={isSubmitting}
          />
          <small className="char-count">
            {guestReview.comment.length}/500 caracteres
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="stayDate">Fecha de tu estadía</label>
          <input
            id="stayDate"
            type="date"
            value={guestReview.date}
            onChange={(e) => setGuestReview(prev => ({ ...prev, date: e.target.value }))}
            max={new Date().toISOString().split('T')[0]}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting || !guestReview.guestName.trim() || !guestReview.comment.trim()}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Enviando...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Enviar Reseña
              </>
            )}
          </button>
        </div>

        <div className="form-footer">
          <small>
            <i className="fas fa-shield-alt"></i>
            Tu reseña será verificada y publicada en breve. Respetamos tu privacidad.
          </small>
        </div>
      </form>
        </>
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

export default GuestReviewForm;
