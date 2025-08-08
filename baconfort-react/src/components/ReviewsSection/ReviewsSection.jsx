import { useState } from 'react';
import { usePropertyReviews } from '../../hooks/usePropertyReviews';
import GuestReviewForm from '../GuestReviewForm/GuestReviewForm';
import './ReviewsSection.css';

function ReviewsSection({ propertyId, className = "" }) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);

  const {
    reviews,
    loading,
    error,
    stats,
    getDisplayReviews,
    addReview
  } = usePropertyReviews(propertyId);

  const displayReviews = getDisplayReviews(showAllReviews);

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? 'filled' : 'empty'}`}
          />
        ))}
      </div>
    );
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <section className={`reviews-section ${className}`} id="reseñas">
        <div className="container">
          <div className="reviews-header">
            <h2>
              <i className="fas fa-star"></i>
              Reseñas de Huéspedes
            </h2>
          </div>
          <div className="reviews-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando reseñas...</p>
          </div>
        </div>
      </section>
    );
  }

  // Mostrar error si hay problemas
  if (error) {
    return (
      <section className={`reviews-section ${className}`} id="reseñas">
        <div className="container">
          <div className="reviews-header">
            <h2>
              <i className="fas fa-star"></i>
              Reseñas de Huéspedes
            </h2>
          </div>
          <div className="reviews-error">
            <i className="fas fa-exclamation-triangle"></i>
            <p>Error cargando reseñas: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  const averageRating = stats.averageRating;
  const distribution = stats.distribution;

  return (
    <section className={`reviews-section ${className}`} id="reseñas">
      <div className="container">
        <div className="reviews-header">
          <h2>
            <i className="fas fa-star"></i>
            Reseñas de Huéspedes
          </h2>
          
          {stats.total > 0 && (
            <div className="rating-summary">
              <div className="rating-main">
                <div className="rating-display">
                  {renderStars(Math.round(averageRating))}
                  <span className="rating-number">{averageRating}</span>
                </div>
                <p className="rating-text">
                  Basado en {stats.total} reseña{stats.total !== 1 ? 's' : ''} verificada{stats.total !== 1 ? 's' : ''}
                </p>
              </div>
              
              {stats.total > 1 && (
                <div className="rating-breakdown">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = distribution[rating];
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    
                    return (
                      <div key={rating} className="rating-bar">
                        <span className="rating-label">{rating}</span>
                        <div className="bar-container">
                          <div 
                            className="bar-fill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="rating-count">({count})</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* Botón para dejar reseña */}
          <div className="leave-review-action">
            <button 
              onClick={() => setShowGuestForm(!showGuestForm)}
              className="btn-leave-review"
            >
              <i className="fas fa-edit"></i>
              {showGuestForm ? 'Ocultar Formulario' : 'Deja tu Reseña'}
            </button>
          </div>
        </div>

        {/* Formulario para huéspedes */}
        {showGuestForm && (
          <GuestReviewForm 
            propertyId={propertyId} 
            propertyTitle={`Departamento ${propertyId}`}
            onReviewSubmitted={addReview}
          />
        )}

        {/* Reseñas existentes */}
        {displayReviews.length > 0 && (
          <div className="reviews-grid">
            {displayReviews.map(review => (
              <div 
                key={review._id || review.id} 
                className={`review-card ${review.isHighlight ? 'highlighted' : ''}`}
              >
                <div className="review-header">
                  <div className="guest-info">
                    <strong className="guest-name">{review.guestName}</strong>
                    <div className="review-meta">
                      {renderStars(review.rating)}
                      <span className="review-date">
                        {new Date(review.createdAt || review.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {review.isHighlight && (
                    <div className="highlight-badge">
                      <i className="fas fa-bookmark"></i>
                    </div>
                  )}
                </div>
                
                <div className="review-comment">
                  <p>"{review.comment}"</p>
                </div>
                
                <div className="review-footer">
                  <span className="verified-badge">
                    <i className="fas fa-check-circle"></i>
                    Estadía verificada
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {stats.total > 4 && !showAllReviews && (
          <div className="reviews-actions">
            <button 
              onClick={() => setShowAllReviews(true)}
              className="btn btn-outline-primary"
            >
              Ver todas las reseñas ({stats.total})
            </button>
          </div>
        )}

        {showAllReviews && stats.total > 4 && (
          <div className="reviews-actions">
            <button 
              onClick={() => setShowAllReviews(false)}
              className="btn btn-outline-secondary"
            >
              Mostrar menos reseñas
            </button>
          </div>
        )}

        {stats.total === 0 && !showGuestForm && (
          <div className="no-reviews">
            <i className="fas fa-star-half-alt"></i>
            <h3>¡Sé el primero en dejar una reseña!</h3>
            <p>Comparte tu experiencia con otros huéspedes</p>
            <button 
              onClick={() => setShowGuestForm(true)}
              className="btn-leave-review primary"
            >
              <i className="fas fa-edit"></i>
              Escribir Primera Reseña
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ReviewsSection;
