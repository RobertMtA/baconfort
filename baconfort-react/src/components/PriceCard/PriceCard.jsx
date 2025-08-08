import React from 'react';
import './PriceCard.css';

const PriceCard = ({ title, amount, details, whatsappMessage, propertyId }) => {
  const whatsappLink = `https://wa.me/+541130021074?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="price-card" data-property-id={propertyId}>
      <div className="price-header">
        <h3>{title}</h3>
      </div>
      <div className="price-body">
        <div className="price-amount">
          <span className="currency">USD</span>
          <span className="amount">{amount}</span>
        </div>
        <p className="price-details">{details}</p>
        <a 
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-button"
        >
          <i className="fab fa-whatsapp"></i> Consultar
        </a>
      </div>
    </div>
  );
};

export default PriceCard;