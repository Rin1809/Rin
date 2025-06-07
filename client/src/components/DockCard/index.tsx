import * as React from 'react';
import { motion, useMotionValue, animate, Variants } from 'framer-motion';
import { useMousePosition } from '../hooks/useMousePosition';
import { useWindowResize } from '../hooks/useWindowResize';
import { useDock } from '../Dock/DockContext';
import { cardIntroButtonIconVariants } from '../languageSelector/languageSelector.constants';

interface DockCardProps {
  children: React.ReactNode;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const INITIAL_WIDTH = 64;

// Dinh nghia variants cho DockCard
const dockCardVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  hover: {
    scale: 1.07,
    y: -8,
    transition: { type: "spring", stiffness: 250, damping: 14 }
  },
  tap: {
    scale: 0.92,
    y: -3,
    backgroundColor: "rgba(var(--highlight-color-poetic-rgb), 0.3)",
    transition: { type: "spring", stiffness: 380, damping: 18 }
  },
};

export const DockCard = ({ children, onClick, onMouseEnter, onMouseLeave }: DockCardProps) => {
  const cardRef = React.useRef<HTMLButtonElement>(null!);
  const [elCenterX, setElCenterX] = React.useState<number>(0);
  const [isHovered, setIsHovered] = React.useState(false);

  // su dung motion value tu framer-motion
  const size = useMotionValue(INITIAL_WIDTH);
  const y = useMotionValue(0);

  const dock = useDock();
  const mousePosition = useMousePosition(); // lay vi tri chuot

  const recalculateCenterX = React.useCallback(() => {
    if (cardRef.current) {
      const { x, width } = cardRef.current.getBoundingClientRect();
      setElCenterX(x + width / 2);
    }
  }, []);

  useWindowResize(recalculateCenterX);
  React.useEffect(recalculateCenterX, [recalculateCenterX, dock.width]);

  // tinh toan lai kich thuoc khi chuot di chuyen
  React.useEffect(() => {
    const mouseX = mousePosition.x;
    if (dock.width > 0 && dock.hovered && mouseX !== null) {
      const DOCK_CARD_GROW_MULTIPLIER = 32;
      const transformedValue =
        INITIAL_WIDTH +
        DOCK_CARD_GROW_MULTIPLIER * Math.cos((((mouseX - elCenterX) / dock.width) * Math.PI) / 2) ** 12;

      animate(size, transformedValue, {
        type: "spring",
        mass: 0.1,
        stiffness: 320,
        damping: 20,
      });
    } else {
      animate(size, INITIAL_WIDTH, {
        type: "spring",
        mass: 0.1,
        stiffness: 320,
        damping: 20,
      });
    }
  }, [mousePosition.x, elCenterX, dock.width, dock.hovered, size]);

  const handleClick = () => {
    onClick();
    // anim nhay len khi click
    animate(y, -INITIAL_WIDTH / 4, {
      type: 'spring',
      stiffness: 400,
      damping: 20,
      onComplete: () => animate(y, 0, { type: 'spring', stiffness: 300, damping: 25 }),
    });
  };

  const handleMouseEnterCombined = () => {
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter();
  };
  const handleMouseLeaveCombined = () => {
    setIsHovered(false);
    if (onMouseLeave) onMouseLeave();
  };

  return (
    <motion.div
        className="dock-item-container"
        onMouseEnter={handleMouseEnterCombined}
        onMouseLeave={handleMouseLeaveCombined}
        variants={dockCardVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
    >
      <motion.button
        ref={cardRef}
        className="dock-item"
        onClick={handleClick}
        style={{
          width: size,
          height: size,
          y,
        }}>
         <motion.div
            className="dock-item-content"
            variants={cardIntroButtonIconVariants}
            animate={isHovered ? "hover" : "rest"}
         >
            {children}
         </motion.div>
      </motion.button>
    </motion.div>
  )
}