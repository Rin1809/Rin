// client/src/components/MainHub.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import './styles/LanguageSelector.css';
import flourishImage from '../assets/flourish.png';

import PersonalCard from './PersonalCard';
import Gallery from './Gallery';
import Guestbook from './Guestbook';
import SpotifyPlaylists from './SpotifyPlaylists';
import Blog from './Blog';
import { LanguageChoiceScreen } from './LanguageChoiceScreen';
import { CardIntro, SelectorView } from './CardIntro';

import { useGuestbookStore } from '../stores/guestbook.store';
import { useSpotifyStore } from '../stores/spotify.store';
import { useBlogStore } from '../stores/blog.store';

import {
  overlayEntryExitVariants,
  cardDisplayInfo,
  galleryViewVariants,
  blogViewContainerVariants,
  guestbookViewContainerVariants,
  spotifyViewContainerVariants,
  cardIntroTranslations,
  aboutNavIconLeft,
  SHARED_FLOURISH_SPRING_TRANSITION,
  flourishVariantsDefinition,
  createFlourishLoopAnimation
} from './languageSelector/languageSelector.constants';
import { logInteraction } from '../utils/logger';

interface MainHubProps {
  onLanguageSelected: (language: 'vi' | 'en' | 'ja') => void;
  cardAvatarUrl: string;
  initialSelectedLanguage: 'vi' | 'en' | 'ja' | null;
  yourNameForIntro: string;
  githubUsername: string;
  onSpotifyViewChange: (isActive: boolean) => void;
}

const getFlourishLayoutPropsForView = (view: SelectorView) => {
    let scale = 1;
    if (['about', 'gallery', 'guestbook', 'spotifyPlaylists', 'blog'].includes(view)) scale = 0.85;
    return { scale };
};

const MainHub: React.FC<MainHubProps> = ({
    onLanguageSelected, cardAvatarUrl, initialSelectedLanguage,
    yourNameForIntro, githubUsername,
    onSpotifyViewChange
}) => {
  const [currentView, setCurrentView] = useState<SelectorView>(initialSelectedLanguage ? 'cardIntro' : 'languageOptions');
  const [currentLanguage, setCurrentLanguage] = useState<'vi' | 'en' | 'ja'>(initialSelectedLanguage || 'vi');
  const [displayTextLanguage, setDisplayTextLanguage] = useState<'vi' | 'en' | 'ja'>(initialSelectedLanguage || 'vi');
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Zustand stores - chi lay ra nhung gi can dung
  const { entries, fetchEntries } = useGuestbookStore();
  const { playlists, fetchPlaylists } = useSpotifyStore();
  const { posts: blogPosts, fetchPosts: fetchBlogPosts } = useBlogStore();
  
  const topFlourishVisualControls = useAnimation();
  const bottomFlourishVisualControls = useAnimation();
  const topFlourishVariants = useMemo(() => flourishVariantsDefinition(0), []);
  const bottomFlourishVariants = useMemo(() => flourishVariantsDefinition(180), []);
  const isMountedRef = useRef(true);
  const prevViewRef = useRef<SelectorView>(currentView);
  
  useEffect(() => {
    if (currentView !== prevViewRef.current) {
      logInteraction('view_changed', {
        previousView: prevViewRef.current,
        currentView: currentView,
        language: currentLanguage
      });
      prevViewRef.current = currentView;
    }
  }, [currentView, currentLanguage]);

  useEffect(() => { isMountedRef.current = true; return () => { isMountedRef.current = false; }; }, []);
  
  const flourishLoopAnimTop = useMemo(() => createFlourishLoopAnimation(0), []);
  const flourishLoopAnimBottom = useMemo(() => createFlourishLoopAnimation(180), []);

  // Effect cho flourish animation
  useEffect(() => {
    if (!isMountedRef.current) return;
    const { scale: targetScale } = getFlourishLayoutPropsForView(currentView);
    const entryDelay = isInitialMount ? 0.1 : 0;
    const createTargetState = (baseSet: any, scaleVal: number) => ({
        ...(baseSet.visibleBase as object), scale: scaleVal,
        transition: {
            opacity: { duration: isInitialMount ? 2.0 : 1.5, ease: [0.23,1,0.32,1], delay: entryDelay },
            filter: { type: "tween", duration: isInitialMount ? 1.2 : 0.9, ease: "easeOut", delay: entryDelay },
            y: { ...SHARED_FLOURISH_SPRING_TRANSITION, delay: entryDelay },
            rotate: { ...SHARED_FLOURISH_SPRING_TRANSITION, delay: entryDelay + (isInitialMount ? 0.1 : 0.05) },
            scale: { ...SHARED_FLOURISH_SPRING_TRANSITION, delay: entryDelay }
        }
    });
    const targetTop = createTargetState(topFlourishVariants, targetScale);
    const targetBottom = createTargetState(bottomFlourishVariants, targetScale);
    const animLoop = async (ctrls: any, target: any, loopDef: any) => {
        await ctrls.start(target);
        if (isMountedRef.current) ctrls.start(loopDef);
    };
    animLoop(topFlourishVisualControls, targetTop, flourishLoopAnimTop);
    animLoop(bottomFlourishVisualControls, targetBottom, flourishLoopAnimBottom);
    if (isInitialMount && isMountedRef.current) requestAnimationFrame(() => { if (isMountedRef.current) setIsInitialMount(false); });
  }, [currentView, isInitialMount, topFlourishVisualControls, bottomFlourishVisualControls, topFlourishVariants, bottomFlourishVariants, flourishLoopAnimTop, flourishLoopAnimBottom]);

  const handleFlourishHoverStart = useCallback((ctrls: any, vars: any) => {
    const baseScale = getFlourishLayoutPropsForView(currentView).scale;
    ctrls.start((vars.hover as (custom: {baseScale:number})=>any)({baseScale}));
  }, [currentView]);

  const handleFlourishHoverEnd = useCallback(async (ctrls: any, vars: any, loopDef: any) => {
    const baseScale = getFlourishLayoutPropsForView(currentView).scale;
    await ctrls.start({ ...(vars.visibleBase as object), scale: baseScale, transition: { type: "spring", stiffness: 280, damping: 35, mass: 1 } });
    if (isMountedRef.current) ctrls.start(loopDef);
  }, [currentView]);

  useEffect(() => { onSpotifyViewChange(currentView === 'spotifyPlaylists'); }, [currentView, onSpotifyViewChange]);

  const handleLanguageSelect = (lang: 'vi'|'en'|'ja') => {
    logInteraction('language_selected', { language: lang });
    onLanguageSelected(lang);
    setCurrentLanguage(lang);
    setDisplayTextLanguage(lang);
    setCurrentView('cardIntro');
  };

  const navigateTo = (view: SelectorView) => {
    setCurrentView(view);
    // trigger fetch data
    if (view === 'guestbook' && !entries.length) fetchEntries();
    if (view === 'spotifyPlaylists' && !playlists.length) fetchPlaylists();
    if (view === 'blog' && !blogPosts.length) fetchBlogPosts();
  };

  const getFlourishWrapperStyle = (view: SelectorView, isTop: boolean) => {
    let mV = "1rem";
    if (['about', 'gallery', 'guestbook', 'spotifyPlaylists', 'blog'].includes(view)) mV = "0.5rem";
    return isTop ? { marginBottom: mV } : { marginTop: mV };
  };

  const footerText = `ᓚᘏᗢ ${yourNameForIntro} | ${new Date().getFullYear()}`;
  const showFooter = !['languageOptions'].includes(currentView);

  return (
    <motion.div className="language-selector-poetic-overlay" variants={overlayEntryExitVariants} initial="hidden" animate="visible" exit="exit">
      <motion.div layout style={getFlourishWrapperStyle(currentView, true)} transition={SHARED_FLOURISH_SPRING_TRANSITION} className="flourish-wrapper">
        <motion.img src={flourishImage} alt="" className="flourish-image flourish-image-top" aria-hidden="true" variants={topFlourishVariants} initial="hidden" animate={topFlourishVisualControls} onHoverStart={()=>handleFlourishHoverStart(topFlourishVisualControls, topFlourishVariants)} onHoverEnd={()=>handleFlourishHoverEnd(topFlourishVisualControls, topFlourishVariants, flourishLoopAnimTop)} />
      </motion.div>
      <div className="language-selector-content-wrapper">
        <AnimatePresence mode="wait">
          {currentView === 'languageOptions' && (
            <LanguageChoiceScreen
              key="view-lang-choice"
              onLanguageSelect={handleLanguageSelect}
              onHoverLanguage={setDisplayTextLanguage}
              onLeaveHoverLanguage={() => {}}
              displayTextLanguage={displayTextLanguage}
              isInitialMount={isInitialMount}
            />
          )}

          {currentView === 'cardIntro' && (
            <CardIntro
              key="view-card-intro"
              onNavigate={navigateTo}
              language={currentLanguage}
              cardAvatarUrl={cardAvatarUrl}
            />
          )}

          {currentView === 'about' && (
            <motion.div key={`about-view-${currentLanguage}`} className="content-section card-content-display" variants={galleryViewVariants(0.05)} initial="hidden" animate="visible" exit="exit">
              <PersonalCard personalCardKey={`pc-about-${currentLanguage}`} name={cardDisplayInfo.name[currentLanguage]} section="about" githubUsername={githubUsername} language={currentLanguage} />
              <motion.button className="card-view-back-button" onClick={()=>setCurrentView('cardIntro')} initial={{opacity:0,y:20}} animate={{opacity:1, y:0, transition:{delay:0.2}}} whileHover={{scale: 1.05}} whileTap={{scale:0.95}}>
                 <span className="button-icon-svg" dangerouslySetInnerHTML={{__html:aboutNavIconLeft}} />
                 <span className="button-text">{cardIntroTranslations.backButton[currentLanguage]}</span>
              </motion.button>
            </motion.div>
          )}

          {currentView === 'gallery' && (
            <motion.div key="gallery-content" className="content-section card-content-display gallery-view-wrapper" variants={galleryViewVariants(0.05)} initial="hidden" animate="visible" exit="exit">
              <Gallery onBack={()=>setCurrentView('cardIntro')} language={currentLanguage} />
            </motion.div>
          )}

          {currentView === 'blog' && (
            <motion.div key="blog-view-content" className="content-section card-content-display" variants={blogViewContainerVariants(0.05)} initial="hidden" animate="visible" exit="exit">
              <Blog language={currentLanguage} onBack={()=>setCurrentView('cardIntro')} />
            </motion.div>
          )}
          
          {currentView === 'guestbook' && (
            <motion.div key="guestbook-content" className="content-section card-content-display guestbook-view-wrapper" variants={guestbookViewContainerVariants(0.05)} initial="hidden" animate="visible" exit="exit">
               <Guestbook language={currentLanguage} onBack={()=>setCurrentView('cardIntro')} />
            </motion.div>
          )}

          {currentView === 'spotifyPlaylists' && (
            <motion.div key="spotify-content" className="content-section card-content-display spotify-playlists-view-wrapper" variants={spotifyViewContainerVariants(0.05)} initial="hidden" animate="visible" exit="exit">
                <SpotifyPlaylists language={currentLanguage} onBack={() => setCurrentView('cardIntro')} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      <motion.div layout style={getFlourishWrapperStyle(currentView, false)} transition={SHARED_FLOURISH_SPRING_TRANSITION} className="flourish-wrapper">
        <motion.img src={flourishImage} alt="" className="flourish-image flourish-image-bottom" aria-hidden="true" variants={bottomFlourishVariants} initial="hidden" animate={bottomFlourishVisualControls} onHoverStart={()=>handleFlourishHoverStart(bottomFlourishVisualControls, bottomFlourishVariants)} onHoverEnd={()=>handleFlourishHoverEnd(bottomFlourishVisualControls, bottomFlourishVariants, flourishLoopAnimBottom)} />
      </motion.div>

      {showFooter && (
        <motion.footer className="language-selector-footer" initial={{opacity:0}} animate={{opacity:1,transition:{delay:0.5,duration:0.5}}} exit={{opacity:0,transition:{duration:0.2}}}>
            {footerText}
        </motion.footer>
      )}
    </motion.div>
  );
};
export default React.memo(MainHub);