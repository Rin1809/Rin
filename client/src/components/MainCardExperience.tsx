// client/src/components/MainCardExperience.tsx
import { useState, useEffect, useRef, memo, FC, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainHub from './MainHub'; 
import { PoeticBackground } from './PoeticBackground';
import backgroundMusicMP3 from '../assets/audio/background_music.mp3';
import './styles/App.css'; 
import Ribbons from './Ribbons/Ribbons'; 
import { isMobileOrTablet } from '../utils/deviceCheck';

const YOUR_AVATAR_URL_FOR_INTRO = "https://pbs.twimg.com/media/FOcT7MiVQAgYZjn?format=jpg&name=large";
const YOUR_NAME_FOR_INTRO = "よこそう！！";
const PERSONAL_CARD_DATA = {
    avatarUrl: "https://i.ibb.co/xSMDyyWW/z6832766349124-12e8f1247de5e10b2e9a86db5a402218.jpg",
    githubUsername: "Rin1809"
};
const POETIC_COLOR_PALETTE=['#D8BFD8','#ffaaaa','#f5c2e7','#89b4fa','#e6e6e6','#a6e3a1'];
const generateColors=(count:number)=>{const c=[];for(let i=0;i<count;i++){c.push(POETIC_COLOR_PALETTE[i%POETIC_COLOR_PALETTE.length]);}return c;};

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
                    <div className="avatar-container-wow"><img src={YOUR_AVATAR_URL_FOR_INTRO} alt="Your Avatar" className="server-avatar-wow" /></div>
                    <div className="text-container-wow"><h2 className="server-name-wow">{userName}</h2></div>
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

    const isDesktop = useMemo(() => !isMobileOrTablet(), []);
    const ribbonColors = useMemo(() => generateColors(5), []);

    useEffect(() => {
        let stageTimer: ReturnType<typeof setTimeout> | null = null;
        let fadeTimer: ReturnType<typeof setTimeout> | null = null;
        const fadeDuration = 600;

        if (stage === 'cat') {
            stageTimer = setTimeout(() => setIsFadingOut(true), 1800);
            fadeTimer = setTimeout(() => { setStage('welcome'); setIsFadingOut(false); }, 1800 + fadeDuration);
        } else if (stage === 'welcome') {
            stageTimer = setTimeout(() => setIsFadingOut(true), 2000);
            fadeTimer = setTimeout(() => { setStage('main'); setIsFadingOut(false); }, 2000 + fadeDuration);
        }
        return () => { if (stageTimer) clearTimeout(stageTimer); if (fadeTimer) clearTimeout(fadeTimer); };
    }, [stage]);
    
    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;
        
        if (stage === 'main' && !isSpotifyViewActive && selectedLanguage !== null) {
            audioElement.play().catch(()=>{});
        } else {
            if (!audioElement.paused) audioElement.pause();
        }
    }, [stage, isSpotifyViewActive, selectedLanguage]);


    return (
         <div className="AppWrapper">
            <audio ref={audioRef} src={backgroundMusicMP3} loop />
            <PoeticBackground />

            {isDesktop && <Ribbons colors={ribbonColors} baseThickness={3} speedMultiplier={0.3} maxAge={550} enableShaderEffect={false}/>}

            <AnimatePresence mode="wait">
                {stage !== 'main' ? (
                    <motion.div key="intro" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
                       <IntroContent currentStage={stage} isFadingOut={isFadingOut} userName={YOUR_NAME_FOR_INTRO} />
                    </motion.div>
                ) : (
                     <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.8, delay: 0.2 } }}>
                        <MainHub
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