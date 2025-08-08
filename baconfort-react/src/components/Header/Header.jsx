import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContextAPI';
import UserButton from '../Auth/UserButton';
import './Header.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navigation = [
    { title: "Inicio", path: "/", icon: "home" },
    { title: "Promociones", path: "/promociones", icon: "tags" },
    { title: "Detalles", path: "#detalles", icon: "info-circle" },
    { title: "Suscríbete", path: "#suscribete", icon: "bell" },
    { title: "Mi Perfil", path: "/profile", icon: "user-circle", requireAuth: true },
    { title: "Mis Reservas", path: "/my-reservations", icon: "calendar-check", requireAuth: true },
    { title: "Contacto", path: "#contactanos", icon: "envelope" }
  ];

  // Filtrar navegación basada en autenticación
  const filteredNavigation = navigation.filter(item => {
    if (item.requireAuth) {
      return isAuthenticated();
    }
    return true;
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setExpanded(false);
  }, [location]);

  const isHomePage = location.pathname === '/';

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''} ${expanded ? 'mobile-open' : ''}`}>
      <Navbar 
        expand="lg" 
        variant="dark" 
        expanded={expanded}
        onToggle={(expanded) => setExpanded(expanded)}
        className="custom-navbar"
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img 
              src="/img/logo.jpg" 
              alt="BACONFORT Logo" 
              width="40" 
              height="40" 
              className="brand-logo me-2"
              loading="lazy"
            />
            <i className="fas fa-star me-2 brand-icon" aria-hidden="true"></i> 
            <span className="brand-text">BA-CONFORT</span>
          </Navbar.Brand>
          
          <Navbar.Toggle 
            aria-controls="basic-navbar-nav" 
            className="custom-toggler"
          >
            {expanded ? (
              <i className="fas fa-times"></i>
            ) : (
              <i className="fas fa-bars"></i>
            )}
          </Navbar.Toggle>
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {filteredNavigation.map((item, idx) => (
                <NavItem 
                  key={idx}
                  to={item.path.startsWith('#') ? null : item.path}
                  href={item.path.startsWith('#') ? item.path : null}
                  icon={item.icon}
                  text={item.title}
                  active={item.path === location.pathname}
                  onClick={() => setExpanded(false)}
                />
              ))}
              <div className="navbar-user-section">
                <UserButton />
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {isHomePage && (
        <div className="video-cover">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            preload="auto" 
            className="back-video"
            aria-label="Video de portada"
          >
            <source src="video/video-portada-principal.mp4" type="video/mp4" />
            <track kind="captions" srcLang="es" label="Spanish captions" />
            Tu navegador no soporta videos HTML5.
          </video>
          <div className="video-overlay" aria-hidden="true"></div>
        </div>
      )}
    </header>
  );
}

function NavItem({ to, href, icon, text, active, onClick }) {
  const location = useLocation();
  
  const content = (
    <>
      <i className={`fas fa-${icon} nav-icon me-2`} aria-hidden="true"></i> 
      <span className="nav-text">{text}</span>
    </>
  );

  const handleAnchorClick = (e, targetHref) => {
    e.preventDefault();
    onClick();
    
    // Si estamos en la página principal, hacer scroll directo
    if (location.pathname === '/') {
      // Esperar un poco para que el menú se cierre
      setTimeout(() => {
        const element = document.querySelector(targetHref);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        } else {
          console.log('Elemento no encontrado:', targetHref);
        }
      }, 100);
    } else {
      // Si estamos en otra página, ir a la página principal primero y luego al anchor
      window.location.href = `/${targetHref}`;
    }
  };

  return (
    <Nav.Item>
      {to ? (
        <Nav.Link 
          as={Link}
          to={to}
          className={active ? 'active' : ''}
          onClick={onClick}
        >
          {content}
        </Nav.Link>
      ) : (
        <Nav.Link 
          href={href}
          onClick={(e) => handleAnchorClick(e, href)}
        >
          {content}
        </Nav.Link>
      )}
    </Nav.Item>
  );
}

export default Header;