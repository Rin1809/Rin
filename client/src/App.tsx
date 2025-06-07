import React, { useState, useEffect, useMemo, useRef } from 'react';
import LanguageSelector from './components/LanguageSelector';
import './components/styles/App.css';
import { PoeticBackground } from './components/PoeticBackground';
import backgroundMusicMP3 from './assets/audio/background_music.mp3';

const YOUR_AVATAR_URL_FOR_INTRO = "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=128";
const YOUR_NAME_FOR_INTRO = "よこそう！！";

const PERSONAL_CARD_DATA = {
    avatarUrl: "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=128",
    githubUsername: "Rin1809"
};

type IntroStage = 'cat' | 'yourName' | 'languageSelection';

interface ContentAreaProps {
    currentStage: IntroStage;
    isFadingOutProp: boolean;
    userName: string | null;
    selectedLanguage: 'vi' | 'en' | 'ja';
}

const ContentArea: React.FC<ContentAreaProps> = React.memo(({ currentStage, isFadingOutProp, userName }) => {
    const yourNameIntroStageClass = `intro-stage server-stage-wow ${isFadingOutProp && currentStage === 'yourName' ? 'hiding' : currentStage === 'yourName' ? 'visible' : ''}`;
    const catStageClass = `intro-stage cat-stage ${isFadingOutProp && currentStage === 'cat' ? 'hiding' : currentStage === 'cat' ? 'visible' : ''}`;

    const appContainerClass = useMemo(() => {
        if (currentStage === 'cat' || currentStage === 'yourName') return "AppContainer intro-active";
        return "AppContainer";
    }, [currentStage]);


    if (currentStage !== 'cat' && currentStage !== 'yourName') return null;

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
                        <img
                            src={YOUR_AVATAR_URL_FOR_INTRO}
                            alt="Your Avatar"
                            className="server-avatar-wow"
                        />
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

function App() {
    const [currentIntroStage, setCurrentIntroStage] = useState<IntroStage>('cat');
    const [isStageFadingOut, setIsStageFadingOut] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<'vi' | 'en' | 'ja' | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isSpotifyViewActive, setIsSpotifyViewActive] = useState(false);
    const [hasIntroFinishedForMusic, setHasIntroFinishedForMusic] = useState(false);

    useEffect(() => {
        if (currentIntroStage === 'languageSelection' && !hasIntroFinishedForMusic) {
            setHasIntroFinishedForMusic(true);
        }

        if (currentIntroStage !== 'cat' && currentIntroStage !== 'yourName') {
            return;
        }

        let stage1TimerId: number | null = null;
        let fade1TimerId: number | null = null;
        let stage2TimerId: number | null = null;
        let fade2TimerId: number | null = null;

        const catDisplayTime = 1800;
        const yourNameDisplayTime = 2000;
        const fadeDuration = 600;

        if (currentIntroStage === 'cat') {
            stage1TimerId = window.setTimeout(() => {
                setIsStageFadingOut(true);
            }, catDisplayTime);

            fade1TimerId = window.setTimeout(() => {
                setCurrentIntroStage('yourName');
                setIsStageFadingOut(false);
            }, catDisplayTime + fadeDuration);
        } else if (currentIntroStage === 'yourName') {
            stage2TimerId = window.setTimeout(() => {
                setIsStageFadingOut(true);
            }, yourNameDisplayTime);

            fade2TimerId = window.setTimeout(() => {
                setCurrentIntroStage('languageSelection');
                setIsStageFadingOut(false);
            }, yourNameDisplayTime + fadeDuration);
        }

        return () => {
            if (stage1TimerId) window.clearTimeout(stage1TimerId);
            if (fade1TimerId) window.clearTimeout(fade1TimerId);
            if (stage2TimerId) window.clearTimeout(stage2TimerId);
            if (fade2TimerId) window.clearTimeout(fade2TimerId);
        };
    }, [currentIntroStage, hasIntroFinishedForMusic]);

    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        const shouldPlayMusic = hasIntroFinishedForMusic &&
                                !isSpotifyViewActive &&
                                audioElement.paused &&
                                selectedLanguage !== null;

        if (isSpotifyViewActive) {
            if (!audioElement.paused) {
                audioElement.pause();
            }
        } else if (shouldPlayMusic) {
            audioElement.play().catch(error => {
                console.warn("Autoplay bi chan hoac loi khi phat nhac:", error.name, error.message);
            });
        }
    }, [isSpotifyViewActive, hasIntroFinishedForMusic, selectedLanguage]);

    const handleLanguageSelectedInSelector = (language: 'vi' | 'en' | 'ja') => {
        setSelectedLanguage(language);
    };

    useEffect(() => {
        const notifyBackendOfVisit = async () => {
            const apiUrl = `/api/notify-visit`;
            try {
                await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (error) {
                console.error(`[NOTIFY VISIT] Loi gui tbáo visit tới ${apiUrl}:`, error);
            }
        };

        if (import.meta.env.PROD) {
            notifyBackendOfVisit();
        }
    }, []);

    return (
        <div className="AppWrapper">
            <audio ref={audioRef} src={backgroundMusicMP3} loop />

            <PoeticBackground />

            {currentIntroStage === 'languageSelection' ? (
                <LanguageSelector
                    onLanguageSelected={handleLanguageSelectedInSelector}
                    cardAvatarUrl={PERSONAL_CARD_DATA.avatarUrl}
                    githubUsername={PERSONAL_CARD_DATA.githubUsername}
                    initialSelectedLanguage={selectedLanguage}
                    yourNameForIntro={YOUR_NAME_FOR_INTRO}
                    onSpotifyViewChange={setIsSpotifyViewActive}
                />
            ) : (
                <ContentArea
                    currentStage={currentIntroStage}
                    isFadingOutProp={isStageFadingOut}
                    userName={YOUR_NAME_FOR_INTRO}
                    selectedLanguage={selectedLanguage || 'vi'}
                />
            )}
        </div>
    );
}

export default App;