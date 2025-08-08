import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext-STATEFUL';
import DepartamentoCard from "../components/DepartamentoCard/DepartamentoCard";
import Carousel from "../components/Carousel/Carousel";
import SubscriptionForm from "../components/SubscriptionForm/SubscriptionForm";
import Header from '../components/Header/Header';
import './Home.css';
import NotFound from './NotFound';

function Home() {
  const { getAllProperties } = useAdmin();
  const properties = getAllProperties();
  
  // Lista de IDs de propiedades que queremos mantener (las 5 principales)
  const mainPropertyIds = [
    'moldes-1680', 
    'santa-fe-3770', 
    'dorrego-1548', 
    'convencion-1994', 
    'ugarteche-2824'
  ];
  
  // Filtrar solo las propiedades principales que tengan imágenes y NO estén bloqueadas
  const propertyList = Object.values(properties)
    .filter(property => 
      mainPropertyIds.includes(property.id) && 
      property.coverImage && 
      !property.isBlocked);

  // Colores para las tarjetas
  const cardColors = ['bg-info', 'bg-success', 'bg-warning', 'bg-danger', 'bg-primary', 'bg-secondary'];
  
  // Mapeo de rutas para propiedades estáticas conocidas
  const staticRouteMap = {
    'moldes-1680': '/departamentos/moldes-1680',
    'santa-fe-3770': '/departamentos/santa-fe-3770',
    'dorrego-1548': '/departamentos/dorrego-1548',
    'convencion-1994': '/departamentos/convencion-1994',
    'ugarteche-2824': '/departamentos/ugarteche-2824'
  };

  return (
    <>
      <Header />
      <hr />

      <main className="home">
        <h1>BA.CONFORT - Alquiler Temporario</h1>
        <h2>Vive Buenos Aires - Tu experiencia porteña comienza aquí.</h2>
        
        {/* Carrusel principal */}
        <Carousel />
        
        <p>
          Bienvenido a BA CONFORT, tu hogar temporal en Buenos Aires. Ofrecemos departamentos y casas únicas en las mejores zonas de la ciudad: Palermo, Belgrano y Recoleta.
        </p>
        <p>
          Cada espacio está diseñado con estilo y funcionalidad, para que te sientas como en casa. Nuestra misión es hacer que tu estancia sea inolvidable y cómoda.
        </p>
        <p className="highlight-text">¡Te esperamos para que vivas una experiencia única!</p>
        
        <hr />
        
        <h2 className="location-title"><i className="fas fa-map-marker-alt text-primary me-2"></i>¿Dónde Estamos?</h2>
        
        <div className="departamentos-grid">
          {propertyList.length > 0 ? (
            propertyList.map((property, index) => {
              const route = staticRouteMap[property.id] || `/departamentos/${property.id}`;
              const colorClass = cardColors[index % cardColors.length];
              
              return (
                <DepartamentoCard 
                  key={property.id}
                  title={<><i className="fas fa-building text-info me-2"></i>{property.title || 'Propiedad'}</>}
                  address={<><i className="fas fa-map-pin text-secondary me-2"></i>{property.address || 'Dirección no disponible'}</>}
                  image={property.coverImage || '/img/logo.jpg'}
                  path={route}
                  badgeColor={colorClass}
                />
              );
            })
          ) : (
            <div className="no-properties-message">
              <p>No hay propiedades disponibles en este momento.</p>
            </div>
          )}
        </div>

        {/* Sección de Ubicaciones */}
        <section id="ubicacion" className="py-5 bg-light">
          <div className="container">
            <h2 className="text-center mb-4">
              <i className="fas fa-map-marked-alt location-title-icon"></i> Nuestras Ubicaciones
            </h2>
            <div className="row">
              {/* Propiedad 1: Ugarteche 2824 */}
              <div className="col-md-4 mb-4">
                <div className="location-card">
                  <h3><i className="fas fa-building location-icon"></i> Palermo Botánico</h3>
                  <p><i className="fas fa-map-marker-alt"></i> Ugarteche 2824</p>
                  <p><i className="fas fa-subway"></i> Cerca de Subte D</p>
                  <p><i className="fas fa-tree"></i> Próximo al Jardín Botánico</p>
                  <p><i className="fas fa-hospital"></i> Hospital Italiano</p>
                  <Link to="/departamentos/ugarteche-2824" className="btn btn-primary">
                    <i className="fas fa-info-circle"></i> Más Información
                  </Link>
                </div>
              </div>
              
              {/* Propiedad 2: Santa Fe 3770 */}
              <div className="col-md-4 mb-4">
                <div className="location-card">
                  <h3><i className="fas fa-building location-icon"></i> Palermo</h3>
                  <p><i className="fas fa-map-marker-alt"></i> Santa Fe 3770</p>
                  <p><i className="fas fa-subway"></i> Cerca de Subte D</p>
                  <p><i className="fas fa-shopping-bag"></i> Zona Comercial</p>
                  <p><i className="fas fa-hospital"></i> Sanatorio Güemes</p>
                  <Link to="/departamentos/santa-fe-3770" className="btn btn-primary">
                    <i className="fas fa-info-circle"></i> Más Información
                  </Link>
                </div>
              </div>
              
              {/* Propiedad 3: Moldes 1680 */}
              <div className="col-md-4 mb-4">
                <div className="location-card">
                  <h3><i className="fas fa-building location-icon"></i> Belgrano</h3>
                  <p><i className="fas fa-map-marker-alt"></i> Moldes 1680</p>
                  <p><i className="fas fa-subway"></i> Cerca de Subte D</p>
                  <p><i className="fas fa-store"></i> Próximo a Av. Cabildo</p>
                  <p><i className="fas fa-hospital"></i> Hospital Pirovano</p>
                  <Link to="/departamentos/moldes-1680" className="btn btn-primary">
                    <i className="fas fa-info-circle"></i> Más Información
                  </Link>
                </div>
              </div>
              
              {/* Propiedad 4: Convención 1994 */}
              <div className="col-md-6 mb-4">
                <div className="location-card">
                  <h3><i className="fas fa-building location-icon"></i> Palermo</h3>
                  <p><i className="fas fa-map-marker-alt"></i> Convención 1994</p>
                  <p><i className="fas fa-utensils"></i> Zona Gastronómica</p>
                  <p><i className="fas fa-shopping-bag"></i> Área Comercial</p>
                  <p><i className="fas fa-hospital"></i> Hospital Fernández</p>
                  <Link to="/departamentos/convencion-1994" className="btn btn-primary">
                    <i className="fas fa-info-circle"></i> Más Información
                  </Link>
                </div>
              </div>
              
              {/* Propiedad 5: Dorrego 1548 */}
              <div className="col-md-6 mb-4">
                <div className="location-card">
                  <h3><i className="fas fa-building location-icon"></i> Palermo</h3>
                  <p><i className="fas fa-map-marker-alt"></i> Dorrego 1548</p>
                  <p><i className="fas fa-glass-cheers"></i> Zona de Bares</p>
                  <p><i className="fas fa-tree"></i> Cerca de Parques</p>
                  <p><i className="fas fa-hospital"></i> Sanatorio Los Arcos</p>
                  <Link to="/departamentos/dorrego-1548" className="btn btn-primary">
                    <i className="fas fa-info-circle"></i> Más Información
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Suscripción */}
        <SubscriptionForm />
      </main>
    </>
  );
}

export default Home;