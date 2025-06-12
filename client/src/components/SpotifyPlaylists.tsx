// client/src/components/SpotifyPlaylists.tsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import './styles/SpotifyPlaylists.css';
import { useSpotifyStore } from '../stores/spotify.store';
import { spotifyPlaylistsTranslations as t, aboutNavIconLeft, cardIntroTranslations } from './languageSelector/languageSelector.constants';

const IconChevronLeft=()=>(<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
const IconChevronRight=()=>(<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);
const IconExternalLink=()=>(<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V14h-2v4H4V6h6zm7-4L8.5 8.5l1.42 1.42L18 1.83V5h2V0z"></path></svg>);
const IconError=()=>(<svg xmlns="http://www.w3.org/2000/svg" className="status-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>);
const IconNoPlaylists=()=>(<svg xmlns="http://www.w3.org/2000/svg" className="status-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line></svg>);
const springTransitionCarousel = { type: "spring", stiffness: 260, damping: 26, mass: 0.95 };
const carouselItemVariants: Variants = { enter: (c) => ({ x: c.direction > 0 ? "80%" : "-80%", opacity: 0, scale: 0.6, zIndex: 1, rotateY: c.direction > 0 ? -20 : 20, filter: "blur(1.5px) brightness(0.9)" }), center: (c) => ({ x: c.role === "main" ? "0%" : (c.role === "prev" ? "-48%" : "48%"), scale: c.role === "main" ? 1 : 0.7, rotateY: c.role === "main" ? 0 : (c.role === "prev" ? 15 : -15), z: c.role === "main" ? 0 : -90,  opacity: c.role === "main" ? 1 : 0.6, zIndex: c.role === "main" ? 2 : 1, filter: c.role === "main" ? "blur(0px) brightness(1.0)" : "blur(1px) brightness(0.85)", boxShadow: c.role === "main" ? "0 18px 50px -15px rgba(var(--highlight-color-poetic-rgb), 0.5), 0 0 3px 3px rgba(var(--highlight-color-poetic-rgb), 0.35)" : "0 6px 15px -6px rgba(0, 0, 0, 0.4)", transition: springTransitionCarousel }), exit: (c) => ({ x: c.direction < 0 ? "80%" : "-80%", opacity: 0, scale: 0.6, zIndex: 0, rotateY: c.direction < 0 ? 20 : -20, filter: "blur(1.5px) brightness(0.9)", transition: { ...springTransitionCarousel, damping: 30, stiffness: 240 } }) };
const statusMessageVariants = { initial: { opacity: 0, y: 20, scale:0.95 }, animate: { opacity: 1, y: 0, scale:1, transition: { duration: 0.4, ease: "easeOut", delay: 0.1 } }, exit: { opacity: 0, y: -15, scale:0.95, transition: { duration: 0.3, ease: "easeIn" } }};

interface SpotifyPlaylistsProps {
    language: 'vi' | 'en' | 'ja';
    onBack: () => void;
}

const SpotifyPlaylists: React.FC<SpotifyPlaylistsProps> = ({ language, onBack }) => {
    const { playlists, isLoading, error, fetchPlaylists } = useSpotifyStore();
    const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState<number | null>(null);
    const [slideDirection, setSlideDirection] = useState(0);

    const totalPlaylists = playlists.length;
    
    useEffect(() => {
        if(playlists.length === 0) { fetchPlaylists(); }
    }, [fetchPlaylists, playlists.length]);

    useEffect(() => {
        if (totalPlaylists > 0 && selectedPlaylistIndex === null) setSelectedPlaylistIndex(0); 
        if (totalPlaylists === 0) setSelectedPlaylistIndex(null); 
    }, [totalPlaylists, selectedPlaylistIndex]);

    const changePlaylist = useCallback((direction: 'next' | 'prev') => {
        if (selectedPlaylistIndex === null || totalPlaylists <= 1) return;
        setSlideDirection(direction === 'next' ? 1 : -1); 
        const newIndex = direction === 'next' ? (selectedPlaylistIndex + 1) % totalPlaylists : (selectedPlaylistIndex - 1 + totalPlaylists) % totalPlaylists;
        setSelectedPlaylistIndex(newIndex);
    }, [selectedPlaylistIndex, totalPlaylists]);

    const { prevPlaylistIndex, currentPlaylistIndex, nextPlaylistIndex } = useMemo(() => {
        if (selectedPlaylistIndex === null || totalPlaylists === 0) return { prevPlaylistIndex: null, currentPlaylistIndex: null, nextPlaylistIndex: null };
        const current = selectedPlaylistIndex;
        const prev = totalPlaylists > 1 ? (current - 1 + totalPlaylists) % totalPlaylists : null;
        const next = totalPlaylists > 1 ? (current + 1) % totalPlaylists : null;
        return { prevPlaylistIndex: prev, currentPlaylistIndex: current, nextPlaylistIndex: next };
    }, [selectedPlaylistIndex, totalPlaylists]);

    const handleSidePlaylistClick = (index: number | null) => {
        if (index === null || index === currentPlaylistIndex || selectedPlaylistIndex === null) return;
        setSlideDirection(index > selectedPlaylistIndex ? 1 : -1);
        setSelectedPlaylistIndex(index);
    };

    if (isLoading) return <motion.div className="spotify-playlists-status-container loading-message" variants={statusMessageVariants} initial="initial" animate="animate" exit="exit"><div className="spinner"></div><p>{t.loading[language]}</p></motion.div>;
    if (error) return <motion.div className="spotify-playlists-status-container error-message" variants={statusMessageVariants} initial="initial" animate="animate" exit="exit"><IconError /><p>{t.error[language]}<br/>({error})</p></motion.div>;
    if (!playlists || playlists.length === 0) return <motion.div className="spotify-playlists-status-container no-playlists-message" variants={statusMessageVariants} initial="initial" animate="animate" exit="exit"><IconNoPlaylists /><p>{t.noPlaylists[language]}</p></motion.div>;

    return (
        <div className="spotify-playlists-container spotify-carousel-mode">
            <motion.h2 className="spotify-playlists-title" initial={{opacity:0}} animate={{opacity:1}}>{t.title[language]}</motion.h2>

            {currentPlaylistIndex !== null && totalPlaylists > 0 && (
            <>
                <div className="spotify-carousel-wrapper">
                    {totalPlaylists > 1 && <motion.button className="spotify-carousel-nav prev" onClick={() => changePlaylist('prev')} aria-label={t.navPrev?.[language]} whileHover={{scale:1.1}} whileTap={{scale:0.9}}><IconChevronLeft/></motion.button>}
                    
                    <div className="spotify-carousel-stage">
                        <AnimatePresence custom={{ direction: slideDirection }} mode="popLayout">
                            {totalPlaylists > 1 && prevPlaylistIndex !== null && (totalPlaylists > 2 || (totalPlaylists === 2 && currentPlaylistIndex === 1)) && (
                                <motion.div key={"prev_" + playlists[prevPlaylistIndex].id} className="spotify-playlist-item prev-item spotify-playlist-placeholder" custom={{role:'prev',direction:slideDirection}} variants={carouselItemVariants} initial="enter" animate="center" exit="exit" onClick={() => handleSidePlaylistClick(prevPlaylistIndex)}>
                                    {playlists[prevPlaylistIndex].imageUrl && <img src={playlists[prevPlaylistIndex].imageUrl} alt={playlists[prevPlaylistIndex].name} className="playlist-cover-art"/>}
                                    <div className="playlist-placeholder-info"><h4>{playlists[prevPlaylistIndex].name}</h4></div>
                                </motion.div>
                            )}
                            <motion.div key={"main_" + playlists[currentPlaylistIndex].id} className="spotify-playlist-item main-item" custom={{role:'main',direction:slideDirection}} variants={carouselItemVariants} initial="enter" animate="center" exit="exit">
                                <iframe title={playlists[currentPlaylistIndex].name} src={`https://open.spotify.com/embed/playlist/${playlists[currentPlaylistIndex].id}?utm_source=generator&theme=0`} width="100%" height="352" allowFullScreen={false} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                                <div className="main-item-info-overlay">
                                    <h3>{playlists[currentPlaylistIndex].name}</h3>
                                    <a href={playlists[currentPlaylistIndex].externalUrl} target="_blank" rel="noopener noreferrer">
                                        {t.externalLink[language]}
                                        <IconExternalLink/>
                                    </a>
                                </div>
                            </motion.div>
                            {totalPlaylists > 1 && nextPlaylistIndex !== null && (totalPlaylists > 2 || (totalPlaylists === 2 && currentPlaylistIndex === 0)) && (
                                <motion.div key={"next_" + playlists[nextPlaylistIndex].id} className="spotify-playlist-item next-item spotify-playlist-placeholder" custom={{role:'next',direction:slideDirection}} variants={carouselItemVariants} initial="enter" animate="center" exit="exit" onClick={() => handleSidePlaylistClick(nextPlaylistIndex)}>
                                    {playlists[nextPlaylistIndex].imageUrl && <img src={playlists[nextPlaylistIndex].imageUrl} alt={playlists[nextPlaylistIndex].name} className="playlist-cover-art"/>}
                                    <div className="playlist-placeholder-info"><h4>{playlists[nextPlaylistIndex].name}</h4></div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {totalPlaylists > 1 && <motion.button className="spotify-carousel-nav next" onClick={() => changePlaylist('next')} aria-label={t.navNext?.[language]} whileHover={{scale:1.1}} whileTap={{scale:0.9}}><IconChevronRight/></motion.button>}
                </div>
                <div className="spotify-carousel-footer">
                    <AnimatePresence mode="wait">
                        <motion.p key={`counter-${currentPlaylistIndex}`} className="spotify-carousel-counter" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{currentPlaylistIndex+1} / {totalPlaylists}</motion.p>
                    </AnimatePresence>
                </div>
                 <motion.button className="card-view-back-button" onClick={onBack} initial={{opacity:0}} animate={{opacity:1}}>
                    <span className="button-icon-svg" dangerouslySetInnerHTML={{ __html: aboutNavIconLeft }} /><span>{cardIntroTranslations.backButton[language]}</span>
                </motion.button>
            </>
            )}
        </div>
    );
};
export default SpotifyPlaylists;