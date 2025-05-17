// rin-personal-card/client/src/App.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import LanguageSelector from './components/LanguageSelector';
import './components/styles/App.css';

import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { ISourceOptions, Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

// Nhạc nền
import backgroundMusicMP3 from './assets/audio/background_music.mp3';

// --  PARTICLESC_CONFIG --
const particlesOptions: ISourceOptions = {
    fpsLimit: 60,
    interactivity: { events: { onClick: { enable: false }, onHover: { enable: false }, resize: { enable: true } }, modes: {} },
    particles: {
        color: { value: ["#ffffff", "#b4befe", "#a6adc8"] },
        links: { enable: false },
        move: { enable: true, speed: { min: 0.1, max: 0.5 }, direction: "none", random: true, straight: false, outModes: { default: "out" } },
        number: {
            density: { enable: true,},
            value: 60,
        },
        opacity: {
            value: { min: 0.1, max: 0.5 },
            animation: {
                enable: true,
                speed: 1,
                sync: false,
            }
        },
        shape: { type: "circle" },
        size: {
            value: { min: 0.4, max: 2 },
            animation: {
                enable: true,
                speed: 8,
                sync: false,
            }
        },
    },
    detectRetina: true,
};

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
    const [particlesInitialized, setParticlesInitialized] = useState(false);
    const [currentIntroStage, setCurrentIntroStage] = useState<IntroStage>('cat');
    const [isStageFadingOut, setIsStageFadingOut] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<'vi' | 'en' | 'ja' | null>(null);

    // State nhạc
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isSpotifyViewActive, setIsSpotifyViewActive] = useState(false);
    const [hasIntroFinishedForMusic, setHasIntroFinishedForMusic] = useState(false);
    const [canTryPlayMusic, setCanTryPlayMusic] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine: Engine) => {
            await loadSlim(engine);
        }).then(() => {
            setParticlesInitialized(true);
        }).catch(error => {
            console.error("Lỗi init particles:", error);
        });
    }, []);

    // QL intro stages & đánh dấu khi intro xong cho nhạc
    useEffect(() => {
        if (currentIntroStage === 'languageSelection' && !hasIntroFinishedForMusic) {
            setHasIntroFinishedForMusic(true);
            setCanTryPlayMusic(true);
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
        } else if (currentIntroStage === 'yourName' && !isStageFadingOut) {
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


    // QL nhạc nền
    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        if (isSpotifyViewActive) {
            if (!audioElement.paused) {
                audioElement.pause();
            }
        } else if (hasIntroFinishedForMusic && canTryPlayMusic) {
            if (audioElement.paused) {
                audioElement.play().then(() => {
                    setCanTryPlayMusic(false);
                }).catch(_error => {
                    // Lỗi autoplay
                });
            } else {
                 setCanTryPlayMusic(false);
            }
        }
    }, [isSpotifyViewActive, hasIntroFinishedForMusic, canTryPlayMusic]);


    const handleLanguageSelectedInSelector = (language: 'vi' | 'en' | 'ja') => {
        setSelectedLanguage(language);
        if (audioRef.current && audioRef.current.paused && hasIntroFinishedForMusic && !isSpotifyViewActive) {
            setCanTryPlayMusic(true);
        }
    };

    // Thông báo truy cập web
    useEffect(() => {
        const notifyBackendOfVisit = async () => {
            try {
                // Dùng đường dẫn tương đối, Vite proxy sẽ xử lý
                await fetch('/api/notify-visit', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Ko cần body, backend tự lấy IP
                });
                console.log("TBáo visit đã gửi tới backend.");
            } catch (error) {
                console.error("Lỗi gửi tbáo visit:", error);
            }
        };

        // Chỉ chạy ở production env
        if (import.meta.env.PROD) {
            notifyBackendOfVisit();
        } else {
            console.log("Bỏ qua tbáo visit ở dev env.");
        }
    }, []); // Chạy 1 lần khi app mount

    const memoizedParticles = useMemo(() => {
        if (!particlesInitialized) {
            return null;
        }
        return (
            <Particles
                key="tsparticles-background-stable"
                id="tsparticles-background-stable"
                options={particlesOptions}
            />
        );
    }, [particlesInitialized]);

    return (
        <div className="AppWrapper">
            <audio ref={audioRef} src={backgroundMusicMP3} loop />
            
            {memoizedParticles} 
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