import React, { useState, useRef } from 'react';

const GalleryVideoUploader = ({ videos = [], onVideosChange, propertyId, maxVideos = 10 }) => {
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event, replaceIndex = null) => {
    const files = Array.from(event.target.files);
    
    // Si estamos reemplazando un video, no verificar límite
    if (replaceIndex === null && videos.length + files.length > maxVideos) {
      alert(`Solo puedes subir un máximo de ${maxVideos} videos`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('video/')) {
        alert('Solo se permiten archivos de video');
        continue;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB límite
        alert('El video es demasiado grande. Límite: 50MB');
        continue;
      }

      setUploadingIndex(replaceIndex !== null ? replaceIndex : videos.length + i);
      
      try {
        // Para videos grandes, solo guardar metadatos, no el contenido completo
        let videoData;
        
        if (file.size > 5 * 1024 * 1024) { // Archivos mayores a 5MB
          console.log('📹 Video grande detectado, guardando solo metadatos:', file.name);
          videoData = {
            id: `video-${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            base64: '[VIDEO_TOO_LARGE_FOR_STORAGE]', // Placeholder
            url: URL.createObjectURL(file), // Para preview temporal
            isNew: true,
            isLarge: true
          };
        } else {
          // Para videos pequeños, convertir a base64
          console.log('📹 Video pequeño, convirtiendo a base64:', file.name);
          const base64 = await fileToBase64(file);
          videoData = {
            id: `video-${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            base64: base64,
            url: URL.createObjectURL(file), // Para preview
            isNew: true,
            isLarge: false
          };
        }

        // Si estamos reemplazando, actualizar el video en esa posición
        let updatedVideos;
        if (replaceIndex !== null) {
          updatedVideos = [...videos];
          updatedVideos[replaceIndex] = videoData;
        } else {
          updatedVideos = [...videos, videoData];
        }
        
        onVideosChange(updatedVideos);
        
      } catch (error) {
        console.error('Error procesando video:', error);
        alert('Error al procesar el video');
      }
    }
    
    setUploadingIndex(null);
    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const removeVideo = (index) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    onVideosChange(updatedVideos);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="gallery-video-uploader">
      {/* Botón de subir */}
      <div className="mb-3">
        <input
          type="file"
          ref={fileInputRef}
          accept="video/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={videos.length >= maxVideos}
        >
          <i className="fas fa-video me-2"></i>
          Subir Videos ({videos.length}/{maxVideos})
        </button>
      </div>

      {/* Lista de videos */}
      {videos.length > 0 && (
        <div className="videos-list">
          <h6 className="mb-3">Videos Subidos:</h6>
          <div className="row">
            {videos.map((video, index) => (
              <div key={video.id || index} className="col-md-6 col-lg-4 mb-3">
                <div className="card video-card">
                  <div className="video-preview position-relative">
                    {video.url && !video.url.includes('[VIDEO_TOO_LARGE_FOR_STORAGE]') ? (
                      <video
                        src={video.url}
                        className="card-img-top"
                        style={{ height: '200px', objectFit: 'cover' }}
                        controls
                        preload="metadata"
                        onError={(e) => {
                          console.warn('Error cargando video:', video.name);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : video.base64 && video.base64 !== '[VIDEO_TOO_LARGE_FOR_STORAGE]' ? (
                      <video
                        src={video.base64}
                        className="card-img-top"
                        style={{ height: '200px', objectFit: 'cover' }}
                        controls
                        preload="metadata"
                      />
                    ) : null}
                    
                    {/* Fallback para videos sin URL válida */}
                    <div
                      className="card-img-top d-flex align-items-center justify-content-center bg-light"
                      style={{ 
                        height: '200px',
                        display: (video.url && !video.url.includes('[VIDEO_TOO_LARGE_FOR_STORAGE]')) ? 'none' : 'flex'
                      }}
                    >
                      <div className="text-center">
                        <i className="fas fa-video fa-3x text-muted mb-2"></i>
                        <div className="small text-muted">
                          {video.isLarge ? 'Video grande - Preview no disponible' : 'Video no disponible'}
                        </div>
                        {video.isLarge && (
                          <div className="small text-warning mt-1">
                            <i className="fas fa-info-circle"></i> Resubir para ver preview
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {uploadingIndex === index && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
                        <div className="spinner-border text-light" role="status">
                          <span className="visually-hidden">Subiendo...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-body p-2">
                    <h6 className="card-title small mb-1" title={video.name}>
                      {video.name?.length > 20 ? `${video.name.substring(0, 20)}...` : video.name}
                      {video.isLarge && (
                        <span className="badge bg-warning ms-1" title="Video grande - solo metadatos guardados">
                          <i className="fas fa-exclamation-triangle"></i>
                        </span>
                      )}
                    </h6>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {formatFileSize(video.size)}
                        {video.isLarge && <span className="text-warning"> (Solo preview)</span>}
                      </small>
                      <div className="btn-group">
                        {/* Mostrar botón de resubir si no hay preview válido */}
                        {(!video.url || video.url.includes('[VIDEO_TOO_LARGE_FOR_STORAGE]') || video.isLarge) && (
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              // Trigger file input para resubir este video específico
                              const fileInput = document.createElement('input');
                              fileInput.type = 'file';
                              fileInput.accept = 'video/*';
                              fileInput.onchange = (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  // Reemplazar el video en el índice actual
                                  handleFileSelect({ target: { files: [file] } }, index);
                                }
                              };
                              fileInput.click();
                            }}
                            title="Resubir video para preview"
                          >
                            <i className="fas fa-upload"></i>
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeVideo(index)}
                          title="Eliminar video"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información de ayuda */}
      {videos.length === 0 && (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Consejos para videos:</strong>
          <ul className="mb-0 mt-2">
            <li>Formatos soportados: MP4, WebM, MOV</li>
            <li>Tamaño máximo: 50MB por video</li>
            <li>Videos menores a 5MB: Se guardan completamente</li>
            <li>Videos mayores a 5MB: Solo se guarda el preview (recomendado subir al servidor)</li>
            <li>Máximo {maxVideos} videos por propiedad</li>
            <li>Los videos se mostrarán en la galería junto con las imágenes</li>
          </ul>
        </div>
      )}

      {/* Estilos inline para evitar warning JSX */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .video-card {
            transition: transform 0.2s;
          }
          .video-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          .video-preview {
            overflow: hidden;
          }
          .video-preview video {
            transition: transform 0.3s;
          }
          .video-preview:hover video {
            transform: scale(1.05);
          }
        `
      }} />
    </div>
  );
};

export default GalleryVideoUploader;
