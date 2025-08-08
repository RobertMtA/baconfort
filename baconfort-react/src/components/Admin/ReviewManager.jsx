import { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import './ReviewManager.css';

function ReviewManager() {
  const { data, updateProperty, moderateReview, deleteReview: deleteReviewFromContext } = useAdmin();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [newReview, setNewReview] = useState({
    guestName: '',
    rating: 5,
    comment: '',
    date: new Date().toISOString().split('T')[0],
    verified: true,
    highlight: false
  });
  const [editingReview, setEditingReview] = useState(null);
  const [filters, setFilters] = useState({
    rating: 'all',
    verified: 'all',
    highlight: 'all'
  });

  const properties = Object.values(data.properties);

  // Test directo de React - esto debería funcionar siempre
  const [testCounter, setTestCounter] = useState(0);
  
  // Refs como alternativa a los inputs controlados
  const nameInputRef = useRef(null);
  const commentTextareaRef = useRef(null);
  const dateInputRef = useRef(null);
  
  useEffect(() => {
    // Efecto de componente montado
  }, [testCounter]);

  const addReview = () => {
    if (!selectedProperty) {
      alert('Por favor selecciona una propiedad');
      return;
    }

    if (!newReview.guestName.trim()) {
      alert('Por favor ingresa el nombre del huésped');
      return;
    }

    if (!newReview.comment.trim()) {
      alert('Por favor ingresa un comentario');
      return;
    }

    try {
      const property = data.properties[selectedProperty];
      
      if (!property) {
        alert('Error: Propiedad no encontrada');
        return;
      }

      const review = {
        id: Date.now().toString(),
        ...newReview,
        createdAt: new Date().toISOString()
      };

      const currentReviews = property.reviews || [];
      const updatedReviews = [...currentReviews, review];

      updateProperty(selectedProperty, { reviews: updatedReviews });
      
      // Resetear formulario
      setNewReview({
        guestName: '',
        rating: 5,
        comment: '',
        date: new Date().toISOString().split('T')[0],
        verified: true,
        highlight: false
      });

      alert('Reseña agregada exitosamente');
      
    } catch (error) {
      console.error('Error agregando reseña:', error);
      alert('Error al agregar la reseña: ' + error.message);
    }
  };

  // Función alternativa usando refs
  const addReviewFromRefs = () => {
    if (!selectedProperty) {
      alert('Por favor selecciona una propiedad');
      return;
    }

    const guestName = nameInputRef.current?.value || '';
    const comment = commentTextareaRef.current?.value || '';
    const date = dateInputRef.current?.value || new Date().toISOString().split('T')[0];

    if (!guestName.trim()) {
      alert('Por favor ingresa el nombre del huésped');
      return;
    }

    if (!comment.trim()) {
      alert('Por favor ingresa un comentario');
      return;
    }

    try {
      const property = data.properties[selectedProperty];
      
      if (!property) {
        alert('Error: Propiedad no encontrada');
        return;
      }

      const review = {
        id: Date.now().toString(),
        guestName: guestName,
        rating: newReview.rating,
        comment: comment,
        date: date,
        verified: newReview.verified,
        highlight: newReview.highlight,
        createdAt: new Date().toISOString()
      };

      const currentReviews = property.reviews || [];
      const updatedReviews = [...currentReviews, review];

      updateProperty(selectedProperty, { reviews: updatedReviews });
      
      // Limpiar campos refs
      if (nameInputRef.current) nameInputRef.current.value = '';
      if (commentTextareaRef.current) commentTextareaRef.current.value = '';
      if (dateInputRef.current) dateInputRef.current.value = new Date().toISOString().split('T')[0];

      alert('Reseña agregada exitosamente (vía refs)');
      
    } catch (error) {
      console.error('Error agregando reseña:', error);
      alert('Error al agregar la reseña: ' + error.message);
    }
  };

  const updateReview = (reviewId, updatedData) => {
    if (!selectedProperty) return;

    const property = data.properties[selectedProperty];
    const updatedReviews = property.reviews.map(review =>
      review.id === reviewId ? { ...review, ...updatedData } : review
    );

    updateProperty(selectedProperty, { reviews: updatedReviews });
    setEditingReview(null);
  };

  const deleteReview = (reviewId) => {
    if (!selectedProperty) return;
    if (!window.confirm('¿Estás seguro de eliminar esta reseña?')) return;

    deleteReviewFromContext(selectedProperty, reviewId);
  };

  const toggleHighlight = (reviewId) => {
    if (!selectedProperty) return;

    const property = data.properties[selectedProperty];
    const updatedReviews = property.reviews.map(review =>
      review.id === reviewId ? { ...review, highlight: !review.highlight } : review
    );

    updateProperty(selectedProperty, { reviews: updatedReviews });
  };

  const getPropertyReviews = () => {
    if (!selectedProperty) return [];
    
    const property = data.properties[selectedProperty];
    let reviews = property.reviews || [];
    
    // Solo mostrar reseñas verificadas en la lista principal
    reviews = reviews.filter(review => review.verified);

    // Aplicar filtros
    if (filters.rating !== 'all') {
      reviews = reviews.filter(review => review.rating === parseInt(filters.rating));
    }
    if (filters.verified !== 'all') {
      reviews = reviews.filter(review => review.verified === (filters.verified === 'true'));
    }
    if (filters.highlight !== 'all') {
      reviews = reviews.filter(review => review.highlight === (filters.highlight === 'true'));
    }

    return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getPendingReviews = () => {
    if (!selectedProperty) return [];
    
    const property = data.properties[selectedProperty];
    const reviews = property.reviews || [];
    
    console.log('🔍 REVIEW MANAGER: Verificando reseñas pendientes para', selectedProperty);
    console.log('📋 Total de reseñas:', reviews.length);
    
    reviews.forEach((review, index) => {
      console.log(`📝 Reseña ${index + 1}:`, {
        id: review.id,
        guestName: review.guestName,
        verified: review.verified,
        status: review.status,
        isGuestSubmission: review.isGuestSubmission,
        isPending: review.status === 'pending' || (!review.verified && review.isGuestSubmission)
      });
    });
    
    const pendingReviews = reviews.filter(review => 
      review.status === 'pending' || (!review.verified && review.isGuestSubmission)
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log('⏳ Reseñas pendientes encontradas:', pendingReviews.length);
    
    return pendingReviews;
  };

  const handleApproveReview = (reviewId) => {
    moderateReview(selectedProperty, reviewId, 'approve');
  };

  const handleRejectReview = (reviewId) => {
    moderateReview(selectedProperty, reviewId, 'reject');
  };

  const getAverageRating = () => {
    if (!selectedProperty) return 0;
    
    const property = data.properties[selectedProperty];
    const reviews = property.reviews || [];
    const verifiedReviews = reviews.filter(r => r.verified);
    
    if (verifiedReviews.length === 0) return 0;
    
    const sum = verifiedReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / verifiedReviews.length).toFixed(1);
  };

  const getRatingStats = () => {
    if (!selectedProperty) return {};
    
    const property = data.properties[selectedProperty];
    const reviews = property.reviews || [];
    const verifiedReviews = reviews.filter(r => r.verified);
    const pendingCount = reviews.filter(r => !r.verified && (r.status === 'pending' || r.isGuestSubmission)).length;
    
    const stats = {
      total: verifiedReviews.length,
      totalIncludingPending: reviews.length,
      pending: pendingCount,
      average: getAverageRating(),
      verified: verifiedReviews.length,
      highlighted: verifiedReviews.filter(r => r.highlight).length,
      distribution: {}
    };

    // Distribución por estrellas (solo verificadas)
    for (let i = 1; i <= 5; i++) {
      stats.distribution[i] = verifiedReviews.filter(r => r.rating === i).length;
    }

    return stats;
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className={`stars ${interactive ? 'interactive' : ''}`}>
        {[1, 2, 3, 4, 5].map(star => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? 'filled' : 'empty'}`}
            onClick={interactive && onChange ? () => onChange(star) : null}
          />
        ))}
      </div>
    );
  };

  const stats = getRatingStats();
  const reviews = getPropertyReviews();
  const pendingReviews = getPendingReviews();

  return (
    <div className="review-manager">
      <div className="review-header">
        <h3><i className="fas fa-star"></i> Gestión de Reseñas y Puntuaciones</h3>
        
        {/* Test de React */}
        <div style={{
          background: '#e7f3ff',
          padding: '10px',
          border: '2px solid #007bff',
          borderRadius: '4px',
          margin: '10px 0'
        }}>
          <strong>🧪 Test de React:</strong> 
          <button 
            onClick={() => setTestCounter(prev => prev + 1)}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Contador: {testCounter}
          </button>
          <small style={{marginLeft: '10px', color: '#666'}}>
            (Si este botón funciona, React está OK)
          </small>
        </div>
      </div>

      {/* Selector de Propiedad */}
      <div className="form-group">
        <label>Seleccionar Propiedad:</label>
        <select 
          value={selectedProperty} 
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="form-control"
        >
          <option value="">Selecciona una propiedad</option>
          {properties.map(property => (
            <option key={property.id} value={property.id}>
              {property.title}
            </option>
          ))}
        </select>
      </div>

      {selectedProperty && (
        <>
          {/* Estadísticas */}
          <div className="review-stats">
            <div className="stat-card main-stat">
              <div className="rating-display">
                {renderStars(Math.round(stats.average))}
                <span className="rating-number">{stats.average}</span>
                <span className="rating-count">({stats.total} reseñas)</span>
              </div>
            </div>
            
            <div className="stat-card">
              <i className="fas fa-check-circle"></i>
              <span className="stat-number">{stats.verified}</span>
              <span className="stat-label">Verificadas</span>
            </div>
            
            <div className="stat-card">
              <i className="fas fa-bookmark"></i>
              <span className="stat-number">{stats.highlighted}</span>
              <span className="stat-label">Destacadas</span>
            </div>
            
            {stats.pending > 0 && (
              <div className="stat-card pending" style={{
                background: '#fff3cd',
                border: '2px solid #ffc107',
                color: '#856404'
              }}>
                <i className="fas fa-clock" style={{color: '#ffc107'}}></i>
                <span className="stat-number" style={{color: '#856404'}}>{stats.pending}</span>
                <span className="stat-label" style={{color: '#856404'}}>Pendientes</span>
              </div>
            )}
          </div>

          {/* Distribución de calificaciones */}
          {stats.total > 0 && (
            <div className="rating-distribution">
              <h4>Distribución de Calificaciones</h4>
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="rating-bar">
                  <span className="rating-label">{rating} ⭐</span>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{
                        width: stats.total > 0 ? `${(stats.distribution[rating] / stats.total) * 100}%` : '0%'
                      }}
                    ></div>
                  </div>
                  <span className="rating-count">({stats.distribution[rating]})</span>
                </div>
              ))}
            </div>
          )}

          {/* Sección de Reseñas Pendientes de Moderación */}
          {pendingReviews.length > 0 && (
            <div className="pending-reviews-section" style={{
              background: '#fff3cd',
              border: '2px solid #ffc107',
              borderRadius: '8px',
              padding: '20px',
              margin: '20px 0'
            }}>
              <h4 style={{color: '#856404', marginBottom: '20px'}}>
                <i className="fas fa-clock"></i> Reseñas Pendientes de Moderación ({pendingReviews.length})
              </h4>
              
              {pendingReviews.map(review => (
                <div key={review.id} className="pending-review-card" style={{
                  background: '#fff',
                  border: '1px solid #ffc107',
                  borderRadius: '6px',
                  padding: '15px',
                  marginBottom: '15px'
                }}>
                  <div className="review-header">
                    <div className="guest-info">
                      <strong style={{color: '#856404'}}>{review.guestName}</strong>
                      <div className="review-meta">
                        {renderStars(review.rating)}
                        <span className="review-date" style={{color: '#666'}}>
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                        <span className="review-timestamp" style={{color: '#999', fontSize: '12px'}}>
                          Enviada: {new Date(review.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pending-badge" style={{
                      background: '#ffc107',
                      color: '#856404',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      <i className="fas fa-clock"></i> PENDIENTE
                    </div>
                  </div>
                  
                  <div className="review-comment" style={{
                    margin: '10px 0',
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '4px',
                    fontStyle: 'italic'
                  }}>
                    <p>"{review.comment}"</p>
                  </div>
                  
                  <div className="moderation-actions" style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={() => handleApproveReview(review.id)}
                      style={{
                        background: '#28a745',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <i className="fas fa-check"></i> Aprobar
                    </button>
                    
                    <button
                      onClick={() => handleRejectReview(review.id)}
                      style={{
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <i className="fas fa-times"></i> Rechazar
                    </button>
                    
                    <button
                      onClick={() => deleteReview(review.id)}
                      style={{
                        background: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <i className="fas fa-trash"></i> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulario para nueva reseña */}
          <div className="add-review-form">
            <h4>Agregar Nueva Reseña</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre del huésped *</label>
                <input
                  type="text"
                  value={newReview.guestName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewReview(prevReview => ({
                      ...prevReview,
                      guestName: value
                    }));
                  }}
                  placeholder="Nombre del huésped"
                  className="form-control"
                  autoComplete="off"
                  style={{
                    backgroundColor: '#fff',
                    border: '2px solid #007bff',
                    padding: '8px 12px',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div className="form-group">
                <label>Calificación *</label>
                <div className="rating-input">
                  {renderStars(newReview.rating, true, (rating) => {
                    setNewReview(prevReview => ({
                      ...prevReview,
                      rating: rating
                    }));
                  })}
                  <span className="rating-text">({newReview.rating}/5)</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Fecha de la estadía</label>
                <input
                  type="date"
                  value={newReview.date}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewReview(prevReview => ({
                      ...prevReview,
                      date: value
                    }));
                  }}
                  className="form-control"
                  style={{
                    backgroundColor: '#fff',
                    border: '2px solid #007bff',
                    padding: '8px 12px',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div className="form-group form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newReview.verified}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setNewReview(prevReview => ({
                        ...prevReview,
                        verified: checked
                      }));
                    }}
                  />
                  <span>Reseña verificada</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newReview.highlight}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setNewReview(prevReview => ({
                        ...prevReview,
                        highlight: checked
                      }));
                    }}
                  />
                  <span>Destacar reseña</span>
                </label>
              </div>
            </div>
            
            <div className="form-group full-width">
              <label>Comentario *</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewReview(prevReview => ({
                    ...prevReview,
                    comment: value
                  }));
                }}
                placeholder="Escribe el comentario del huésped..."
                rows="4"
                className="form-control"
                autoComplete="off"
                style={{
                  backgroundColor: '#fff',
                  border: '2px solid #007bff',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            {/* Campo de debug para mostrar el estado actual */}
            <div style={{
              background: '#f8f9fa',
              padding: '10px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              marginBottom: '10px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              <strong>Estado actual:</strong><br/>
              Nombre: "{newReview.guestName}"<br/>
              Comentario: "{newReview.comment}"<br/>
              Rating: {newReview.rating}<br/>
              Fecha: {newReview.date}
            </div>
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addReview();
              }}
              className="btn btn-primary"
              type="button"
              style={{
                backgroundColor: '#007bff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-plus"></i> Agregar Reseña
            </button>
            
            {/* Botón de prueba manual */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const testName = `Usuario Test ${Date.now()}`;
                const testComment = `Comentario de prueba generado el ${new Date().toLocaleString()}`;
                setNewReview({
                  guestName: testName,
                  rating: 5,
                  comment: testComment,
                  date: new Date().toISOString().split('T')[0],
                  verified: true,
                  highlight: false
                });
              }}
              className="btn btn-secondary"
              type="button"
              style={{
                backgroundColor: '#6c757d',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                marginLeft: '10px'
              }}
            >
              🧪 Llenar Automático
            </button>
          </div>

          {/* FORMULARIO ALTERNATIVO CON REFS (BACKUP) */}
          <div className="add-review-form" style={{
            background: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            padding: '20px',
            margin: '20px 0'
          }}>
            <h4 style={{color: '#856404'}}>⚡ Formulario Alternativo (Si el principal no funciona)</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre del huésped (REF) *</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="Nombre del huésped"
                  defaultValue=""
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid #ffc107',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div className="form-group">
                <label>Fecha (REF)</label>
                <input
                  ref={dateInputRef}
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid #ffc107',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            
            <div className="form-group full-width">
              <label>Comentario (REF) *</label>
              <textarea
                ref={commentTextareaRef}
                placeholder="Escribe el comentario del huésped..."
                rows="3"
                defaultValue=""
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #ffc107',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addReviewFromRefs();
              }}
              style={{
                backgroundColor: '#ffc107',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                color: '#000',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ⚡ Agregar con REFS
            </button>
          </div>

          {/* Filtros */}
          {reviews.length > 0 && (
            <div className="review-filters">
              <div className="filter-group">
                <label>Calificación:</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                >
                  <option value="all">Todas</option>
                  <option value="5">5 estrellas</option>
                  <option value="4">4 estrellas</option>
                  <option value="3">3 estrellas</option>
                  <option value="2">2 estrellas</option>
                  <option value="1">1 estrella</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Estado:</label>
                <select
                  value={filters.verified}
                  onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value }))}
                >
                  <option value="all">Todas</option>
                  <option value="true">Verificadas</option>
                  <option value="false">No verificadas</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Destacadas:</label>
                <select
                  value={filters.highlight}
                  onChange={(e) => setFilters(prev => ({ ...prev, highlight: e.target.value }))}
                >
                  <option value="all">Todas</option>
                  <option value="true">Destacadas</option>
                  <option value="false">No destacadas</option>
                </select>
              </div>
            </div>
          )}

          {/* Lista de reseñas */}
          <div className="reviews-list">
            <h4>Reseñas ({reviews.length})</h4>
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className={`review-card ${review.highlight ? 'highlighted' : ''}`}>
                  {editingReview?.id === review.id ? (
                    <div className="edit-review">
                      <div className="form-grid">
                        <input
                          type="text"
                          value={editingReview.guestName}
                          onChange={(e) => setEditingReview(prev => ({ ...prev, guestName: e.target.value }))}
                          placeholder="Nombre del huésped"
                        />
                        
                        <div className="rating-input">
                          {renderStars(editingReview.rating, true, (rating) => 
                            setEditingReview(prev => ({ ...prev, rating }))
                          )}
                        </div>
                        
                        <input
                          type="date"
                          value={editingReview.date}
                          onChange={(e) => setEditingReview(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      
                      <textarea
                        value={editingReview.comment}
                        onChange={(e) => setEditingReview(prev => ({ ...prev, comment: e.target.value }))}
                        rows="3"
                      />
                      
                      <div className="edit-actions">
                        <button 
                          onClick={() => updateReview(review.id, editingReview)}
                          className="btn btn-success btn-sm"
                        >
                          <i className="fas fa-save"></i> Guardar
                        </button>
                        <button 
                          onClick={() => setEditingReview(null)}
                          className="btn btn-secondary btn-sm"
                        >
                          <i className="fas fa-times"></i> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="review-header">
                        <div className="guest-info">
                          <strong>{review.guestName}</strong>
                          <div className="review-meta">
                            {renderStars(review.rating)}
                            <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="review-badges">
                          {review.verified && (
                            <span className="badge verified">
                              <i className="fas fa-check-circle"></i> Verificada
                            </span>
                          )}
                          {review.highlight && (
                            <span className="badge highlighted">
                              <i className="fas fa-bookmark"></i> Destacada
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="review-comment">
                        <p>"{review.comment}"</p>
                      </div>
                      
                      <div className="review-actions">
                        <button
                          onClick={() => setEditingReview(review)}
                          className="btn btn-outline-primary btn-sm"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        
                        <button
                          onClick={() => toggleHighlight(review.id)}
                          className={`btn btn-sm ${review.highlight ? 'btn-warning' : 'btn-outline-warning'}`}
                          title={review.highlight ? 'Quitar destacado' : 'Destacar reseña'}
                        >
                          <i className="fas fa-bookmark"></i>
                        </button>
                        
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="btn btn-outline-danger btn-sm"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <i className="fas fa-star-half-alt"></i>
                <p>No hay reseñas para esta propiedad</p>
                <small>Agrega la primera reseña usando el formulario de arriba</small>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ReviewManager;
