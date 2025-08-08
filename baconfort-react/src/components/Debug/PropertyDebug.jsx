import React from 'react';

const PropertyDebug = ({ property }) => {
  if (!property) return <div>❌ No property data</div>;

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #007bff', 
      margin: '20px 0',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    }}>
      <h3>🔍 DEBUG: Property Data</h3>
      <ul>
        <li><strong>ID:</strong> {property.id}</li>
        <li><strong>Title:</strong> {property.title}</li>
        <li><strong>Amenities exist:</strong> {property.amenities ? '✅' : '❌'}</li>
        {property.amenities && (
          <>
            <li><strong>Departamento:</strong> {property.amenities.departamento?.length || 0} items</li>
            <li><strong>Servicios:</strong> {property.amenities.servicios?.length || 0} items</li>
            <li><strong>Edificio:</strong> {property.amenities.amenitiesEdificio?.length || 0} items</li>
          </>
        )}
      </ul>
      
      {property.amenities?.departamento && (
        <div>
          <h4>Departamento Amenities:</h4>
          <ul>
            {property.amenities.departamento.map((amenity, index) => (
              <li key={index}>
                <i className={amenity.icon}></i> {amenity.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PropertyDebug;
