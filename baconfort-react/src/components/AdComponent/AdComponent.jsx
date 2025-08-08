import React, { useEffect } from 'react';
import './AdComponent.css';

const AdComponent = ({ position }) => {
  useEffect(() => {
    try {
      // Inicializar anuncio cuando el componente se monta
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Error al inicializar AdSense:', error);
    }
  }, []);

  return (
    <div className={`ad-container ${position}`}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9166920951160128"
        data-ad-slot="9207910176"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdComponent;