import { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './components/styles/App.css';
import { useVideoPreloader } from './utils/videoPreloader'; 
import { isMobileOrTablet } from './utils/deviceCheck';

const FishScrollExperience = lazy(() => import('./components/FishScrollExperience'));
const MainCardExperience = lazy(() => import('./components/MainCardExperience'));

// ds video can tai truoc
const fishExperienceVideos = [
    "/videos/cosmos_intro.mp4",
    "/videos/stars_forming.mp4",
    "/videos/milkyway.mp4",
    "/videos/solar_system.mp4",
    "/videos/earth.mp4",
    "/videos/humans.mp4",
    "/videos/arrival.mp4",
    "/videos/10.mp4"
];

const transitionVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } },
    exit: { opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }
};

const PreloadingScreen = ({ progress }: { progress: number }) => (
    <motion.div
        key="preloading-screen"
        variants={transitionVariants}
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
            Weaving the cosmos...
        </p>
        <div style={{width: '60%', maxWidth: '400px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden'}}>
            <motion.div 
                style={{width: '100%', height: '100%', background: 'var(--highlight-color-poetic)', transformOrigin: 'left'}}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.3 }}
            />
        </div>
        <p style={{fontFamily: 'var(--font-family-poetic)', fontSize: '1em', marginTop: '1rem', color: '#a6adc8'}}>
            {Math.round(progress)}%
        </p>
    </motion.div>
);

function App() {
    type AppPhase = 'preloading' | 'fishExperience' | 'cardExperience';
    const [appPhase, setAppPhase] = useState<AppPhase>('preloading');
    
    // ktr thiet bi
    const isTrueMobileDevice = isMobileOrTablet();
    
    const { progress: videoPreloadProgress, isLoaded: areVideosLoaded } = useVideoPreloader(
        isTrueMobileDevice ? [] : fishExperienceVideos
    );

    useEffect(() => {
        if (areVideosLoaded && appPhase === 'preloading') {
            setTimeout(() => {
                setAppPhase('fishExperience');
            }, 500); 
        }
    }, [areVideosLoaded, appPhase]);
    
    useEffect(() => {
        // gui tbao truy cap
        const notifyBackendOfVisit = async () => {
            try {
                await fetch(`/api/notify-visit`, { method: 'POST' });
            } catch (error) {
                // bo qua loi
            }
        };
        if (import.meta.env.PROD) {
            notifyBackendOfVisit();
        }
    }, []);

    // xu ly chuyen man hinh chinh
    const handleFishScrollEnd = () => {
        setAppPhase('cardExperience');
    };

    return (
        <AnimatePresence mode="wait">
            {appPhase === 'preloading' && (
                <PreloadingScreen progress={videoPreloadProgress} />
            )}
            
            {appPhase === 'fishExperience' && (
                <motion.div key="fish-experience" variants={transitionVariants} initial="initial" animate="animate" exit="exit">
                    <Suspense fallback={<PreloadingScreen progress={100} />}>
                        <FishScrollExperience onScrollEnd={handleFishScrollEnd} />
                    </Suspense>
                </motion.div>
            )}

            {appPhase === 'cardExperience' && (
                <motion.div key="card-experience" variants={transitionVariants} initial="initial" animate="animate" exit="exit">
                     <Suspense fallback={<div className='AppWrapper' style={{background:'#0c0e1a'}} />}>
                        <MainCardExperience />
                    </Suspense>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default App;