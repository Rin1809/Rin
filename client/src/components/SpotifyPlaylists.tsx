// client/src/components/SpotifyPlaylists.tsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import './styles/SpotifyPlaylists.css';
import { spotifyPlaylistsTranslations as t } from './languageSelector/languageSelector.constants';

// --- ICONS ---
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
const IconError = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="status-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);
const IconNoPlaylists = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="status-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);
// --- END ICONS ---

interface SpotifyPlaylist {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    externalUrl: string;
    owner: string;
}

interface SpotifyPlaylistsProps {
    language: 'vi' | 'en' | 'ja';
    playlists: SpotifyPlaylist[];
    isLoading: boolean;
    error: string | null;
}

// --- VARIANTS ---
const springTransitionCarousel = { type: "spring", stiffness: 260, damping: 26, mass: 0.95 };

const carouselItemVariants: Variants = {
    enter: (custom: { direction: number; role: 'main' | 'prev' | 'next' }) => ({
        x: custom.direction > 0 ? "100%" : "-100%",
        opacity: 0,
        scale: 0.65, 
        zIndex: 1,
        rotateY: custom.direction > 0 ? -25 : 25,
        filter: "blur(1.5px) brightness(0.9)"
    }),
    center: (custom: { role: 'main' | 'prev' | 'next'; direction: number }) => ({
        x: custom.role === "main" ? "0%" : (custom.role === "prev" ? "-60%" : "60%"), 
        scale: custom.role === "main" ? 1 : 0.75, 
        rotateY: custom.role === "main" ? 0 : (custom.role === "prev" ? 18 : -18), 
        z: custom.role === "main" ? 0 : -120, 
        opacity: custom.role === "main" ? 1 : 0.55, 
        zIndex: custom.role === "main" ? 2 : 1,
        filter: custom.role === "main" ? "blur(0px) brightness(1.0)" : "blur(1.5px) brightness(0.8)", 
        boxShadow: custom.role === "main"
            ? "0 18px 50px -15px rgba(var(--highlight-color-poetic-rgb), 0.5), 0 0 3px 3px rgba(var(--highlight-color-poetic-rgb), 0.35)"
            : "0 8px 20px -8px rgba(0, 0, 0, 0.45)",
        transition: springTransitionCarousel
    }),
    exit: (custom: { direction: number; role: 'main' | 'prev' | 'next' }) => ({
        x: custom.direction < 0 ? "100%" : "-100%",
        opacity: 0,
        scale: 0.65,
        zIndex: 0,
        rotateY: custom.direction < 0 ? 25 : -25,
        filter: "blur(1.5px) brightness(0.9)",
        transition: { ...springTransitionCarousel, damping: 30, stiffness: 240 }
    })
};

const statusMessageVariants = {
    initial: { opacity: 0, y: 20, scale:0.95 },
    animate: { opacity: 1, y: 0, scale:1, transition: { duration: 0.4, ease: "easeOut", delay: 0.1 } },
    exit: { opacity: 0, y: -15, scale:0.95, transition: { duration: 0.3, ease: "easeIn" } }
};
// --- END VARIANTS ---


