import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FaCode, FaHome, FaWhatsapp, FaEnvelope, FaCalendarAlt, FaShieldAlt, FaTags } from 'react-icons/fa';
import ReservationForm from '../ReservationForm/ReservationForm';

const Footer = () => {
  const [showReservationForm, setShowReservationForm] = useState(false);

  const toggleReservationForm = () => {
    setShowReservationForm(!showReservationForm);
  };

  return (
    <footer className="footer">
      <div id="contactanos" className="contact-section">
        <h3>Contáctanos</h3>
        <div className="social-links">
          {/* WhatsApp */}
          <a
            href="https://wa.me/+541130021074?text=Hola%20BAconfort,%20me%20interesa%20obtener%20información%20sobre%20sus%20departamentos%20en%20alquiler.%20¿Podría%20ayudarme?"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link whatsapp"
            aria-label="WhatsApp de BAconfort"
            title="Enviar mensaje por WhatsApp"
          >
            <FaWhatsapp />
            <span className="whatsapp-tooltip">Consultar disponibilidad</span>
          </a>
          {/* Email with improved tooltip and accessibility */}
          <a
            href="mailto:andybuenosaires@gmail.com"
            className="social-link email"
            aria-label="Enviar email a BAconfort"
            title="Enviar email a andybuenosaires@gmail.com"
            rel="noopener"
            data-toggle="tooltip"
            data-placement="top"
          >
            <FaEnvelope />
            <span className="email-tooltip">andybuenosaires@gmail.com</span>
          </a>
          {/* Reservation Form Button */}
          <button
            onClick={toggleReservationForm}
            className="social-link reservation"
            aria-label="Formulario de Reserva"
          >
            <FaCalendarAlt />
          </button>
        </div>
      </div>

      {showReservationForm && (
        <div className="footer-reservation-modal">
          <div className="footer-reservation-content">
            <button 
              className="close-reservation-btn"
              onClick={toggleReservationForm}
            >
              &times;
            </button>
            <ReservationForm apartmentName="un departamento de BAconfort" />
          </div>
        </div>
      )}

      <p className="credit">
        <FaCode /> Desarrollador | Roberto Gaona
      </p>
      <div className="footer-actions">
        <a href="/" className="btn-volver">
          <FaHome /> Volver
        </a>
        <Link to="/promociones" className="btn-promociones" title="Ver Promociones">
          <FaTags /> Promociones
        </Link>
        <Link to="/admin" className="btn-admin" title="Panel de Administración">
          <FaShieldAlt />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;