import React from 'react';

const PromotionsDebug = () => {
  const handleTestPromotion = () => {
    console.log('🧪 Test: Forzando aparición de promoción');
    
    // Crear evento personalizado para mostrar promoción
    const event = new CustomEvent('showPromotionTest');
    window.dispatchEvent(event);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 10000,
      background: '#007bff',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      cursor: 'pointer'
    }} onClick={handleTestPromotion}>
      🧪 Test Promociones
    </div>
  );
};

export default PromotionsDebug;
