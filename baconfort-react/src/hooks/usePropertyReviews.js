import { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/api';

/**
 * Hook para cargar y gestionar reseñas de una propiedad desde el backend
 * @param {string} propertyId - ID de la propiedad
 * @param {object} options - Opciones de configuración
 */
export function usePropertyReviews(propertyId, options = {}) {
  const { limit = 20, autoLoad = true } = options;
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  const loadReviews = async () => {
    if (!propertyId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await reviewsAPI.getPropertyReviews(propertyId, {
        limit,
        sort: '-createdAt'
      });

      if (response.success) {
        const reviewsData = response.data || [];
        setReviews(reviewsData);
        
        // Calcular estadísticas
        const total = reviewsData.length;
        const averageRating = total > 0 
          ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / total
          : 0;
        
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviewsData.forEach(review => {
          if (review.rating >= 1 && review.rating <= 5) {
            distribution[review.rating]++;
          }
        });

        setStats({
          total,
          averageRating: Number(averageRating.toFixed(1)),
          distribution
        });

        console.log(`✅ REVIEWS: Cargadas ${total} reseñas para ${propertyId}`);
      } else {
        console.error('❌ REVIEWS: Error en respuesta:', response.error);
        setError(response.error || 'Error cargando reseñas');
      }
    } catch (err) {
      console.error('❌ REVIEWS: Error cargando reseñas:', err);
      setError('Error de conexión');
      setReviews([]);
      setStats({
        total: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-cargar al montar el componente
  useEffect(() => {
    if (autoLoad && propertyId) {
      loadReviews();
    }
  }, [propertyId, autoLoad]);

  // Funciones helper
  const getHighlightedReviews = () => reviews.filter(review => review.isHighlight);
  
  const getRecentReviews = (count = 5) => 
    reviews
      .filter(review => !review.isHighlight)
      .slice(0, count);

  const getDisplayReviews = (showAll = false) => {
    if (showAll) {
      return reviews;
    }
    
    // Mostrar primero las destacadas, luego las más recientes
    const highlighted = getHighlightedReviews();
    const recent = getRecentReviews(Math.max(0, 4 - highlighted.length));
    
    return [...highlighted, ...recent];
  };

  // Añadir nueva reseña (optimistic update)
  const addReview = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
    setStats(prevStats => ({
      ...prevStats,
      total: prevStats.total + 1
    }));
  };

  return {
    reviews,
    loading,
    error,
    stats,
    loadReviews,
    getHighlightedReviews,
    getRecentReviews,
    getDisplayReviews,
    addReview
  };
}
