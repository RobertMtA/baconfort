import React from 'react';
import { Link } from 'react-router-dom';
import './BlockedProperty.css';

/**
 * Componente que muestra un mensaje cuando una propiedad está bloqueada
 */
const BlockedProperty = ({ propertyId, propertyName }) => {
  return (
    <div className="blocked-property-page">
      <div className="blocked-property-container">
        <div className="blocked-icon">
          <i className="fas fa-lock"></i>
        </div>
        <h1>Propiedad no disponible</h1>
        <p>
          Lo sentimos, la propiedad <strong>{propertyName || propertyId}</strong> no está disponible en este momento.
        </p>
        <p>Esta propiedad está temporalmente bloqueada para reservas.</p>
        <div className="blocked-actions">
          <Link to="/" className="btn btn-primary">
            <i className="fas fa-home"></i> Volver a Inicio
          </Link>
          <Link to="/promociones" className="btn btn-secondary">
            <i className="fas fa-tags"></i> Ver Promociones
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlockedProperty;
