// client/src/components/LanguageSelector.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion';
import './styles/LanguageSelector.css';
import flourishImage from '../assets/flourish.png';

import PersonalCard from './PersonalCard';
import Gallery from './Gallery';
import Guestbook from './Guestbook'; // NEW: Import Guestbook
import { initialGuestbookEntries, type GuestbookEntry } from '../data/guestbook.data'; // NEW: Import guestbook data
import { v4 as uuidv4 } from 'uuid';

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
    guestbookViewContainerVariants, // NEW
    SHARED_FLOURISH_SPRING_TRANSITION,
    aboutNavIconLeft, // Import for back button
} from './languageSelector/languageSelector.constants';


interface LanguageSelectorProps {
  onLanguageSelected: (language: 'vi' | 'en' | 'ja') => void;
  cardAvatarUrl: string;
  initialSelectedLanguage: 'vi' | 'en' | 'ja' | null;
  yourNameForIntro: string;
  githubUsername: string;
}

type SelectorView = 'languageOptions' | 'cardIntro' | 'about' | 'gallery' | 'guestbook'; // ADDED 'guestbook'

const getFlourishLayoutPropsForView = (view: SelectorView) => {
    let scale = 1;
    if (view === 'about' || view === 'gallery' || view === 'guestbook') { // ADDED 'guestbook'
        scale = 0.85;
    }
    return { scale };
};

// New proposed isInitialMount delays (slower sequence) for languageOptions view
const initialMountTitleDelay = 0.5;
const initialMountSubtitleDelay = initialMountTitleDelay + 0.3; // 0.8
const initialMountButton1Delay = initialMountSubtitleDelay + 0.4; // 1.2
const initialMountDivider1Delay = initialMountButton1Delay + 0.1; // 1.3
const initialMountButton2Delay = initialMountDivider1Delay + 0.2; // 1.5
const initialMountDivider2Delay = initialMountButton2Delay + 0.1; // 1.6
const initialMountButton3Delay = initialMountDivider2Delay + 0.2; // 1.8
const initialMountFooterNoteDelay = initialMountButton3Delay + 0.4; // 2.2


