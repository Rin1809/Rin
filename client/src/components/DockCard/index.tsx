import * as React from 'react'
import { animated, useIsomorphicLayoutEffect, useSpringValue } from '@react-spring/web'
import { motion, Variants } from 'framer-motion' // them motion
import { useMousePosition } from '../hooks/useMousePosition'
import { useWindowResize } from '../hooks/useWindowResize'
import { useDock } from '../Dock/DockContext'
import { cardIntroButtonIconVariants } from '../languageSelector/languageSelector.constants'; // them import

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
  const cardRef = React.useRef<HTMLButtonElement>(null!)
  const [elCenterX, setElCenterX] = React.useState<number>(0)
  const [isHovered, setIsHovered] = React.useState(false);

  const size = useSpringValue(INITIAL_WIDTH, {
    config: { mass: 0.1, tension: 320 },
  })
  const y = useSpringValue(0, {
    config: { friction: 29, tension: 238 },
  })

  const dock = useDock()

  const recalculateCenterX = React.useCallback(() => {
    if (cardRef.current) {
      const { x, width } = cardRef.current.getBoundingClientRect()
      setElCenterX(x + width / 2)
    }
  }, []);

  useWindowResize(recalculateCenterX);

  useIsomorphicLayoutEffect(() => {
    recalculateCenterX();
  }, [recalculateCenterX, dock.width]);


  useMousePosition(
    {
      onChange: ({ value }) => {
        const mouseX = value.x
        if (dock.width > 0 && dock.hovered) {
          const DOCK_CARD_GROW_MULTIPLIER = 32;
          const transformedValue =
            INITIAL_WIDTH +
            DOCK_CARD_GROW_MULTIPLIER * Math.cos((((mouseX - elCenterX) / dock.width) * Math.PI) / 2) ** 12;

          size.start(transformedValue)
        }
      },
    },
    [elCenterX, dock.width, dock.hovered, size]
  )

  useIsomorphicLayoutEffect(() => {
    if (!dock.hovered) {
      size.start(INITIAL_WIDTH)
    }
  }, [dock.hovered, size])

  const handleClick = () => {
    onClick();
    y.start(-INITIAL_WIDTH / 4, {
        onRest: () => y.start(0),
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
      <animated.button
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
      </animated.button>
    </motion.div>
  )
}