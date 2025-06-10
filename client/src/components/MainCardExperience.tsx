import { useState, useEffect, useRef, memo, FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import { PoeticBackground } from './PoeticBackground';
import backgroundMusicMP3 from '../assets/audio/background_music.mp3';
import './styles/App.css'; 

const YOUR_AVATAR_URL_FOR_INTRO = "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=128";
const YOUR_NAME_FOR_INTRO = "よこそう！！";
const PERSONAL_CARD_DATA = {
    avatarUrl: "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=128",
    githubUsername: "Rin1809"
};

type IntroStage = 'none' | 'cat' | 'welcome' | 'main';

interface IntroContentProps {
    currentStage: IntroStage;
    isFadingOut: boolean;
    userName: string;
}

const IntroContent: FC<IntroContentProps> = memo(({ currentStage, isFadingOut, userName }) => {
    const welcomeStageClass = `intro-stage server-stage-wow ${isFadingOut && currentStage === 'welcome' ? 'hiding' : currentStage === 'welcome' ? 'visible' : ''}`;
    const catStageClass = `intro-stage cat-stage ${isFadingOut && currentStage === 'cat' ? 'hiding' : currentStage === 'cat' ? 'visible' : ''}`;
    const appContainerClass = "AppContainer intro-active";

    return (
        <div className={`App ${appContainerClass}`}>
            {currentStage === 'cat' && (
                <div className={catStageClass}>
                    <span className="cat-icon">ᓚᘏᗢ</span>
                    <span className="ellipsis">...</span>
                </div>
            )}
            {currentStage === 'welcome' && (
                <div className={welcomeStageClass}>
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
IntroContent.displayName = 'IntroContent';

const MainCardExperience: FC = () => {
    const [stage, setStage] = useState<IntroStage>('cat');
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<'vi' | 'en' | 'ja' | null>(null);
    const [isSpotifyViewActive, setIsSpotifyViewActive] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        let stageTimer: ReturnType<typeof setTimeout> | null = null;
        let fadeTimer: ReturnType<typeof setTimeout> | null = null;
        const fadeDuration = 600;

        if (stage === 'cat') {
            const catDisplayTime = 1800;
            stageTimer = setTimeout(() => setIsFadingOut(true), catDisplayTime);
            fadeTimer = setTimeout(() => {
                setStage('welcome');
                setIsFadingOut(false);
            }, catDisplayTime + fadeDuration);
        } else if (stage === 'welcome') {
            const welcomeDisplayTime = 2000;
            stageTimer = setTimeout(() => setIsFadingOut(true), welcomeDisplayTime);
            fadeTimer = setTimeout(() => {
                setStage('main');
                setIsFadingOut(false);
            }, welcomeDisplayTime + fadeDuration);
        }

        return () => {
            if (stageTimer) clearTimeout(stageTimer);
            if (fadeTimer) clearTimeout(fadeTimer);
        };
    }, [stage]);
    
    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;
        
        if (stage === 'main' && !isSpotifyViewActive && selectedLanguage !== null) {
            audioElement.play().catch(_ => { /* autoplay was prevented */ });
        } else {
            if (!audioElement.paused) {
                audioElement.pause();
            }
        }
    }, [stage, isSpotifyViewActive, selectedLanguage]);


    return (
         <div className="AppWrapper">
            <audio ref={audioRef} src={backgroundMusicMP3} loop />
            <PoeticBackground />
            <AnimatePresence mode="wait">
                {stage !== 'main' && (
                    <motion.div
                        key="intro-stages"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.5 } }}
                    >
                       <IntroContent currentStage={stage} isFadingOut={isFadingOut} userName={YOUR_NAME_FOR_INTRO} />
                    </motion.div>
                )}

                {stage === 'main' && (
                     <motion.div
                        key="main-card-app"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.8, delay: 0.2 } }}
                    >
                        <LanguageSelector
                            onLanguageSelected={setSelectedLanguage}
                            cardAvatarUrl={PERSONAL_CARD_DATA.avatarUrl}
                            githubUsername={PERSONAL_CARD_DATA.githubUsername}
                            initialSelectedLanguage={selectedLanguage}
                            yourNameForIntro={YOUR_NAME_FOR_INTRO}
                            onSpotifyViewChange={setIsSpotifyViewActive}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MainCardExperience;