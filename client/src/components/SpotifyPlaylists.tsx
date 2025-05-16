// client/src/components/SpotifyPlaylists.tsx
import React from 'react';
import { motion } from 'framer-motion';
import './styles/SpotifyPlaylists.css';
import { spotifyPlaylistsTranslations as t } from './languageSelector/languageSelector.constants';

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

const playlistItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.1 + 0.2, // stagger + init delay
            type: "spring",
            stiffness: 200,
            damping: 25,
        },
    }),
    exit: { opacity: 0, y: -15, scale: 0.97, transition: { duration: 0.2 } }
};

const SpotifyPlaylists: React.FC<SpotifyPlaylistsProps> = ({
    language,
    playlists,
    isLoading,
    error,
}) => {

    if (isLoading) {
        return (
            <motion.div className="spotify-playlists-container status-message"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <div className="spinner"></div>
                <p>{t.loading[language]}</p>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div className="spotify-playlists-container status-message error-message"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <p>{t.error[language]}<br/>({error})</p>
            </motion.div>
        );
    }

    if (!playlists || playlists.length === 0) {
        return (
            <motion.div className="spotify-playlists-container status-message"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <p>{t.noPlaylists[language]}</p>
            </motion.div>
        );
    }

    return (
        <div className="spotify-playlists-scroll-wrapper">
            <motion.h2
                className="spotify-playlists-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.5, ease:"easeOut" } }}
                exit={{ opacity: 0, y: 15, transition: { duration: 0.2 } }}
            >
                {t.title[language]}
            </motion.h2>
            <div className="spotify-playlists-grid">
                {playlists.map((playlist, index) => (
                    <motion.div
                        key={playlist.id}
                        className="spotify-playlist-item"
                        custom={index}
                        variants={playlistItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                    >
                        <div className="spotify-embed-wrapper">
                            <iframe
                                title={playlist.name}
                                style={{ borderRadius: '12px' }}
                                src={`https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator&theme=0`}
                                width="100%"
                                height="352" // Standard compact height
                                allowFullScreen={false}
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            ></iframe>
                        </div>
                        <div className="playlist-info">
                            <h3 className="playlist-name">{playlist.name}</h3>
                            {playlist.description && <p className="playlist-description" dangerouslySetInnerHTML={{__html: playlist.description}}></p>}
                            <a href={playlist.externalUrl} target="_blank" rel="noopener noreferrer" className="playlist-external-link">
                                {t.externalLink[language]}
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SpotifyPlaylists;