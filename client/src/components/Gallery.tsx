// client/src/components/Gallery.tsx
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import './styles/Gallery.css';
import { galleryTranslations } from './languageSelector/languageSelector.constants'; 

// --- ICONS ---
const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);
const IconDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconFullscreen = () => (
 <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
  </svg>
);
const IconExitFullscreen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 0-2-2h-3M3 16h3a2 2 0 0 0 2-2v-3"/>
  </svg>
);
// --- END ICONS ---

const imageModules = import.meta.glob('/src/assets/gallery_images/*.{png,jpg,jpeg,gif,svg,webp}', {
  eager: true,
  import: 'default',
});
const localImages: string[] = Object.values(imageModules) as string[];

interface GalleryProps {
  images?: string[];
  onBack?: () => void; 
  language: 'vi' | 'en' | 'ja'; 
}

const galleryDividerVariants = (delay: number = 0): Variants => ({
  hidden: { opacity: 0, scaleX: 0.6, filter: "blur(2px)" }, 
  visible: {
    opacity: 0.75, 
    scaleX: 1,
    filter: "blur(0px)",
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1], delay } 
  },
  exit: {
    opacity: 0,
    scaleX: 0.6,
    filter: "blur(2px)",
    transition: { duration: 0.3, ease: "easeIn" }
  }
});


