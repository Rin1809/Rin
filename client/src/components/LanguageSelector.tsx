// client/src/components/LanguageSelector.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import './styles/LanguageSelector.css';
import flourishImage from '../assets/flourish.png';

import PersonalCard from './PersonalCard';
import Gallery from './Gallery';
import Guestbook from './Guestbook';
import SpotifyPlaylists from './SpotifyPlaylists';
import type { GuestbookEntry } from '../data/guestbook.data';

import { initParticlesEngine } from "@tsparticles/react";
import type { Engine, Container } from "@tsparticles/engine";
import { loadEmittersPlugin } from "@tsparticles/plugin-emitters";
import { loadExternalTrailInteraction } from "@tsparticles/interaction-external-trail";
import { loadCircleShape } from "@tsparticles/shape-circle";
import { loadStarShape } from "@tsparticles/shape-star";

import MemoizedParticlesComponent from './common/MemoizedParticlesComponent';
import LangButton from './languageSelector/LangButton';
import {
    poeticStarsOptionsDefinition,
    translations,
    cardIntroTranslations,
    contentItemVariants,
    titleVariants,
    flourishVariantsDefinition,
    createFlourishLoopAnimation,
    dividerVerticalVariants,
    dividerHorizontalVariants,
    cardIntroButtonIconVariants,
    cardIntroButtonVariants,
    cardNameTextVariants,
    sparkleVariants,
    numSparkles,
    overlayEntryExitVariants,
    cardIntroHeaderVariants,
    layoutTransition,
    previewContainerVariants,
    previewIcons,
    languageSelectorPreviewTranslations,
    cardDisplayInfo,
    galleryViewVariants,
    guestbookViewContainerVariants,
    spotifyViewContainerVariants,
    SHARED_FLOURISH_SPRING_TRANSITION,
    aboutNavIconLeft,
} from './languageSelector/languageSelector.constants';
import { logInteraction } from '../utils/logger'; // IMPORT LOG UTIL

interface LanguageSelectorProps {
  onLanguageSelected: (language: 'vi' | 'en' | 'ja') => void;
  cardAvatarUrl: string;
  initialSelectedLanguage: 'vi' | 'en' | 'ja' | null;
  yourNameForIntro: string;
  githubUsername: string;
  onSpotifyViewChange: (isActive: boolean) => void; 
}

type SelectorView = 'languageOptions' | 'cardIntro' | 'about' | 'gallery' | 'guestbook' | 'spotifyPlaylists';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const getFlourishLayoutPropsForView = (view: SelectorView) => {
    let scale = 1;
    if (['about', 'gallery', 'guestbook', 'spotifyPlaylists'].includes(view)) scale = 0.85;
    return { scale };
};

const initialMountTitleDelay = 0.5;
const initialMountSubtitleDelay = initialMountTitleDelay + 0.3;
const initialMountButton1Delay = initialMountSubtitleDelay + 0.4;
const initialMountDivider1Delay = initialMountButton1Delay + 0.1;
const initialMountButton2Delay = initialMountDivider1Delay + 0.2;
const initialMountDivider2Delay = initialMountButton2Delay + 0.1;
const initialMountButton3Delay = initialMountDivider2Delay + 0.2;
const initialMountFooterNoteDelay = initialMountButton3Delay + 0.4;

type MainCardIntroButtonTextKey = 'aboutButton' | 'galleryButton' | 'guestbookButton' | 'spotifyButton';
type CardIntroIconKey = 'aboutIconSvg' | 'galleryIconSvg' | 'guestbookIconSvg' | 'spotifyIconSvg';
type HeaderPreviewType = 'about' | 'gallery' | 'guestbook' | 'spotifyPlaylists';


