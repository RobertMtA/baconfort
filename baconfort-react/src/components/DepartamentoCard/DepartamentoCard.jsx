import React from 'react';
import { Link } from 'react-router-dom';
import './DepartamentoCard.css';

const DepartamentoCard = ({ title, address, image, video, path }) => {
  return (
    <div className="departamento-card">
      <div className="card-media">
        {video ? (
          <video autoPlay loop muted playsInline className="card-video">
            <source src={video} type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
        ) : (
          <img src={image} alt={title} className="card-image" loading="lazy" />
        )}
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p className="address">{address}</p>
        <Link to={path} className="btn btn-primary">
          Ver Más <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
};

export default DepartamentoCard;