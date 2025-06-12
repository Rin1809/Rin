// client/src/components/LanguageChoiceScreen.tsx
import React from 'react';
import { motion } from 'framer-motion';
import LangButton from './languageSelector/LangButton';
import {
    translations,
    contentItemVariants,
    titleVariants,
    dividerVerticalVariants,
    dividerHorizontalVariants,
} from './languageSelector/languageSelector.constants';

interface LanguageChoiceScreenProps {
  onLanguageSelect: (lang: 'vi' | 'en' | 'ja') => void;
  onHoverLanguage: (lang: 'vi' | 'en' | 'ja') => void;
  onLeaveHoverLanguage: () => void;
  displayTextLanguage: 'vi' | 'en' | 'ja';
  isInitialMount: boolean;
}

// cac delay cho animation
const initialMountTitleDelay = 0.5;
const initialMountSubtitleDelay = initialMountTitleDelay + 0.3;
const initialMountButton1Delay = initialMountSubtitleDelay + 0.4;
const initialMountDivider1Delay = initialMountButton1Delay + 0.1;
const initialMountButton2Delay = initialMountDivider1Delay + 0.2;
const initialMountDivider2Delay = initialMountButton2Delay + 0.1;
const initialMountButton3Delay = initialMountDivider2Delay + 0.2;
const initialMountFooterNoteDelay = initialMountButton3Delay + 0.4;

export const LanguageChoiceScreen: React.FC<LanguageChoiceScreenProps> = ({
  onLanguageSelect,
  onHoverLanguage,
  onLeaveHoverLanguage,
  displayTextLanguage,
  isInitialMount
}) => (
    <motion.div
      key="lang-options-content"
      className="content-section"
    >
      <motion.h2
        key={`title-${displayTextLanguage}`}
        className="poetic-title"
        variants={titleVariants(isInitialMount ? initialMountTitleDelay : 0.05)}
        initial="hidden" animate="visible" exit="exit"
      >
        {translations.title[displayTextLanguage]}
      </motion.h2>

      <motion.p
        key={`subtitle-${displayTextLanguage}`}
        className="poetic-subtitle"
        variants={contentItemVariants(isInitialMount ? initialMountSubtitleDelay : 0.1)}
        initial="hidden" animate="visible" exit="exit"
      >
        {translations.subtitle[displayTextLanguage]}
      </motion.p>

      <motion.div className="language-options-poetic">
        <LangButton
          onClick={() => onLanguageSelect('vi')}
          ariaLabel="Chọn TV"
          icon="🇻🇳"
          name="Tiếng Việt"
          animationDelay={isInitialMount ? initialMountButton1Delay : 0.15}
          onMouseEnter={() => onHoverLanguage('vi')}
          onMouseLeave={onLeaveHoverLanguage}
        />
        <motion.div className="poetic-divider poetic-divider-vertical" variants={dividerVerticalVariants(isInitialMount ? initialMountDivider1Delay : 0.2)} initial="hidden" animate="visible" exit="exit" />
        <motion.div className="poetic-divider poetic-divider-horizontal" variants={dividerHorizontalVariants(isInitialMount ? initialMountDivider1Delay : 0.2)} initial="hidden" animate="visible" exit="exit" />

        <LangButton
          onClick={() => onLanguageSelect('en')}
          ariaLabel="Choose EN"
          icon="🇬🇧"
          name="English"
          animationDelay={isInitialMount ? initialMountButton2Delay : 0.25}
          onMouseEnter={() => onHoverLanguage('en')}
          onMouseLeave={onLeaveHoverLanguage}
        />
        <motion.div className="poetic-divider poetic-divider-vertical" variants={dividerVerticalVariants(isInitialMount ? initialMountDivider2Delay : 0.3)} initial="hidden" animate="visible" exit="exit" />
        <motion.div className="poetic-divider poetic-divider-horizontal" variants={dividerHorizontalVariants(isInitialMount ? initialMountDivider2Delay : 0.3)} initial="hidden" animate="visible" exit="exit" />

        <LangButton
          onClick={() => onLanguageSelect('ja')}
          ariaLabel="Chọn JP"
          icon="🇯🇵"
          name="日本語"
          animationDelay={isInitialMount ? initialMountButton3Delay : 0.35}
          onMouseEnter={() => onHoverLanguage('ja')}
          onMouseLeave={onLeaveHoverLanguage}
        />
      </motion.div>

      <motion.p
        key={`note-${displayTextLanguage}`}
        className="poetic-footer-note"
        variants={contentItemVariants(isInitialMount ? initialMountFooterNoteDelay : 0.4)}
        initial="hidden" animate="visible" exit="exit"
      >
        {translations.note[displayTextLanguage]}
      </motion.p>
    </motion.div>
);