const SpotifyPlaylists: React.FC<SpotifyPlaylistsProps> = ({
    language,
    playlists,
    isLoading,
    error,
}) => {
    const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState<number | null>(null);
    const [slideDirection, setSlideDirection] = useState(0);

    const totalPlaylists = playlists.length;

    useEffect(() => {
        if (totalPlaylists > 0 && selectedPlaylistIndex === null) {
            setSelectedPlaylistIndex(0); 
        }
        if (totalPlaylists === 0 && selectedPlaylistIndex !== null) {
            setSelectedPlaylistIndex(null); 
        }
    }, [totalPlaylists, selectedPlaylistIndex]);

    const changePlaylist = useCallback((direction: 'next' | 'prev') => {
        if (selectedPlaylistIndex === null || totalPlaylists <= 1) return;
        
        setSlideDirection(direction === 'next' ? 1 : -1); 

        let newIndex: number;
        if (direction === 'next') {
            newIndex = (selectedPlaylistIndex + 1) % totalPlaylists;
        } else {
            newIndex = (selectedPlaylistIndex - 1 + totalPlaylists) % totalPlaylists;
        }
        setSelectedPlaylistIndex(newIndex);
    }, [selectedPlaylistIndex, totalPlaylists]);

    const { prevPlaylistIndex, currentPlaylistIndex, nextPlaylistIndex } = useMemo(() => {
        if (selectedPlaylistIndex === null || totalPlaylists === 0) {
            return { prevPlaylistIndex: null, currentPlaylistIndex: null, nextPlaylistIndex: null };
        }
        const current = selectedPlaylistIndex;
        const prev = totalPlaylists > 1 ? (current - 1 + totalPlaylists) % totalPlaylists : null;
        const next = totalPlaylists > 1 ? (current + 1) % totalPlaylists : null;
        return { prevPlaylistIndex: prev, currentPlaylistIndex: current, nextPlaylistIndex: next };
    }, [selectedPlaylistIndex, totalPlaylists]);

    const handleSidePlaylistClick = (index: number | null) => {
        if (index === null || index === currentPlaylistIndex || selectedPlaylistIndex === null) return;
        const diff = index - selectedPlaylistIndex;
        let direction = 0;
        if (index === prevPlaylistIndex) direction = -1;
        else if (index === nextPlaylistIndex) direction = 1;
        else { 
            if (Math.abs(diff) <= totalPlaylists / 2) direction = diff > 0 ? 1 : -1; 
            else direction = diff > 0 ? -1 : 1; 
        }
        setSlideDirection(direction);
        setSelectedPlaylistIndex(index);
    };


    if (isLoading) {
        return (
            <motion.div className="spotify-playlists-status-container loading-message" variants={statusMessageVariants} initial="initial" animate="animate" exit="exit">
                <div className="spinner"></div>
                <p>{t.loading[language]}</p>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div className="spotify-playlists-status-container error-message" variants={statusMessageVariants} initial="initial" animate="animate" exit="exit">
                <IconError />
                <p>{t.error[language]}<br/>({error})</p>
            </motion.div>
        );
    }

    if (!playlists || playlists.length === 0) {
        return (
            <motion.div className="spotify-playlists-status-container no-playlists-message" variants={statusMessageVariants} initial="initial" animate="animate" exit="exit">
                <IconNoPlaylists />
                <p>{t.noPlaylists[language]}</p>
            </motion.div>
        );
    }

    return (
        <div className="spotify-playlists-container spotify-carousel-mode">
            <motion.h2
                className="spotify-playlists-title"
                initial={{ opacity: 0, y: -20, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] } }}
                exit={{ opacity: 0, y: 15, filter: "blur(2px)", transition: { duration: 0.25 } }}
            >
                {t.title[language]}
            </motion.h2>

            {currentPlaylistIndex !== null && totalPlaylists > 0 ? (
                <>
                    <div className="spotify-carousel-wrapper">
                        {totalPlaylists > 1 && (
                            <motion.button
                                className="spotify-carousel-nav prev" onClick={() => changePlaylist('prev')}
                                aria-label={t.navPrev?.[language] || "Previous Playlist"}
                                whileHover={{ scale: 1.15, x: -5, backgroundColor: "rgba(var(--primary-color-rgb),0.15)", color: "var(--primary-color)" }}
                                whileTap={{ scale: 0.9, x: -2 }} transition={{type:"spring", stiffness:380, damping:16}}
                            ><IconChevronLeft /></motion.button>
                        )}

                        <div className="spotify-carousel-stage">
                            <AnimatePresence custom={{ direction: slideDirection }} initial={false} mode="popLayout">
                                {totalPlaylists > 1 && prevPlaylistIndex !== null &&
                                (totalPlaylists > 2 || (totalPlaylists === 2 && currentPlaylistIndex === 1 )) &&
                                    <motion.div
                                        key={"carousel_prev_" + playlists[prevPlaylistIndex].id} 
                                        className="spotify-playlist-item prev-item"
                                        custom={{ role: 'prev', direction: slideDirection }} variants={carouselItemVariants}
                                        initial="enter" animate="center" exit="exit"
                                        onClick={() => handleSidePlaylistClick(prevPlaylistIndex)}
                                    >
                                       <iframe
                                            title={playlists[prevPlaylistIndex].name}
                                            src={`https://open.spotify.com/embed/playlist/${playlists[prevPlaylistIndex].id}?utm_source=generator&theme=0`}
                                            width="100%" height="352" allowFullScreen={false}
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"
                                        ></iframe>
                                    </motion.div>
                                }
                                {currentPlaylistIndex !== null && ( 
                                  <motion.div
                                      key={"carousel_main_" + playlists[currentPlaylistIndex].id} 
                                      className="spotify-playlist-item main-item"
                                      custom={{ role: 'main', direction: slideDirection }} variants={carouselItemVariants}
                                      initial="enter" animate="center" exit="exit"
                                  >
                                      <iframe
                                          title={playlists[currentPlaylistIndex].name}
                                          src={`https://open.spotify.com/embed/playlist/${playlists[currentPlaylistIndex].id}?utm_source=generator&theme=0`}
                                          width="100%" height="352" allowFullScreen={false}
                                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"
                                      ></iframe>
                                      <motion.div 
                                        className="main-item-info-overlay"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0, transition: {delay: 0.2, duration: 0.4, ease: "easeOut"} }}
                                        exit={{ opacity: 0, y: 15, transition: {duration: 0.2, ease: "easeIn"} }}
                                      >
                                          <h3>{playlists[currentPlaylistIndex].name}</h3>
                                          <a href={playlists[currentPlaylistIndex].externalUrl} target="_blank" rel="noopener noreferrer">
                                            {t.externalLink[language]}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V14h-2v4H4V6h6zm7-4L8.5 8.5l1.42 1.42L18 1.83V5h2V0z"></path></svg>
                                          </a>
                                      </motion.div>
                                  </motion.div>
                                )}
                                {totalPlaylists > 1 && nextPlaylistIndex !== null &&
                                (totalPlaylists > 2 || (totalPlaylists === 2 && currentPlaylistIndex === 0)) &&
                                    <motion.div
                                        key={"carousel_next_" + playlists[nextPlaylistIndex].id} 
                                        className="spotify-playlist-item next-item"
                                        custom={{ role: 'next', direction: slideDirection }} variants={carouselItemVariants}
                                        initial="enter" animate="center" exit="exit"
                                        onClick={() => handleSidePlaylistClick(nextPlaylistIndex)}
                                    >
                                      <iframe
                                          title={playlists[nextPlaylistIndex].name}
                                          src={`https://open.spotify.com/embed/playlist/${playlists[nextPlaylistIndex].id}?utm_source=generator&theme=0`}
                                          width="100%" height="352" allowFullScreen={false}
                                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"
                                      ></iframe>
                                    </motion.div>
                                }
                            </AnimatePresence>
                        </div>

                        {totalPlaylists > 1 && (
                            <motion.button
                                className="spotify-carousel-nav next" onClick={() => changePlaylist('next')}
                                aria-label={t.navNext?.[language] || "Next Playlist"}
                                whileHover={{ scale: 1.15, x: 5, backgroundColor: "rgba(var(--primary-color-rgb),0.15)", color: "var(--primary-color)" }}
                                whileTap={{ scale: 0.9, x: 2 }} transition={{type:"spring", stiffness:380, damping:16}}
                            ><IconChevronRight /></motion.button>
                        )}
                    </div>
                    <div className="spotify-carousel-footer">
                        <AnimatePresence mode="wait">
                        {currentPlaylistIndex !== null && totalPlaylists > 0 && (
                            <motion.p
                                key={`counter-${currentPlaylistIndex}`} className="spotify-carousel-counter"
                                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: {duration:0.35, delay: 0.22, ease:"easeOut"}}}
                                exit={{ opacity: 0, y: -12, transition: {duration: 0.2, ease:"easeIn"} }}
                            >{currentPlaylistIndex + 1} / {totalPlaylists}</motion.p>
                        )}
                        </AnimatePresence>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default SpotifyPlaylists;