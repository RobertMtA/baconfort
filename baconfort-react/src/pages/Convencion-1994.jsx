import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import PriceCard from "../components/PriceCard/PriceCard";
import Gallery from '../components/Gallery/Gallery';
import ReservationForm from '../components/ReservationForm/ReservationForm';
import AvailabilityInquiryForm from '../components/AvailabilityInquiryForm/AvailabilityInquiryForm';
import ReviewsSection from '../components/ReviewsSection/ReviewsSection';
import Loading from '../components/Loading/Loading';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import { useNavbar } from '../hooks/useNavbar';
import { useGallery } from '../hooks/useGallery';
import { useAdmin } from '../context/AdminContext';
import { usePropertyFromContext } from '../hooks/usePropertyFromContext';
import { useProperty } from '../hooks/useProperty';
import ImageUtils from '../utils/ImageUtils';
import '../styles/departamento.css';
import NotFound from './NotFound';
import BlockedProperty from '../components/BlockedProperty/BlockedProperty';



function Convencion1994() {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { navbarOpen, toggleNavbar, closeNavbar } = useNavbar();
  
  // AMENITIES HARDCODEADAS - SIN localStorage NI BACKEND
  const amenitiesConvencion1994 = {
    departamento: [
      { icon: 'fas fa-tv', text: 'Smart TV 32"' },
      { icon: 'fas fa-wifi', text: 'WiFi 300MB Fibra Óptica' },
      { icon: 'fas fa-snowflake', text: 'Aire Acondicionado F/C' },
      { icon: 'fas fa-utensils', text: 'Cocina Completamente Equipada' },
      { icon: 'fas fa-bed', text: 'Ropa de Cama' },
      { icon: 'fas fa-bath', text: 'Baño Privado con Ducha' },
      { icon: 'fas fa-tshirt', text: 'Lavarropas' },
      { icon: 'fas fa-blender', text: 'Microondas y Electrodomésticos' },
      { icon: 'fas fa-couch', text: 'Living Amueblado' },
      { icon: 'fas fa-door-closed', text: 'Balcón Privado' },
      { icon: 'fas fa-lock', text: 'Caja Fuerte para llaves ' }
    ],
    servicios: [
      { icon: 'fas fa-concierge-bell', text: 'Recepción 24hs' },
      { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
      { icon: 'fas fa-car', text: 'Servicio de Traslados' },
      { icon: 'fas fa-phone', text: 'Asistencia 24/7' }
    ],
    amenitiesEdificio: [
      { icon: 'fas fa-elevator', text: 'Ascensor' },
      { icon: 'fas fa-dumbbell', text: 'Gimnasio' },
      { icon: 'fas fa-swimming-pool', text: 'Piscina' },
      { icon: 'fas fa-sun', text: 'Solarium/Terraza' },
      { icon: 'fas fa-users', text: 'SUM/Salón de Usos Múltiples' },
      { icon: 'fas fa-spa', text: 'Spa/Jacuzzi' },
      { icon: 'fas fa-tree', text: 'Jardín/Espacios Verdes' },
      { icon: 'fas fa-building', text: 'Edificio Moderno' }
    ]
  };
  
  // HOOK DUAL: Priorizar AdminContext, fallback a backend
  const {
    property: contextProperty,
    loading: isContextLoading,
    error: contextError,
    refreshProperty: refreshContextProperty
  } = usePropertyFromContext('convencion-1994');

  const {
    property: apiProperty,
    loading: isApiPropertyLoading,
    error: apiPropertyError,
    refreshProperty: refreshApiProperty,
    isUsingFallback
  } = useProperty('convencion-1994');

  // PROPIEDAD FINAL CON AMENITIES HARDCODEADAS
  const baseProperty = contextProperty || apiProperty;
  const property = baseProperty ? {
    ...baseProperty,
    amenities: amenitiesConvencion1994 // SIEMPRE usar las amenities hardcodeadas
  } : {
    // Datos básicos si no hay backend
    id: 'convencion-1994',
    title: 'Convencion 1994',
    amenities: amenitiesConvencion1994,
    prices: {
      daily: "USD 70",
      weekly: "USD 410", 
      monthly: "USD 980"
    }
  };

  const propertyLoading = isContextLoading || isApiPropertyLoading;
  const propertyError = contextError || apiPropertyError;

  // Función para refrescar propiedades
  const refreshProperty = () => {
    if (refreshContextProperty) refreshContextProperty();
    if (refreshApiProperty) refreshApiProperty();
  };

  // Escuchar eventos de actualización de precios
  useEffect(() => {
    const handlePriceUpdate = (event) => {
      if (event.detail.propertyId === 'convencion-1994') {
        console.log('🔄 Convencion1994 - Evento de actualización de precios recibido:', event.detail);
        // Forzar refresh de la propiedad para obtener los nuevos precios
        refreshProperty();
      }
    };

    window.addEventListener('baconfort-prices-updated', handlePriceUpdate);
    return () => {
      window.removeEventListener('baconfort-prices-updated', handlePriceUpdate);
    };
  }, [refreshProperty]);
  
  // Cargar galería desde la base de datos
  const { 
    images: galleryImages, 
    loading: galleryLoading, 
    error: galleryError, 
    mainImage,
    refreshGallery 
  } = useGallery('convencion-1994');
  
  // Los precios ahora vienen directamente del backend a través de useProperty
  console.log('🏠 Convencion1994 - Property from backend:', property ? {
    id: property.id,
    title: property.title,
    hasPrices: !!property.prices,
    isUsingFallback
  } : 'NULL');
  
  // Imágenes de fallback para cuando no hay imágenes en la base de datos
  const demoImages = [
    '/img/img-convencion1.jpg',
    '/img/img-convencion2.jpg',
    '/img/img-convencion3.jpg',
    '/img/img-convencion4.jpg',
    '/img/img-convencion5.jpg',
    '/img/img-convencion6.jpg',
    '/img/img-convencion7.jpg',
    '/img/img-convencion8.jpg',
    '/img/img-convencion9.jpg',
    '/img/img-convencion10.jpg',
    '/img/img-convencion11.jpg',
    '/img/img-convencion12.jpg'
  ];
  
  // Solo usar imágenes demo para esta propiedad específica (convencion-1994)
  // Para propiedades nuevas que crees, NO usar demo si no hay imágenes
  const images = galleryImages.length > 0 ? galleryImages : 
                (property?.id === 'convencion-1994' || !property?.id) ? demoImages : [];

  // Aplicar amenities hardcodeadas al property existente
  if (property && property.amenities) {
    property.amenities = amenitiesConvencion1994;
  }

  // LOG: Verificar amenities
  console.log('🎯 CONVENCION1994: Amenities hardcodeadas cargadas:', {
    total: amenitiesConvencion1994.departamento.length + 
           amenitiesConvencion1994.servicios.length + 
           amenitiesConvencion1994.amenitiesEdificio.length,
    departamento: amenitiesConvencion1994.departamento.length,
    servicios: amenitiesConvencion1994.servicios.length,
    edificio: amenitiesConvencion1994.amenitiesEdificio.length
  });

  // Procesar imágenes con ImageUtils
  const processedImages = images.map(img => ImageUtils.getImageSrc(img));

  useEffect(() => {
    // Simular carga de imágenes y esperar a que se cargue la galería y la propiedad
    const loadImages = async () => {
      // Esperar a que la galería y la propiedad terminen de cargar
      if (galleryLoading || propertyLoading) {
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
  }, [galleryLoading, propertyLoading]); // Dependencia del estado de carga de la galería y la propiedad

  // Función para abrir la galería de imágenes
  const openGallery = (index) => {
    setSelectedImage(index);
    setShowGallery(true);
  };

  useEffect(() => {
    // Log para debugging - mostrar datos de la propiedad cuando cambien (solo si hay cambios reales)
    if (property || galleryImages.length > 0) {
      console.log('🔄 Convencion1994 - Property or gallery updated:', { 
        propertyLoaded: !!property,
        galleryCount: galleryImages.length 
      });
    }
  }, [property?.id, galleryImages.length]); // Solo re-ejecutar si cambia el ID de la propiedad o el número de imágenes
  
  // Verificar si la propiedad está bloqueada
  if (baseProperty && baseProperty.isBlocked) {
    return <BlockedProperty propertyId="convencion-1994" propertyName="Convencion 1994" />;
  }

  return (
    <>
      {!['/convencion1994', '/departamentos/convencion-1994'].includes(window.location.pathname) ? (
        <NotFound />
      ) : (
        <>
          {isLoading && <Loading />}
          {/* Navbar independiente */}
          <nav className="navbar navbar-expand-lg sticky-top convencion-navbar">
            <div className="container">
              <Link className="navbar-brand" to="/" aria-label="BACONFORT Home">
                <img 
                  src="/img/logo.jpg" 
                  alt="BACONFORT" 
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
                aria-controls="navbarNavConvencion" 
                aria-expanded={navbarOpen} 
                aria-label="Abrir menú de navegación"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className={`navbar-collapse ${navbarOpen ? 'show' : 'collapse'}`} id="navbarNavConvencion">
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
                    <a className="nav-link" href="#convencion-1994-precios" onClick={closeNavbar} aria-label="Ver precios de alquiler">
                      <i className="fas fa-tag nav-icon" aria-hidden="true"></i> 
                      Precio
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#consulta" onClick={closeNavbar} aria-label="Consultar disponibilidad">
                      <i className="fas fa-calendar-check nav-icon" aria-hidden="true"></i> 
                      Consulta
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#calendario" onClick={closeNavbar} aria-label="Ver calendario de reservas">
                      <i className="fas fa-calendar-alt nav-icon" aria-hidden="true"></i> 
                      Calendario
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {/* Sección Hero con Video */}
          <div className="video-hero">
            <VideoPlayer
              src={ImageUtils.getVideoSrc(property?.heroVideo) || "/video/video-portada-convencion-1994.mp4"}
              poster={ImageUtils.getImageSrc(mainImage || property?.coverImage || "/img/img-convencion1.jpg")}
              title={property?.title || "Departamento Convención 1994"}
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
                  <h1 className="text-center mb-4"><i className="fas fa-building"></i> Palermo Lifestyle en el corazón de Palermo</h1>
                  <h2 className="h4 text-center mb-4"><i className="fas fa-map-marker-alt"></i> Convención 1994 - Confort y Espacio</h2>
                  
                  <div className="property-features mb-5">
                    <div className="row text-center">
                      <div className="col-md-3 col-6 mb-3">
                        <i className="fas fa-building fa-2x mb-2 feature-icon building-icon"></i>
                        <p>5° Piso con Ascensor</p>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <i className="fas fa-bed fa-2x mb-2 feature-icon bed-icon"></i>
                        <p>Studio con Living-Cocina</p>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <i className="fas fa-snowflake fa-2x mb-2 feature-icon ac-icon"></i>
                        <p>Aire Acondicionado F/C</p>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <i className="fas fa-users fa-2x mb-2 feature-icon people-icon"></i>
                        <p>Para 2 Huéspedes</p>
                      </div>
                    </div>
                  </div>

                  <div id="convencion-1994-precios" className="pricing-container">
                    <h2 className="pricing-title"><i className="fas fa-dollar-sign"></i> Valor del Alquiler</h2>
                    <div className="pricing-cards">
                      <PriceCard 
                        title="Por Mes"
                        amount={property?.prices?.monthly || "USD 1200"}
                        details="Incluye servicios y limpieza semanal"
                        whatsappMessage="Me interesa el departamento en Convención 1994 para alquiler mensual"
                        propertyId="convencion-1994"
                      />
                      <PriceCard 
                        title="Por Semana"
                        amount={property?.prices?.weekly || "USD 380"}
                        details="Incluye una limpieza"
                        whatsappMessage="Me interesa el departamento en Convención 1994 para alquiler semanal"
                        propertyId="convencion-1994"
                      />
                      <PriceCard 
                        title="Por Día"
                        amount={property?.prices?.daily || "USD 90"}
                        details="Mínimo 3 noches"
                        whatsappMessage="Me interesa el departamento en Convención 1994 para alquiler diario"
                        propertyId="convencion-1994"
                      />
                    </div>
                  </div>

                  <div className="service">
                    <h3>
                      <i className="fas fa-home" aria-hidden="true"></i> Palermo Lifestyle en el corazón de Palermo<br />
                      <i className="fas fa-map-marker-alt" aria-hidden="true"></i> Convención 1994
                    </h3>
                    <div className="description">
                      <p lang="es">
                        <strong>En Español:</strong><br />
                        {property?.description?.es || "Espectacular departamento de tres ambientes en edificio premium con amenities de primer nivel en Belgrano. Perfecto para familias que buscan confort y elegancia."}
                      </p>
                      <hr />
                      <p lang="en">
                        <strong>In English:</strong><br />
                        {property?.description?.en || "Spectacular three-room apartment in a premium building with first-class amenities in Belgrano. Perfect for families seeking comfort and elegance."}
                      </p>
                      <hr />
                      <p lang="pt">
                        <strong>Em Português:</strong><br />
                        {property?.description?.pt || "Espetacular apartamento de três ambientes em edifício premium com amenidades de primeiro nível em Belgrano. Perfeito para famílias que buscam conforto e elegância."}
                      </p>
                    </div>
                  </div>
                  {/* Comodidades Premium */}
                  <div className="amenities-list mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="h5 mb-0">
                        <i className="fas fa-star"></i> Comodidades Destacadas
                      </h3>
                      <small className="text-muted">
                        {amenitiesConvencion1994.departamento.length + amenitiesConvencion1994.servicios.length + amenitiesConvencion1994.amenitiesEdificio.length} comodidades totales
                      </small>
                    </div>
                    
                    {/* Mostrar comodidades hardcodeadas */}
                    <div className="row">
                      {/* Departamento */}
                      <div className="col-md-4">
                        <h4 className="h6 mb-3"><i className="fas fa-home"></i> Departamento</h4>
                        <ul className="list-unstyled">
                          {amenitiesConvencion1994.departamento.map((amenity, index) => (
                            <li key={`dept-${index}`}>
                              <i className={amenity.icon}></i> {amenity.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Servicios */}
                      <div className="col-md-4">
                        <h4 className="h6 mb-3"><i className="fas fa-concierge-bell"></i> Servicios</h4>
                        <ul className="list-unstyled">
                          {amenitiesConvencion1994.servicios.map((amenity, index) => (
                            <li key={`serv-${index}`}>
                              <i className={amenity.icon}></i> {amenity.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Amenities del Edificio */}
                      <div className="col-md-4">
                        <h4 className="h6 mb-3"><i className="fas fa-building"></i> Amenities del Edificio</h4>
                        <ul className="list-unstyled">
                          {amenitiesConvencion1994.amenitiesEdificio.map((amenity, index) => (
                            <li key={`amenities-${index}`}>
                              <i className={amenity.icon}></i> {amenity.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
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
                        <button 
                          onClick={refreshGallery}
                          className="btn btn-sm btn-outline-primary"
                          title="Actualizar galería"
                        >
                          <i className="fas fa-sync-alt"></i> Actualizar Galería
                        </button>
                      </div>
                    </div>
                    <div className="gallery-container">
                      {processedImages.map((img, index) => (
                        <div key={index} className="gallery-item" onClick={() => openGallery(index)}>
                          <img src={img} alt={`Departamento Convención 1994 - ${index + 1}`} loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </section>
            <div className="col-lg-4">
                  {/* Reservation form moved to dedicated section below */}
                </div>
            <section id="ubicacion" className="py-5 bg-light">
              <div className="container">
                <div className="row">
                  <div className="col-12 text-center mb-4">
                    <h2 className="section-title">
                      <i className="fas fa-map-marker-alt"></i> Ubicación Convención 1994
                    </h2>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 mb-4">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.9794528214347!2d-58.443187525655496!3d-34.57938645621117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb5eb56f5992b%3A0x95ec69c6c92a8551!2sConvenci%C3%B3n%201994%2C%20C1414%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1746470781616!5m2!1ses-419!2sar" 
                      width="100%" 
                      height="450" 
                      style={{border:0}}
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Mapa de Convención 1994"
                    ></iframe>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="location-details mb-4">
                      <h3 className="h4">Puntos de interés cercanos:</h3>
                      <ul className="list-unstyled">
                      <li><i className="fas fa-utensils"></i> Polo Gastronómico Palermo (5 min)</li>
                                <li><i className="fas fa-store"></i> Mercado de Pulgas (5 min)</li>
                                <li><i className="fas fa-subway"></i> Subte Línea D - Ministro Carranza (10 min)</li>
                                <li><i className="fas fa-subway"></i> Subte Línea B - Dorrego (12 min)</li>
                                <li><i className="fas fa-bus"></i> Metrobús Av. Juan B. Justo</li>
                                <li><i className="fas fa-shopping-cart"></i> Plaza Serrano (15 min)</li>
                                <li><i className="fas fa-coffee"></i> Cafeterías y Restaurantes (2-5 min)</li>
                                <li><i className="fas fa-walking"></i> Zona altamente transitable y segura</li>
                      </ul>
                    </div>
                  </div>
                </div>
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

            {/* Sección de Consulta de Disponibilidad */}
            <section id="consulta" className="consultation-section py-5">
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-lg-10 col-xl-8">
                    <div className="consultation-form-wrapper">
                      <AvailabilityInquiryForm 
                        apartmentName="Convención 1994" 
                        propertyId="convencion-1994" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección de Calendario de Reservas */}
            <section id="calendario" className="reservation-section py-5 bg-light">
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-lg-10 col-xl-8">
                    <div className="reservation-form-wrapper">
                      <ReservationForm apartmentName="Convención 1994" propertyId="convencion-1994" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

              {/* Sección de Reseñas */}
            <section id="reseñas" className="py-5">
              <div className="container">
                <ReviewsSection propertyId="convencion-1994" />
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
      )}
    </>
  );
}

export default Convencion1994;