const Gallery: React.FC<GalleryProps> = ({ images, onBack, language }) => { 
  const displayImages = useMemo(() => {
    if (images && images.length > 0) return images;
    return localImages;
  }, [images]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lightboxImageWrapperRef = useRef<HTMLDivElement>(null);

  const t = galleryTranslations; 

  const totalImages = displayImages.length;

  const initialContainerDelay = 0.15;
  const titleDelay = initialContainerDelay + 0.05; 
  const topDividerDelay = titleDelay + 0.3; 
  const contentDelay = topDividerDelay + 0.15; 
  const bottomDividerDelay = contentDelay + (totalImages > 0 ? 0.5 : 0.25); 

  useEffect(() => {
    if (selectedImageIndex === null && totalImages > 0) {
      setSelectedImageIndex(0);
    }
    if (totalImages === 0 && selectedImageIndex !== null) {
        setSelectedImageIndex(null);
    }
  }, [totalImages, selectedImageIndex]);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setSlideDirection(0);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    if (isFullscreen) {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
        }
        setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const changeImage = useCallback((direction: 'next' | 'prev') => {
    if (selectedImageIndex === null || totalImages <= 1) return;
    
    setSlideDirection(direction === 'next' ? 1 : -1);

    let newIndex: number;
    if (direction === 'next') {
      newIndex = (selectedImageIndex + 1) % totalImages;
    } else {
      newIndex = (selectedImageIndex - 1 + totalImages) % totalImages;
    }
    setSelectedImageIndex(newIndex);
  }, [selectedImageIndex, totalImages]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (lightboxOpen && selectedImageIndex !== null) {
        if (event.key === 'Escape') {
          if (isFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
            setIsFullscreen(false);
          } else {
            closeLightbox();
          }
        }
        if (event.key === 'ArrowRight') changeImage('next');
        if (event.key === 'ArrowLeft') changeImage('prev');
        if (event.key === 'f' || event.key === 'F') handleFullscreenToggle();
      }
    };
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [lightboxOpen, selectedImageIndex, closeLightbox, changeImage, totalImages, isFullscreen]);

  const handleDownload = useCallback(() => {
    if (selectedImageIndex === null) return;
    const imageUrl = displayImages[selectedImageIndex];
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageUrl.substring(imageUrl.lastIndexOf('/') + 1) || `gallery-image-${selectedImageIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedImageIndex, displayImages]);

  const handleFullscreenToggle = useCallback(() => {
    if (!lightboxImageWrapperRef.current) return;
    if (!document.fullscreenElement) {
      lightboxImageWrapperRef.current.requestFullscreen().catch(err => console.error(`Fullscreen error: ${err.message}`));
    } else {
      document.exitFullscreen().catch(err => console.error(`Exit fullscreen error: ${err.message}`));
    }
  }, []);

  const containerMotionVariants = { 
    hidden: { },
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } }, 
    exit: { } 
  };

  const galleryTitleVariants = {
    hidden:{opacity:0, y: -25, filter: "blur(5px)"},
    visible:{ opacity:1, y:0, filter: "blur(0px)", transition:{delay:titleDelay, duration: 0.7, ease: [0.23, 1, 0.32, 1]}}
  };
  
  const galleryContentVariants = { 
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "circOut", delay: contentDelay } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
  };
  
  const lightboxOverlayVariants = { 
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.35, delay: 0.05, ease: "easeIn" } },
  };
  const lightboxContentVariants = { 
    hidden: { scale: 0.9, opacity: 0, y: 25 },
    visible: {
      scale: 1, opacity: 1, y: 0,
      transition: {
        type: "spring", stiffness: 280, damping: 28, mass: 0.95,
        staggerChildren: 0.06, delayChildren: 0.1
      }
    },
    exit: { scale: 0.92, opacity: 0, y: 15, transition: { duration: 0.3, ease: "easeIn" } },
  };
  
  const lightboxImageSpring = { type: "spring", stiffness: 230, damping: 30, mass: 1.0 };
  const lightboxImageVariants = { 
    enter: (direction: number) => ({ x: direction > 0 ? "70%" : "-70%", opacity: 0.4, scale: 0.85, rotate: direction > 0 ? 8 : -8, }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1, rotate: 0, transition: lightboxImageSpring },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? "70%" : "-70%", opacity: 0, scale: 0.85, rotate: direction < 0 ? 8 : -8, transition: { ...lightboxImageSpring, damping: 32 }})
  };
  
  const springTransitionCarousel = { type: "spring", stiffness: 260, damping: 26, mass: 0.95 };
  const carouselItemVariants = { 
    enter: (custom: { direction: number; role: 'main' | 'prev' | 'next' }) => ({ x: custom.direction > 0 ? "100%" : "-100%", opacity: 0, scale: 0.5, zIndex: 1, rotateY: custom.direction > 0 ? -20 : 20 }),
    center: (custom: { role: 'main' | 'prev' | 'next'; direction: number }) => ({ x: custom.role === "main" ? "0%" : (custom.role === "prev" ? "-55%" : "55%"), scale: custom.role === "main" ? 1 : 0.8, rotateY: custom.role === "main" ? 0 : (custom.role === "prev" ? 12 : -12), z: custom.role === "main" ? 0 : -90, opacity: custom.role === "main" ? 1 : 0.6, zIndex: custom.role === "main" ? 2 : 1, filter: custom.role === "main" ? "blur(0px) brightness(1.0)" : "blur(2px) brightness(0.8)", boxShadow: custom.role === "main" ? "0 16px 40px -12px rgba(0, 0, 0, 0.5), 0 0 2px 2px rgba(var(--primary-color-rgb), 0.45)" : "0 6px 15px -6px rgba(0, 0, 0, 0.4)", transition: springTransitionCarousel }),
    exit: (custom: { direction: number; role: 'main' | 'prev' | 'next' }) => ({ x: custom.direction < 0 ? "100%" : "-100%", opacity: 0, scale: 0.5, zIndex: 0, rotateY: custom.direction < 0 ? 20 : -20, transition: { ...springTransitionCarousel, damping: 30, stiffness: 240}})
  };

  const controlsBarVariants = { 
    hidden: { opacity: 0, y: 25, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1], staggerChildren: 0.07 } },
    exit: { opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.28, ease: "easeIn" } }
  };

  const controlButtonIndividualVariants = { 
    hidden: { opacity: 0, y: 8, scale: 0.7 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness:380, damping:20 } },
  };

  const { prevImgIndex, currentImgIndex, nextImgIndex } = useMemo(() => {
    if (selectedImageIndex === null || totalImages === 0) {
      return { prevImgIndex: null, currentImgIndex: null, nextImgIndex: null };
    }
    const current = selectedImageIndex;
    const prev = totalImages > 1 ? (current - 1 + totalImages) % totalImages : null;
    const next = totalImages > 1 ? (current + 1) % totalImages : null;
    return { prevImgIndex: prev, currentImgIndex: current, nextImgIndex: next };
  }, [selectedImageIndex, totalImages]);

  const handleSideImageClick = (index: number | null) => {
    if (index === null || index === currentImgIndex || selectedImageIndex === null) return;
    const diff = index - selectedImageIndex;
    let direction = 0;
    if (index === prevImgIndex) direction = -1;
    else if (index === nextImgIndex) direction = 1;
    else { if (Math.abs(diff) <= totalImages / 2) direction = diff > 0 ? 1 : -1; else direction = diff > 0 ? -1 : 1; }
    setSlideDirection(direction);
    setSelectedImageIndex(index);
  };

  return (
    <>
      <motion.div
        className="gallery-main-container gallery-carousel-mode"
        initial="hidden" 
        animate="visible" 
        exit="exit"
        variants={containerMotionVariants} 
      >
        <motion.h2 className="gallery-title" variants={galleryTitleVariants}>{t.title[language]}</motion.h2>
        <motion.div
          className="gallery-divider top"
          variants={galleryDividerVariants(topDividerDelay)}
          initial="hidden"
          animate="visible"
          exit="exit"
        />

        <motion.div 
          key={totalImages > 0 ? "carousel-content" : "placeholder-content"}
          variants={galleryContentVariants}
          initial="hidden" animate="visible" exit="exit"
        >
          {currentImgIndex !== null && totalImages > 0 ? (
          <>
            <div className="gallery-carousel-wrapper">
              {totalImages > 1 && (
                <motion.button
                  className="gallery-carousel-nav prev" onClick={() => changeImage('prev')}
                  aria-label={t.navPrev[language]}
                  whileHover={{ scale: 1.2, x: -6, backgroundColor: "rgba(var(--primary-color-rgb),0.18)", color: "var(--primary-color)" }}
                  whileTap={{ scale: 0.92 }} transition={{type:"spring", stiffness:380, damping:16}}
                ><IconChevronLeft /></motion.button>
              )}

              <div className="gallery-carousel-stage">
                <AnimatePresence custom={{ direction: slideDirection }} initial={false} mode="popLayout">
                  {totalImages > 1 && prevImgIndex !== null &&
                  (totalImages > 2 || (totalImages === 2 && currentImgIndex === 1 )) &&
                      <motion.div
                          key={"carousel_prev_" + prevImgIndex} className="gallery-carousel-item"
                          custom={{ role: 'prev', direction: slideDirection }} variants={carouselItemVariants}
                          initial="enter" animate="center" exit="exit"
                          onClick={() => handleSideImageClick(prevImgIndex)}
                      ><img src={displayImages[prevImgIndex]} alt={`Gallery image preview ${prevImgIndex + 1}`} /></motion.div>
                  }
                  <motion.div
                      key={"carousel_main_" + currentImgIndex} className="gallery-carousel-item main-item-clickable"
                      custom={{ role: 'main', direction: slideDirection }} variants={carouselItemVariants}
                      initial="enter" animate="center" exit="exit"
                      onClick={() => openLightbox(currentImgIndex)} tabIndex={0} role="button" aria-label={t.viewLarger[language].replace("{index}", String(currentImgIndex+1))}
                      whileHover={{
                          scale: 1.08, y: -10, z: 10,
                          boxShadow: "0 22px 60px -18px rgba(var(--primary-color-rgb), 0.6), 0 0 25px -6px rgba(var(--primary-color-rgb), 0.4), inset 0 0 14px rgba(var(--primary-color-rgb),0.25), 0 0 0 3px rgba(var(--primary-color-rgb), 0.5)",
                          filter: "blur(0px) brightness(1.12)"
                      }}
                      transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  ><img src={displayImages[currentImgIndex]} alt={`Gallery image ${currentImgIndex + 1}`} /><div className="main-item-inner-glow"></div></motion.div>
                  {totalImages > 1 && nextImgIndex !== null &&
                  (totalImages > 2 || (totalImages === 2 && currentImgIndex === 0)) &&
                      <motion.div
                          key={"carousel_next_" + nextImgIndex} className="gallery-carousel-item"
                          custom={{ role: 'next', direction: slideDirection }} variants={carouselItemVariants}
                          initial="enter" animate="center" exit="exit"
                          onClick={() => handleSideImageClick(nextImgIndex)}
                      ><img src={displayImages[nextImgIndex]} alt={`Gallery image preview ${nextImgIndex + 1}`} /></motion.div>
                  }
                </AnimatePresence>
              </div>

              {totalImages > 1 && (
                <motion.button
                  className="gallery-carousel-nav next" onClick={() => changeImage('next')} 
                  aria-label={t.navNext[language]}
                  whileHover={{ scale: 1.2, x: 6, backgroundColor: "rgba(var(--primary-color-rgb),0.18)", color: "var(--primary-color)" }}
                  whileTap={{ scale: 0.92 }} transition={{type:"spring", stiffness:380, damping:16}}
                ><IconChevronRight /></motion.button>
              )}
            </div>
            <div className="gallery-carousel-footer">
              <AnimatePresence mode="wait">
              {currentImgIndex !== null && totalImages > 0 && (
                  <motion.p
                      key={`counter-${currentImgIndex}`} className="gallery-carousel-counter"
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: {duration:0.35, delay: 0.22, ease:"easeOut"}}}
                      exit={{ opacity: 0, y: -12, transition: {duration: 0.2, ease:"easeIn"} }}
                  >{currentImgIndex + 1} / {totalImages}</motion.p>
              )}
              </AnimatePresence>
            </div>
          </>
          ) : (
            <motion.p className="gallery-placeholder">
              {t.placeholder.line1[language]}<br/>
              {t.placeholder.line2[language]}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          className="gallery-divider bottom"
          variants={galleryDividerVariants(bottomDividerDelay)}
          initial="hidden"
          animate="visible"
          exit="exit"
        />

        {onBack && (
            <motion.button
                className="gallery-back-button"
                onClick={onBack}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ 
                    opacity: 1, y: 0, scale: 1,
                    transition: { 
                        delay: bottomDividerDelay + 0.3, 
                        duration: 0.6, 
                        ease: [0.23, 1, 0.32, 1] 
                    } 
                }}
                exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.25, ease: "easeIn" } }}
                whileHover={{ 
                    scale: 1.08, 
                    y: -4, 
                    boxShadow: "0 8px 20px -5px rgba(var(--primary-color-rgb), 0.35)",
                    backgroundColor: "rgba(var(--primary-color-rgb), 0.1)"
                }}
                whileTap={{ scale: 0.96, y: -1 }}
                transition={{type:"spring", stiffness: 300, damping: 15}}
            >
                <IconChevronLeft /> 
                <span>Back</span>
            </motion.button>
        )}

      </motion.div>

      <AnimatePresence>
        {lightboxOpen && currentImgIndex !== null && (
          <motion.div
            className="lightbox-overlay" variants={lightboxOverlayVariants}
            initial="hidden" animate="visible" exit="exit"
            onClick={closeLightbox} aria-modal="true" role="dialog"
          >
            <motion.div
              className="lightbox-content"
              variants={lightboxContentVariants}
              onClick={(e) => e.stopPropagation()}
              initial="hidden" animate="visible" exit="exit"
            >
              <motion.button 
                className="lightbox-close-button" onClick={closeLightbox} 
                aria-label={t.closeLightbox[language]} title={t.closeLightbox[language]} 
                variants={controlButtonIndividualVariants} 
                whileHover={{ scale: 1.2, rotate: 95, color: "var(--error-color, #f38ba8)", backgroundColor: "rgba(var(--error-color-rgb), 0.2)" }} 
                whileTap={{ scale: 0.9, rotate: 80 }} 
                transition={{ type: "spring", stiffness: 380, damping: 16 }} 
              ><IconClose /></motion.button>
              {totalImages > 1 && (
                 <>
                    <motion.button 
                      className="lightbox-nav-button prev" onClick={() => changeImage('prev')} 
                      aria-label={t.navPrev[language]} title={`${t.navPrev[language]} (←)`} 
                      variants={controlButtonIndividualVariants} whileHover={{ scale: 1.15, x: -7, color: "var(--primary-color)", backgroundColor: "rgba(var(--primary-color-rgb),0.12)"}} whileTap={{ scale: 0.92 }} 
                    ><IconChevronLeft /></motion.button>
                    <motion.button 
                      className="lightbox-nav-button next" onClick={() => changeImage('next')} 
                      aria-label={t.navNext[language]} title={`${t.navNext[language]} (→)`} 
                      variants={controlButtonIndividualVariants} whileHover={{ scale: 1.15, x: 7, color: "var(--primary-color)", backgroundColor: "rgba(var(--primary-color-rgb),0.12)"}} whileTap={{ scale: 0.92 }} 
                    ><IconChevronRight /></motion.button>
                 </>
              )}
              <div className="lightbox-image-wrapper" ref={lightboxImageWrapperRef}>
                <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                    <motion.img key={currentImgIndex + "_lightbox"} src={displayImages[currentImgIndex]} alt={`Enlarged gallery image ${currentImgIndex + 1}`} className="lightbox-image" custom={slideDirection} variants={lightboxImageVariants} initial="enter" animate="center" exit="exit" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.18} onDragEnd={(_event, info) => { if (totalImages <=1 ) return; const offsetThreshold = 75; if (info.offset.x > offsetThreshold) changeImage('prev'); else if (info.offset.x < -offsetThreshold) changeImage('next');}} />
                </AnimatePresence>
              </div>
              <motion.div className="lightbox-controls-bar" variants={controlsBarVariants} initial="hidden" animate="visible" exit="exit" >
                <motion.button 
                  className="lightbox-action-button" onClick={handleDownload} 
                  aria-label={t.downloadImage[language]} title={t.downloadImage[language]} 
                  variants={controlButtonIndividualVariants} whileHover={{ scale: 1.18, y: -3, color: "var(--primary-color)" }} whileTap={{ scale: 0.92 }} 
                ><IconDownload /></motion.button>
                <motion.div variants={controlButtonIndividualVariants}>
                    <AnimatePresence mode="wait">
                        {currentImgIndex !== null && totalImages > 0 && (<motion.span key={`lightbox-counter-${currentImgIndex}`} className="lightbox-counter" initial={{ opacity: 0, y:6 }} animate={{ opacity: 1, y:0, transition: {duration: 0.3, delay:0.12} }} exit={{ opacity: 0, y:-6, transition: { duration: 0.18 } }} >{currentImgIndex + 1} / {totalImages}</motion.span>)}
                    </AnimatePresence>
                </motion.div>
                <motion.button 
                  className="lightbox-action-button" 
                  onClick={handleFullscreenToggle} 
                  aria-label={isFullscreen ? t.fullscreenExit[language] : t.fullscreenEnter[language]} 
                  title={isFullscreen ? t.fullscreenExit[language] : t.fullscreenEnter[language]} 
                  variants={controlButtonIndividualVariants} 
                  whileHover={{ scale: 1.18, y: -3, color: "var(--primary-color)"}} whileTap={{ scale: 0.92 }} 
                >{isFullscreen ? <IconExitFullscreen /> : <IconFullscreen />}</motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Gallery;