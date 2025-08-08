import { useState, useEffect } from 'react';
import { reviewsAPI } from '../../services/api';
import './ReviewsAdmin.css';

function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedReview, setSelectedReview] = useState(null);
  const [moderatingId, setModeratingId] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [activeTab]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'pending') {
        response = await reviewsAPI.getAllReviews({ status: 'pending' });
      } else {
        response = await reviewsAPI.getAllReviews({ status: activeTab });
      }

      if (response.success) {
        setReviews(response.data || []);
        console.log(`✅ REVIEWS ADMIN: Cargadas ${response.data?.length || 0} reseñas ${activeTab}`);
      }
    } catch (error) {
      console.error('❌ REVIEWS ADMIN: Error cargando reseñas:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId, action, notes = '') => {
    try {
      setModeratingId(reviewId);
      console.log(`🔍 REVIEWS ADMIN: Moderando reseña ${reviewId} con acción ${action}`);
      
      const response = await reviewsAPI.moderateReview(reviewId, action, notes);
      
      if (response.success) {
        console.log(`✅ REVIEWS ADMIN: Reseña ${action === 'approve' ? 'aprobada' : 'rechazada'}`);
        // Recargar reseñas después de moderar
        await loadReviews();
        setSelectedReview(null);
      }
    } catch (error) {
      console.error('❌ REVIEWS ADMIN: Error moderando reseña:', error);
      alert(`Error al ${action === 'approve' ? 'aprobar' : 'rechazar'} la reseña: ${error.message}`);
    } finally {
      setModeratingId(null);
    }
  };

  const handleToggleHighlight = async (reviewId, highlight) => {
    try {
      console.log(`⭐ REVIEWS ADMIN: ${highlight ? 'Destacando' : 'Quitando destaque'} reseña ${reviewId}`);
      
      const response = await reviewsAPI.toggleHighlight(reviewId, highlight);
      
      if (response.success) {
        console.log(`✅ REVIEWS ADMIN: Reseña ${highlight ? 'destacada' : 'sin destacar'}`);
        await loadReviews();
      }
    } catch (error) {
      console.error('❌ REVIEWS ADMIN: Error cambiando destaque:', error);
      alert(`Error al ${highlight ? 'destacar' : 'quitar destaque'}: ${error.message}`);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return;
    }

    try {
      console.log(`🗑️ REVIEWS ADMIN: Eliminando reseña ${reviewId}`);
      
      const response = await reviewsAPI.deleteReview(reviewId);
      
      if (response.success) {
        console.log('✅ REVIEWS ADMIN: Reseña eliminada');
        await loadReviews();
        setSelectedReview(null);
      }
    } catch (error) {
      console.error('❌ REVIEWS ADMIN: Error eliminando reseña:', error);
      alert(`Error al eliminar la reseña: ${error.message}`);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? 'filled' : 'empty'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (review) => {
    if (review.isApproved) {
      return <span className="badge badge-success">Aprobada</span>;
    } else if (review.isRejected) {
      return <span className="badge badge-danger">Rechazada</span>;
    } else {
      return <span className="badge badge-warning">Pendiente</span>;
    }
  };

  return (
    <div className="reviews-admin">
      <div className="reviews-admin-header">
        <h2><i className="fas fa-star"></i> Gestión de Reseñas</h2>
        <p>Modera las reseñas enviadas por los huéspedes</p>
      </div>

      <div className="reviews-tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <i className="fas fa-clock"></i> Pendientes ({reviews.filter(r => !r.isApproved && !r.isRejected).length})
        </button>
        <button 
          className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <i className="fas fa-check"></i> Aprobadas
        </button>
        <button 
          className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          <i className="fas fa-times"></i> Rechazadas
        </button>
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <i className="fas fa-list"></i> Todas
        </button>
      </div>

      {loading ? (
        <div className="reviews-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando reseñas...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="reviews-empty">
          <i className="fas fa-comment-slash"></i>
          <h3>No hay reseñas {activeTab === 'all' ? '' : activeTab}</h3>
          <p>
            {activeTab === 'pending' 
              ? 'No hay reseñas pendientes de moderación.'
              : `No hay reseñas ${activeTab}.`
            }
          </p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="review-property">
                  <i className="fas fa-home"></i>
                  <strong>{review.propertyId}</strong>
                </div>
                <div className="review-status">
                  {getStatusBadge(review)}
                  {review.isHighlight && (
                    <span className="badge badge-star">
                      <i className="fas fa-star"></i> Destacada
                    </span>
                  )}
                </div>
              </div>

              <div className="review-content">
                <div className="review-meta">
                  <div className="guest-info">
                    <i className="fas fa-user"></i>
                    <strong>{review.guestName}</strong>
                    {review.user && (
                      <span className="user-badge">
                        <i className="fas fa-user-check"></i> Usuario registrado
                      </span>
                    )}
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                    <span>({review.rating}/5)</span>
                  </div>
                </div>

                <div className="review-text">
                  <p>"{review.comment}"</p>
                </div>

                <div className="review-footer">
                  <div className="review-date">
                    <i className="fas fa-calendar"></i>
                    {formatDate(review.createdAt)}
                  </div>
                  
                  <div className="review-actions">
                    {!review.isApproved && !review.isRejected && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleModerate(review._id, 'approve')}
                          disabled={moderatingId === review._id}
                        >
                          {moderatingId === review._id ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-check"></i>
                          )}
                          Aprobar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleModerate(review._id, 'reject')}
                          disabled={moderatingId === review._id}
                        >
                          {moderatingId === review._id ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-times"></i>
                          )}
                          Rechazar
                        </button>
                      </>
                    )}
                    
                    {review.isApproved && (
                      <button
                        className={`btn btn-sm ${review.isHighlight ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => handleToggleHighlight(review._id, !review.isHighlight)}
                      >
                        <i className="fas fa-star"></i>
                        {review.isHighlight ? 'Quitar destaque' : 'Destacar'}
                      </button>
                    )}
                    
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(review._id)}
                    >
                      <i className="fas fa-trash"></i>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsAdmin;
