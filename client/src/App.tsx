import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion và AnimatePresence
import LanguageSelector from './components/LanguageSelector';
import { PoeticBackground } from './components/PoeticBackground';
import FishScrollExperience from './components/FishScrollExperience';
import backgroundMusicMP3 from './assets/audio/background_music.mp3';
import './components/styles/App.css';

// --- CONSTANTS ---
const YOUR_AVATAR_URL_FOR_INTRO = "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=128";
const YOUR_NAME_FOR_INTRO = "よこそう！！";

const PERSONAL_CARD_DATA = {
    avatarUrl: "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=128",
    githubUsername: "Rin1809"
};

// --- STAGE DEFINITIONS ---
type AppStage = 'fishExperience' | 'cardIntroCat' | 'cardIntroWelcome' | 'mainCardApp';
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
    const [currentAppStage, setCurrentAppStage] = useState<AppStage>('fishExperience');
    const [isIntroStageFadingOut, setIsIntroStageFadingOut] = useState(false);
    
    const [selectedLanguage, setSelectedLanguage] = useState<'vi' | 'en' | 'ja' | null>(null);
    const [isSpotifyViewActive, setIsSpotifyViewActive] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Quản lý việc cuộn trang
    useEffect(() => {
        if (currentAppStage === 'fishExperience') {
            document.body.classList.remove('no-scroll');
        } else {
            document.body.classList.add('no-scroll');
        }
    }, [currentAppStage]);

    // Xử lý chuyển tiếp giữa các bước intro của card
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

    // Quản lý nhạc nền
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

    return (
        <>
            <audio ref={audioRef} src={backgroundMusicMP3} loop />
            
            <AnimatePresence mode="wait">
                {currentAppStage === 'fishExperience' ? (
                    <motion.div
                        key="fish-experience-stage"

                    >
                        <FishScrollExperience onScrollEnd={handleFishScrollEnd} />
                    </motion.div>
                ) : (
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