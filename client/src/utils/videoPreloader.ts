import { useState, useEffect } from 'react';

// hook preload video
export const useVideoPreloader = (videoSrcs: string[]) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const totalVideos = videoSrcs.length;

    if (totalVideos === 0) {
      setIsLoaded(true);
      setProgress(100);
      return;
    }

    let loadedCount = 0;

    const handleVideoLoaded = () => {
      if (!isMounted) return;
      loadedCount++;
      const newProgress = (loadedCount / totalVideos) * 100;
      setProgress(newProgress);
      if (loadedCount === totalVideos) {
        setIsLoaded(true);
      }
    };

    videoSrcs.forEach(src => {
      const video = document.createElement('video');
      video.src = src;
      video.muted = true;
      video.playsInline = true;

      // 'canplaythrough' event bao video da buffer du
      video.addEventListener('canplaythrough', handleVideoLoaded, { once: true });
      video.addEventListener('error', handleVideoLoaded, { once: true }); // coi loi cung la "da load" de k bi ket
      
      video.load(); // bat dau tai
    });

    return () => {
      isMounted = false;
    };
  }, [videoSrcs]);

  return { progress, isLoaded };
};