import React from 'react';
import { motion } from 'framer-motion';
import './styles/GalleryUI.css';
import { aboutNavIconLeft } from './languageSelector/languageSelector.constants';

interface GalleryUIProps {
    title: string;
    backButtonText: string;
    onBack: () => void;
}

const GalleryUI: React.FC<GalleryUIProps> = ({ title, backButtonText, onBack }) => {
    return (
        <div className="gallery-ui-container">
            <motion.h2
                className="gallery-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } }}
            >
                {title}
            </motion.h2>

            <motion.button
                className="card-view-back-button gallery-back-button"
                onClick={onBack}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.5 } }}
                whileHover={{
                    scale: 1.08,
                    y: -4,
                    boxShadow: "0 8px 20px -5px rgba(var(--primary-color-rgb), 0.35)",
                    backgroundColor: "rgba(var(--primary-color-rgb), 0.1)"
                }}
                whileTap={{ scale: 0.96, y: -1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
                <span className="button-icon-svg" dangerouslySetInnerHTML={{ __html: aboutNavIconLeft }} />
                <span className="button-text">{backButtonText}</span>
            </motion.button>
        </div>
    );
};

export default GalleryUI;