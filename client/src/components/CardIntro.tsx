// client/src/components/CardIntro.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dock } from './Dock';
import { DockCard } from './DockCard';

import { useGuestbookStore } from '../stores/guestbook.store';
import { useSpotifyStore } from '../stores/spotify.store';

import {
  cardIntroTranslations,
  contentItemVariants,
  cardDisplayInfo,
  cardNameTextVariants,
  sparkleVariants,
  numSparkles,
  cardIntroHeaderVariants,
  layoutTransition,
  previewContainerVariants,
  previewIcons,
  languageSelectorPreviewTranslations,
  dividerHorizontalVariants,
} from './languageSelector/languageSelector.constants';
import { logInteraction } from '../utils/logger';

export type SelectorView = 'languageOptions' | 'cardIntro' | 'about' | 'gallery' | 'guestbook' | 'spotifyPlaylists' | 'blog';
type HeaderPreviewType = 'about' | 'gallery' | 'guestbook' | 'spotifyPlaylists' | 'blog';
type MainCardIntroButtonTextKey = 'aboutButton' | 'galleryButton' | 'guestbookButton' | 'spotifyButton' | 'blogButton';
type CardIntroIconKey = 'aboutIconSvg' | 'galleryIconSvg' | 'guestbookIconSvg' | 'spotifyIconSvg' | 'blogIconSvg';

const localImages = Object.values(import.meta.glob('/src/assets/gallery_images/*.{png,jpg,jpeg,gif,svg,webp}', { eager: true, import: 'default' })) as string[];

interface CardIntroProps {
  onNavigate: (view: SelectorView) => void;
  language: 'vi' | 'en' | 'ja';
  cardAvatarUrl: string;
}

