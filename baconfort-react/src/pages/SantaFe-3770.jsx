import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import PriceCard from "../components/PriceCard/PriceCard";
import Gallery from '../components/Gallery/Gallery';
import ReservationForm from '../components/ReservationForm/ReservationForm';
import AvailabilityInquiryForm from '../components/AvailabilityInquiryForm/AvailabilityInquiryForm';
import Loading from '../components/Loading/Loading';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import ReviewsSection from '../components/ReviewsSection/ReviewsSection';
import { useNavbar } from '../hooks/useNavbar';
import { useGallery } from '../hooks/useGallery';
import { useProperty } from '../hooks/useProperty';
import { usePropertyFromContext } from '../hooks/usePropertyFromContext';
import ImageUtils from '../utils/ImageUtils';
import '../styles/departamento.css';
import NotFound from './NotFound';
import BlockedProperty from '../components/BlockedProperty/BlockedProperty';



function SantaFe3770() {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { navbarOpen, toggleNavbar, closeNavbar } = useNavbar();
  
  // AMENITIES HARDCODEADAS - SIN localStorage NI BACKEND
  const amenitiesSantaFe3770 = {
    departamento: [
      { icon: 'fas fa-tv', text: 'Smart TV 55"' },
      { icon: 'fas fa-wifi', text: 'WiFi 500MB Fibra Óptica' },
      { icon: 'fas fa-snowflake', text: 'Aire Acondicionado F/C' },
      { icon: 'fas fa-utensils', text: 'Cocina Completamente Equipada' },
      { icon: 'fas fa-bed', text: 'Ropa de Cama Premium' },
      { icon: 'fas fa-bath', text: 'Baño Privado con Ducha' },
      { icon: 'fas fa-tshirt', text: 'Lavarropas' },
      { icon: 'fas fa-coffee', text: 'Cafetera y Menaje Completo' },
      { icon: 'fas fa-blender', text: 'Microondas y Electrodomésticos' },
      { icon: 'fas fa-couch', text: 'Living Amueblado' },
      { icon: 'fas fa-door-closed', text: 'Balcón Privado' },
      { icon: 'fas fa-lock', text: 'Caja Fuerte' },
      { icon: 'fas fa-broom', text: 'Kit de Limpieza' },
      { icon: 'fas fa-laptop', text: 'Zona de Trabajo/Escritorio' }
    ],
    servicios: [
      { icon: 'fas fa-concierge-bell', text: 'Recepción 24hs' },
      { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
      { icon: 'fas fa-broom', text: 'Servicio de Limpieza' },
      { icon: 'fas fa-car', text: 'Servicio de Traslados' },
      { icon: 'fas fa-suitcase', text: 'Guardaequipaje' },
      { icon: 'fas fa-info-circle', text: 'Información Turística' },
      { icon: 'fas fa-phone', text: 'Asistencia 24/7' }
    ],
    amenitiesEdificio: [
      { icon: 'fas fa-elevator', text: 'Ascensor' },
      { icon: 'fas fa-car', text: 'Cochera/Estacionamiento' },
      { icon: 'fas fa-dumbbell', text: 'Gimnasio' },
      { icon: 'fas fa-swimming-pool', text: 'Piscina' },
      { icon: 'fas fa-sun', text: 'Solarium/Terraza' },
      { icon: 'fas fa-users', text: 'SUM/Salón de Usos Múltiples' },
      { icon: 'fas fa-spa', text: 'Spa/Jacuzzi' },
      { icon: 'fas fa-tree', text: 'Jardín/Espacios Verdes' },
      { icon: 'fas fa-building', text: 'Edificio Moderno' },
      { icon: 'fas fa-shield-alt', text: 'Portería/Seguridad 24hs' }
    ]
  };
  
  // Cargar galería desde la base de datos
  const { 
    images: galleryImages, 
    loading: galleryLoading, 
    error: galleryError, 
    mainImage,
    refreshGallery 
  } = useGallery('santa-fe-3770');

  // Cargar información completa de la propiedad desde el contexto (prioritario)
  const {
    property: contextProperty,
    loading: isContextLoading,
    error: contextError,
    refreshProperty: refreshContextProperty,
    isUsingContext
  } = usePropertyFromContext('santa-fe-3770');

  // Cargar información completa de la propiedad desde el backend (fallback)
  const {
    property: apiProperty,
    loading: isApiPropertyLoading,
    error: apiPropertyError,
    refreshProperty: refreshApiProperty,
    isUsingFallback
  } = useProperty('santa-fe-3770');

  // PROPIEDAD FINAL CON AMENITIES HARDCODEADAS
  const baseProperty = contextProperty || apiProperty;
  const property = baseProperty ? {
    ...baseProperty,
    amenities: amenitiesSantaFe3770 // SIEMPRE usar las amenities hardcodeadas
  } : {
    // Datos básicos si no hay backend
    id: 'santa-fe-3770',
    title: 'Santa Fe 3770',
    amenities: amenitiesSantaFe3770,
    prices: {
      daily: "USD 75",
      weekly: "USD 420", 
      monthly: "USD 1000"
    }
  };

  const isPropertyLoading = isContextLoading || isApiPropertyLoading;
  const propertyError = contextError || apiPropertyError;

  // Función para refrescar propiedades
  const refreshProperty = () => {
    if (refreshContextProperty) refreshContextProperty();
    if (refreshApiProperty) refreshApiProperty();
  };

  // Escuchar eventos de actualización de precios
  useEffect(() => {
    const handlePriceUpdate = (event) => {
      if (event.detail.propertyId === 'santa-fe-3770') {
        console.log('🔄 SantaFe3770 - Evento de actualización de precios recibido:', event.detail);
        // Forzar refresh de la propiedad para obtener los nuevos precios
        refreshProperty();
      }
    };

    window.addEventListener('baconfort-prices-updated', handlePriceUpdate);
    return () => {
      window.removeEventListener('baconfort-prices-updated', handlePriceUpdate);
    };
  }, [refreshProperty]);

  useEffect(() => {
    // Log de la información de la propiedad cuando se carga
    if (property) {
      console.log('🏠 SANTA FE 3770: Propiedad cargada:', property);
      console.log('💰 SANTA FE 3770: Precios recibidos:', property.prices);
      console.log('🏠 SANTA FE 3770: Amenities:', property.amenities);
      console.log('🏠 SANTA FE 3770: Usando fallback:', isUsingFallback);
    }
  }, [property, isUsingFallback]);
  
  // Estado para precios dinámicos
  const [currentPrices, setCurrentPrices] = useState({
    monthly: "USD 1000",
    weekly: "USD 420", 
    daily: "USD 75"
  });
  
  // Actualizar precios cuando cambien los datos del backend
  useEffect(() => {
    if (property && property.prices) {
      console.log('💰 SantaFe3770 - Actualizando precios:', property.prices);
      setCurrentPrices({
        monthly: property.prices.monthly || "USD 1000",
        weekly: property.prices.weekly || "USD 420",
        daily: property.prices.daily || "USD 75"
      });
    }
  }, [property?.prices]);
  
  // Escuchar eventos de actualización de precios
  useEffect(() => {
    const handlePriceUpdate = (event) => {
      console.log('🔍 SantaFe3770 - Evento recibido completo:', event);
      console.log('🔍 SantaFe3770 - Event detail:', event.detail);
      console.log('🔍 SantaFe3770 - propertyId del evento:', event.detail.propertyId);
      console.log('🔍 SantaFe3770 - Mi ID esperado: santa-fe-3770');
      console.log('🔍 SantaFe3770 - ¿Coinciden?:', event.detail.propertyId === 'santa-fe-3770');
      
      if (event.detail.propertyId === 'santa-fe-3770') {
        console.log('✅ SantaFe3770 - Evento de actualización de precios recibido:', event.detail);
        console.log('💰 SantaFe3770 - Precios recibidos:', event.detail.prices);
        
        setCurrentPrices({
          monthly: event.detail.prices.monthly || "USD 1000",
          weekly: event.detail.prices.weekly || "USD 420",
          daily: event.detail.prices.daily || "USD 75"
        });
        
        console.log('💰 SantaFe3770 - Precios actualizados a:', {
          monthly: event.detail.prices.monthly || "USD 1000",
          weekly: event.detail.prices.weekly || "USD 420",
          daily: event.detail.prices.daily || "USD 75"
        });
      }
    };

    window.addEventListener('baconfort-prices-updated', handlePriceUpdate);
    return () => window.removeEventListener('baconfort-prices-updated', handlePriceUpdate);
  }, []);
  
  // Imágenes de fallback para cuando no hay imágenes en la base de datos
  const demoImages = [
    '/img/img-santa-fe1-3770.jpg',
    '/img/img-santa-fe2-3770.jpg',
    '/img/img-santa-fe3-3770.jpg',
    '/img/img-santa-fe4-3770.jpg',
    '/img/img-santa-fe5-3770.jpg',
    '/img/img-santa-fe6-3770.jpg',
    '/img/img-santa-fe7-3770.jpg',
    '/img/img-santa-fe8-3770.jpg',
    '/img/img-santa-fe9-3770.jpg',
    '/img/img-santa-fe10-3770.jpg',
    '/img/img-santa-fe11-3770.jpg',
    '/img/img-santa-fe12-3770.jpg',
    '/img/img-santa-fe13-3770.jpg',
    '/img/img-santa-fe14-3770.jpg',
    '/img/img-santa-fe15-3770.jpg',
    '/img/img-santa-fe16-3770.jpg',
    '/img/img-santa-fe17-3770.jpg',
    '/img/img-santa-fe18-3770.jpg',
    '/img/img-santa-fe19-3770.jpg',
    '/img/img-santa-fe20-3770.jpg',
    '/img/img-santa-fe21-3770.jpg',
  ];
  
  // Solo usar imágenes demo para esta propiedad específica (santa-fe-3770)
  // Para propiedades nuevas que crees, NO usar demo si no hay imágenes
  const images = galleryImages.length > 0 ? galleryImages : 
                (property?.id === 'santa-fe-3770' || !property?.id) ? demoImages : [];

  // Aplicar amenities hardcodeadas al property existente
  if (property && property.amenities) {
    property.amenities = amenitiesSantaFe3770;
  }

  // LOG: Verificar amenities
  console.log('🎯 SANTAFE3770: Amenities hardcodeadas cargadas:', {
    total: amenitiesSantaFe3770.departamento.length + 
           amenitiesSantaFe3770.servicios.length + 
           amenitiesSantaFe3770.amenitiesEdificio.length,
    departamento: amenitiesSantaFe3770.departamento.length,
    servicios: amenitiesSantaFe3770.servicios.length,
    edificio: amenitiesSantaFe3770.amenitiesEdificio.length
  });

  // Procesar imágenes con ImageUtils
  const processedImages = images.map(img => ImageUtils.getImageSrc(img));

  useEffect(() => {
    // Simular carga de imágenes y esperar a que se cargue la galería
    const loadImages = async () => {
      // Esperar a que la galería termine de cargar
      if (galleryLoading) {
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
  }, [galleryLoading]); // Dependencia del estado de carga de la galería

  const openGallery = (index) => {
    setSelectedImage(index);
    setShowGallery(true);
  };

  useEffect(() => {
    const loadImages = async () => {
      try {
        const imagePromises = processedImages.map(src => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = reject;
          });
        });

        await Promise.all(imagePromises);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading images:', error);
        setIsLoading(false);
      }
    };

    loadImages();
  }, [processedImages]);

  // Verificar si la propiedad está bloqueada
  if (baseProperty && baseProperty.isBlocked) {
    return <BlockedProperty propertyId="santa-fe-3770" propertyName="Santa Fe 3770" />;
  }
  
  return (
    <>
      {!['/santafe3770', '/departamentos/santa-fe-3770'].includes(window.location.pathname) ? (
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
                    <a className="nav-link" href="#santa-fe-3770-precios" onClick={closeNavbar} aria-label="Ver precios de alquiler">
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
                    <a className="nav-link" href="#calendario" onClick={closeNavbar} aria-label="Ver calendario de disponibilidad">
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
              src={ImageUtils.getVideoSrc(property?.heroVideo) || "/video/video-portada-santa-fe-3770.mp4"}
              poster={ImageUtils.getImageSrc(mainImage || property?.coverImage || "/img/img-santa-fe10.jpg")}
              title={property?.title || "Departamento Santa Fe 3770"}
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
                  <h1 className="text-center mb-4"><i className="fas fa-building"></i> Palermo Lifestylet</h1>
                  <h2 className="h4 text-center mb-4"><i className="fas fa-map-marker-alt"></i>   Santa Fe 3770 - Confort y Espacio</h2>
                  
                  <div className="property-features mb-5">
                    <div className="row text-center">
                      <div className="col-md-3 col-6 mb-3">
                        <i className="fas fa-building fa-2x mb-2 feature-icon building-icon"></i>
                        <p> 12° Piso con Ascensor</p>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <i className="fas fa-bed fa-2x mb-2 feature-icon bed-icon"></i>
                        <p> 2 Dormitorios</p>
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
                  <div id="santa-fe-3770-precios" className="pricing-container">
                    <h2 className="pricing-title"><i className="fas fa-dollar-sign"></i> Valor del Alquiler</h2>
                    <div className="pricing-cards">
                      <PriceCard 
                        title="Por Mes"
                        amount={currentPrices.monthly}
                        details="No incluye servicios y limpieza semanal"
                        whatsappMessage="Me interesa el departamento en Santa Fe 3770 para alquiler mensual"
                        propertyId="santa-fe-3770"
                      />
                      <PriceCard 
                        title="Por Semana"
                        amount={currentPrices.weekly}
                        details="No incluye una limpieza"
                        whatsappMessage="Me interesa el departamento en Santa Fe 3770 para alquiler semanal"
                        propertyId="santa-fe-3770"
                      />
                      <PriceCard 
                        title="Por Día"
                        amount={currentPrices.daily}
                        details="Mínimo 3 noches"
                        whatsappMessage="Me interesa el departamento en Santa Fe 3770 para alquiler diario"
                        propertyId="santa-fe-3770"
                      />
                    </div>
                  </div>

                  <div className="service">
                    <h3>
                      <i className="fas fa-home" aria-hidden="true"></i> Chic Studio by Jardín Botánico<br />
                      <i className="fas fa-map-marker-alt" aria-hidden="true"></i> Av. Santa Fe 3770<br />
                    </h3>
                    <div className="description">
                      <p lang="es">
                        <strong>En Español:</strong><br />
                        {property?.description?.es || "Moderno departamento de dos ambientes en pleno corazón de Palermo con diseño contemporáneo y amenities de lujo. Ubicación privilegiada con fácil acceso a transporte y entretenimiento."}
                      </p>
                      <hr />
                      <p lang="en">
                        <strong>In English:</strong><br />
                        {property?.description?.en || "Modern two-room apartment in the heart of Palermo with contemporary design and luxury amenities. Prime location with easy access to transport and entertainment."}
                      </p>
                      <hr />
                      <p lang="pt">
                        <strong>Em Português:</strong><br />
                        {property?.description?.pt || "Moderno apartamento de dois ambientes no coração de Palermo com design contemporâneo e amenidades de luxo. Localização privilegiada com fácil acesso a transporte e entretenimento."}
                      </p>
                    </div>
                  </div>
                  
                  {/* Comodidades Destacadas */}
                  <div className="amenities-list mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="h5 mb-0">
                        <i className="fas fa-star"></i> Comodidades Destacadas
                      </h3>
                      <small className="text-muted">
                        {amenitiesSantaFe3770.departamento.length + amenitiesSantaFe3770.servicios.length + amenitiesSantaFe3770.amenitiesEdificio.length} comodidades totales
                      </small>
                    </div>
                    
                    {/* Mostrar comodidades hardcodeadas */}
                    <div className="row">
                      {/* Departamento */}
                      <div className="col-md-4">
                        <h4 className="h6 mb-3"><i className="fas fa-home"></i> Departamento</h4>
                        <ul className="list-unstyled">
                          {amenitiesSantaFe3770.departamento.map((amenity, index) => (
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
                          {amenitiesSantaFe3770.servicios.map((amenity, index) => (
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
                          {amenitiesSantaFe3770.amenitiesEdificio.map((amenity, index) => (
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
                      <div style={{ display: 'flex', gap: '10px' }}>
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
                          <img src={img} alt={`Departamento Santa Fe 3770 - ${index + 1}`} loading="lazy" />
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
                      <i className="fas fa-map-marker-alt"></i> Ubicación Santa Fe 3770
                    </h2>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 mb-4">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.7660184958695!2d-58.419351225655085!3d-34.584786556496226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb57f7a315c89%3A0x77e5993c26725c26!2sAv.%20Sta.%20Fe%203770%2C%20C1425%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1746478051004!5m2!1ses-419!2sar" 
                      width="100%" 
                      height="450" 
                      style={{border:0}}
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Mapa de Santa Fe 3770"
                    ></iframe>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="location-details mb-4">
                      <h3 className="h4">Puntos de interés cercanos:</h3>
                      <ul className="list-unstyled">
                      <li><i className="fas fa-subway"></i> Subte Línea D - Scalabrini Ortiz (1 min)</li>
                                <li><i className="fas fa-store"></i> Av. Santa Fe - Zona comercial (1 min)</li>
                                <li><i className="fas fa-tree"></i> Jardín Botánico Carlos Thays (2 min)</li>
                                <li><i className="fas fa-shopping-cart"></i> Alto Palermo Shopping (15 min)</li>
                                <li><i className="fas fa-hospital"></i> Hospital Italiano (10 min)</li>
                                <li><i className="fas fa-hospital"></i> Sanatorio Güemes (8 min)</li>
                                <li><i className="fas fa-bus"></i> Múltiples líneas de colectivo</li>
                                <li><i className="fas fa-coffee"></i> Cafeterías y restaurantes (1 min)</li>
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
                        apartmentName="Santa Fe 3770" 
                        propertyId="santa-fe-3770" 
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
                      <ReservationForm apartmentName="Santa Fe 3770" propertyId="santa-fe-3770" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </main>

          {/* Sección de Reseñas */}
          <ReviewsSection propertyId="santa-fe-3770" />
          
          {showGallery && (
            <Gallery 
              images={processedImages}
              currentIndex={selectedImage}
              onClose={() => setShowGallery(false)}
            />
          )}
        </>
      )}
    </>
  );
}

export default SantaFe3770;
