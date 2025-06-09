import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from './components/LanguageSelector';
import { PoeticBackground } from './components/PoeticBackground';
import FishScrollExperience from './components/FishScrollExperience';
import backgroundMusicMP3 from './assets/audio/background_music.mp3';
import './components/styles/App.css';
import { useVideoPreloader } from './utils/videoPreloader'; 

// --- CONSTANTS ---
const YOUR_AVATAR_URL_FOR_INTRO = "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=128";
const YOUR_NAME_FOR_INTRO = "よこそう！！";

const PERSONAL_CARD_DATA = {
    avatarUrl: "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=128",
    githubUsername: "Rin1809"
};

const fishExperienceVideos = [
    "/videos/cosmos_intro.mp4",
    "/videos/stars_forming.mp4",
    "/videos/milkyway.mp4",
    "/videos/solar_system.mp4",
    "/videos/earth.mp4",
    "/videos/humans.mp4",
    "/videos/arrival.mp4"
];

// --- STAGE DEFINITIONS ---
type AppStage = 'preloadingFish' | 'fishExperience' | 'cardIntroCat' | 'cardIntroWelcome' | 'mainCardApp';
type CardIntroStage = 'cat' | 'yourName';

// --- COMPONENT PHỤ ĐỂ HIỂN THỊ INTRO ---
interface ContentAreaProps {
    currentStage: CardIntroStage;
    isFadingOutProp: boolean;
    userName: string;
}

const ContentArea: React.FC<ContentAreaProps> = React.memo(({ currentStage, isFadingOutProp, userName }) => {
    const yourNameIntroStageClass = `intro-stage server-stage-wow ${isFadingOutProp && currentStage === 'yourName' ? 'hiding' : currentStage === 'yourName' ? 'visible' : ''}`;
    const catStageClass = `intro-stage cat-stage ${isFadingOutProp && currentStage === 'cat' ? 'hiding' : currentStage === 'cat' ? 'visible' : ''}`;
    const appContainerClass = "AppContainer intro-active";

    return (
        <div className={`App ${appContainerClass}`}>
            {currentStage === 'cat' && (
                <div className={catStageClass}>
                    <span className="cat-icon">ᓚᘏᗢ</span>
                    <span className="ellipsis">...</span>
                </div>
            )}
            {currentStage === 'yourName' && (
                <div className={yourNameIntroStageClass}>
                    <div className="avatar-container-wow">
                        <img src={YOUR_AVATAR_URL_FOR_INTRO} alt="Your Avatar" className="server-avatar-wow" />
                    </div>
                    <div className="text-container-wow">
                        <h2 className="server-name-wow">{userName}</h2>
                    </div>
                </div>
            )}
        </div>
    );
});
ContentArea.displayName = 'ContentArea';


