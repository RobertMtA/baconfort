import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import PriceCard from "../components/PriceCard/PriceCard";
import Gallery from '../components/Gallery/Gallery';
import ReservationForm from '../components/ReservationForm/ReservationForm';
import AvailabilityInquiryForm from '../components/AvailabilityInquiryForm/AvailabilityInquiryForm';
import ReviewsSection from '../components/ReviewsSection/ReviewsSection';
import Loading from '../components/Loading/Loading';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import { useGallery } from '../hooks/useGallery';
import { useProperty } from '../hooks/useProperty';
import { usePropertyFromContext } from '../hooks/usePropertyFromContext';
import { useNavbar } from '../hooks/useNavbar';
import ImageUtils from '../utils/ImageUtils';
import '../styles/departamento.css';
import NotFound from './NotFound';
import BlockedProperty from '../components/BlockedProperty/BlockedProperty';


function Moldes1680() {
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { navbarOpen, toggleNavbar, closeNavbar } = useNavbar();

  const { 
    images: galleryImages, 
    loading: isGalleryLoading, 
    error: galleryError,
    refreshGallery 
  } = useGallery('moldes-1680');

  // AMENITIES HARDCODEADAS - SIN localStorage NI BACKEND
  const amenitiesMoldes1680 = {
    departamento: [
      { icon: 'fas fa-tv', text: 'Smart TV 43"' },
      { icon: 'fas fa-wifi', text: 'WiFi 300MB Fibra Óptica' },
      { icon: 'fas fa-snowflake', text: 'Aire Acondicionado F/C' },
      { icon: 'fas fa-utensils', text: 'Cocina Completamente Equipada' },
      { icon: 'fas fa-bed', text: 'Ropa de Cama' },
      { icon: 'fas fa-bath', text: 'Baño Privado con Ducha' },
      { icon: 'fas fa-tshirt', text: 'Lavarropas' },
      { icon: 'fas fa-blender', text: 'Microondas y Electrodomésticos' },
      { icon: 'fas fa-couch', text: 'Living Amueblado' },
      { icon: 'fas fa-door-closed', text: 'Balcón Privado' },
    ],
    servicios: [
      { icon: 'fas fa-phone', text: 'Asistencia 24/7' }
    ],
    amenitiesEdificio: [
      { icon: 'fas fa-elevator', text: 'Ascensor' }
    ]
  };

  // Cargar información completa de la propiedad desde el contexto (prioritario)
  const {
    property: contextProperty,
    loading: isContextLoading,
    error: contextError,
    refreshProperty: refreshContextProperty,
    isUsingContext
  } = usePropertyFromContext('moldes-1680');

  // Cargar información completa de la propiedad desde el backend (fallback)
  const {
    property: apiProperty,
    loading: isApiPropertyLoading,
    error: apiPropertyError,
    refreshProperty: refreshApiProperty,
    isUsingFallback
  } = useProperty('moldes-1680');

  // PROPIEDAD FINAL CON AMENITIES HARDCODEADAS
  const baseProperty = contextProperty || apiProperty;
  const property = baseProperty ? {
    ...baseProperty,
    amenities: amenitiesMoldes1680 // SIEMPRE usar las amenities hardcodeadas
  } : {
    // Datos básicos si no hay backend
    id: 'moldes-1680',
    title: 'Moldes 1680',
    amenities: amenitiesMoldes1680,
    prices: {
      daily: "USD 70",
      weekly: "USD 400", 
      monthly: "USD 1200"
    },
    description: {
      es: "Exclusivo departamento de dos ambientes en edificio boutique con amenities premium en Belgrano. Diseño moderno, espacios luminosos y todas las comodidades para una estadía perfecta.",
      en: "Exclusive two-room apartment in a boutique building with premium amenities in Belgrano. Modern design, bright spaces, and all the comforts for a perfect stay.",
      pt: "Apartamento exclusivo de dois ambientes em edifício boutique com amenidades premium em Belgrano. Design moderno, espaços luminosos e todas as comodidades para uma estadia perfeita."
    }
  };
  
  // Estado para precios dinámicos
  const [currentPrices, setCurrentPrices] = useState({
    monthly: "USD 1000",
    weekly: "USD 350", 
    daily: "USD 65"
  });
  
  // Actualizar precios cuando cambien los datos del backend
  useEffect(() => {
    if (property && property.prices) {
      console.log('💰 Moldes1680 - Actualizando precios:', property.prices);
      setCurrentPrices({
        monthly: property.prices.monthly || "USD 1000",
        weekly: property.prices.weekly || "USD 350",
        daily: property.prices.daily || "USD 65"
      });
    }
  }, [property?.prices]);
  
  // Escuchar eventos de actualización de precios
  useEffect(() => {
    const handlePriceUpdate = (event) => {
      if (event.detail.propertyId === 'moldes-1680') {
        console.log('🔄 Moldes1680 - Evento de actualización de precios recibido:', event.detail);
        setCurrentPrices({
          monthly: event.detail.prices.monthly || "USD 1000",
          weekly: event.detail.prices.weekly || "USD 350",
          daily: event.detail.prices.daily || "USD 65"
        });
      }
    };

    window.addEventListener('baconfort-prices-updated', handlePriceUpdate);
    return () => window.removeEventListener('baconfort-prices-updated', handlePriceUpdate);
  }, []);

  const isPropertyLoading = isContextLoading || isApiPropertyLoading;
  const propertyError = contextError || apiPropertyError;

  // Función para refrescar propiedades
  const refreshProperty = () => {
    refreshContextProperty();
    refreshApiProperty();
  };

  // Auto-refresh cuando cambie el contexto (para sincronización con admin)
  useEffect(() => {
    if (contextProperty && contextProperty.lastModified) {
      // Detectado cambio en contexto, refrescando...
    }
  }, [contextProperty?.lastModified, contextProperty?.updatedAt]);

  // Amenities hardcodeadas cargadas

  // Sincronización automática con admin

  // Fallback images if database is empty - SOLO para esta propiedad específica
  const fallbackImages = [
    '/img/img-moldes1-1680.jpg',
    '/img/img-moldes2-1680.jpg',
    '/img/img-moldes3-1680.jpg',
    '/img/img-moldes4-1680.jpg',
    '/img/img-moldes5-1680.jpg',
    '/img/img-moldes6-1680.jpg',
    '/img/img-moldes7-1680.jpg',
    '/img/img-moldes8-1680.jpg',
  ];

  // Solo usar imágenes demo para esta propiedad específica (moldes-1680)
  // Para propiedades nuevas que crees, NO usar demo si no hay imágenes
  const images = galleryImages.length > 0 ? galleryImages : 
                (property?.id === 'moldes-1680' || !property?.id) ? fallbackImages : [];

  // Procesar imágenes con ImageUtils
  const processedImages = images.map(img => ImageUtils.getImageSrc(img));

  const openGallery = (index) => {
    setCurrentImageIndex(index);
    setShowGallery(true);
  };

  useEffect(() => {
    // Simular carga de imágenes
    const loadImages = async () => {
      const images = document.querySelectorAll('img');
      const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve); // Handle error cases too
        });
      });

      await Promise.all(promises);
      setIsLoading(false);
    };

    loadImages();
  }, []);
  // Verificar si la propiedad está bloqueada
  if (baseProperty && baseProperty.isBlocked) {
    return <BlockedProperty propertyId="moldes-1680" propertyName="Moldes 1680" />;
  }

  return (
    <>
      {!['/moldes1680', '/departamentos/moldes-1680'].includes(window.location.pathname) ? (
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
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className={`navbar-collapse ${navbarOpen ? 'show' : 'collapse'}`} id="navbarNav">
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <a className="nav-link" href="/" onClick={closeNavbar}><i className="fas fa-home nav-icon"></i> Inicio</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#servicios" onClick={closeNavbar}><i className="fas fa-list nav-icon"></i> Detalles</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#ubicacion" onClick={closeNavbar}><i className="fas fa-map-marker-alt nav-icon"></i> Ubicación</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#moldes-1680-precios" onClick={closeNavbar}><i className="fas fa-tag nav-icon"></i> Precio</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#reseñas" onClick={closeNavbar}><i className="fas fa-star nav-icon"></i> Reseñas</a>
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
              src={ImageUtils.getVideoSrc(property?.heroVideo) || "/video/video-portada-moldes-1680.mp4"}
              poster={ImageUtils.getImageSrc(property?.coverImage || "/img/img-moldes3.jpg")}
              title={property?.title || "Departamento Moldes 1680"}
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
                  <h1 className="text-center mb-4"><i className="fas fa-building"></i> Belgrano Family Retreat</h1>
                  <h2 className="h4 text-center mb-4"><i className="fas fa-map-marker-alt"></i> Moldes 1680 - Confort y Espacio</h2>
                  
                  <div className="property-features mb-5">
                    <div className="row text-center">
                      <div className="col-md-3 col-6 mb-3">
                        <i className="fas fa-building fa-2x mb-2 feature-icon"></i>
                        <p>2° Piso con Ascensor</p>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <i className="fas fa-bed fa-2x mb-2 feature-icon"></i>
                        <p>2 Dormitorios</p>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <i className="fas fa-snowflake fa-2x mb-2 feature-icon"></i>
                        <p>Aire Acondicionado F/C</p>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <i className="fas fa-users fa-2x mb-2 feature-icon"></i>
                        <p>Para 4 Huéspedes</p>
                      </div>
                    </div>
                  </div>

                  <div id="moldes-1680-precios" className="pricing-container">
                    <h2 className="pricing-title"><i className="fas fa-dollar-sign"></i> Valor del Alquiler</h2>
                    <div className="pricing-cards">
                      <PriceCard 
                        title="Por Mes"
                        amount={currentPrices.monthly}
                        details="No incluye servicios y limpieza semanal"
                        whatsappMessage="Me interesa el departamento en Moldes 1680 para alquiler mensual"
                        propertyId="moldes-1680"
                      />
                      <PriceCard 
                        title="Por Semana"
                        amount={currentPrices.weekly}
                        details="No incluye una limpieza"
                        whatsappMessage="Me interesa el departamento en Moldes 1680 para alquiler semanal"
                        propertyId="moldes-1680"
                      />
                      <PriceCard 
                        title="Por Día"
                        amount={currentPrices.daily}
                        details="Mínimo 3 noches"
                        whatsappMessage="Me interesa el departamento en Moldes 1680 para alquiler diario"
                        propertyId="moldes-1680"
                      />
                    </div>
                  </div>

                  <div className="service">
                    <h3>
                      <i className="fas fa-home"></i> Belgrano Family Retreat<br />
                      <i className="fas fa-map-marker-alt"></i> Moldes 1680 - Confort y Espacio
                    </h3>
                    <div className="description">
                      <p lang="es">
                        <strong>En Español:</strong><br />
                        {property?.description?.es || "Exclusivo departamento de dos ambientes en edificio boutique con amenities premium en Belgrano. Diseño moderno, espacios luminosos y todas las comodidades para una estadía perfecta."}
                      </p>
                      <hr />
                      <p lang="en">
                        <strong>In English:</strong><br />
                        {property?.description?.en || "Exclusive two-room apartment in a boutique building with premium amenities in Belgrano. Modern design, bright spaces, and all the comforts for a perfect stay."}
                      </p>
                      <hr />
                      <p lang="pt">
                        <strong>Em Português:</strong><br />
                        {property?.description?.pt || "Apartamento exclusivo de dois ambientes em edifício boutique com amenidades premium em Belgrano. Design moderno, espaços luminosos e todas as comodidades para uma estadia perfeita."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="amenities-list mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="h5 mb-0">
                        <i className="fas fa-star"></i> Comodidades Destacadas
                      </h3>
                      <small className="text-muted">
                        {amenitiesMoldes1680.departamento.length + amenitiesMoldes1680.servicios.length + amenitiesMoldes1680.amenitiesEdificio.length} comodidades totales
                      </small>
                    </div>
                    
                    {/* Mostrar comodidades hardcodeadas */}
                    <div className="row">
                      {/* Departamento */}
                      <div className="col-md-4">
                        <h4 className="h6 mb-3"><i className="fas fa-home"></i> Departamento</h4>
                        <ul className="list-unstyled">
                          {amenitiesMoldes1680.departamento.map((amenity, index) => (
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
                          {amenitiesMoldes1680.servicios.map((amenity, index) => (
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
                          {amenitiesMoldes1680.amenitiesEdificio.map((amenity, index) => (
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
                        <button 
                          onClick={refreshGallery}
                          className="btn btn-sm btn-outline-primary"
                          title="Actualizar galería"
                        >
                          <i className="fas fa-sync-alt"></i> Actualizar
                        </button>
                      </div>
                    </div>
                    <div className="gallery-container">
                      {processedImages.map((img, index) => (
                        <div key={index} className="gallery-item" onClick={() => openGallery(index)}>
                          <img src={img} alt={`Departamento Moldes 1680 - ${index + 1}`} loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </section>
            <div className="col-lg-4">
                  {/* Reservation form moved to bottom section with correct apartmentName prop */}
                </div>
            <section id="ubicacion" className="py-5 bg-light">
              <div className="container">
                <div className="row">
                  <div className="col-12 text-center mb-4">
                    <h2 className="section-title">
                      <i className="fas fa-map-marker-alt"></i> Ubicación Moldes 1680
                    </h2>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 mb-4">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.4459416106006!2d-58.45894352565634!3d-34.56758125558819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb5d0c68f12dd%3A0xaae761375ee581ce!2sMoldes%201680%2C%20C1426ALV%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1746476890169!5m2!1ses-419!2sar" 
                      width="100%" 
                      height="450" 
                      style={{border:0}}
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Mapa de Moldes 1680"
                    ></iframe>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="location-details mb-4">
                      <h3 className="h4">Puntos de interés cercanos:</h3>
                      <ul className="list-unstyled">
                        <li><i className="fas fa-subway"></i> Subte Línea D - José Hernández (2 min)</li>
                        <li><i className="fas fa-store"></i> Av. Cabildo (5 min)</li>
                        <li><i className="fas fa-tree"></i> Barrancas de Belgrano (10 min)</li>
                        <li><i className="fas fa-utensils"></i> Barrio Chino (15 min)</li>
                        <li><i className="fas fa-bus"></i> Múltiples líneas de colectivo</li>
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
                        apartmentName="Moldes 1680" 
                        propertyId="moldes-1680" 
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
                      <ReservationForm apartmentName="Moldes 1680" propertyId="moldes-1680" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección de Reseñas */}
            <ReviewsSection propertyId="moldes-1680" />
          </main>
          
          {showGallery && (
            <Gallery 
              images={images}
              currentIndex={currentImageIndex}
              onClose={() => setShowGallery(false)}
            />
          )}
        </>
      )}
    </>
  );
}

export default Moldes1680;