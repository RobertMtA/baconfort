import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext-STATEFUL';

const NewPropertyManager = () => {
  const navigate = useNavigate();
  const { getAllProperties, deleteProperty } = useAdmin();
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState('');

  // Obtener solo las propiedades nuevas (no las existentes con archivos)
  const allProperties = getAllProperties();
  const existingProperties = ['moldes-1680', 'santa-fe-3770', 'dorrego-1548', 'convencion-1994', 'ugarteche-2824'];
  
  const newProperties = Object.values(allProperties).filter(property => 
    !existingProperties.includes(property.id) && property.id !== 'tucuman-766'
  );

  const handleDeleteNewProperty = async (propertyId, propertyTitle) => {
    // Doble verificación para asegurar que no se eliminen propiedades existentes
    if (existingProperties.includes(propertyId)) {
      alert('❌ ERROR: No se puede eliminar una propiedad existente con archivos.');
      return;
    }

    const confirmDelete = window.confirm(`¿Eliminar la propiedad "${propertyTitle}" permanentemente?`);
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      setMessage(`🗑️ Eliminando "${propertyTitle}"...`);
      
      await deleteProperty(propertyId);
      
      setMessage(`✅ Propiedad "${propertyTitle}" eliminada exitosamente`);
      
      setTimeout(() => {
        setMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error al eliminar propiedad:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="text-success">
              <i className="fas fa-cog me-2"></i>
              Gestión de Propiedades Nuevas
            </h3>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/admin/new-property')}
              >
                <i className="fas fa-plus me-2"></i>
                Crear Nueva Propiedad
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/admin')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Volver al Dashboard
              </button>
            </div>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`alert ${message.includes('❌') ? 'alert-danger' : 
                                   message.includes('⚠️') ? 'alert-warning' : 'alert-success'} mb-4`}>
              <i className={`fas ${message.includes('❌') ? 'fa-exclamation-circle' : 
                                   message.includes('⚠️') ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2`}></i>
              {message}
            </div>
          )}

          {/* Información */}
          <div className="alert alert-info mb-4">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Importante:</strong> Esta sección solo gestiona propiedades nuevas. 
            Las propiedades existentes con archivos estáticos (Moldes 1680, Santa Fe 3770, etc.) 
            no aparecen aquí y no pueden ser eliminadas.
          </div>

          {/* Lista de propiedades nuevas */}
          {newProperties.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fas fa-home fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">No hay propiedades nuevas</h5>
                <p className="text-muted">
                  Todas las propiedades mostradas son las existentes con archivos estáticos.
                </p>
                <button 
                  className="btn btn-primary mt-3"
                  onClick={() => navigate('/admin/new-property')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Crear Primera Propiedad Nueva
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  Propiedades Nuevas ({newProperties.length})
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {newProperties.map((property) => (
                    <div key={property.id} className="col-md-6 col-lg-4 mb-3">
                      <div className="card border-success">
                        <div className="card-body">
                          <h6 className="card-title text-success">
                            <i className="fas fa-home me-2"></i>
                            {property.title}
                          </h6>
                          <p className="card-text text-muted">
                            <i className="fas fa-map-marker-alt me-2"></i>
                            {property.address}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              ID: {property.id}
                            </small>
                            <div className="d-flex gap-1">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate(`/admin/edit-property/${property.id}`)}
                                title="Editar propiedad"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteNewProperty(property.id, property.title)}
                                disabled={isDeleting}
                                title="Eliminar propiedad"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resumen */}
          <div className="row mt-4">
            <div className="col-md-6">
              <div className="card border-primary">
                <div className="card-body">
                  <h6 className="card-title text-primary">
                    <i className="fas fa-shield-alt me-2"></i>
                    Propiedades Protegidas
                  </h6>
                  <p className="card-text">
                    {existingProperties.length} propiedades con archivos estáticos están protegidas 
                    y no pueden ser eliminadas desde aquí.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-success">
                <div className="card-body">
                  <h6 className="card-title text-success">
                    <i className="fas fa-cogs me-2"></i>
                    Propiedades Gestionables
                  </h6>
                  <p className="card-text">
                    {newProperties.length} propiedades nuevas pueden ser editadas o eliminadas 
                    sin afectar el sistema existente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPropertyManager;
