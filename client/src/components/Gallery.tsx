// client/src/components/Gallery.tsx

import * as THREE from 'three';
import React, { useMemo, useRef, Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Image, Environment, ScrollControls, useScroll, useTexture } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { easing } from 'maath';

import './styles/Gallery.css';
import { galleryTranslations, cardIntroTranslations, aboutNavIconLeft } from './languageSelector/languageSelector.constants';
import { logInteraction } from '../utils/logger';
import '../utils/threeUtils';

// --- Icons ---
const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const IconDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const IconFullscreen = () => (
 <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
);
const IconExitFullscreen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 0-2-2h-3M3 16h3a2 2 0 0 0 2-2v-3"/></svg>
);
// --- End Icons ---


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

interface CarouselProps {
    count: number;
    radius?: number;
    imageUrls: string[];
    onImageClick: (index: number) => void;
}

interface CardProps {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onClick: () => void;
}

// --- 3D Components ---

function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  const scroll = useScroll();
  
  useFrame((state, delta) => {
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2);
    easing.damp3(state.camera.position, [-state.pointer.x * 1.5, state.pointer.y * 1.5 + 1.5, 10], 0.3, delta);
    state.camera.lookAt(0, 0, 0);
  });

  return <group ref={ref}>{children}</group>;
}

function Carousel({ count, radius = 2.2, imageUrls, onImageClick }: CarouselProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Card
          key={i}
          url={imageUrls[i % imageUrls.length]}
          position={[Math.sin((i / count) * Math.PI * 2) * radius, 0, Math.cos((i / count) * Math.PI * 2) * radius]}
          rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
          onClick={() => onImageClick(i)}
        />
      ))}
    </>
  );
}

function Card({ url, onClick, ...props }: CardProps) {
  const ref = useRef<any>();
  const [hovered, hover] = useState(false);
  const pointerOver = (e: any) => (e.stopPropagation(), hover(true));
  const pointerOut = () => hover(false);
  
  useFrame((_state, delta) => {
    easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta);
    easing.damp(ref.current.material, 'radius', hovered ? 0.25 : 0.1, 0.2, delta);
    easing.damp(ref.current.material, 'zoom', hovered ? 1 : 1.5, 0.2, delta);
  });

  return (
    <Image ref={ref} url={url} transparent side={THREE.DoubleSide} onPointerOver={pointerOver} onPointerOut={pointerOut} onClick={onClick} {...props}>
      {/* @ts-ignore */}
      <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
    </Image>
  );
}

function Banner(props: any) {
    const ref = useRef<any>();
    const texture = useTexture('/src/assets/gallery_ring_texture.png');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    const scroll = useScroll();
    useFrame((_state, delta) => {
      ref.current.material.time.value += Math.abs(scroll.delta) * 4;
      ref.current.material.map.offset.x += delta / 2;
    });
    return (
      <mesh ref={ref} {...props}>
        <cylinderGeometry args={[2.8, 2.8, 0.15, 128, 16, true]} />
        {/* @ts-ignore */}
        <meshSineMaterial map={texture} map-anisotropy={16} map-repeat={[30, 1]} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    );
}

// --- Main Gallery Component ---

