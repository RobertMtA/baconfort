import { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';

function VideoPlayer({ 
  src, 
  poster, 
  title = "Video de la propiedad",
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  className = "" 
}) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };
    
    const handleLoadedData = () => {
      setIsLoading(false);
      setHasError(false);
    };
    
    const handleError = (e) => {
      console.error('📹 VIDEO PLAYER: Error cargando video:', e);
      console.error('📹 VIDEO PLAYER: Video src:', src);
      setIsLoading(false);
      setHasError(true);
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Log de debug
    console.log('📹 VIDEO PLAYER: Inicializando con src:', src);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [src]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  };

  if (hasError || !src) {
    console.error('📹 VIDEO PLAYER: Error mostrado al usuario. src:', src, 'hasError:', hasError);
    return (
      <div className={`video-player error ${className}`}>
        <div className="error-content">
          <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
          <p>Error al cargar el video</p>
          <small className="text-muted">Archivo: {src}</small>
          {poster && (
            <img 
              src={poster} 
              alt={title}
              className="fallback-image"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`video-player ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="video-loading">
          <div className="loading-spinner"></div>
          <p>Cargando video...</p>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
        className="video-element"
        controls={controls}
      >
        <source src={src} type="video/mp4" />
        Tu navegador no soporta la reproducción de video.
        {poster && <img src={poster} alt={title} />}
      </video>

      {/* Video overlay */}
      <div className="video-overlay"></div>

      {/* Custom controls */}
      {!controls && (
        <div className={`video-controls ${showControls ? 'show' : ''}`}>
          <button 
            className="control-btn play-pause-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          
          <button 
            className="control-btn mute-btn"
            onClick={toggleMute}
            aria-label="Alternar audio"
          >
            <i className="fas fa-volume-up"></i>
          </button>
        </div>
      )}

      {/* Video info */}
      <div className="video-info">
        <h3 className="video-title">{title}</h3>
      </div>
    </div>
  );
}

export default VideoPlayer;