// --- MAIN APP COMPONENT ---
function App() {
    const [currentAppStage, setCurrentAppStage] = useState<AppStage>('preloadingFish');
    const [isIntroStageFadingOut, setIsIntroStageFadingOut] = useState(false);
    
    const [selectedLanguage, setSelectedLanguage] = useState<'vi' | 'en' | 'ja' | null>(null);
    const [isSpotifyViewActive, setIsSpotifyViewActive] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { progress: videoPreloadProgress, isLoaded: areVideosLoaded } = useVideoPreloader(fishExperienceVideos);

    useEffect(() => {
        if (currentAppStage === 'fishExperience') {
            document.body.classList.remove('no-scroll');
        } else {
            document.body.classList.add('no-scroll');
        }
    }, [currentAppStage]);

    useEffect(() => {
        if (areVideosLoaded && currentAppStage === 'preloadingFish') {
            setTimeout(() => {
                setCurrentAppStage('fishExperience');
            }, 500);
        }
    }, [areVideosLoaded, currentAppStage]);


    useEffect(() => {
        let stageTimer: number | null = null;
        let fadeTimer: number | null = null;
        const fadeDuration = 600;

        if (currentAppStage === 'cardIntroCat') {
            const catDisplayTime = 1800;
            stageTimer = window.setTimeout(() => setIsIntroStageFadingOut(true), catDisplayTime);
            fadeTimer = window.setTimeout(() => {
                setCurrentAppStage('cardIntroWelcome');
                setIsIntroStageFadingOut(false);
            }, catDisplayTime + fadeDuration);
        } else if (currentAppStage === 'cardIntroWelcome') {
            const welcomeDisplayTime = 2000;
            stageTimer = window.setTimeout(() => setIsIntroStageFadingOut(true), welcomeDisplayTime);
            fadeTimer = window.setTimeout(() => {
                setCurrentAppStage('mainCardApp');
                setIsIntroStageFadingOut(false);
            }, welcomeDisplayTime + fadeDuration);
        }

        return () => {
            if (stageTimer) window.clearTimeout(stageTimer);
            if (fadeTimer) window.clearTimeout(fadeTimer);
        };
    }, [currentAppStage]);

    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;
        if (currentAppStage === 'mainCardApp' && !isSpotifyViewActive && selectedLanguage !== null) {
            audioElement.play().catch(error => console.warn("Autoplay was prevented:", error.name, error.message));
        } else {
            if (!audioElement.paused) audioElement.pause();
        }
    }, [currentAppStage, isSpotifyViewActive, selectedLanguage]);

    useEffect(() => {
        const notifyBackendOfVisit = async () => {
            try {
                await fetch(`/api/notify-visit`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            } catch (error) {
                console.error(`[NOTIFY VISIT] Error sending visit notification:`, error);
            }
        };
        if (import.meta.env.PROD) notifyBackendOfVisit();
    }, []);

    const handleFishScrollEnd = () => {
        setCurrentAppStage('cardIntroCat');
    };

    const handleLanguageSelectedInSelector = (language: 'vi' | 'en' | 'ja') => {
        setSelectedLanguage(language);
    };

    const stageVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } },
        exit: { opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }
    };
    
    const fishExperienceVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 2.0, ease: "easeInOut" } },
        exit: { opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }
    };
    
    const VideoPreloadingScreen = () => (
        <motion.div
            key="video-preloading-stage"
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
                width: '100vw', height: '100vh', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', 
                flexDirection: 'column', background: '#0c0e1a', color: '#e6e6e6'
            }}
        >
            <p style={{fontFamily: 'var(--font-family-poetic)', fontSize: '1.2em', marginBottom: '1.5rem', minHeight: '1.4em', textAlign: 'center'}}>
                Loading...
            </p>
            <div style={{width: '60%', maxWidth: '400px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden'}}>
                <motion.div 
                    style={{width: '100%', height: '100%', background: 'var(--highlight-color-poetic)', transformOrigin: 'left'}}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: videoPreloadProgress / 100 }}
                    transition={{ duration: 0.3 }}
                />
            </div>
             <p style={{fontFamily: 'var(--font-family-poetic)', fontSize: '1em', marginTop: '1rem', color: '#a6adc8'}}>
                {Math.round(videoPreloadProgress)}%
            </p>
        </motion.div>
    );

    return (
        <>
            <audio ref={audioRef} src={backgroundMusicMP3} loop />
            
            <AnimatePresence mode="wait">
                {currentAppStage === 'preloadingFish' && <VideoPreloadingScreen />}

                {currentAppStage === 'fishExperience' && (
                    <motion.div
                        key="fish-experience-stage"
                        variants={fishExperienceVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <FishScrollExperience onScrollEnd={handleFishScrollEnd} />
                    </motion.div>
                )}
                
                {(currentAppStage === 'cardIntroCat' || currentAppStage === 'cardIntroWelcome' || currentAppStage === 'mainCardApp') && (
                    <motion.div
                        key="card-experience-stage"
                        variants={stageVariants}
                        initial="initial"
                        animate="animate"
                        className="AppWrapper" 
                    >
                        <PoeticBackground />
                        
                        {currentAppStage === 'cardIntroCat' && (
                            <ContentArea currentStage="cat" isFadingOutProp={isIntroStageFadingOut} userName={YOUR_NAME_FOR_INTRO} />
                        )}
                        
                        {currentAppStage === 'cardIntroWelcome' && (
                            <ContentArea currentStage="yourName" isFadingOutProp={isIntroStageFadingOut} userName={YOUR_NAME_FOR_INTRO} />
                        )}

                        {currentAppStage === 'mainCardApp' && (
                            <LanguageSelector
                                onLanguageSelected={handleLanguageSelectedInSelector}
                                cardAvatarUrl={PERSONAL_CARD_DATA.avatarUrl}
                                githubUsername={PERSONAL_CARD_DATA.githubUsername}
                                initialSelectedLanguage={selectedLanguage}
                                yourNameForIntro={YOUR_NAME_FOR_INTRO}
                                onSpotifyViewChange={setIsSpotifyViewActive}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default App;