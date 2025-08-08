import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import AddPropertyForm from './AddPropertyForm';
import ImageManager from './ImageManager';
import PriceUpdater from './PriceUpdater';
import './QuickActions.css';

function QuickActions({ action, onClose, properties, onEditProperty }) {
  const [step, setStep] = useState(1);

  const renderContent = () => {
    switch (action) {
      case 'add-property':
        return <AddPropertyForm onClose={onClose} />;
      case 'manage-images':
        return <ImageManager properties={properties} onClose={onClose} />;
      case 'update-prices':
        return <PriceUpdater properties={properties} onClose={onClose} />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (action) {
      case 'add-property':
        return 'Agregar Nueva Propiedad';
      case 'manage-images':
        return 'Gestionar Imágenes';
      case 'update-prices':
        return 'Actualizar Precios';
      default:
        return 'Acción Rápida';
    }
  };

  return (
    <div className="quick-actions-modal">
      <div className="quick-actions-overlay" onClick={onClose}></div>
      <div className="quick-actions-content">
        <div className="quick-actions-header">
          <h3>
            <i className="fas fa-bolt"></i>
            {getTitle()}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="quick-actions-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default QuickActions;