const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    onLanguageSelected,
    cardAvatarUrl,
    initialSelectedLanguage,
    yourNameForIntro,
    githubUsername
}) => {
  const [engineInitialized, setEngineInitialized] = useState(false);
  const [currentView, setCurrentView] = useState<SelectorView>('languageOptions');
  
  const [currentLanguage, setCurrentLanguage] = useState<'vi' | 'en' | 'ja'>(initialSelectedLanguage || 'vi');
  const [displayTextLanguage, setDisplayTextLanguage] = useState<'vi' | 'en' | 'ja'>(initialSelectedLanguage || 'vi');
  
  const [isInitialMount, setIsInitialMount] = useState(true);

  const [isButtonHovered, setIsButtonHovered] = useState<string | null>(null);
  const [headerPreviewType, setHeaderPreviewType] = useState<'about' | 'gallery' | 'guestbook' | null>(null); // ADDED 'guestbook'

  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>(() => {
    // Attempt to load from localStorage, otherwise use initial
    try {
        const localData = localStorage.getItem('guestbookEntries');
        return localData ? JSON.parse(localData) : initialGuestbookEntries;
    } catch (error) {
        console.error("Error loading guestbook from localStorage", error);
        return initialGuestbookEntries;
    }
  });

  const topFlourishVisualControls = useAnimation();
  const bottomFlourishVisualControls = useAnimation();

  const topFlourishVariants = useMemo(() => flourishVariantsDefinition(0), []);
  const bottomFlourishVariants = useMemo(() => flourishVariantsDefinition(180), []);

  const particleOptions = useMemo(() => {
    if (engineInitialized) return poeticStarsOptionsDefinition;
    return undefined;
  }, [engineInitialized]);

  const isMountedRef = useRef(true);
  const initInProgressRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    if (!engineInitialized && !initInProgressRef.current) {
      initInProgressRef.current = true;
      initParticlesEngine(async (engine: Engine) => {
        await loadEmittersPlugin(engine);
        await loadExternalTrailInteraction(engine);
        await loadCircleShape(engine);
        await loadStarShape(engine);
        if (isMountedRef.current) {
            setEngineInitialized(true);
        }
      }).catch(error => {
        if (isMountedRef.current) console.error("LanguageSelector: Error initializing particles engine:", error);
      }).finally(() => {
        if(isMountedRef.current) {
            initInProgressRef.current = false;
        }
      });
    }
    return () => { isMountedRef.current = false; };
  }, [engineInitialized]);

  const flourishLoopAnimTop = useMemo(() => createFlourishLoopAnimation(0), []);
  const flourishLoopAnimBottom = useMemo(() => createFlourishLoopAnimation(180), []);

   useEffect(() => {
    if (!isMountedRef.current) return;

    const { scale: targetScale } = getFlourishLayoutPropsForView(currentView); // Ensures currentView update is used
    const entryDelay = isInitialMount ? 0.1 : 0;

    const createTargetFlourishState = (baseVariantSet: Variants, scaleValue: number) => ({
        ...(baseVariantSet.visibleBase as object),
        scale: scaleValue,
        transition: {
            opacity: { duration: isInitialMount ? 2.0 : 1.5, ease: [0.23, 1, 0.32, 1], delay: entryDelay },
            filter: { type: "tween", duration: isInitialMount ? 1.2 : 0.9, ease: "easeOut", delay: entryDelay },
            y: { ...SHARED_FLOURISH_SPRING_TRANSITION, delay: entryDelay },
            rotate: { ...SHARED_FLOURISH_SPRING_TRANSITION, delay: entryDelay + (isInitialMount ? 0.1 : 0.05) },
            scale: { ...SHARED_FLOURISH_SPRING_TRANSITION, delay: entryDelay }
        }
    });
    
    const targetAnimationStateTop = createTargetFlourishState(topFlourishVariants, targetScale);
    const targetAnimationStateBottom = createTargetFlourishState(bottomFlourishVariants, targetScale);
    
    const animateAndThenLoop = async (
        controls: ReturnType<typeof useAnimation>,
        targetState: any,
        loopDefinition: any
    ) => {
        await controls.start(targetState);
        
        if (isMountedRef.current) {
             controls.start(loopDefinition);
        }
    };

    animateAndThenLoop(topFlourishVisualControls, targetAnimationStateTop, flourishLoopAnimTop);
    animateAndThenLoop(bottomFlourishVisualControls, targetAnimationStateBottom, flourishLoopAnimBottom);

    if (isInitialMount && isMountedRef.current) {
        requestAnimationFrame(() => {
             if(isMountedRef.current) setIsInitialMount(false);
        });
    }
  }, [currentView, isInitialMount, topFlourishVisualControls, bottomFlourishVisualControls, topFlourishVariants, bottomFlourishVariants, flourishLoopAnimTop, flourishLoopAnimBottom]); 


  const handleFlourishHoverStart = useCallback((
      controls: ReturnType<typeof useAnimation>,
      variants: Variants
  ) => {
      const currentBaseScale = getFlourishLayoutPropsForView(currentView).scale;
      const hoverVariant = (variants.hover as (custom: { baseScale: number }) => any)({ baseScale: currentBaseScale });
      controls.start(hoverVariant);
  }, [currentView]);

  const handleFlourishHoverEnd = useCallback(async (
      controls: ReturnType<typeof useAnimation>,
      variants: Variants,
      loopAnimDef: any
  ) => {
      const currentBaseScale = getFlourishLayoutPropsForView(currentView).scale;
      const targetStaticState = {
          ...(variants.visibleBase as object),
          scale: currentBaseScale,
          transition: { type: "spring", stiffness: 280, damping: 35, mass: 1 }
      };
      await controls.start(targetStaticState);
      if (isMountedRef.current) {
        controls.start(loopAnimDef);
      }
  }, [currentView]);


  const handleParticlesLoaded = useCallback(async (_container?: Container) => { /* Placeholder */ }, []);

  const handleLanguageButtonClick = (lang: 'vi' | 'en' | 'ja') => {
    onLanguageSelected(lang);
    setCurrentLanguage(lang);
    setDisplayTextLanguage(lang);
    setCurrentView('cardIntro');
  };

  const handleMouseEnterLangBtn = (lang: 'vi' | 'en' | 'ja') => {
    setDisplayTextLanguage(lang);
  };

  const handleMouseLeaveLangBtn = () => {
    // If you want it to revert to the selected language on mouse leave from button list
    // setDisplayTextLanguage(currentLanguage);
  };

  const langForTextDisplayInOptionsView = displayTextLanguage;

  const footerText = currentLanguage === 'vi'
    ? `ᓚᘏᗢ ${yourNameForIntro} | ${new Date().getFullYear()}`
    : currentLanguage === 'en'
    ? `ᓚᘏᗢ ${yourNameForIntro} | ${new Date().getFullYear()}`
    : `ᓚᘏᗢ ${yourNameForIntro} | ${new Date().getFullYear()}`;

  const showFooter = currentView === 'cardIntro' || currentView === 'about' || currentView === 'gallery' || currentView === 'guestbook'; // ADDED 'guestbook'

  const getFlourishWrapperStyle = (view: SelectorView, isTop: boolean) => {
      let marginVertical = "1rem";
      if (view === 'about' || view === 'gallery' || view === 'guestbook') { // ADDED 'guestbook'
          marginVertical = "0.5rem";
      }
      return isTop ? { marginBottom: marginVertical } : { marginTop: marginVertical };
  };

  const cardIntroAvatarDelay = 0;
  const cardIntroDivider1Delay = cardIntroAvatarDelay + 0.4;
  const cardIntroNameDisplayDelay = 0.05;
  const cardIntroTitleDisplayDelay = cardIntroNameDisplayDelay + 0.15;
  const cardIntroTaglineDisplayDelay = cardIntroTitleDisplayDelay + 0.15;
  const cardIntroDivider2Delay = cardIntroTaglineDisplayDelay + 0.4;
  const cardIntroActionsDelay = cardIntroDivider2Delay + 0.1;
  const cardIntroButtonBaseDelay = 0.1;
  const headerContentBlockDelay = 0.05;


  // NEW: Handler for adding a guestbook entry
  const handleAddGuestbookEntry = async (name: string, message: string, lang: 'vi' | 'en' | 'ja') => {
    // Simulate API call delay for now
    await new Promise(resolve => setTimeout(resolve, 700));

    const newEntry: GuestbookEntry = {
      id: uuidv4(), // Generate a unique ID
      name,
      message,
      timestamp: new Date().toISOString(),
      language: lang,
    };

    const updatedEntries = [newEntry, ...guestbookEntries].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).reverse(); // Keep sorted
    setGuestbookEntries(updatedEntries);

    // Save to localStorage (simple persistence)
    try {
        localStorage.setItem('guestbookEntries', JSON.stringify(updatedEntries));
    } catch (error) {
        console.error("Error saving guestbook to localStorage", error);
    }
  };


  return (
    <motion.div
      className="language-selector-poetic-overlay"
      variants={overlayEntryExitVariants}
      initial="hidden" animate="visible" exit="exit"
    >
      {particleOptions && (
        <MemoizedParticlesComponent
            id="tsparticles-lang-selector-stable"
            options={particleOptions}
            particlesLoaded={handleParticlesLoaded}
        />
      )}
        <motion.div
            layout
            style={getFlourishWrapperStyle(currentView, true)}
            transition={SHARED_FLOURISH_SPRING_TRANSITION}
            className="flourish-wrapper"
        >
            <motion.img
                src={flourishImage} alt="Decorative flourish"
                className="flourish-image flourish-image-top"
                aria-hidden="true"
                variants={topFlourishVariants}
                initial="hidden"
                animate={topFlourishVisualControls}
                onHoverStart={() => handleFlourishHoverStart(topFlourishVisualControls, topFlourishVariants)}
                onHoverEnd={() => handleFlourishHoverEnd(topFlourishVisualControls, topFlourishVariants, flourishLoopAnimTop)}
            />
        </motion.div>

      <div className="language-selector-content-wrapper">
        <AnimatePresence mode="wait">
          {currentView === 'languageOptions' && (
            <motion.div key="lang-options-content" className="content-section">
              <motion.h2
                key={`title-${langForTextDisplayInOptionsView}`}
                className="poetic-title"
                variants={titleVariants(isInitialMount ? initialMountTitleDelay : 0.05)}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {translations.title[langForTextDisplayInOptionsView]}
              </motion.h2>
              <motion.p
                key={`subtitle-${langForTextDisplayInOptionsView}`}
                className="poetic-subtitle"
                variants={contentItemVariants(isInitialMount ? initialMountSubtitleDelay : 0.1)}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {translations.subtitle[langForTextDisplayInOptionsView]}
              </motion.p>
              <motion.div
                className="language-options-poetic"
              >
                <LangButton
                    onClick={() => handleLanguageButtonClick('vi')}
                    ariaLabel="Chọn Tiếng Việt"
                    icon="🇻🇳"
                    name="Tiếng Việt"
                    animationDelay={isInitialMount ? initialMountButton1Delay : 0.15}
                    onMouseEnter={() => handleMouseEnterLangBtn('vi')}
                    onMouseLeave={handleMouseLeaveLangBtn}
                />
                <motion.div
                    className="poetic-divider poetic-divider-vertical"
                    variants={dividerVerticalVariants(isInitialMount ? initialMountDivider1Delay : 0.2)}
                    initial="hidden" animate="visible" exit="exit"
                />
                <motion.div
                    className="poetic-divider poetic-divider-horizontal"
                    variants={dividerHorizontalVariants(isInitialMount ? initialMountDivider1Delay : 0.2)}
                    initial="hidden" animate="visible" exit="exit"
                />
                <LangButton
                    onClick={() => handleLanguageButtonClick('en')}
                    ariaLabel="Choose English"
                    icon="🇬🇧"
                    name="English"
                    animationDelay={isInitialMount ? initialMountButton2Delay : 0.25}
                    onMouseEnter={() => handleMouseEnterLangBtn('en')}
                    onMouseLeave={handleMouseLeaveLangBtn}
                />
                <motion.div
                    className="poetic-divider poetic-divider-vertical"
                    variants={dividerVerticalVariants(isInitialMount ? initialMountDivider2Delay : 0.3)}
                    initial="hidden" animate="visible" exit="exit"
                />
                <motion.div
                    className="poetic-divider poetic-divider-horizontal"
                    variants={dividerHorizontalVariants(isInitialMount ? initialMountDivider2Delay : 0.3)}
                    initial="hidden" animate="visible" exit="exit"
                />
                <LangButton
                    onClick={() => handleLanguageButtonClick('ja')}
                    ariaLabel="日本語を選択"
                    icon="🇯🇵"
                    name="日本語"
                    animationDelay={isInitialMount ? initialMountButton3Delay : 0.35}
                    onMouseEnter={() => handleMouseEnterLangBtn('ja')}
                    onMouseLeave={handleMouseLeaveLangBtn}
                />
              </motion.div>
              <motion.p
                key={`note-${langForTextDisplayInOptionsView}`}
                className="poetic-footer-note"
                variants={contentItemVariants(isInitialMount ? initialMountFooterNoteDelay : 0.4)}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {translations.note[langForTextDisplayInOptionsView]}
              </motion.p>
            </motion.div>
          )}

          {currentView === 'cardIntro' && (
            <motion.div key="card-intro-content" className="content-section card-intro-section-modifier"
              initial={false}
              animate="visible"
            >
                <motion.div
                    className="card-intro-header"
                    variants={cardIntroHeaderVariants}
                    initial="hidden" animate="visible" exit="exit"
                    layout
                    transition={layoutTransition}
                >
                    <motion.div
                      className="card-intro-avatar-wrapper"
                      whileHover="hover" initial="rest"
                      variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
                      transition={{ type: "spring", stiffness: 200, damping: 10}}
                    >
                      <motion.img
                          src={cardAvatarUrl} alt={`${cardDisplayInfo.name[currentLanguage]}'s avatar`}
                          className="card-intro-avatar"
                          initial={{scale:0.1, opacity:0, rotate: -60, y: 50, filter: "blur(10px) brightness(0.5)"}}
                          animate={{
                              scale:1, opacity:1, rotate: [-30, 15, -8, 5, 0], y: 0, filter: "blur(0px) brightness(1)",
                              boxShadow: "0 0 45px 8px rgba(var(--highlight-color-poetic-rgb), 0.7)",
                              transition: { type: "spring", stiffness: 100, damping: 15, duration: 1, delay: cardIntroAvatarDelay }
                          }}
                          exit={{scale:0.2, opacity:0, rotate: 30, y: -30, filter: "blur(8px)", transition:{duration:0.25, ease:"anticipate"}}}
                      />
                      {[...Array(numSparkles)].map((_, i) => (
                        <motion.div
                          key={`sparkle-avatar-${i}`}
                          className="sparkle-element avatar-sparkle"
                          custom={i}
                          variants={sparkleVariants}
                          initial="initial"
                          animate="animate"
                        />
                      ))}
                    </motion.div>

                    <motion.div
                        className="poetic-divider poetic-divider-horizontal card-intro-first-divider"
                        variants={dividerHorizontalVariants(cardIntroDivider1Delay)}
                        initial="hidden" animate="visible" exit="exit"

                    >
                       <div className="divider-line"></div>
                    </motion.div>

                    <motion.div
                        className="card-intro-header-swappable-content"
                        layout
                        transition={layoutTransition}
                    >
                      <AnimatePresence mode="wait">
                        {headerPreviewType ? (
                          <motion.div
                            key={`header-preview-container-${headerPreviewType}`}
                            className="header-preview-container"
                            variants={previewContainerVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            whileHover="hover"
                          >
                            <motion.h4
                              className="header-preview-title"
                              variants={contentItemVariants(0)}
                            >
                              {headerPreviewType === 'about' ? languageSelectorPreviewTranslations.aboutSnippetTitle[currentLanguage]
                                : headerPreviewType === 'gallery' ? languageSelectorPreviewTranslations.gallerySneakPeekTitle[currentLanguage]
                                : languageSelectorPreviewTranslations.guestbookSneakPeekTitle[currentLanguage]}
                            </motion.h4>
                            <motion.div
                                className="header-preview-block-content"
                                variants={contentItemVariants(0.1)}
                                initial="hidden" animate="visible" exit="exit"
                            >
                                <span
                                    className="header-preview-icon"
                                    dangerouslySetInnerHTML={{ __html: headerPreviewType === 'about' ? previewIcons.about
                                                                        : headerPreviewType === 'gallery' ? previewIcons.gallery
                                                                        : previewIcons.guestbook }}
                                />
                                <div className="header-preview-actual-content">
                                  {headerPreviewType === 'about' && (
                                    <p className="header-preview-text-enhanced">
                                        {languageSelectorPreviewTranslations.aboutSnippetContent[currentLanguage]}
                                    </p>
                                  )}
                                  {headerPreviewType === 'gallery' && (
                                    <div className="header-preview-images-enhanced">
                                      {(localImages.length > 0 ? localImages.slice(0,4) : [
                                      ]).map((imgSrc, idx) => (
                                        <motion.img
                                          key={`preview-${idx}`}
                                          variants={contentItemVariants(0.1 + idx * 0.08)} // Adjusted delay for faster sequence
                                          src={imgSrc}
                                          alt={languageSelectorPreviewTranslations.galleryPreviewAlt[currentLanguage].replace("{index}", String(idx + 1))}
                                        />
                                      ))}
                                    </div>
                                  )}
                                  {headerPreviewType === 'guestbook' && ( // NEW Guestbook preview
                                    <p className="header-preview-text-enhanced">
                                        {languageSelectorPreviewTranslations.guestbookSnippetContent[currentLanguage]}
                                    </p>
                                  )}
                                </div>
                            </motion.div>
                          </motion.div>
                        ) : (
                            <motion.div
                                key="header-details-content"
                                className="header-details-block"
                                variants={contentItemVariants(headerContentBlockDelay)}
                                initial="hidden" animate="visible" exit="exit"
                            >
                                <motion.h2
                                    className="card-intro-name poetic-glow-effect"
                                    variants={cardNameTextVariants(cardIntroNameDisplayDelay)}
                                    whileHover="hover"
                                    initial="initial" animate="animate" exit="exit"
                                >
                                    {cardDisplayInfo.name[currentLanguage]}
                                    <span className="text-shine-effect"></span>
                                </motion.h2>
                                <motion.p
                                    className="card-intro-title"
                                    initial={{y:20, opacity:0, filter:"blur(2px)"}}
                                    animate={{y:0, opacity:1, filter:"blur(0px)", transition: {delay: cardIntroTitleDisplayDelay, duration:0.6, ease: "easeOut"}}}
                                    exit={{y:15, opacity:0, filter:"blur(2px)", transition: {duration:0.15}}}
                                >
                                    {cardDisplayInfo.title[currentLanguage]}
                                </motion.p>
                                <motion.p
                                    className="card-intro-tagline"
                                    initial={{ opacity: 0, y: 20, letterSpacing: "-0.5px" }}
                                    animate={{ opacity: 1, y: 0, letterSpacing: "0.3px", transition: { delay: cardIntroTaglineDisplayDelay, duration: 0.7, ease: "circOut" } }}
                                    exit={{ opacity: 0, y: 15, transition: { duration: 0.2 } }}
                                >
                                    {cardIntroTranslations.introTagline[currentLanguage]}
                                </motion.p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                </motion.div>

                <motion.div
                    className="poetic-divider poetic-divider-horizontal card-intro-second-divider"
                    variants={dividerHorizontalVariants(cardIntroDivider2Delay)}
                    initial="hidden" animate="visible" exit="exit"
                    layout
                    transition={layoutTransition}
                >
                    <div className="divider-line"></div>
                </motion.div>

                <motion.div className="card-intro-actions"
                  variants={contentItemVariants(cardIntroActionsDelay)}
                  initial="hidden" animate="visible" exit="exit"
                  layout
                  transition={layoutTransition}
                >
                    {(['about', 'gallery', 'guestbook'] as const).map((type, index) => ( // ADDED 'guestbook'
                        <motion.button
                            key={type}
                            className="card-intro-button"
                            onClick={
                                type === 'about' ? () => setCurrentView('about')
                                : type === 'gallery' ? () => setCurrentView('gallery')
                                : () => setCurrentView('guestbook') // NEW
                            }
                            variants={cardIntroButtonVariants}
                            initial="initial" animate="animate" exit="exit"
                            custom={cardIntroButtonBaseDelay + index * 0.1}
                            whileHover="hover" whileTap="tap"
                            onMouseEnter={() => {
                                setIsButtonHovered(type);
                                setHeaderPreviewType(type);
                            }}
                            onMouseLeave={() => {
                                setIsButtonHovered(null);
                                setHeaderPreviewType(null);
                            }}

                        >
                            <motion.span
                                className="button-icon-svg"
                                variants={cardIntroButtonIconVariants}
                                animate={isButtonHovered === type ? "hover" : "rest"}
                                dangerouslySetInnerHTML={{ __html: type === 'about' ? cardIntroTranslations.aboutIconSvg
                                                                    : type === 'gallery' ? cardIntroTranslations.galleryIconSvg
                                                                    : cardIntroTranslations.guestbookIconSvg // NEW
                                                                }}
                            />
                            <span className="button-text">
                                {type === 'about' ? cardIntroTranslations.aboutButton[currentLanguage]
                                : type === 'gallery' ? cardIntroTranslations.galleryButton[currentLanguage]
                                : cardIntroTranslations.guestbookButton[currentLanguage]} {/* NEW */}
                            </span>
                             <span className="button-shine-effect"></span>
                        </motion.button>
                    ))}
                </motion.div>
            </motion.div>
          )}

          {currentView === 'about' && (
            <motion.div
              key="about-content"
              className="content-section card-content-display"
              variants={contentItemVariants(0.1)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <PersonalCard
                name={cardDisplayInfo.name[currentLanguage]}
                section="about"
                githubUsername={githubUsername}
                language={currentLanguage}
              />
              <motion.button
                className="card-view-back-button" // Use a common back button class if available
                onClick={() => setCurrentView('cardIntro')}
                variants={cardIntroButtonVariants} // Can reuse button variants or make specific ones
                initial="initial" animate="animate" exit="exit"
                custom={0.2} // Adjust delay as needed
                whileHover="hover" whileTap="tap"
              >
                 <span className="button-icon-svg" dangerouslySetInnerHTML={{ __html: aboutNavIconLeft}} />
                <span className="button-text">{cardIntroTranslations.backButton[currentLanguage]}</span>
              </motion.button>
            </motion.div>
          )}

          {currentView === 'gallery' && (
            <motion.div
              key="gallery-content"
              className="content-section card-content-display gallery-view-wrapper"
              variants={galleryViewVariants(0.05)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Gallery
                onBack={() => setCurrentView('cardIntro')}
                language={currentLanguage}
              />
              {/* The onBack in Gallery.tsx now handles its own button, so this is redundant */}
            </motion.div>
          )}

          {currentView === 'guestbook' && ( // NEW Guestbook View
            <motion.div
              key="guestbook-content"
              className="content-section card-content-display guestbook-view-wrapper"
              variants={guestbookViewContainerVariants(0.05)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Guestbook
                language={currentLanguage}
                onBack={() => setCurrentView('cardIntro')}
                entries={guestbookEntries}
                onAddEntry={handleAddGuestbookEntry}
              />
                 <motion.button
                    className="card-view-back-button"
                    onClick={() => setCurrentView('cardIntro')}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.3, duration: 0.6, ease: [0.23, 1, 0.32, 1] } }}
                    exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.25, ease: "easeIn" } }}
                    whileHover={{ scale: 1.08, y: -4, boxShadow: "0 8px 20px -5px rgba(var(--primary-color-rgb), 0.35)", backgroundColor: "rgba(var(--primary-color-rgb), 0.1)"}}
                    whileTap={{ scale: 0.96, y: -1 }}
                    transition={{type:"spring", stiffness: 300, damping: 15}}
                >
                   <span className="button-icon-svg" dangerouslySetInnerHTML={{__html: aboutNavIconLeft }} />
                   <span className="button-text">{cardIntroTranslations.backButton[currentLanguage]}</span>
                </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
        <motion.div
            layout
            style={getFlourishWrapperStyle(currentView, false)}
            transition={SHARED_FLOURISH_SPRING_TRANSITION}
            className="flourish-wrapper"
        >
            <motion.img
                src={flourishImage} alt="Decorative flourish"
                className="flourish-image flourish-image-bottom"
                aria-hidden="true"
                variants={bottomFlourishVariants}
                initial="hidden"
                animate={bottomFlourishVisualControls}
                onHoverStart={() => handleFlourishHoverStart(bottomFlourishVisualControls, bottomFlourishVariants)}
                onHoverEnd={() => handleFlourishHoverEnd(bottomFlourishVisualControls, bottomFlourishVariants, flourishLoopAnimBottom)}
            />
        </motion.div>
      {showFooter && (
        <motion.footer
            className="language-selector-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.5 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >{footerText}</motion.footer>
      )}
    </motion.div>
  );
};

const localImages = Object.values(import.meta.glob('/src/assets/gallery_images/*.{png,jpg,jpeg,gif,svg,webp}', { eager: true, import: 'default' })) as string[];

export default React.memo(LanguageSelector);