export const CardIntro: React.FC<CardIntroProps> = ({ onNavigate, language, cardAvatarUrl }) => {
  const [headerPreviewType, setHeaderPreviewType] = useState<HeaderPreviewType | null>(null);

  const { fetchEntries: fetchGuestbookEntries } = useGuestbookStore();
  const { fetchPlaylists: fetchSpotifyPlaylists } = useSpotifyStore();
  
  useEffect(() => {
    if (headerPreviewType === 'guestbook') fetchGuestbookEntries();
    if (headerPreviewType === 'spotifyPlaylists') fetchSpotifyPlaylists();
  }, [headerPreviewType, fetchGuestbookEntries, fetchSpotifyPlaylists]);

  const handleCardClick = (view: SelectorView) => {
    logInteraction(`navigate_to_${view}`, { language });
    onNavigate(view);
  };
  
  const handleDockHover = (type: HeaderPreviewType | null) => {
    setHeaderPreviewType(type);
    if(type) logInteraction(`hover_dock_item`, { item: type, language });
  };
  
  const cardIntroAvatarDelay = 0;
  const cardIntroDivider1Delay = cardIntroAvatarDelay + 0.4;
  const cardIntroNameDisplayDelay = 0.05;
  const cardIntroTitleDisplayDelay = cardIntroNameDisplayDelay + 0.15;
  const cardIntroTaglineDisplayDelay = cardIntroTitleDisplayDelay + 0.15;
  const cardIntroDivider2Delay = cardIntroTaglineDisplayDelay + 0.4;
  const cardIntroActionsDelay = cardIntroDivider2Delay + 0.1;
  const headerContentBlockDelay = 0.05;
  
  const cardIntroActionButtons: {
    type: HeaderPreviewType;
    iconKey: CardIntroIconKey;
    textKey: MainCardIntroButtonTextKey;
  }[] = [
    { type: 'about', iconKey: 'aboutIconSvg', textKey: 'aboutButton' },
    { type: 'gallery', iconKey: 'galleryIconSvg', textKey: 'galleryButton' },
    { type: 'blog', iconKey: 'blogIconSvg', textKey: 'blogButton' },
    { type: 'guestbook', iconKey: 'guestbookIconSvg', textKey: 'guestbookButton' },
    { type: 'spotifyPlaylists', iconKey: 'spotifyIconSvg', textKey: 'spotifyButton' },
  ];

  return (
    <motion.div key="card-intro-content" className="content-section card-intro-section-modifier" initial={false} animate="visible">
      <motion.div className="card-intro-header" variants={cardIntroHeaderVariants} initial="hidden" animate="visible" exit="exit" layout transition={layoutTransition}>
        
        <motion.div className="card-intro-avatar-wrapper" whileHover="hover" initial="rest" variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
          <motion.img
            src={cardAvatarUrl}
            alt={`${cardDisplayInfo.name[language]}'s avatar`}
            className="card-intro-avatar"
            initial={{ scale: 0.1, opacity: 0, rotate: -60, y: 50, filter: "blur(10px) brightness(0.5)" }}
            animate={{ scale: 1, opacity: 1, rotate: [-30, 15, -8, 5, 0], y: 0, filter: "blur(0px) brightness(1)", boxShadow: "0 0 45px 8px rgba(var(--highlight-color-poetic-rgb),0.7)", transition: { type: "spring", stiffness: 100, damping: 15, duration: 1, delay: cardIntroAvatarDelay } }}
            exit={{ scale: 0.2, opacity: 0, rotate: 30, y: -30, filter: "blur(8px)", transition: { duration: 0.25, ease: "anticipate" } }}
          />
          {[...Array(numSparkles)].map((_, i) => (
            <motion.div key={`sparkle-avatar-${i}`} className="sparkle-element avatar-sparkle" custom={i} variants={sparkleVariants} initial="initial" animate="animate" />
          ))}
        </motion.div>
        
        <motion.div className="poetic-divider poetic-divider-horizontal card-intro-first-divider" variants={dividerHorizontalVariants(cardIntroDivider1Delay)} initial="hidden" animate="visible" exit="exit"><div className="divider-line"></div></motion.div>
        
        <motion.div className="card-intro-header-swappable-content" layout transition={layoutTransition}>
          <AnimatePresence mode="wait">
            {headerPreviewType ? (
              <motion.div key={`header-preview-${headerPreviewType}`} className="header-preview-container" variants={previewContainerVariants} initial="initial" animate="animate" exit="exit" whileHover="hover">
                  <motion.h4 className="header-preview-title" variants={contentItemVariants(0)}>
                      {headerPreviewType==='about' ? languageSelectorPreviewTranslations.aboutSnippetTitle[language]
                        :headerPreviewType==='gallery'? languageSelectorPreviewTranslations.gallerySneakPeekTitle[language]
                        :headerPreviewType==='guestbook'? languageSelectorPreviewTranslations.guestbookSneakPeekTitle[language]
                        :headerPreviewType==='spotifyPlaylists'? languageSelectorPreviewTranslations.spotifySneakPeekTitle[language]
                        :headerPreviewType==='blog'? languageSelectorPreviewTranslations.blogSneakPeekTitle[language]
                        : ''}
                  </motion.h4>
                  <motion.div className="header-preview-block-content" variants={contentItemVariants(0.1)} initial="hidden" animate="visible" exit="exit">
                      <span className="header-preview-icon" dangerouslySetInnerHTML={{ __html:
                          headerPreviewType==='about' ? previewIcons.about
                          :headerPreviewType==='gallery' ? previewIcons.gallery
                          :headerPreviewType==='guestbook' ? previewIcons.guestbook
                          :headerPreviewType==='spotifyPlaylists' ? previewIcons.spotify
                          :headerPreviewType==='blog' ? previewIcons.blog
                          : ''
                      }} />
                      <div className="header-preview-actual-content">
                        {headerPreviewType === 'about' && <p className="header-preview-text-enhanced">{languageSelectorPreviewTranslations.aboutSnippetContent[language]}</p>}
                        {headerPreviewType === 'gallery' && (
                          <div className="header-preview-images-enhanced">
                            {(localImages.length > 0 ? localImages.slice(0, 4) : []).map((img, idx) => (
                              <motion.img key={`preview-${idx}`} variants={contentItemVariants(0.1 + idx * 0.08)} src={img} alt={languageSelectorPreviewTranslations.galleryPreviewAlt[language].replace("{index}", String(idx + 1))} />
                            ))}
                          </div>
                        )}
                        {headerPreviewType==='guestbook' && <p className="header-preview-text-enhanced">{languageSelectorPreviewTranslations.guestbookSnippetContent[language]}</p>}
                        {headerPreviewType==='spotifyPlaylists' && <p className="header-preview-text-enhanced">{languageSelectorPreviewTranslations.spotifyPreviewContent[language]}</p>}
                        {headerPreviewType==='blog' && <p className="header-preview-text-enhanced">{languageSelectorPreviewTranslations.blogSnippetContent[language]}</p>}
                      </div>
                  </motion.div>
              </motion.div>
            ) : (
              <motion.div key="header-details" className="header-details-block" variants={contentItemVariants(headerContentBlockDelay)} initial="hidden" animate="visible" exit="exit">
                <motion.h2 className="card-intro-name poetic-glow-effect" variants={cardNameTextVariants(cardIntroNameDisplayDelay)} whileHover="hover" initial="initial" animate="animate" exit="exit">
                  {cardDisplayInfo.name[language]}
                  <span className="text-shine-effect"></span>
                </motion.h2>
                <motion.p className="card-intro-title" initial={{y:20,opacity:0,filter:"blur(2px)"}} animate={{y:0,opacity:1,filter:"blur(0px)",transition:{delay:cardIntroTitleDisplayDelay,duration:0.6,ease:"easeOut"}}} exit={{y:15,opacity:0,filter:"blur(2px)",transition:{duration:0.15}}}>
                  {cardDisplayInfo.title[language]}
                </motion.p>
                <motion.p className="card-intro-tagline" initial={{opacity:0,y:20,letterSpacing:"-0.5px"}} animate={{opacity:1,y:0,letterSpacing:"0.3px",transition:{delay:cardIntroTaglineDisplayDelay,duration:0.7,ease:"circOut"}}} exit={{opacity:0,y:15,transition:{duration:0.2}}}>
                  {cardIntroTranslations.introTagline[language]}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <motion.div className="poetic-divider poetic-divider-horizontal card-intro-second-divider" variants={dividerHorizontalVariants(cardIntroDivider2Delay)} initial="hidden" animate="visible" exit="exit" layout transition={layoutTransition}><div className="divider-line"></div></motion.div>

      <motion.div className="card-intro-actions" variants={contentItemVariants(cardIntroActionsDelay)} initial="hidden" animate="visible" exit="exit" layout transition={layoutTransition}>
        <Dock>
          {cardIntroActionButtons.map((btn) => (
            <DockCard
              key={btn.type}
              onClick={() => handleCardClick(btn.type as SelectorView)}
              onMouseEnter={() => handleDockHover(btn.type)}
              onMouseLeave={() => handleDockHover(null)}
            >
              <span className="button-icon-svg" dangerouslySetInnerHTML={{ __html: cardIntroTranslations[btn.iconKey] as string }} />
            </DockCard>
          ))}
        </Dock>
      </motion.div>
    </motion.div>
  );
};