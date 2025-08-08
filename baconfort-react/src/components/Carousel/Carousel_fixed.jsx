import { useEffect, useState } from 'react';
import './Carousel.css';

function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Imágenes estáticas del carrusel
  const slides = [
    {
      id: 'slide1',
      image: '/img/img-portada-moldes-1680.jpg',
      alt: 'Departamento Moldes 1680'
    },
    {
      id: 'slide2', 
      image: '/img/img-portada-santa-fe-3770.jpg',
      alt: 'Departamento Santa Fe 3770'
    },
    {
      id: 'slide3',
      image: '/img/img-portada-dorrego-1548.jpg', 
      alt: 'Departamento Dorrego 1548'
    },
    {
      id: 'slide4',
      image: '/img/img-portada-convencion-1994.jpg',
      alt: 'Departamento Convención 1994'
    },
    {
      id: 'slide5',
      image: '/img/img-portada-ugarteche-2824.jpg',
      alt: 'Departamento Ugarteche 2824'
    }
  ];

  useEffect(() => {
    // Auto-advance carousel
    const interval = setInterval(() => {
      setActiveIndex((current) => (current === slides.length - 1 ? 0 : current + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePrev = () => {
    setActiveIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  };

  const handleNext = () => {
    setActiveIndex((current) => (current === slides.length - 1 ? 0 : current + 1));
  };

  const handleImageError = (e) => {
    console.error('Error cargando imagen:', e.target.src);
    e.target.style.backgroundColor = '#f0f0f0';
    e.target.alt = 'Error al cargar imagen';
  };

  const handleImageLoad = (e) => {
    console.log('Imagen cargada correctamente:', e.target.src);
  };

  return (
    <section id="imageCarousel" className="carousel slide" aria-label="Galería de departamentos">
      <div className="carousel-indicators">
        {slides.map((_, index) => (
          <button
            key={`indicator-${index}`}
            type="button"
            className={index === activeIndex ? 'active' : ''}
            aria-current={index === activeIndex ? 'true' : 'false'}
            aria-label={`Imagen ${index + 1}`}
            onClick={() => setActiveIndex(index)}
          ></button>
        ))}
      </div>
      
      <div className="carousel-inner">
        {slides.map((slide, index) => (
          <div 
            key={`slide-${slide.id}`}
            className={`carousel-item ${index === activeIndex ? 'active' : ''}`}
          >
            <img 
              src={slide.image} 
              className="carousel-image" 
              alt={slide.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
        ))}
      </div>
      
      <button 
        className="carousel-control-prev" 
        type="button" 
        onClick={handlePrev}
        aria-label="Imagen anterior"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Anterior</span>
      </button>
      
      <button 
        className="carousel-control-next" 
        type="button" 
        onClick={handleNext}
        aria-label="Siguiente imagen"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Siguiente</span>
      </button>
    </section>
  );
}

export default Carousel;
