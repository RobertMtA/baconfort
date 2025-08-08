import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Gallery.css';

const Gallery = ({ items = [], images = [], currentIndex, onClose, onNavigate }) => {
  // Usar items si está disponible, sino usar images (compatibilidad hacia atrás)
  const galleryItems = items.length > 0 ? items : images.map(img => ({ type: 'image', src: img }));
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex || 0);

  // Sincronizar con el prop currentIndex cuando cambie
  useEffect(() => {
    setCurrentImageIndex(currentIndex || 0);
  }, [currentIndex]);

  const handlePrev = () => {
    const newIndex = currentImageIndex === 0 ? galleryItems.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    if (onNavigate) onNavigate(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentImageIndex === galleryItems.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
    if (onNavigate) onNavigate(newIndex);
  };

  const currentItem = galleryItems[currentImageIndex];

  console.log('🖼️ GALLERY: Renderizando item', currentImageIndex, 'de', galleryItems.length);
  console.log('🖼️ GALLERY: Item actual:', currentItem);

  return (
    <div className="gallery-modal">
      <div className="gallery-overlay" onClick={onClose}></div>
      <button className="gallery-close-button" onClick={onClose}>
        <FaTimes />
      </button>
      <button className="gallery-nav-button prev" onClick={handlePrev}>
        <FaChevronLeft />
      </button>
      <div className="gallery-image-container">
        {currentItem?.type === 'video' ? (
          <video 
            src={currentItem.src} 
            controls
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            onLoad={() => console.log('🎥 GALLERY: Video cargado:', currentItem.src)}
            onError={(e) => console.error('🎥 GALLERY: Error cargando video:', e.target.src)}
          />
        ) : (
          <img 
            src={currentItem?.src || currentItem} 
            alt={`Item ${currentImageIndex + 1}`}
            onLoad={() => console.log('🖼️ GALLERY: Imagen cargada:', currentItem?.src || currentItem)}
            onError={(e) => console.error('🖼️ GALLERY: Error cargando imagen:', e.target.src)}
          />
        )}
      </div>
      <button className="gallery-nav-button next" onClick={handleNext}>
        <FaChevronRight />
      </button>
    </div>
  );
};

export default Gallery;