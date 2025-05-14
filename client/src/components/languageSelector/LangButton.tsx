// client/src/components/languageSelector/LangButton.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  buttonVariants,
  iconVariants,
  textVariants,
  fireflyVariants,
  particleBaseStyle
} from './languageSelector.constants';

interface LangButtonProps {
  onClick: () => void;
  ariaLabel: string;
  icon: string;
  name: string;
  animationDelay: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const LangButton: React.FC<LangButtonProps> = ({
  onClick,
  ariaLabel,
  icon,
  name,
  animationDelay,
  onMouseEnter,
  onMouseLeave
}) => (
  <motion.button
    className="lang-choice-poetic"
    onClick={onClick}
    aria-label={ariaLabel}
    variants={buttonVariants}
    initial="initial"
    animate="animate"
    custom={animationDelay}
    whileHover="hover"
    whileTap="tap"
    exit="exit"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <motion.div
      style={{...particleBaseStyle, width: '4px', height: '4px', backgroundColor: 'rgba(var(--highlight-color-poetic-rgb), 0.7)', boxShadow: "10px 12px 1px rgba(var(--highlight-color-poetic-rgb), 0.2), -8px 15px 2px rgba(var(--highlight-color-poetic-rgb), 0.25)"}}
      variants={fireflyVariants("60%", "35%", "-35px", "-20px", 10, 0.2, 0)}
    />
    <motion.div
      style={{...particleBaseStyle, width: '3px', height: '3px', backgroundColor: 'rgba(var(--primary-color-rgb), 0.6)', boxShadow: "-12px -8px 2px rgba(var(--secondary-color-rgb), 0.25), 18px 10px 1px rgba(var(--highlight-color-poetic-rgb), 0.2)"}}
      variants={fireflyVariants("35%", "65%", "20px", "15px", 12, 0.7, 0.15)}
    />
    <motion.span className="lang-icon-poetic" variants={iconVariants}>
      {icon}
    </motion.span>
    <motion.span className="lang-name-poetic" variants={textVariants}>
      {name}
    </motion.span>
  </motion.button>
);

export default LangButton;