import React, { useState, useEffect, useRef } from 'react';

const VideoHero = ({ 
  videoSrc, 
  posterSrc, 
  fallbackImage, 
  altText = "Video Hero" 
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      console.log('✅ VideoHero: Video loaded successfully');
      setVideoLoaded(true);
      setVideoError(false);
    };

    const handleError = (e) => {
      console.error('❌ VideoHero: Video error:', e);
      console.error('❌ VideoHero: Error details:', video.error);
      setVideoError(true);
      setVideoLoaded(false);
    };

    const handlePlay = () => {
      console.log('▶️ VideoHero: Video started playing');
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('⏸️ VideoHero: Video paused');
      setIsPlaying(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('🔇 VideoHero: Autoplay prevented:', err);
      });
    }
  };

  return (
    <div className="video-hero">
      {!videoError ? (
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline 
          preload="auto"
          className="hero-video"
          poster={posterSrc}
          style={{ opacity: videoLoaded ? 1 : 0.7 }}
        >
          <source src={videoSrc} type="video/mp4" />
          <img src={fallbackImage} alt={altText} />
        </video>
      ) : (
        <div className="video-fallback">
          <img 
            src={fallbackImage} 
            alt={altText}
            className="hero-video"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      
      <div className="video-overlay"></div>
    </div>
  );
};

export default VideoHero;
