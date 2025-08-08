import { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext-STATEFUL';
import PriceCard from "../components/PriceCard/PriceCard";
import Gallery from '../components/Gallery/Gallery';
import ReservationForm from '../components/ReservationForm/ReservationForm';
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
  const { getProperty, debugStoredProperties } = useAdmin();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { navbarOpen, toggleNavbar, closeNavbar } = useNavbar();
  
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
  
  console.log('🏠 DynamicProperty - Property data:', {
    propertyId,
    contextProperty: !!contextProperty,
    backendProperty: !!backendProperty,
    finalProperty: !!finalProperty
  });

  // Usar imágenes de la base de datos o fallback a imágenes estáticas
  const images = galleryImages && galleryImages.length > 0 
    ? galleryImages 
    : finalProperty?.galleryImages || [
        finalProperty?.coverImage || '/img/img-default-property.jpg'
      ];

  // Procesar imágenes con ImageUtils
  const processedImages = images.map(img => ImageUtils.getImageSrc(img));

  useEffect(() => {
    const loadProperty = () => {
      console.log('🏠 DynamicProperty: Cargando propiedad con ID:', propertyId);
      console.log('🏠 DynamicProperty: Tipo de propertyId:', typeof propertyId);
      console.log('🏠 DynamicProperty: propertyId decodificado:', decodeURIComponent(propertyId));
      
      const foundProperty = getProperty(propertyId);
      console.log('🏠 DynamicProperty: Propiedad encontrada:', foundProperty);
      
      // Si no se encuentra, intentar buscar con diferentes variaciones del ID
      if (!foundProperty) {
        console.log('🔍 DynamicProperty: No encontrada directamente, intentando variaciones...');
        
        // Ejecutar debugging completo
        debugStoredProperties();
        
        // Intentar con el ID decodificado
        const decodedId = decodeURIComponent(propertyId);
        const foundWithDecoded = getProperty(decodedId);
        console.log('🔍 DynamicProperty: Intentando con ID decodificado:', decodedId, foundWithDecoded ? 'ENCONTRADA' : 'NO ENCONTRADA');
        
        if (foundWithDecoded) {
          setProperty(foundWithDecoded);
          setLoading(false);
          return;
        }
      }
      
      setProperty(foundProperty);
      setLoading(false);
    };

    if (propertyId) {
      loadProperty();
    }
  }, [propertyId, getProperty, debugStoredProperties]);

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
    console.log('🖼️ DynamicProperty: Imágenes disponibles:', processedImages.length);
    console.log('🖼️ DynamicProperty: Imagen seleccionada:', processedImages[index]);
    setSelectedImage(index);
    setShowGallery(true);
  };

  if (loading || isLoading) {
    return <Loading />;
  }

  if (!finalProperty) {
    return (
      <NotFound 
        title="Propiedad no encontrada"
        message={`No se encontró la página para la propiedad: ${propertyId}`}
      />
    );
  }

  return (
    <>
      {isLoading && <Loading />}
      
      {/* Navbar independiente */}
      <nav className="navbar navbar-expand-lg sticky-top convencion-navbar">
        <div className="container">
          <Link className="navbar-brand" to="/" aria-label="BACONFORT Home">
            <img 
              src="/img/logo.jpg" 
              alt="BACONFORT Logo" 
              width="40" 
              height="40" 
              className="brand-logo"
              loading="lazy"
            />
            <i className="fas fa-star ms-2 brand-icon" aria-hidden="true"></i> 
            <span className="brand-text">BACONFORT</span>
          </Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={toggleNavbar}
            aria-controls="navbarNav" 
            aria-expanded={navbarOpen} 
            aria-label="Abrir menú de navegación"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`navbar-collapse ${navbarOpen ? 'show' : 'collapse'}`} id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="/" onClick={closeNavbar} aria-label="Ir al inicio">
                  <i className="fas fa-home nav-icon" aria-hidden="true"></i> 
                  Inicio
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#servicios" onClick={closeNavbar} aria-label="Ver detalles de la propiedad">
                  <i className="fas fa-list nav-icon" aria-hidden="true"></i> 
                  Detalles
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#ubicacion" onClick={closeNavbar} aria-label="Ver ubicación en el mapa">
                  <i className="fas fa-map-marker-alt nav-icon" aria-hidden="true"></i> 
                  Ubicación
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#reseñas" onClick={closeNavbar} aria-label="Ver reseñas de huéspedes">
                  <i className="fas fa-star nav-icon" aria-hidden="true"></i> 
                  Reseñas
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href={`#${propertyId}-precios`} onClick={closeNavbar} aria-label="Ver precios de alquiler">
                  <i className="fas fa-tag nav-icon" aria-hidden="true"></i> 
                  Precio
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Sección Hero con Video */}
      <div className="video-hero">
        <VideoPlayer
          src={ImageUtils.getVideoSrc(finalProperty?.heroVideo) || "/video/video-portada-default.mp4"}
          poster={ImageUtils.getImageSrc(mainImage || finalProperty?.coverImage || "/img/img-default-property.jpg")}
          title={finalProperty?.title || "Departamento BACONFORT"}
          autoPlay={true}
          muted={true}
          loop={true}
          controls={false}
          className="hero-video"
        />
        <div className="video-overlay"></div>
        <div className="video-content">
        
        </div>
      </div>

      <main className="departamento-page moldes-container">
        <section id="servicios" className="services container py-5">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <h1 className="text-center mb-4">
                <i className="fas fa-building"></i> {finalProperty.title}
              </h1>
              <h2 className="h4 text-center mb-4">
                <i className="fas fa-map-marker-alt"></i> {finalProperty.address}
              </h2>
              
              <div className="property-features mb-5">
                <div className="row text-center">
                  <div className="col-md-3 col-6 mb-3">
                    <i className="fas fa-building fa-2x mb-2 feature-icon building-icon"></i>
                    <p>Departamento Premium</p>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <i className="fas fa-bed fa-2x mb-2 feature-icon bed-icon"></i>
                    <p>Dormitorios</p>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <i className="fas fa-snowflake fa-2x mb-2 feature-icon ac-icon"></i>
                    <p>Aire Acondicionado F/C</p>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <i className="fas fa-users fa-2x mb-2 feature-icon people-icon"></i>
                    <p>Para Huéspedes</p>
                  </div>
                </div>
              </div>

              <div id={`${propertyId}-precios`} className="pricing-container">
                <h2 className="pricing-title"><i className="fas fa-dollar-sign"></i> Valor del Alquiler</h2>
                <div className="pricing-cards">
                  <PriceCard 
                    title="Por Mes"
                    amount={finalProperty?.prices?.monthly || "1200"}
                    details="No incluye servicios y limpieza semanal"
                    whatsappMessage={`Me interesa el departamento en ${finalProperty.title} para alquiler mensual`}
                    propertyId={propertyId}
                  />
                  <PriceCard 
                    title="Por Semana"
                    amount={finalProperty?.prices?.weekly || "400"}
                    details="No incluye una limpieza"
                    whatsappMessage={`Me interesa el departamento en ${finalProperty.title} para alquiler semanal`}
                    propertyId={propertyId}
                  />
                  <PriceCard 
                    title="Por Día"
                    amount={finalProperty?.prices?.daily || "70"}
                    details="Mínimo 3 noches"
                    whatsappMessage={`Me interesa el departamento en ${finalProperty.title} para alquiler diario`}
                    propertyId={propertyId}
                  />
                </div>
              </div>

              <div className="service">
                <h3>
                  <i className="fas fa-home" aria-hidden="true"></i> {finalProperty.title}<br />
                  <i className="fas fa-map-marker-alt" aria-hidden="true"></i> {finalProperty.address}<br />
                </h3>
                <div className="description">
                  <p lang="es">
                    <strong>En Español:</strong><br />
                    {finalProperty?.description?.es || "Departamento de lujo en una ubicación privilegiada."}
                  </p>
                  <hr />
                  <p lang="en">
                    <strong>In English:</strong><br />
                    {finalProperty?.description?.en || "Luxury apartment in a privileged location."}
                  </p>
                  <hr />
                  <p lang="pt">
                    <strong>Em Português:</strong><br />
                    {finalProperty?.description?.pt || "Apartamento de luxo em uma localização privilegiada."}
                  </p>
                </div>
              </div>
              
              {/* Comodidades Destacadas */}
              <div className="amenities-list mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h5 mb-0">
                    <i className="fas fa-star"></i> Comodidades Destacadas
                  </h3>
                  <div className="d-flex align-items-center">
                    {refreshProperty && (
                      <button 
                        onClick={refreshProperty}
                        className="btn btn-sm btn-outline-primary"
                        title="Actualizar comodidades"
                        disabled={propertyLoading}
                      >
                        <i className={`fas fa-sync-alt ${propertyLoading ? 'fa-spin' : ''}`}></i>
                        {propertyLoading ? ' Actualizando...' : ' Actualizar'}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Mostrar comodidades dinámicas del backend */}
                {finalProperty?.amenities ? (
                  <div className="row">
                    {/* Departamento */}
                    {finalProperty.amenities.departamento && finalProperty.amenities.departamento.length > 0 && (
                      <div className="col-md-4">
                        <h4 className="h6 mb-3"><i className="fas fa-home"></i> Departamento</h4>
                        <ul className="list-unstyled">
                          {finalProperty.amenities.departamento.map((amenity, index) => (
                            <li key={`dept-${index}`}>
                              <i className={amenity.icon}></i> {amenity.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Servicios */}
                    {finalProperty.amenities.servicios && finalProperty.amenities.servicios.length > 0 && (
                      <div className="col-md-4">
                        <h4 className="h6 mb-3"><i className="fas fa-concierge-bell"></i> Servicios</h4>
                        <ul className="list-unstyled">
                          {finalProperty.amenities.servicios.map((amenity, index) => (
                            <li key={`serv-${index}`}>
                              <i className={amenity.icon}></i> {amenity.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Amenities del Edificio */}
                    {finalProperty.amenities.amenitiesEdificio && finalProperty.amenities.amenitiesEdificio.length > 0 && (
                      <div className="col-md-4">
                        <h4 className="h6 mb-3"><i className="fas fa-building"></i> Amenities del Edificio</h4>
                        <ul className="list-unstyled">
                          {finalProperty.amenities.amenitiesEdificio.map((amenity, index) => (
                            <li key={`amenities-${index}`}>
                              <i className={amenity.icon}></i> {amenity.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fallback: mostrar estado de carga o mensaje */
                  <div className="row">
                    <div className="col-md-12">
                      <div className="text-center text-muted p-4">
                        {propertyLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i> 
                            <span className="ms-2">Cargando comodidades...</span>
                          </>
                        ) : propertyError ? (
                          <>
                            <i className="fas fa-exclamation-triangle text-warning"></i>
                            <span className="ms-2">Error cargando comodidades: {propertyError}</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-info-circle"></i>
                            <span className="ms-2">No hay comodidades disponibles</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <section className="gallery-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h2><i className="fas fa-images"></i> Galería de Imágenes</h2>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Debug visual */}
                    <div style={{ 
                      padding: '5px 10px', 
                      fontSize: '12px', 
                      borderRadius: '4px',
                      backgroundColor: galleryImages.length > 0 ? '#d4edda' : '#f8d7da',
                      color: galleryImages.length > 0 ? '#155724' : '#721c24',
                      border: '1px solid ' + (galleryImages.length > 0 ? '#c3e6cb' : '#f5c6cb')
                    }}>
                      DB: {galleryImages.length} | Total: {images.length}
                      {galleryLoading ? ' (Cargando...)' : ''}
                      {galleryError ? ' (Error)' : ''}
                      {!galleryLoading && galleryImages.length > 0 ? ' ✅' : ''}
                      {!galleryLoading && galleryImages.length === 0 ? ' (Usando fallback)' : ''}
                    </div>
                    {refreshGallery && (
                      <button 
                        onClick={refreshGallery}
                        className="btn btn-sm btn-outline-primary"
                        title="Actualizar galería"
                      >
                        <i className="fas fa-sync-alt"></i> Actualizar Galería
                      </button>
                    )}
                  </div>
                </div>
                <div className="gallery-container">
                  {processedImages.map((img, index) => (
                    <div key={index} className="gallery-item" onClick={() => openGallery(index)}>
                      <img src={img} alt={`${finalProperty.title} - ${index + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        <section id="ubicacion" className="py-5 bg-light">
          <div className="container">
            <div className="row">
              <div className="col-12 text-center mb-4">
                <h2 className="section-title">
                  <i className="fas fa-map-marker-alt"></i> Ubicación {finalProperty.title}
                </h2>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 mb-4">
                {/* Aquí se podría agregar un mapa dinámico basado en la dirección */}
                <div className="map-placeholder bg-light border rounded p-5 text-center">
                  <i className="fas fa-map fa-3x text-muted mb-3"></i>
                  <h3 className="text-muted">Mapa de Ubicación</h3>
                  <p className="text-muted">{finalProperty.address}</p>
                  <p className="text-muted">
                    <small>Mapa dinámico próximamente disponible</small>
                  </p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="location-details mb-4">
                  <h3 className="h4">Puntos de interés cercanos:</h3>
                  <ul className="list-unstyled">
                    <li><i className="fas fa-subway"></i> Transporte público cercano</li>
                    <li><i className="fas fa-store"></i> Comercios y servicios</li>
                    <li><i className="fas fa-shopping-cart"></i> Centros comerciales</li>
                    <li><i className="fas fa-tree"></i> Espacios verdes</li>
                    <li><i className="fas fa-hospital"></i> Servicios de salud</li>
                    <li><i className="fas fa-bus"></i> Múltiples líneas de transporte</li>
                    <li><i className="fas fa-utensils"></i> Zona gastronómica</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Reseñas */}
        <section id="reseñas" className="py-5">
          <div className="container">
            <ReviewsSection propertyId={propertyId} />
          </div>
        </section>

        <div className="house-rules mb-5 container">
          <h3 className="h5 mb-3 text-center">Información Importante</h3>
          <div className="row">
            <div className="col-md-6">
              <ul className="list-unstyled">
                <li><i className="fas fa-clock"></i> Check-in: 14:00</li>
                <li><i className="fas fa-clock"></i> Check-out: 11:00</li>
                <li><i className="fas fa-smoking-ban"></i> No fumar</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="list-unstyled">
                <li><i className="fas fa-paw"></i> Mascotas permitidas (consultar)</li>
                <li><i className="fas fa-baby"></i> Apto para niños</li>
                <li><i className="fas fa-shield-alt"></i> Depósito de seguridad requerido</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sección dedicada para el formulario de reserva */}
        <section id="reservas" className="reservation-section py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xl-6">
                <ReservationForm apartmentName={finalProperty.title} propertyId={propertyId} />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {showGallery && (
        <Gallery 
          images={processedImages}
          currentIndex={selectedImage}
          onClose={() => setShowGallery(false)}
          onNavigate={setSelectedImage}
        />
      )}
    </>
  );
};

export default DynamicProperty;
