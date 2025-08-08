import { useState, useRef } from 'react';
import './VideoUploader.css';

function VideoUploader({ value, onChange, label = "Video", required = false, className = "" }) {
  const [preview, setPreview] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  // Función para abrir el selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Función para manejar la selección de archivos
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    setUploading(true);
    setMessage('📤 Procesando video...');

    try {
      // Validar tipo de archivo
      if (!file.type.startsWith('video/')) {
        setMessage('❌ Debe seleccionar un archivo de video válido (MP4, WebM, AVI, etc.)');
        setUploading(false);
        return;
      }

      // Validar tamaño (máximo 10MB para videos para evitar problemas de localStorage)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setMessage(`❌ El video es muy grande (${sizeMB}MB). Máximo permitido: 10MB. Intenta comprimir el video.`);
        setUploading(false);
        return;
      }

      // Mostrar progreso de carga
      setMessage(`📊 Procesando video (${(file.size / (1024 * 1024)).toFixed(2)}MB)...`);

      // Leer el archivo como base64
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const videoBase64 = e.target.result;
          
          // Verificar el tamaño del base64
          if (videoBase64.length > 15 * 1024 * 1024) { // ~15MB en base64
            setMessage('❌ El video procesado es muy grande. Intenta con un archivo más pequeño o comprímelo.');
            setUploading(false);
            return;
          }

          // Usar el base64 directamente como preview
          setPreview(videoBase64);

          // Llamar al onChange con el video en base64
          onChange(videoBase64);
          
          setMessage('✅ Video cargado correctamente! El video aparecerá en la página del departamento.');
          
          console.log('📹 VIDEO UPLOAD: Video procesado exitosamente:', {
            originalName: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
            type: file.type,
            base64Length: `${(videoBase64.length / (1024 * 1024)).toFixed(2)}MB (base64)`
          });
          
        } catch (error) {
          console.error('Error procesando video:', error);
          setMessage('❌ Error al procesar el video');
        } finally {
          setUploading(false);
          setTimeout(() => {
            setMessage('');
          }, 3000);
        }
      };

      reader.onerror = () => {
        setMessage('❌ Error al leer el archivo de video');
        setUploading(false);
      };

      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error al procesar video:', error);
      setMessage('❌ Error al procesar el video');
    } finally {
      setUploading(false);
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  // Función para manejar cambio manual de URL
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    onChange(url);
  };

  // Función para limpiar video
  const clearVideo = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`video-uploader ${className}`}>
      <label>
        <i className="fas fa-video"></i>
        {label} {required && '*'}
      </label>
      
      {/* Input oculto para archivos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="video/*"
        style={{ display: 'none' }}
      />
      
      {/* Controles de carga */}
      <div className="upload-controls">
        <div className="upload-buttons">
          <button
            type="button"
            onClick={openFileSelector}
            className="btn btn-primary btn-upload"
            disabled={uploading}
          >
            <i className="fas fa-upload"></i>
            {uploading ? 'Procesando...' : 'Subir Video desde Dispositivo'}
          </button>
          
          {preview && (
            <button
              type="button"
              onClick={clearVideo}
              className="btn btn-danger btn-clear"
              disabled={uploading}
            >
              <i className="fas fa-trash"></i>
              Limpiar
            </button>
          )}
        </div>
        
        {/* Campo manual para URL (alternativo) */}
        <div className="manual-url">
          <small className="text-muted">O ingresa una URL manualmente:</small>
          <input
            type="text"
            className="form-control form-control-sm"
            value={value || ''}
            onChange={handleUrlChange}
            placeholder="/video/video-ejemplo.mp4"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`upload-message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Preview del video */}
      {preview && (
        <div className="video-preview">
          <h5>Vista Previa:</h5>
          <video 
            src={preview} 
            controls
            preload="metadata"
            className="preview-video"
            onError={(e) => {
              console.error('Error loading video preview:', e);
            }}
          >
            Tu navegador no soporta la reproducción de video.
          </video>
          <div className="video-info">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              {preview.startsWith('data:') ? 
                'Video subido desde dispositivo' : 
                `Archivo: ${preview.split('/').pop()}`
              }
            </small>
          </div>
        </div>
      )}

      {/* Tips para el usuario */}
      <div className="upload-tips">
        <small className="text-muted">
          <i className="fas fa-lightbulb me-1"></i>
          <strong>Tips:</strong>
          <ul className="tips-list">
            <li>Máximo 10MB por video</li>
            <li>Formatos soportados: MP4, WebM, AVI</li>
            <li>Para videos grandes, usa herramientas como HandBrake para comprimir</li>
            <li>Videos más pequeños cargan más rápido en la web</li>
          </ul>
        </small>
      </div>
    </div>
  );
}

export default VideoUploader;
