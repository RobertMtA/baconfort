import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';

const ImageDebugger = ({ propertyId }) => {
  const { getProperty } = useAdmin();
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (!propertyId) return;

    const debugProperty = async () => {
      try {
        const property = await getProperty(propertyId);
        
        setDebugInfo({
          propertyId,
          propertyExists: !!property,
          propertyTitle: property?.title,
          hasGalleryImages: !!property?.galleryImages,
          galleryImagesType: typeof property?.galleryImages,
          galleryImagesLength: Array.isArray(property?.galleryImages) ? property.galleryImages.length : 0,
          galleryImagesRaw: property?.galleryImages,
          timestamp: new Date().toISOString()
        });
        
        console.log('🔍 IMAGE DEBUGGER:', {
          propertyId,
          property,
          galleryImages: property?.galleryImages
        });
      } catch (error) {
        console.error('Debug error:', error);
        setDebugInfo({
          error: error.message,
          propertyId,
          timestamp: new Date().toISOString()
        });
      }
    };

    debugProperty();
  }, [propertyId, getProperty]);

  if (!debugInfo) return null;

  return (
    <div style={{
      backgroundColor: '#1f2937',
      color: '#f3f4f6',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '16px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ color: '#fbbf24', marginBottom: '12px' }}>🔍 Image Debug Info</h4>
      
      <div style={{ display: 'grid', gap: '8px' }}>
        <div><strong>Property ID:</strong> {debugInfo.propertyId}</div>
        <div><strong>Property Exists:</strong> {String(debugInfo.propertyExists)}</div>
        <div><strong>Property Title:</strong> {debugInfo.propertyTitle || 'N/A'}</div>
        <div><strong>Has Gallery Images:</strong> {String(debugInfo.hasGalleryImages)}</div>
        <div><strong>Gallery Images Type:</strong> {debugInfo.galleryImagesType}</div>
        <div><strong>Gallery Images Length:</strong> {debugInfo.galleryImagesLength}</div>
        <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
        
        {debugInfo.error && (
          <div style={{ color: '#f87171' }}>
            <strong>Error:</strong> {debugInfo.error}
          </div>
        )}
        
        {debugInfo.galleryImagesRaw && (
          <details style={{ marginTop: '12px' }}>
            <summary style={{ cursor: 'pointer', color: '#60a5fa' }}>
              View Raw Gallery Images Data
            </summary>
            <pre style={{ 
              marginTop: '8px', 
              padding: '8px', 
              backgroundColor: '#374151', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {JSON.stringify(debugInfo.galleryImagesRaw, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ImageDebugger;