const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    onLanguageSelected, cardAvatarUrl, initialSelectedLanguage,
    yourNameForIntro, githubUsername,
    onSpotifyViewChange 
}) => {
  const [engineInitialized, setEngineInitialized] = useState(false);
  const [currentView, setCurrentView] = useState<SelectorView>('languageOptions');
  const [currentLanguage, setCurrentLanguage] = useState<'vi' | 'en' | 'ja'>(initialSelectedLanguage || 'vi');
  const [displayTextLanguage, setDisplayTextLanguage] = useState<'vi' | 'en' | 'ja'>(initialSelectedLanguage || 'vi');
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isButtonHovered, setIsButtonHovered] = useState<string | null>(null);
  const [headerPreviewType, setHeaderPreviewType] = useState<HeaderPreviewType | null>(null);

  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [guestbookLoading, setGuestbookLoading] = useState<boolean>(true);
  const [_guestbookError, setGuestbookError] = useState<string | null>(null);

  const [spotifyPlaylists, setSpotifyPlaylists] = useState<any[]>([]);
  const [spotifyLoading, setSpotifyLoading] = useState<boolean>(false);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);

  const topFlourishVisualControls = useAnimation();
  const bottomFlourishVisualControls = useAnimation();
  const topFlourishVariants = useMemo(() => flourishVariantsDefinition(0), []);
  const bottomFlourishVariants = useMemo(() => flourishVariantsDefinition(180), []);
  const particleOptions = useMemo(() => engineInitialized ? poeticStarsOptionsDefinition : undefined, [engineInitialized]);
  const isMountedRef = useRef(true);
  const initInProgressRef = useRef(false);

  const prevViewRef = useRef<SelectorView>(currentView); // Track previous view

  useEffect(() => {
    if (currentView !== prevViewRef.current) {
      logInteraction('view_changed', { 
        previousView: prevViewRef.current,
        currentView: currentView, 
        language: currentLanguage 
      });
      prevViewRef.current = currentView; // Update sau khi log
    }
  }, [currentView, currentLanguage]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!engineInitialized && !initInProgressRef.current) {
      initInProgressRef.current = true;
      initParticlesEngine(async (engine: Engine) => {
        await loadEmittersPlugin(engine); await loadExternalTrailInteraction(engine);
        await loadCircleShape(engine); await loadStarShape(engine);
        if (isMountedRef.current) setEngineInitialized(true);
      }).catch(e => isMountedRef.current && console.error("LangSel: Lỗi init particles:", e))
        .finally(() => { if (isMountedRef.current) initInProgressRef.current = false; });
    }
    return () => { isMountedRef.current = false; };
  }, [engineInitialized]);

  const flourishLoopAnimTop = useMemo(() => createFlourishLoopAnimation(0), []);
  const flourishLoopAnimBottom = useMemo(() => createFlourishLoopAnimation(180), []);

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
            rotate: { ...SHARED_FLOURISH_SPRING_TRANSITION, delay: entryDelay + (isInitialMount ? 0.1:0.05) },
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

  useEffect(() => {
    if (isMountedRef.current) {
      onSpotifyViewChange(currentView === 'spotifyPlaylists');
    }
  }, [currentView, onSpotifyViewChange]); 


  const handleParticlesLoaded = useCallback(async (_container?: Container) => {}, []);
  const handleLanguageButtonClick = (lang: 'vi'|'en'|'ja') => { 
    logInteraction('language_selected', { language: lang }); // LOG KHI CHON NN
    onLanguageSelected(lang); 
    setCurrentLanguage(lang); 
    setDisplayTextLanguage(lang); 
    setCurrentView('cardIntro');
  };
  const handleMouseEnterLangBtn = (lang: 'vi'|'en'|'ja') => setDisplayTextLanguage(lang);
  const handleMouseLeaveLangBtn = () => {};
  const langForTextDisplayInOptionsView = displayTextLanguage;
  const footerText = `ᓚᘏᗢ ${yourNameForIntro} | ${new Date().getFullYear()}`;
  const showFooter = ['cardIntro', 'about', 'gallery', 'guestbook', 'spotifyPlaylists'].includes(currentView);

  const getFlourishWrapperStyle = (view: SelectorView, isTop: boolean) => {
    let mV = "1rem";
    if (['about', 'gallery', 'guestbook', 'spotifyPlaylists'].includes(view)) mV = "0.5rem";
    return isTop ? { marginBottom: mV } : { marginTop: mV };
  };

  const cardIntroAvatarDelay=0, cardIntroDivider1Delay=cardIntroAvatarDelay+0.4, cardIntroNameDisplayDelay=0.05;
  const cardIntroTitleDisplayDelay=cardIntroNameDisplayDelay+0.15, cardIntroTaglineDisplayDelay=cardIntroTitleDisplayDelay+0.15;
  const cardIntroDivider2Delay=cardIntroTaglineDisplayDelay+0.4, cardIntroActionsDelay=cardIntroDivider2Delay+0.1;
  const cardIntroButtonBaseDelay=0.1, headerContentBlockDelay=0.05;

  const fetchGuestbookEntries = useCallback(async () => {
      if (!isMountedRef.current) return;
      setGuestbookLoading(true); setGuestbookError(null);
      try {
          const res = await fetch(`${API_BASE_URL}/api/guestbook`);
          if (!res.ok) { let msg = `HTTP error! status: ${res.status}`; try { const errD = await res.json(); msg = errD.error || msg; } catch (e) {} throw new Error(msg); }
          if (isMountedRef.current) setGuestbookEntries(await res.json());
      } catch (e: any) { console.error("Lỗi fetch GBook:", e); if (isMountedRef.current) setGuestbookError(e.message || 'Lỗi tải GBook.'); }
      finally { if (isMountedRef.current) setGuestbookLoading(false); }
  }, []);

  const fetchSpotifyPlaylists = useCallback(async () => {
    if (!isMountedRef.current) return;
    setSpotifyLoading(true); setSpotifyError(null);
    try {
        const res = await fetch(`${API_BASE_URL}/api/spotify/playlists`);
        if (!res.ok) {
            let msg = `HTTP error! status: ${res.status}`;
            try { const errData = await res.json(); msg = errData.error || msg; } catch (e) {}
            throw new Error(msg);
        }
        if (isMountedRef.current) setSpotifyPlaylists(await res.json());
    } catch (e: any) {
        console.error("Lỗi fetch Spotify Playlists:", e);
        if (isMountedRef.current) setSpotifyError(e.message || 'Lỗi tải Spotify playlists.');
    } finally {
        if (isMountedRef.current) setSpotifyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'guestbook' || (currentView === 'cardIntro' && headerPreviewType === 'guestbook')) {
        fetchGuestbookEntries();
    }
    if (currentView === 'spotifyPlaylists' || (currentView === 'cardIntro' && headerPreviewType === 'spotifyPlaylists')) {
        fetchSpotifyPlaylists();
    }
  }, [fetchGuestbookEntries, fetchSpotifyPlaylists, currentView, headerPreviewType]);

  const handleAddGuestbookEntry = async (name: string, message: string, lang: 'vi'|'en'|'ja'): Promise<void> => {
      const payload = { name, message, language: lang };
      try {
          const res = await fetch(`${API_BASE_URL}/api/guestbook`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (!res.ok) { let msg = `Lỗi gửi: ${res.status}`; try { const errD = await res.json(); msg = errD.error || msg; } catch (e) {} throw new Error(msg); }
          await fetchGuestbookEntries();
      } catch (e: any) { console.error("Lỗi gửi GBook từ LangSel:", e); throw e; }
  };

  const personalCardRenderKey = `pc-${currentView}-${currentLanguage}`;

  const cardIntroActionButtons: {
    type: HeaderPreviewType;
    iconKey: CardIntroIconKey;
    textKey: MainCardIntroButtonTextKey;
  }[] = [
    { type: 'about', iconKey: 'aboutIconSvg', textKey: 'aboutButton'},
    { type: 'gallery', iconKey: 'galleryIconSvg', textKey: 'galleryButton'},
    { type: 'guestbook', iconKey: 'guestbookIconSvg', textKey: 'guestbookButton'},
    { type: 'spotifyPlaylists', iconKey: 'spotifyIconSvg', textKey: 'spotifyButton'},
  ];


  return (
    <motion.div className="language-selector-poetic-overlay" variants={overlayEntryExitVariants} initial="hidden" animate="visible" exit="exit">
      {particleOptions && <MemoizedParticlesComponent id="tsparticles-lang-selector-stable" options={particleOptions} particlesLoaded={handleParticlesLoaded} />}
      <motion.div layout style={getFlourishWrapperStyle(currentView, true)} transition={SHARED_FLOURISH_SPRING_TRANSITION} className="flourish-wrapper">
            <motion.img src={flourishImage} alt="Họa tiết" className="flourish-image flourish-image-top" aria-hidden="true" variants={topFlourishVariants} initial="hidden" animate={topFlourishVisualControls} onHoverStart={()=>handleFlourishHoverStart(topFlourishVisualControls, topFlourishVariants)} onHoverEnd={()=>handleFlourishHoverEnd(topFlourishVisualControls, topFlourishVariants, flourishLoopAnimTop)} />
      </motion.div>
      <div className="language-selector-content-wrapper">
        <AnimatePresence mode="wait">
          {currentView === 'languageOptions' && ( <motion.div key="lang-options-content" className="content-section">
              <motion.h2 key={`title-${langForTextDisplayInOptionsView}`} className="poetic-title" variants={titleVariants(isInitialMount ? initialMountTitleDelay : 0.05)} initial="hidden" animate="visible" exit="exit">{translations.title[langForTextDisplayInOptionsView]}</motion.h2>
              <motion.p key={`subtitle-${langForTextDisplayInOptionsView}`} className="poetic-subtitle" variants={contentItemVariants(isInitialMount ? initialMountSubtitleDelay : 0.1)} initial="hidden" animate="visible" exit="exit">{translations.subtitle[langForTextDisplayInOptionsView]}</motion.p>
              <motion.div className="language-options-poetic">
                <LangButton onClick={()=>handleLanguageButtonClick('vi')} ariaLabel="Chọn TV" icon="🇻🇳" name="Tiếng Việt" animationDelay={isInitialMount?initialMountButton1Delay:0.15} onMouseEnter={()=>handleMouseEnterLangBtn('vi')} onMouseLeave={handleMouseLeaveLangBtn} />
                <motion.div className="poetic-divider poetic-divider-vertical" variants={dividerVerticalVariants(isInitialMount?initialMountDivider1Delay:0.2)} initial="hidden" animate="visible" exit="exit" />
                <motion.div className="poetic-divider poetic-divider-horizontal" variants={dividerHorizontalVariants(isInitialMount?initialMountDivider1Delay:0.2)} initial="hidden" animate="visible" exit="exit" />
                <LangButton onClick={()=>handleLanguageButtonClick('en')} ariaLabel="Choose EN" icon="🇬🇧" name="English" animationDelay={isInitialMount?initialMountButton2Delay:0.25} onMouseEnter={()=>handleMouseEnterLangBtn('en')} onMouseLeave={handleMouseLeaveLangBtn} />
                <motion.div className="poetic-divider poetic-divider-vertical" variants={dividerVerticalVariants(isInitialMount?initialMountDivider2Delay:0.3)} initial="hidden" animate="visible" exit="exit" />
                <motion.div className="poetic-divider poetic-divider-horizontal" variants={dividerHorizontalVariants(isInitialMount?initialMountDivider2Delay:0.3)} initial="hidden" animate="visible" exit="exit" />
                <LangButton onClick={()=>handleLanguageButtonClick('ja')} ariaLabel="Chọn JP" icon="🇯🇵" name="日本語" animationDelay={isInitialMount?initialMountButton3Delay:0.35} onMouseEnter={()=>handleMouseEnterLangBtn('ja')} onMouseLeave={handleMouseLeaveLangBtn} />
              </motion.div>
              <motion.p key={`note-${langForTextDisplayInOptionsView}`} className="poetic-footer-note" variants={contentItemVariants(isInitialMount?initialMountFooterNoteDelay:0.4)} initial="hidden" animate="visible" exit="exit">{translations.note[langForTextDisplayInOptionsView]}</motion.p>
          </motion.div> )}
          {currentView === 'cardIntro' && ( <motion.div key="card-intro-content" className="content-section card-intro-section-modifier" initial={false} animate="visible">
                <motion.div className="card-intro-header" variants={cardIntroHeaderVariants} initial="hidden" animate="visible" exit="exit" layout transition={layoutTransition}>
                    <motion.div className="card-intro-avatar-wrapper" whileHover="hover" initial="rest" variants={{rest:{scale:1}, hover:{scale:1.05}}} transition={{type:"spring",stiffness:200,damping:10}}>
                      <motion.img src={cardAvatarUrl} alt={`${cardDisplayInfo.name[currentLanguage]}'s avatar`} className="card-intro-avatar" initial={{scale:0.1,opacity:0,rotate:-60,y:50,filter:"blur(10px) brightness(0.5)"}} animate={{scale:1,opacity:1,rotate:[-30,15,-8,5,0],y:0,filter:"blur(0px) brightness(1)",boxShadow:"0 0 45px 8px rgba(var(--highlight-color-poetic-rgb),0.7)",transition:{type:"spring",stiffness:100,damping:15,duration:1,delay:cardIntroAvatarDelay}}} exit={{scale:0.2,opacity:0,rotate:30,y:-30,filter:"blur(8px)",transition:{duration:0.25,ease:"anticipate"}}} />
                      {[...Array(numSparkles)].map((_,i)=>(<motion.div key={`sparkle-avatar-${i}`} className="sparkle-element avatar-sparkle" custom={i} variants={sparkleVariants} initial="initial" animate="animate" />))}
                    </motion.div>
                    <motion.div className="poetic-divider poetic-divider-horizontal card-intro-first-divider" variants={dividerHorizontalVariants(cardIntroDivider1Delay)} initial="hidden" animate="visible" exit="exit"><div className="divider-line"></div></motion.div>
                    <motion.div className="card-intro-header-swappable-content" layout transition={layoutTransition}>
                      <AnimatePresence mode="wait">
                        {headerPreviewType?(<motion.div key={`header-preview-${headerPreviewType}`} className="header-preview-container" variants={previewContainerVariants} initial="initial" animate="animate" exit="exit" whileHover="hover">
                            <motion.h4 className="header-preview-title" variants={contentItemVariants(0)}>
                                {headerPreviewType==='about'?languageSelectorPreviewTranslations.aboutSnippetTitle[currentLanguage]
                                :headerPreviewType==='gallery'?languageSelectorPreviewTranslations.gallerySneakPeekTitle[currentLanguage]
                                :headerPreviewType==='guestbook'?languageSelectorPreviewTranslations.guestbookSneakPeekTitle[currentLanguage]
                                :headerPreviewType==='spotifyPlaylists'?languageSelectorPreviewTranslations.spotifySneakPeekTitle[currentLanguage]
                                : ''}
                            </motion.h4>
                            <motion.div className="header-preview-block-content" variants={contentItemVariants(0.1)} initial="hidden" animate="visible" exit="exit">
                                <span className="header-preview-icon" dangerouslySetInnerHTML={{__html:
                                    headerPreviewType==='about'?previewIcons.about
                                    :headerPreviewType==='gallery'?previewIcons.gallery
                                    :headerPreviewType==='guestbook'?previewIcons.guestbook
                                    :headerPreviewType==='spotifyPlaylists'?previewIcons.spotify
                                    : ''
                                }} />
                                <div className="header-preview-actual-content">
                                  {headerPreviewType==='about' && (<p className="header-preview-text-enhanced">{languageSelectorPreviewTranslations.aboutSnippetContent[currentLanguage]}</p>)}
                                  {headerPreviewType==='gallery' && (<div className="header-preview-images-enhanced">{(localImages.length>0?localImages.slice(0,4):[]).map((img,idx)=>(<motion.img key={`preview-${idx}`} variants={contentItemVariants(0.1+idx*0.08)} src={img} alt={languageSelectorPreviewTranslations.galleryPreviewAlt[currentLanguage].replace("{index}",String(idx+1))} />))}</div>)}
                                  {headerPreviewType==='guestbook' && (<p className="header-preview-text-enhanced">{languageSelectorPreviewTranslations.guestbookSnippetContent[currentLanguage]}</p>)}
                                  {headerPreviewType==='spotifyPlaylists' && (<p className="header-preview-text-enhanced">{languageSelectorPreviewTranslations.spotifyPreviewContent[currentLanguage]}</p>)}
                                </div>
                            </motion.div>
                        </motion.div>):(<motion.div key="header-details" className="header-details-block" variants={contentItemVariants(headerContentBlockDelay)} initial="hidden" animate="visible" exit="exit">
                            <motion.h2 className="card-intro-name poetic-glow-effect" variants={cardNameTextVariants(cardIntroNameDisplayDelay)} whileHover="hover" initial="initial" animate="animate" exit="exit">{cardDisplayInfo.name[currentLanguage]}<span className="text-shine-effect"></span></motion.h2>
                            <motion.p className="card-intro-title" initial={{y:20,opacity:0,filter:"blur(2px)"}} animate={{y:0,opacity:1,filter:"blur(0px)",transition:{delay:cardIntroTitleDisplayDelay,duration:0.6,ease:"easeOut"}}} exit={{y:15,opacity:0,filter:"blur(2px)",transition:{duration:0.15}}}>{cardDisplayInfo.title[currentLanguage]}</motion.p>
                            <motion.p className="card-intro-tagline" initial={{opacity:0,y:20,letterSpacing:"-0.5px"}} animate={{opacity:1,y:0,letterSpacing:"0.3px",transition:{delay:cardIntroTaglineDisplayDelay,duration:0.7,ease:"circOut"}}} exit={{opacity:0,y:15,transition:{duration:0.2}}}>{cardIntroTranslations.introTagline[currentLanguage]}</motion.p>
                        </motion.div>)}
                      </AnimatePresence>
                    </motion.div>
                </motion.div>
                <motion.div className="poetic-divider poetic-divider-horizontal card-intro-second-divider" variants={dividerHorizontalVariants(cardIntroDivider2Delay)} initial="hidden" animate="visible" exit="exit" layout transition={layoutTransition}><div className="divider-line"></div></motion.div>
                <motion.div className="card-intro-actions" variants={contentItemVariants(cardIntroActionsDelay)} initial="hidden" animate="visible" exit="exit" layout transition={layoutTransition}>
                    {cardIntroActionButtons.map((btn, idx) => (
                        <motion.button
                            key={btn.type}
                            className="card-intro-button"
                            onClick={() => setCurrentView(btn.type)}
                            variants={cardIntroButtonVariants}
                            initial="initial" animate="animate" exit="exit"
                            custom={cardIntroButtonBaseDelay + idx * 0.1}
                            whileHover="hover" whileTap="tap"
                            onMouseEnter={() => { setIsButtonHovered(btn.type); setHeaderPreviewType(btn.type); }}
                            onMouseLeave={() => { setIsButtonHovered(null); setHeaderPreviewType(null); }}
                        >
                            <motion.span
                                className="button-icon-svg"
                                variants={cardIntroButtonIconVariants}
                                animate={isButtonHovered === btn.type ? "hover" : "rest"}
                                dangerouslySetInnerHTML={{ __html: cardIntroTranslations[btn.iconKey] as string }}
                            />
                            <span className="button-text">
                                {cardIntroTranslations[btn.textKey][currentLanguage]}
                            </span>
                            <span className="button-shine-effect"></span>
                        </motion.button>
                    ))}
                </motion.div>
          </motion.div> )}
          {currentView === 'about' && ( <motion.div key={`about-view-${currentLanguage}`} className="content-section card-content-display" variants={galleryViewVariants(0.05)} initial="hidden" animate="visible" exit="exit">
              <PersonalCard personalCardKey={personalCardRenderKey} name={cardDisplayInfo.name[currentLanguage]} section="about" githubUsername={githubUsername} language={currentLanguage} />
              <motion.button className="card-view-back-button" onClick={()=>setCurrentView('cardIntro')} variants={cardIntroButtonVariants} initial="initial" animate="animate" exit="exit" custom={0.2} whileHover="hover" whileTap="tap">
                 <span className="button-icon-svg" dangerouslySetInnerHTML={{__html:aboutNavIconLeft}} /> <span className="button-text">{cardIntroTranslations.backButton[currentLanguage]}</span>
              </motion.button>
          </motion.div> )}
          {currentView === 'gallery' && ( <motion.div key="gallery-content" className="content-section card-content-display gallery-view-wrapper" variants={galleryViewVariants(0.05)} initial="hidden" animate="visible" exit="exit">
              <Gallery onBack={()=>setCurrentView('cardIntro')} language={currentLanguage} />
          </motion.div> )}
          {currentView === 'guestbook' && ( <motion.div key="guestbook-content" className="content-section card-content-display guestbook-view-wrapper" variants={guestbookViewContainerVariants(0.05)} initial="hidden" animate="visible" exit="exit">
                {guestbookLoading&&!guestbookEntries.length?(<motion.p initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{currentLanguage==='vi'?'Đang tải...':currentLanguage==='en'?'Loading...':'読み込み中...'}</motion.p>):(<Guestbook language={currentLanguage} onBack={()=>setCurrentView('cardIntro')} entries={guestbookEntries} onAddEntry={handleAddGuestbookEntry} />)}
                <motion.button className="card-view-back-button" onClick={()=>setCurrentView('cardIntro')} initial={{opacity:0,y:30,scale:0.9}} animate={{opacity:1,y:0,scale:1,transition:{delay:0.3,duration:0.6,ease:[0.23,1,0.32,1]}}} exit={{opacity:0,y:20,scale:0.95,transition:{duration:0.25,ease:"easeIn"}}} whileHover={{scale:1.08,y:-4,boxShadow:"0 8px 20px -5px rgba(var(--primary-color-rgb),0.35)",backgroundColor:"rgba(var(--primary-color-rgb),0.1)"}} whileTap={{scale:0.96,y:-1}} transition={{type:"spring",stiffness:300,damping:15}}>
                   <span className="button-icon-svg" dangerouslySetInnerHTML={{__html:aboutNavIconLeft}} /> <span className="button-text">{cardIntroTranslations.backButton[currentLanguage]}</span>
                </motion.button>
          </motion.div> )}
          {currentView === 'spotifyPlaylists' && (
            <motion.div
                key="spotify-playlists-content"
                className="content-section card-content-display spotify-playlists-view-wrapper"
                variants={spotifyViewContainerVariants(0.05)}
                initial="hidden" animate="visible" exit="exit"
            >
                <SpotifyPlaylists
                    language={currentLanguage}
                    playlists={spotifyPlaylists}
                    isLoading={spotifyLoading}
                    error={spotifyError}
                />
                 <motion.button
                    className="card-view-back-button"
                    onClick={() => setCurrentView('cardIntro')}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.3, duration: 0.6, ease: [0.23, 1, 0.32, 1] } }}
                    exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.25, ease: "easeIn" } }}
                    whileHover={{ scale: 1.08, y: -4, boxShadow: "0 8px 20px -5px rgba(var(--primary-color-rgb),0.35)", backgroundColor: "rgba(var(--primary-color-rgb),0.1)" }}
                    whileTap={{ scale: 0.96, y: -1 }}
                    transition={{type:"spring", stiffness: 300, damping: 15}}
                >
                    <span className="button-icon-svg" dangerouslySetInnerHTML={{ __html: aboutNavIconLeft }} />
                    <span className="button-text">{cardIntroTranslations.backButton[currentLanguage]}</span>
                </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.div layout style={getFlourishWrapperStyle(currentView, false)} transition={SHARED_FLOURISH_SPRING_TRANSITION} className="flourish-wrapper">
            <motion.img src={flourishImage} alt="Họa tiết" className="flourish-image flourish-image-bottom" aria-hidden="true" variants={bottomFlourishVariants} initial="hidden" animate={bottomFlourishVisualControls} onHoverStart={()=>handleFlourishHoverStart(bottomFlourishVisualControls, bottomFlourishVariants)} onHoverEnd={()=>handleFlourishHoverEnd(bottomFlourishVisualControls, bottomFlourishVariants, flourishLoopAnimBottom)} />
      </motion.div>
      {showFooter && (<motion.footer className="language-selector-footer" initial={{opacity:0}} animate={{opacity:1,transition:{delay:0.5,duration:0.5}}} exit={{opacity:0,transition:{duration:0.2}}}>{footerText}</motion.footer>)}
    </motion.div>
  );
};
const localImages = Object.values(import.meta.glob('/src/assets/gallery_images/*.{png,jpg,jpeg,gif,svg,webp}',{eager:true,import:'default'})) as string[];
export default React.memo(LanguageSelector);