const Gallery: React.FC<GalleryProps> = ({ images, onBack, language }) => {
  const displayImages = useMemo(() => {
    if (images && images.length > 0) return images;
    return localImages;
  }, [images]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lightboxImageWrapperRef = useRef<HTMLDivElement>(null);

  const t = galleryTranslations;
  const totalImages = displayImages.length;

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setSlideDirection(0);
    setLightboxOpen(true);
    logInteraction('gallery_image_viewed', {
        imageIndex: index, totalImages, imageUrl: displayImages[index], language, action: 'open_lightbox'
    });
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    if (isFullscreen) {
      if (document.fullscreenElement) document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const changeImageInLightbox = useCallback((direction: 'next' | 'prev') => {
    if (totalImages <= 1) return;
    setSlideDirection(direction === 'next' ? 1 : -1);
    const newIndex = direction === 'next' ? (selectedImageIndex + 1) % totalImages : (selectedImageIndex - 1 + totalImages) % totalImages;
    setSelectedImageIndex(newIndex);
    logInteraction('gallery_image_viewed', {
        imageIndex: newIndex, totalImages, imageUrl: displayImages[newIndex], language, action: 'lightbox_nav'
    });
  }, [selectedImageIndex, totalImages, displayImages, language]);

  const handleDownload = useCallback(() => {
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (lightboxOpen) {
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowRight') changeImageInLightbox('next');
        if (event.key === 'ArrowLeft') changeImageInLightbox('prev');
        if (event.key === 'f' || event.key === 'F') handleFullscreenToggle();
      }
    };
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [lightboxOpen, closeLightbox, changeImageInLightbox, handleFullscreenToggle]);
  
  // --- Animation Variants ---
  const lightboxOverlayVariants = { 
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.35, delay: 0.05, ease: "easeIn" } },
  };
  const lightboxContentVariants = { 
    hidden: { scale: 0.9, opacity: 0, y: 25 },
    visible: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 28, mass: 0.95, staggerChildren: 0.06, delayChildren: 0.1 }},
    exit: { scale: 0.92, opacity: 0, y: 15, transition: { duration: 0.3, ease: "easeIn" } },
  };
  const lightboxImageSpring = { type: "spring", stiffness: 230, damping: 30, mass: 1.0 };
  const lightboxImageVariants = { 
    enter: (direction: number) => ({ x: direction > 0 ? "70%" : "-70%", opacity: 0.4, scale: 0.85, rotate: direction > 0 ? 8 : -8, }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1, rotate: 0, transition: lightboxImageSpring },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? "70%" : "-70%", opacity: 0, scale: 0.85, rotate: direction < 0 ? 8 : -8, transition: { ...lightboxImageSpring, damping: 32 }})
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
  
  return (
    <>
    <motion.div
        className="gallery-main-container gallery-3d-mode"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.1 } }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
        <div className="gallery-canvas-background">
            {totalImages > 0 ? (
            <Suspense fallback={<div className="canvas-fallback">Loading 3D View...</div>}>
                <Canvas camera={{ position: [0, 0, 10], fov: 15 }}>
                  <fog attach="fog" args={['#0c0e1a', 8.5, 13]} />
                  <ScrollControls pages={4} infinite>
                      <Rig>
                          <Carousel 
                              count={totalImages} 
                              imageUrls={displayImages} 
                              onImageClick={openLightbox}
                          />
                      </Rig>
                      <Banner position={[0, -0.15, 0]} />
                  </ScrollControls>
                  <Environment preset="dawn" background={false} blur={0.5} />
                </Canvas>
            </Suspense>
            ) : (
            <motion.p className="gallery-placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1, transition:{ delay: 0.3 }}}>
                {t.placeholder.line1[language]}<br/>{t.placeholder.line2[language]}
            </motion.p>
            )}
        </div>

        <div className="gallery-ui-layer">
            <motion.h2 className="gallery-title" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } }}>
                {t.title[language]}
            </motion.h2>
            {onBack && (
            <motion.button className="card-view-back-button gallery-back-button" onClick={onBack} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.5 } }} whileHover={{ scale: 1.08, y: -4, boxShadow: "0 8px 20px -5px rgba(var(--primary-color-rgb), 0.35)", backgroundColor: "rgba(var(--primary-color-rgb), 0.1)" }} whileTap={{ scale: 0.96, y: -1 }} transition={{type:"spring", stiffness: 300, damping: 15}}>
                <span className="button-icon-svg" dangerouslySetInnerHTML={{__html: aboutNavIconLeft}}/>
                <span className="button-text">{cardIntroTranslations.backButton[language]}</span>
            </motion.button>
            )}
        </div>
    </motion.div>
    
    <AnimatePresence>
        {lightboxOpen && (
          <motion.div className="lightbox-overlay" variants={lightboxOverlayVariants} initial="hidden" animate="visible" exit="exit" onClick={closeLightbox} aria-modal="true" role="dialog">
            <motion.div className="lightbox-content" variants={lightboxContentVariants} onClick={(e) => e.stopPropagation()} initial="hidden" animate="visible" exit="exit">
              <motion.button className="lightbox-close-button" onClick={closeLightbox} aria-label={t.closeLightbox[language]} title={t.closeLightbox[language]} variants={controlButtonIndividualVariants} whileHover={{ scale: 1.2, rotate: 95, color: "var(--error-color, #f38ba8)", backgroundColor: "rgba(var(--error-color-rgb), 0.2)" }} whileTap={{ scale: 0.9, rotate: 80 }} transition={{ type: "spring", stiffness: 380, damping: 16 }} ><IconClose /></motion.button>
              {totalImages > 1 && (
                 <>
                    <motion.button className="lightbox-nav-button prev" onClick={() => changeImageInLightbox('prev')} aria-label={t.navPrev[language]} title={`${t.navPrev[language]} (←)`} variants={controlButtonIndividualVariants} whileHover={{ scale: 1.15, x: -7, color: "var(--primary-color)", backgroundColor: "rgba(var(--primary-color-rgb),0.12)"}} whileTap={{ scale: 0.92 }} ><IconChevronLeft /></motion.button>
                    <motion.button className="lightbox-nav-button next" onClick={() => changeImageInLightbox('next')} aria-label={t.navNext[language]} title={`${t.navNext[language]} (→)`} variants={controlButtonIndividualVariants} whileHover={{ scale: 1.15, x: 7, color: "var(--primary-color)", backgroundColor: "rgba(var(--primary-color-rgb),0.12)"}} whileTap={{ scale: 0.92 }} ><IconChevronRight /></motion.button>
                 </>
              )}
              <div className="lightbox-image-wrapper" ref={lightboxImageWrapperRef}>
                <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                    <motion.img key={selectedImageIndex + "_lightbox"} src={displayImages[selectedImageIndex]} alt={`Enlarged gallery image ${selectedImageIndex + 1}`} className="lightbox-image" custom={slideDirection} variants={lightboxImageVariants} initial="enter" animate="center" exit="exit" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.18} onDragEnd={(_event, info) => { if (totalImages <=1 ) return; const offsetThreshold = 75; if (info.offset.x > offsetThreshold) changeImageInLightbox('prev'); else if (info.offset.x < -offsetThreshold) changeImageInLightbox('next');}} />
                </AnimatePresence>
              </div>
              <motion.div className="lightbox-controls-bar" variants={controlsBarVariants} initial="hidden" animate="visible" exit="exit" >
                <motion.button className="lightbox-action-button" onClick={handleDownload} aria-label={t.downloadImage[language]} title={t.downloadImage[language]} variants={controlButtonIndividualVariants} whileHover={{ scale: 1.18, y: -3, color: "var(--primary-color)" }} whileTap={{ scale: 0.92 }} ><IconDownload /></motion.button>
                <motion.div variants={controlButtonIndividualVariants}>
                    <AnimatePresence mode="wait">
                        <motion.span key={`lightbox-counter-${selectedImageIndex}`} className="lightbox-counter" initial={{ opacity: 0, y:6 }} animate={{ opacity: 1, y:0, transition: {duration: 0.3, delay:0.12} }} exit={{ opacity: 0, y:-6, transition: { duration: 0.18 } }} >{selectedImageIndex + 1} / {totalImages}</motion.span>
                    </AnimatePresence>
                </motion.div>
                <motion.button className="lightbox-action-button" onClick={handleFullscreenToggle} aria-label={isFullscreen ? t.fullscreenExit[language] : t.fullscreenEnter[language]} title={isFullscreen ? t.fullscreenExit[language] : t.fullscreenEnter[language]} variants={controlButtonIndividualVariants} whileHover={{ scale: 1.18, y: -3, color: "var(--primary-color)"}} whileTap={{ scale: 0.92 }} >{isFullscreen ? <IconExitFullscreen /> : <IconFullscreen />}</motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Gallery;