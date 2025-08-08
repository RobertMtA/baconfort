import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext-STATEFUL';
import PriceCard from "../components/PriceCard/PriceCard";
import Gallery from '../components/Gallery/Gallery';
import ReservationForm from '../components/ReservationForm/ReservationForm';
import AvailabilityInquiryForm from '../components/AvailabilityInquiryForm/AvailabilityInquiryForm';
import ReviewsSection from '../components/ReviewsSection/ReviewsSection';
import Loading from '../components/Loading/Loading';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import { useNavbar } from '../hooks/useNavbar';
import { useGallery } from '../hooks/useGallery';
import { useProperty } from '../hooks/useProperty';
import ImageUtils from '../utils/ImageUtils';
import NotFound from './NotFound';

import '../styles/departamento.css';

const DynamicProperty = () => {
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const { getProperty, debugStoredProperties, regenerateVideoUrl, getAllProperties } = useAdmin();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { navbarOpen, toggleNavbar, closeNavbar } = useNavbar();
  
  // Extraer parámetros de URL para pre-cargar el formulario de reserva
  const preloadReservationData = {
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || ''
  };
  
  // Usar useProperty para obtener datos de la propiedad del backend si existe el hook
  const { 
    property: backendProperty, 
    loading: propertyLoading, 
    error: propertyError,
    refreshProperty,
    isUsingFallback
  } = useProperty ? useProperty(propertyId) : { 
    property: null, 
    loading: false, 
    error: null, 
    refreshProperty: () => {}, 
    isUsingFallback: false 
  };
  
  // Cargar galería desde la base de datos si existe el hook
  const { 
    images: galleryImages, 
    loading: galleryLoading, 
    error: galleryError, 
    mainImage,
    refreshGallery 
  } = useGallery ? useGallery(propertyId) : { 
    images: [], 
    loading: false, 
    error: null, 
    mainImage: null, 
    refreshGallery: () => {} 
  };
  
  // Obtener propiedad del contexto local primero, luego del backend
  const contextProperty = getProperty(propertyId);
  const finalProperty = backendProperty || contextProperty || property;
  
  // Función para validar y limpiar URLs
  const safeUrl = (url, fallback = '/img/logo.jpg') => {
    if (!url) return fallback;
    if (typeof url !== 'string') return fallback;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      return url;
    }
    return fallback;
  };
  
  // Debug info (solo ejecutar una vez para evitar spam)
  const debugInfo = useMemo(() => {
    const info = {
      propertyId,
      contextProperty: !!contextProperty,
      backendProperty: !!backendProperty,
      finalProperty: !!finalProperty,
      propertyTitle: finalProperty?.title || 'N/A'
    };
    console.log('🏠 DynamicProperty - Property data:', info);
    return info;
  }, [propertyId, !!contextProperty, !!backendProperty, !!finalProperty, finalProperty?.title]);

  // Usar imágenes SOLO de la base de datos - SIN FALLBACK para propiedades nuevas
  const images = galleryImages && galleryImages.length > 0 
    ? galleryImages 
    : finalProperty?.galleryImages && finalProperty.galleryImages.length > 0
      ? finalProperty.galleryImages.filter(img => {
          // Filtrar solo imágenes reales (no demo)
          if (typeof img === 'string') {
            return img.startsWith('data:image/') || img.startsWith('http') || (!img.includes('/img/'));
          } else if (img && typeof img === 'object') {
            return img.url && (img.url.startsWith('data:image/') || img.url.startsWith('http') || (!img.url.includes('/img/')));
          }
          return false;
        })
      : []; // Sin imágenes fallback para propiedades nuevas

  // Procesar videos de la galería - con regeneración de URLs
  const videos = finalProperty?.galleryVideos || [];
  
  // Procesar videos válidos con regeneración de URLs
  const processedVideos = videos.map(video => {
    if (!video) return null;
    
    let videoSrc = null;
    let hasValidSrc = false;
    
    // 1. Si tiene base64 VÁLIDO, usar directamente
    if (video.base64 && 
        typeof video.base64 === 'string' && 
        video.base64.startsWith('data:') &&
        !video.base64.includes('[VIDEO_')) {
      videoSrc = video.base64;
      hasValidSrc = true;
    } 
    // 2. Si tiene URL válida (no blob, no error)
    else if (video.url && 
             !video.url.includes('[VIDEO_') && 
             !video.url.includes('ERROR') &&
             !video.url.includes('EXPIRED') &&
             !video.url.startsWith('blob:')) {
      videoSrc = video.url;
      hasValidSrc = true;
    }
    // 3. Si tiene base64 VÁLIDO pero URL blob expirada, regenerar
    else if (video.base64 && 
             typeof video.base64 === 'string' && 
             video.base64.startsWith('data:') &&
             !video.base64.includes('[VIDEO_') &&
             video.url && 
             video.url.startsWith('blob:')) {
      const regeneratedUrl = regenerateVideoUrl(video);
      if (regeneratedUrl) {
        videoSrc = regeneratedUrl;
        hasValidSrc = true;
        console.log('🎥 URL regenerada para video:', video.name);
      } else {
        videoSrc = video.base64; // Fallback a base64
        hasValidSrc = true;
      }
    }
    
    return {
      ...video,
      type: 'video',
      src: videoSrc,
      thumbnail: video.thumbnail || '/img/video-thumbnail.jpg',
      hasValidSrc,
      canPlay: hasValidSrc
    };
  }).filter(video => video && video.hasValidSrc);

  // Videos que no se pueden reproducir
  const invalidVideos = videos.filter(video => {
    if (!video) return false;
    
    // Si tiene base64 VÁLIDO, no es inválido
    if (video.base64 && 
        typeof video.base64 === 'string' && 
        video.base64.startsWith('data:') &&
        !video.base64.includes('[VIDEO_')) {
      return false;
    }
    
    // Si tiene URL válida, no es inválido
    if (video.url && 
        !video.url.includes('[VIDEO_') && 
        !video.url.includes('ERROR') &&
        !video.url.includes('EXPIRED') &&
        !video.url.startsWith('blob:')) {
      return false;
    }
    
    return true;
  }).map(video => ({
    ...video,
    type: 'video',
    src: null,
    hasValidSrc: false,
    isPlaceholder: true,
    isExpiredBlob: video.url && video.url.startsWith('blob:'),
    isTooLarge: video.url && video.url.includes('[VIDEO_TOO_LARGE_FOR_STORAGE]'),
    hasError: video.url && (video.url.includes('ERROR') || video.url.includes('[VIDEO_PROCESSING_ERROR]')),
    errorReason: video.url && video.url.includes('[VIDEO_TOO_LARGE_FOR_STORAGE]') ? 'too_large' :
                 video.url && video.url.startsWith('blob:') ? 'expired_blob' :
                 video.url && video.url.includes('ERROR') ? 'processing_error' : 'unknown'
  }));

  // Combinar videos válidos e inválidos
  const allVideos = [...processedVideos, ...invalidVideos];

  // Combinar imágenes y videos para la galería
  const processedImages = images.map(img => ({
    type: 'image',
    src: ImageUtils.getImageSrc(img)
  }));

  // Array combinado para la galería (imágenes primero, luego videos)
  const galleryItems = [...processedImages, ...processedVideos];
  
  console.log('🖼️ DynamicProperty - Images data:', {
    galleryImages: galleryImages?.length || 0,
    propertyGalleryImages: finalProperty?.galleryImages?.length || 0,
    finalImages: images?.length || 0,
    processedImages: processedImages?.length || 0,
    processedVideos: processedVideos?.length || 0,
    totalGalleryItems: galleryItems?.length || 0
  });

  useEffect(() => {
    const loadProperty = () => {
      console.log('🏠 DynamicProperty: Cargando propiedad con ID:', propertyId);
      
      // Usar finalProperty que ya incluye backend y context
      if (finalProperty) {
        // Verificar si la propiedad está bloqueada
        if (finalProperty.isBlocked) {
          console.log('🚫 DynamicProperty: Propiedad bloqueada, no disponible:', propertyId);
          setProperty(null);
          setLoading(false);
          return;
        }
        
        console.log('🏠 DynamicProperty: Usando finalProperty:', finalProperty.title);
        setProperty(finalProperty);
        setLoading(false);
        return;
      }
      
      // Si AdminProvider aún está cargando, esperar
      if (!getProperty) {
        console.log('🔄 DynamicProperty: AdminProvider no inicializado, esperando...');
        return;
      }
      
      const foundProperty = getProperty(propertyId);
      console.log('🏠 DynamicProperty: Propiedad encontrada:', foundProperty?.title || 'null');
      
      // Verificar si la propiedad está bloqueada
      if (foundProperty && foundProperty.isBlocked) {
        console.log('🚫 DynamicProperty: Propiedad bloqueada, no disponible:', propertyId);
        setProperty(null);
        setLoading(false);
        return;
      }
      
      if (foundProperty) {
        setProperty(foundProperty);
        setLoading(false);
      } else {
        console.log('❌ DynamicProperty: Propiedad no encontrada');
        setLoading(false);
      }
    };

    if (propertyId) {
      loadProperty();
    }
  }, [propertyId, finalProperty?.id, getProperty]); // Solo depender del ID de la propiedad para evitar bucles

  useEffect(() => {
    // Simular carga de imágenes y esperar a que se cargue la galería y la propiedad
    const loadImages = async () => {
      // Esperar a que la galería y la propiedad terminen de cargar
      if (galleryLoading || propertyLoading || loading) {
        return;
      }

      const images = document.querySelectorAll('img');
      const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve);
        });
      });

      await Promise.all(promises);
      setIsLoading(false);
    };

    loadImages();
  }, [galleryLoading, propertyLoading, loading]);

  const openGallery = (index) => {
    console.log('🖼️ DynamicProperty: Abriendo galería en índice:', index);
    console.log('🖼️ DynamicProperty: Items de galería disponibles:', processedImages.length);
    console.log('🖼️ DynamicProperty: Item seleccionado:', processedImages[index]);
    setSelectedImage(index);
    setShowGallery(true);
  };

  const openVideoModal = (video, index) => {
    console.log('🎥 DynamicProperty: Abriendo modal de video:', video.name);
    console.log('🎥 DynamicProperty: Video source:', video.src);
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  if (loading) {
    return <Loading />;
  }

  // Verificar si la propiedad está bloqueada
  if (finalProperty && finalProperty.isBlocked) {
    console.log('🚫 DynamicProperty: Propiedad bloqueada:', {
      propertyId,
      isBlocked: true
    });
    
    return (
      <NotFound 
        title="Propiedad no disponible"
        message="Esta propiedad no está disponible actualmente."
      />
    );
  }

  if (!property) {
    // Mostrar información adicional para debugging
    console.log('❌ DynamicProperty: Propiedad no encontrada:', {
      searchedId: propertyId,
      availableProperties: Object.keys(getProperty('') || {}),
      adminContextInitialized: !!getProperty
    });
    
    return (
      <NotFound 
        title="Propiedad no encontrada"
        message={`No se encontró la página para la propiedad: ${propertyId}`}
      />
    );
  }

  return (
    <div className="dynamic-property-page">
      {/* Hero Section */}
      <section className="hero-section position-relative">
        <div className="hero-content">
          <img
            src={safeUrl(property.coverImage)}
            alt={property.title}
            className="hero-image w-100"
            style={{ height: '70vh', objectFit: 'cover' }}
            onError={(e) => {
              console.log('❌ Error cargando imagen de portada:', e.target.src);
              // Evitar bucle infinito - solo cambiar si no es ya la imagen por defecto
              if (!e.target.src.includes('img-default-property.jpg')) {
                e.target.src = '/img/img-default-property.jpg';
              } else {
                // Si la imagen por defecto también falla, usar una imagen sólida
                e.target.style.display = 'none';
                e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                e.target.parentElement.style.minHeight = '70vh';
              }
            }}
          />
          
          {/* Overlay con información */}
          <div className="hero-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end" 
               style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
            <div className="container">
              <div className="row">
                <div className="col-lg-8">
                  <h1 className="text-white display-4 fw-bold mb-3">{property.title}</h1>
                  <p className="text-white fs-5 mb-4">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {property.address}
                  </p>
                  
                  {property.prices && (
                    <div className="pricing-info d-flex flex-wrap gap-4 mb-4">
                      {property.prices.daily && (
                        <div className="price-item text-white">
                          <small className="d-block opacity-75">Por día</small>
                          <strong className="fs-4">{property.prices.daily}</strong>
                        </div>
                      )}
                      {property.prices.weekly && (
                        <div className="price-item text-white">
                          <small className="d-block opacity-75">Por semana</small>
                          <strong className="fs-4">{property.prices.weekly}</strong>
                        </div>
                      )}
                      {property.prices.monthly && (
                        <div className="price-item text-white">
                          <small className="d-block opacity-75">Por mes</small>
                          <strong className="fs-4">{property.prices.monthly}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="property-content py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* Descripción */}
              {property.description && (
                <div className="property-description mb-5">
                  <h3 className="mb-4">
                    <i className="fas fa-info-circle me-2"></i>
                    Descripción
                  </h3>
                  
                  {/* Tabs para diferentes idiomas */}
                  <ul className="nav nav-tabs mb-3">
                    {property.description.es && (
                      <li className="nav-item">
                        <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#desc-es">
                          <i className="fas fa-flag me-1"></i> Español
                        </button>
                      </li>
                    )}
                    {property.description.en && (
                      <li className="nav-item">
                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#desc-en">
                          <i className="fas fa-flag me-1"></i> English
                        </button>
                      </li>
                    )}
                    {property.description.pt && (
                      <li className="nav-item">
                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#desc-pt">
                          <i className="fas fa-flag me-1"></i> Português
                        </button>
                      </li>
                    )}
                  </ul>
                  
                  <div className="tab-content">
                    {property.description.es && (
                      <div className="tab-pane show active" id="desc-es">
                        <p className="lead">{property.description.es}</p>
                      </div>
                    )}
                    {property.description.en && (
                      <div className="tab-pane" id="desc-en">
                        <p className="lead">{property.description.en}</p>
                      </div>
                    )}
                    {property.description.pt && (
                      <div className="tab-pane" id="desc-pt">
                        <p className="lead">{property.description.pt}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Galería de Imágenes */}
              {processedImages && processedImages.length > 1 && (
                <div className="property-gallery mb-5">
                  <h3 className="mb-4">
                    <i className="fas fa-images me-2"></i>
                    Galería de Imágenes ({processedImages.length} fotos)
                  </h3>
                  
                  <div className="row">
                    {processedImages.map((item, index) => (
                      <div key={index} className="col-md-4 col-sm-6 mb-3">
                        <div className="gallery-item">
                          <img
                            src={item.src || '/img/logo.jpg'}
                            alt={`Imagen ${index + 1}`}
                            className="img-fluid rounded shadow-sm"
                            style={{ 
                              width: '100%', 
                              height: '200px', 
                              objectFit: 'cover',
                              cursor: 'pointer'
                            }}
                            onClick={() => openGallery(index)}
                            onError={(e) => {
                              console.log('❌ Error cargando imagen de galería:', e.target.src);
                              e.target.src = '/img/logo.jpg';
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Galería de Videos */}
              {allVideos && allVideos.length > 0 && (
                <div className="property-videos mb-5">
                  <h3 className="mb-4">
                    <i className="fas fa-video me-2"></i>
                    Galería de Videos ({allVideos.length} videos)
                  </h3>
                  
                  <div className="row">
                    {allVideos.map((video, index) => (
                      <div key={index} className="col-md-6 col-lg-4 mb-3">
                        <div className="video-item">
                          <div 
                            className="video-thumbnail"
                            style={{ 
                              width: '100%', 
                              height: '250px', 
                              position: 'relative',
                              cursor: video.hasValidSrc ? 'pointer' : 'default',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '0.375rem',
                              overflow: 'hidden',
                              opacity: video.hasValidSrc ? 1 : 0.6
                            }}
                            onClick={() => video.hasValidSrc && openVideoModal(video, index)}
                          >
                            {/* Si hay URL válida, mostrar thumbnail del video */}
                            {video.hasValidSrc && video.src && !video.src.includes('[VIDEO_TOO_LARGE_FOR_STORAGE]') ? (
                              <video
                                src={video.src}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover'
                                }}
                                preload="metadata"
                                muted
                                onError={(e) => {
                                  console.log('❌ Error cargando thumbnail de video:', video.name);
                                  // Ocultar video y mostrar placeholder
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            
                            {/* Placeholder para videos sin thumbnail */}
                            <div 
                              className="video-placeholder"
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#e9ecef',
                                display: (!video.hasValidSrc || !video.src || video.src.includes('[VIDEO_TOO_LARGE_FOR_STORAGE]')) ? 'flex' : 'none',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column'
                              }}
                            >
                              <i className="fas fa-video fa-3x text-muted mb-2"></i>
                              <small className="text-muted text-center">
                                {video.name || `Video ${index + 1}`}
                                <br />
                                <span className="text-warning">
                                  {video.errorReason === 'expired_blob' ? 'Video expirado (recarga la página)' :
                                   video.errorReason === 'too_large' ? 'Video demasiado grande para mostrar' :
                                   video.errorReason === 'processing_error' ? 'Error procesando video' :
                                   video.isPlaceholder ? 'Video no disponible' : 'Preview no disponible'}
                                </span>
                                {video.size && (
                                  <>
                                    <br />
                                    <span className="text-info">
                                      {(video.size / (1024*1024)).toFixed(1)} MB
                                    </span>
                                  </>
                                )}
                              </small>
                            </div>
                            
                            {/* Icono de play superpuesto - solo para videos válidos */}
                            {video.hasValidSrc && (
                              <div 
                                className="play-overlay"
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  width: '60px',
                                  height: '60px',
                                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '24px',
                                  color: 'white'
                                }}
                              >
                                ▶
                              </div>
                            )}
                            
                            {/* Información del video */}
                            <div 
                              className="video-info"
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                color: 'white',
                                padding: '1rem',
                                fontSize: '0.9rem'
                              }}
                            >
                              <div className="fw-bold">
                                {video.name ? (video.name.length > 25 ? `${video.name.substring(0, 25)}...` : video.name) : `Video ${index + 1}`}
                              </div>
                              {video.size && (
                                <small className="opacity-75">
                                  {(video.size / (1024 * 1024)).toFixed(1)} MB
                                </small>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <div className="property-sidebar">
                <div className="card shadow">
                  <div className="card-body">
                    <h4 className="card-title mb-4">Información de contacto</h4>
                    
                    <div className="contact-info">
                      <p className="mb-3">
                        <i className="fas fa-whatsapp me-2 text-success"></i>
                        <strong>WhatsApp:</strong><br />
                        <a href="https://wa.me/541130021074" className="text-decoration-none" target="_blank" rel="noopener noreferrer">
                          +54 11 3002-1074
                        </a>
                      </p>
                      
                      <p className="mb-4">
                        <i className="fas fa-envelope me-2 text-primary"></i>
                        <strong>Email:</strong><br />
                        <a href="mailto:andybuenosaires@gmail.com" className="text-decoration-none">
                          andybuenosaires@gmail.com
                        </a>
                      </p>
                    </div>
                    
                    <a 
                      href="https://wa.me/541130021074" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-success w-100 text-decoration-none"
                    >
                      <i className="fab fa-whatsapp me-2"></i>
                      Consultar por WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Gallery Modal para Imágenes */}
      {showGallery && (
        <Gallery 
          images={processedImages.map(img => img.src)}
          currentIndex={selectedImage}
          onClose={() => setShowGallery(false)}
          onNavigate={setSelectedImage}
        />
      )}

      {/* Modal para Videos */}
      {showVideoModal && selectedVideo && (
        <div className="video-modal">
          <div className="video-modal-overlay" onClick={() => setShowVideoModal(false)}></div>
          <div className="video-modal-content">
            <button 
              className="video-modal-close" 
              onClick={() => setShowVideoModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '18px',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              ✕
            </button>
            
            <div className="video-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
              {selectedVideo.src && !selectedVideo.src.includes('[VIDEO_TOO_LARGE_FOR_STORAGE]') ? (
                <video
                  src={selectedVideo.src}
                  controls
                  autoPlay
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    console.error('❌ Error cargando video en modal:', selectedVideo.name);
                  }}
                />
              ) : (
                <div 
                  style={{
                    width: '400px',
                    height: '300px',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    borderRadius: '8px'
                  }}
                >
                  <i className="fas fa-video fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">{selectedVideo.name}</h5>
                  <p className="text-muted text-center">
                    Video no disponible para reproducción
                    <br />
                    <small>El archivo es demasiado grande o se perdió la referencia temporal</small>
                  </p>
                </div>
              )}
            </div>
            
            {/* Información del video */}
            <div 
              className="video-info-overlay"
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '1rem',
                borderRadius: '8px'
              }}
            >
              <h6 className="mb-1">{selectedVideo.name}</h6>
              {selectedVideo.size && (
                <small className="text-light">
                  Tamaño: {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB
                </small>
              )}
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{
            __html: `
              .video-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .video-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
              }
              .video-modal-content {
                position: relative;
                z-index: 1001;
                max-width: 95vw;
                max-height: 95vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
            `
          }} />
        </div>
      )}
    </div>
  );
};

export default DynamicProperty;
