// client/src/components/languageSelector/languageSelector.constants.ts
import type { ISourceOptions } from "@tsparticles/engine";
import type { Variants } from 'framer-motion';
import React from "react";

export const poeticStarsOptionsDefinition: ISourceOptions = {
    fpsLimit: 120,
    particles: {
        number: {
            value: 500,
            density: { enable: true },
        },
        color: { value: ["#FFFFFF", "#F0E68C", "#ADD8E6", "#FFDAB9"] },
        shape: { type: "star" },
        opacity: {
            value: { min: 0.1, max: 0.6 },
            animation: { enable: true, speed: 0.8, sync: false },
        },
        size: {
            value: { min: 0.5, max: 1.5 },
            animation: { enable: true, speed: 2, sync: false },
        },
        links: { enable: false },
        move: {
            enable: true,
            speed: 0.4,
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "out" },
        },
    },
    interactivity: {
        events: {
            onHover: { enable: false },
            onClick: { enable: false },
            resize: { enable: true }
        },
    },
    detectRetina: true,
    style: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
    },
    emitters: [
        {
            name: "leftShootingStars",
            direction: "right",
            rate: { quantity: 1, delay: 0.5 },
            position: { x: 0, y: 50 },
            particles: {
                move: {
                    direction: "right",
                    speed: { min: 15, max: 35 },
                    straight: true,
                    outModes: { default: "destroy" },
                    trail: { enable: true, length: 40, fill: { color: "#ffffff" } },
                },
                opacity: { value: {min: 0.8, max: 1} },
                size: { value: { min: 1.5, max: 3 } },
                shape: { type: "circle" },
                color: { value: "#ffffff" },
                life: { duration: { value: 7 }, count: 0 },
            },
        },
        {
            name: "leftShootingStarsAlternateY",
            direction: "right",
            rate: { quantity: 5, delay: 0.9 },
            position: { x: 0, y: 30 },
            particles: {
                move: {
                    direction: "right",
                    speed: { min: 12, max: 30 },
                    straight: true,
                    outModes: { default: "destroy" },
                    trail: { enable: true, length: 35, fill: { color: "#ffffff" } },
                },
                opacity: { value: {min: 0.7, max: 1} },
                size: { value: { min: 1, max: 2.5 } },
                shape: { type: "circle" },
                color: { value: "#ffffff" },
                life: { duration: { value: 8 }, count: 0 },
            },
        },
         {
            name: "leftShootingStarsHighY",
            direction: "right",
            rate: { quantity: 5, delay: 1.3 },
            position: { x: 0, y: 75 },
            particles: {
                move: {
                    direction: "right",
                    speed: { min: 18, max: 40 },
                    straight: true,
                    outModes: { default: "destroy" },
                    trail: { enable: true, length: 45, fill: { color: "#ffffff" } },
                },
                opacity: { value: {min: 0.8, max: 1} },
                size: { value: { min: 1.5, max: 3.5 } },
                shape: { type: "circle" },
                color: { value: "#ffffff" },
                life: { duration: { value: 6 }, count: 0 },
            },
        }
    ],
};

export const translations = {
  title: {
    vi: "Ngôn Ngữ Yêu Thích",
    en: "Preferred Language",
    ja: "お好みの言語"
  },
  subtitle: {
    vi: "Chọn một dòng chảy cho riêng mình  ",
    en: "Choose your own flow",
    ja: "自分だけの流れを選んでください"
  },
  note: {
    vi: "(Mặc định sẽ là tiếng việt)",
    en: "(Vietnamese is default language)",
    ja: "(ベトナム語はデフォルト語だ)"
  },
};

export const buttonVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 1,
    boxShadow: "0 4px 15px -5px rgba(var(--highlight-color-poetic-rgb), 0.05)",
    borderColor: "rgba(var(--text-color-poetic-rgb), 0.1)",
    backgroundColor: "transparent"
  },
  animate: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.0, // MODIFIED: Was 0.8
      delay: delay,
      ease: [0.23, 1, 0.32, 1]
    }
  }),
  hover: {
    scale: 1.03,
    y: -8,
    backgroundColor: "rgba(var(--highlight-color-poetic-rgb), 0.08)",
    borderColor: "rgba(var(--highlight-color-poetic-rgb), 0.35)",
    boxShadow: "0 8px 28px -6px rgba(var(--highlight-color-poetic-rgb), 0.28), 0 0 15px 0px rgba(var(--text-color-poetic-rgb), 0.12) inset",
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 22,
      duration: 0.3
    }
  },
  tap: {
    scale: 0.97,
    y: -3,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.9,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

export const textVariants: Variants = {
  initial: {
    color: "var(--text-color-poetic)",
    textShadow: "none"
  },
  hover: {
    color: "var(--highlight-color-poetic)",
    textShadow: "0 0 10px rgba(var(--highlight-color-poetic-rgb), 0.4), 0 0 18px rgba(var(--highlight-color-poetic-rgb), 0.3)",
    transition: { duration: 0.25 }
  }
};

export const iconVariants: Variants = {
  initial: {
    scale: 1,
    rotate: 0,
    y: 0,
    textShadow: "none"
  },
  hover: {
    scale: 1.2,
    rotate: -5,
    y: -5,
    textShadow: "0 3px 10px rgba(var(--highlight-color-poetic-rgb), 0.2)",
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 18
    }
  }
};

export const particleBaseStyle: React.CSSProperties = {
  position: 'absolute',
  borderRadius: '50%',
  pointerEvents: 'none'
};

export const fireflyVariants = (
  initialX: string, initialY: string, hoverX: string, hoverY: string,
  floatDuration: number, floatDelay: number = 0, sparkleDelay: number = 0
): Variants => ({
  initial: { x: initialX, y: initialY, scale: [0.8,0.9,1,0.95,0.85,0.8], opacity: [0.3,0.5,0.6,0.45,0.35,0.3], translateX: [0,8,-10,5,-12,3,0], translateY: [0,-12,5,10,-8,6,0], transition: { translateX: {repeat:Infinity,duration:floatDuration,ease:"easeInOut",delay:floatDelay}, translateY: {repeat:Infinity,duration:floatDuration,ease:"easeInOut",delay:floatDelay+(floatDuration/3)}, scale: {repeat:Infinity,duration:floatDuration,ease:"easeInOut",delay:floatDelay}, opacity: {repeat:Infinity,duration:floatDuration,ease:"easeInOut",delay:floatDelay}}},
  hover: { x: hoverX, y: hoverY, scale: 1.35, opacity: [0.9,0.6,1.0,0.7,0.9], boxShadow: ["0 0 3px 1px rgba(var(--highlight-color-poetic-rgb),0.7),0 0 6px 2px rgba(var(--highlight-color-poetic-rgb),0.5)","0 0 5px 2px rgba(var(--highlight-color-poetic-rgb),0.9),0 0 10px 4px rgba(var(--highlight-color-poetic-rgb),0.6)","0 0 2px 1px rgba(var(--highlight-color-poetic-rgb),0.6),0 0 5px 2px rgba(var(--highlight-color-poetic-rgb),0.4)","0 0 6px 3px rgba(var(--highlight-color-poetic-rgb),1.0),0 0 12px 5px rgba(var(--highlight-color-poetic-rgb),0.7)","0 0 3px 1px rgba(var(--highlight-color-poetic-rgb),0.7),0 0 6px 2px rgba(var(--highlight-color-poetic-rgb),0.5)"], transition: { x:{type:"spring",stiffness:180,damping:18,delay:sparkleDelay}, y:{type:"spring",stiffness:180,damping:18,delay:sparkleDelay}, scale:{type:"spring",stiffness:180,damping:18,delay:sparkleDelay}, opacity:{repeat:Infinity,duration:2.5,ease:"easeInOut",delay:sparkleDelay}, boxShadow:{repeat:Infinity,duration:2.5,ease:"easeInOut",delay:sparkleDelay}}}
});

export const contentItemVariants = (delay: number): Variants => ({
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8, // MODIFIED: Was 0.6
      delay,
      ease: [0.23, 1, 0.32, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
});

export const titleInitialTextShadow = "0 0 5px rgba(var(--highlight-color-poetic-rgb), 0.1)";
export const titleIdleTextShadowStart = "0 0 20px rgba(var(--highlight-color-poetic-rgb), 0.5), 0 0 35px rgba(var(--highlight-color-poetic-rgb), 0.2)";
export const titleIdleTextShadowMid = "0 0 28px rgba(var(--highlight-color-poetic-rgb), 0.7), 0 0 50px rgba(var(--highlight-color-poetic-rgb), 0.35)";

export const titleVariants = (delay: number): Variants => ({
  hidden: {
    opacity: 0,
    y: 30,
    textShadow: titleInitialTextShadow
  },
  visible: {
    opacity: 1,
    y: 0,
    textShadow: [
      titleIdleTextShadowStart,
      titleIdleTextShadowMid,
      titleIdleTextShadowStart
    ],
    transition: {
      opacity: { duration: 1.0, delay, ease: [0.23, 1, 0.32, 1] }, // MODIFIED: Was 0.8
      y: { duration: 1.0, delay, ease: [0.23, 1, 0.32, 1] }, // MODIFIED: Was 0.8
      textShadow: { duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: delay + 0.5 }
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    textShadow: titleInitialTextShadow,
    transition: { duration: 0.2, ease: "easeIn" }
  }
});

export const baseFlourishVisibleFilterKeyframes = [
    "drop-shadow(0 0 15px rgba(var(--highlight-color-poetic-rgb), 0.4))",
    "drop-shadow(0 0 25px rgba(var(--highlight-color-poetic-rgb), 0.6))",
    "drop-shadow(0 0 15px rgba(var(--highlight-color-poetic-rgb), 0.4))"
];

export const flourishVariantsDefinition = (initialRotate: number = 0): Variants => ({
    hidden: {
        opacity: 0,
        y: -40, // Start 40px above its local origin (for top: comes from top; for bottom after 180deg rotation: comes from bottom)
        scale: 0.8,
        rotate: initialRotate,
        filter: "drop-shadow(0 0 0px transparent)"
    },
    visibleBase: {
        opacity: 0.85,
        rotate: initialRotate,
        y: 0,
        // filter: baseFlourishVisibleFilterKeyframes[0], // Removed as per diff logic, loop will apply it
    },
    hover: (custom: { baseScale: number }) => ({
        y: initialRotate === 0 ? -12 : 12,
        scale: (custom?.baseScale || 1) * 1.05,
        filter: "drop-shadow(0 0 30px rgba(var(--highlight-color-poetic-rgb), 0.75)) drop-shadow(0 0 15px rgba(var(--highlight-color-poetic-rgb), 0.5))",
        transition: { type: "spring", stiffness: 300, damping: 22, mass: 0.8 }
    })
});

// Define SHARED_FLOURISH_SPRING_TRANSITION here for slower animation
export const SHARED_FLOURISH_SPRING_TRANSITION = {
    type: "spring", stiffness: 120, damping: 28, mass: 1.2
};

export const createFlourishLoopAnimation = (initialRotate: number) => ({
    y: initialRotate === 0 ? [0, -7, 0] : [0, 7, 0],
    filter: baseFlourishVisibleFilterKeyframes,
    transition: {
        y: { duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
        filter: { duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
    }
});

export const layoutTransition = { duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] };

export const dividerVariants = (delay: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, delay: delay, ease: "easeOut" } // MODIFIED: Was 0.6
  },
  exit: {
      opacity: 0,
      transition: { duration: 0.2, ease: "easeIn"}
  }
});

export const dividerVerticalVariants = (delay: number): Variants => ({
  hidden: { ...dividerVariants(delay).hidden, scaleY: 0 },
  visible: { ...dividerVariants(delay).visible, scaleY: 1 },
  exit: { ...dividerVariants(delay).exit, scaleY: 0}
});

export const dividerHorizontalVariants = (delay: number): Variants => ({
  hidden: { ...dividerVariants(delay).hidden, scaleX: 0 },
  visible: { ...dividerVariants(delay).visible, scaleX: 1 },
  exit: { ...dividerVariants(delay).exit, scaleX: 0}
});

export const cardIntroTranslations = {
  aboutButton: { vi: "Về tôi", en: "About Me", ja: "私について" },
  galleryButton: { vi: "Bộ sưu tập", en: "Gallery", ja: "ギャラリー" },
  guestbookButton: { vi: "Sổ Lưu Bút", en: "Guestbook", ja: "感想ノート" }, // MODIFIED/NEW
  introTagline: {
      vi: "Chào mừng đến với thế giới của tui !",
      en: "Welcome to my world!",
      ja: "アタシの世界へよこそう！ "
  },
  aboutIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  galleryIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
  guestbookIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"></path><path d="M12 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"></path><line x1="12" y1="22" x2="12" y2="6"></line></svg>`, // NEW - Placeholder SVG for Guestbook button
  backButton: { vi: "Quay Lại", en: "Back", ja: "戻る" },
};

export const cardIntroButtonIconVariants: Variants = {
  rest: {
    x: 0, scale: 1, opacity: 0.85,
    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  hover: {
    x: -4, scale: 1.15, opacity: 1, rotate: -5,
    filter: "drop-shadow(0 3px 5px rgba(var(--highlight-color-poetic-rgb),0.3))",
    transition: { type: "spring", stiffness: 350, damping: 12 }
  },
  tap: {
    scale: 0.9, rotate: 5,
    transition: { type: "spring", stiffness: 400, damping: 15 }
  }
};

export const cardIntroButtonVariants: Variants = {
  initial: { opacity: 0, y: 40, scale: 0.8 },
  animate: (delay: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1], type: "spring", stiffness: 120, damping: 15 }
  }),
  hover: {
    scale: 1.07,
    y: -8,
    borderColor: "rgba(var(--highlight-color-poetic-rgb), 0.75)",
    boxShadow: `
      0 10px 30px -8px rgba(var(--highlight-color-poetic-rgb), 0.45),
      0 0 20px rgba(var(--highlight-color-poetic-rgb), 0.3) inset,
      0 0 35px 8px rgba(var(--highlight-color-poetic-rgb), 0.2)
    `,
    transition: { type: "spring", stiffness: 250, damping: 14 }
  },
  tap: {
    scale: 0.92,
    y: -3,
    backgroundColor: "rgba(var(--highlight-color-poetic-rgb), 0.3)",
    boxShadow: `
      0 5px 18px -6px rgba(var(--highlight-color-poetic-rgb), 0.35),
      0 0 12px rgba(var(--highlight-color-poetic-rgb), 0.25) inset
    `,
    transition: { type: "spring", stiffness: 380, damping: 18 }
  },
  exit: { opacity: 0, y: 30, scale: 0.85, transition: { duration: 0.35, ease: "easeIn" } }
};

export const cardNameTextVariants = (delayValue: number = 0.05): Variants => ({
  initial: { y: 20, opacity: 0, scale: 0.85, filter: "blur(4px)" },
  animate: {
    y: 0, opacity: 1, scale: 1,
    filter: [
      "blur(0px) drop-shadow(0 0 10px rgba(var(--highlight-color-poetic-rgb), 0.4)) drop-shadow(0 0 18px rgba(var(--highlight-color-poetic-rgb), 0.25))",
      "blur(0px) drop-shadow(0 0 14px rgba(var(--highlight-color-poetic-rgb), 0.6)) drop-shadow(0 0 25px rgba(var(--highlight-color-poetic-rgb), 0.35))",
      "blur(0px) drop-shadow(0 0 10px rgba(var(--highlight-color-poetic-rgb), 0.4)) drop-shadow(0 0 18px rgba(var(--highlight-color-poetic-rgb), 0.25))"
    ],
    transition: {
      y: { delay: delayValue, duration: 0.7, ease: [0.23, 1, 0.32, 1] },
      opacity: { delay: delayValue, duration: 0.7, ease: [0.23, 1, 0.32, 1] },
      scale: { delay: delayValue, duration: 0.7, ease: [0.23, 1, 0.32, 1] },
      filter: { duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: delayValue + 0.7 }
    }
  },
  hover: {
    scale: 1.04,
    transition: { type: "spring", stiffness: 280, damping: 10 }
  },
  exit: { y: 15, opacity: 0, filter: "blur(3px)", transition: { duration: 0.2 } }
});

export const sparkleVariants: Variants = {
  initial: (i: number) => ({
    opacity: 0,
    scale: 0,
    x: Math.random() * 60 - 30,
    y: Math.random() * 40 - 20,
    delay: i * 0.3 + Math.random() * 1
  }),
  animate: (i: number) => ({
    opacity: [0, 0.3 + Math.random() * 0.4, 0],
    scale: [0, 0.6 + Math.random() * 0.6, 0],
    x: Math.random() * 100 - 50,
    y: Math.random() * 80 - 40,
    rotate: Math.random() * 360,
    transition: {
      duration: 2 + Math.random() * 2,
      repeat: Infinity,
      repeatType: "loop",
      delay: i * 0.3 + Math.random() * 1,
      ease: "linear"
    }
  })
};

export const numSparkles = 5;

export const overlayEntryExitVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }, // MODIFIED: Was 0.5
    exit: { opacity: 0, transition: { duration: 0.4, ease: "easeIn" } }
};

export const cardIntroHeaderVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.85 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: {
        duration: 0.7, delay: 0,
        staggerChildren: 0
      }
    },
    exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.25, ease: "easeIn" } }
};

export const previewContainerVariants: Variants = {
  initial: { opacity: 0, y: 15, scale: 0.97, marginTop: "0rem" },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    marginTop: "0.8rem",
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 28,
      when: "beforeChildren",
      staggerChildren: 0.07
    }
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.97,
    marginTop: "0rem",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  },
  hover: {
    y: -4,
    boxShadow: "0 10px 35px -10px rgba(var(--highlight-color-poetic-rgb), 0.35), 0 0 10px rgba(var(--highlight-color-poetic-rgb), 0.1) inset",
    transition: { type: "spring", stiffness: 320, damping: 20 }
  }
};

export const previewContentItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { type: "spring", stiffness: 320, damping: 20 }
  }
};

export const previewIcons = {
  about: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  gallery: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
  guestbook: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"></path><path d="M12 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"></path><line x1="12" y1="22" x2="12" y2="6"></line></svg>`, // NEW - Placeholder SVG for Guestbook preview
};

export const galleryViewVariants = (delay: number = 0.1): Variants => ({
    hidden: {
        opacity: 0,
        scale: 0.6,
        filter: "blur(15px) saturate(0.3)",
    },
    visible: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px) saturate(1) brightness(1)",
        transition: {
            type: "spring",
            stiffness: 130,
            damping: 20,
            mass: 1,
            delay,
            opacity: { duration: 0.5, ease: "circOut", delay },
            scale: { type: "spring", stiffness: 130, damping: 20, delay },
            filter: { duration: 0.6, ease: [0.25, 1, 0.5, 1], delay: delay + 0.1 },
        }
    },
    exit: {
        opacity: 0,
        scale: 0.7,
        filter: "blur(12px) saturate(0.5)",
        transition: {
            duration: 0.35,
            ease: "anticipate",
            opacity: { duration: 0.3, ease: "easeIn"},
        }
    }
});

export const aboutNavIconLeft = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
export const aboutNavIconRight = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

// For PersonalCard component (about section)
export const personalCardTranslations = {
  sectionTitles: {
    intro: { vi: "Giới Thiệu Bản Thân", en: "Introduction", ja: "自己紹介" },
    github: { vi: "Thống kê GitHub", en: "GitHub Statistics", ja: "GitHub統計" },
    githubStatsIi: { vi: "Thống kê GitHub II", en: "GitHub Statistics II", ja: "GitHub統計 II" },
    githubStatsIii: { vi: "Thống kê GitHub III", en: "GitHub Statistics III", ja: "GitHub統計 III" },
    discordPresence: { vi: "Trạng thái Discord", en: "Discord Presence", ja: "Discordステータス" },
    socials: { vi: "Mạng xã hội", en: "Social Media", ja: "ソーシャルメディア" },
    tiktokStats: { vi: "Thống kê TikTok", en: "TikTok Statistics", ja: "TikTok統計" },
    youtubeStats: { vi: "Thống kê YouTube", en: "YouTube Statistics", ja: "YouTube統計" },
  },
  introBio: {
    namePlaceholder: "{name}", // Main name for the card (e.g., Rin)
    part1: {
      vi: `Chào ! Mình là <strong>{name}</strong>, đang theo học ngành An Ninh Mạng.`,
      en: `Hi! I'm <strong>{name}</strong>, currently studying Cyber Security.`,
      ja: `こんにちは！<strong>{name}</strong>です。サイバーセキュリティを勉強しています。`
    },
    part2: {
      vi: `Mình thích mèo, thích vẽ, thích hát, ghét An Ninh Mạng.`,
      en: `I like cats, drawing, singing, and dislike Cyber Security.`,
      ja: `猫が好き、絵を描くのが好き、歌うのが好き、サイバーセキュリティは嫌いです。`
    },
    part3: {
      vi: `Mình chỉ có 1 điều ước nhỏ nhoi là...`,
      en: `I have just one small wish...`,
      ja: `たった一つの小さな願いがあります。。。`
    },
    part4: {
      vi: `ước gì có 100 tỷ....`,
      en: `to have 100 billion....`,
      ja: `1000億あったらなぁ。。。`
    },
    part5: {
      vi: `Thì sao? đang đánh giá đó hả? ai mà chả có ước mơ ....?`,
      en: `So what? Judging me? Doesn't everyone have dreams....?`,
      ja: `だから何？評価してるの？誰だって夢くらいあるでしょう。。。？`
    }
  },
  loadingText: {
    vi: "Đang dệt những vì sao từ vũ trụ...",
    en: "Weaving stars from the cosmos...",
    ja: "宇宙から星を紡いでいます..."
  },
  errorTextPrefix: {
    vi: "Lỗi: ",
    en: "Error: ",
    ja: "エラー: "
  },
  githubUserBioDefault: {
    vi: "Không có mô tả.",
    en: "No bio provided.",
    ja: "紹介文はありません。"
  },
  socialLinks: {
    github: { vi: "Ghé thăm GitHub", en: "Visit GitHub", ja: "GitHubを見る" },
    tiktok: { vi: "Xem TikTok", en: "Watch TikTok", ja: "TikTokを見る" },
    discordProfile: { vi: "Hồ sơ Discord", en: "Discord Profile", ja: "Discordプロフィール" },
    discordServer: { vi: "Máy chủ Discord", en: "Discord Server", ja: "Discordサーバー" },
    youtube: { vi: "Kênh YouTube", en: "YouTube Channel", ja: "YouTubeチャンネル" }
  },
  githubLabels: { // Kept for consistency if needed for GitHub API section specifically
    followers: { vi: "Người theo dõi", en: "Followers", ja: "フォロワー" },
    publicRepos: { vi: "Kho lưu trữ", en: "Public Repos", ja: "公開リポジトリ" },
    profileLink: { vi: "Xem trên GitHub", en: "View on GitHub", ja: "GitHubで表示" },
  },
  tiktokLabels: {
    name: { vi: "Tên TikTok", en: "TikTok Name", ja: "TikTok名" },
    following: { vi: "Đang theo dõi", en: "Following", ja: "フォロー中" },
    followers: { vi: "Người theo dõi", en: "Followers", ja: "フォロワー" },
    likes: { vi: "Lượt thích", en: "Likes", ja: "いいね" },
    description: { vi: "Mô tả", en: "Description", ja: "説明" },
    profileLink: { vi: "Xem trên TikTok", en: "View on TikTok", ja: "TikTokで表示" },
  },
  youtubeLabels: {
    name: { vi: "Tên YouTube", en: "YouTube Name", ja: "YouTube名" },
    subscribers: { vi: "Người đăng ký", en: "Subscribers", ja: "チャンネル登録者" },
    joinedDate: { vi: "Ngày tham gia", en: "Joined Date", ja: "参加日" },
    description: { vi: "Mô tả kênh", en: "Channel Description", ja: "チャンネル概要" },
    profileLink: { vi: "Xem trên YouTube", en: "View on YouTube", ja: "YouTubeで表示" },
  }
};

// For LanguageSelector's card intro preview
export const languageSelectorPreviewTranslations = {
  aboutSnippetTitle: { vi: "Giới thiệu sơ lược", en: "About Me Snippet", ja: "自己紹介（概要）" },
  gallerySneakPeekTitle: { vi: "Xem trước bộ sưu tập", en: "Gallery Sneak Peek", ja: "ギャラリー予告編" },
  guestbookSneakPeekTitle: { vi: "Góc Cảm Xúc", en: "Corner of Feelings", ja: "思いのコーナー" }, // MODIFIED/NEW
  aboutSnippetContent: {
    vi: "Chào ! Mình là Rin,...ừm, là Rin, hết rồi đó? mong chờ gì?",
    en: "Hi! I'm Rin,... well, just Rin, that's it? What were you expecting?",
    ja: "こんにちは！リンです。えっと、リンです、それだけ？何を期待してたの？"
  },
  galleryPreviewAlt: { vi: "Xem trước bộ sưu tập {index}", en: "Gallery preview {index}", ja: "ギャラリープレビュー {index}" },
  guestbookSnippetContent: { // NEW
    vi: "Những dòng nhắn gửi, khoảnh khắc được sẻ chia và lưu giữ...",
    en: "Shared moments, treasured words, all kept here...",
    ja: "共有された瞬間、大切な言葉、すべてここに保管されています。。。"
  }
};

// For Gallery component
export const galleryTranslations = {
  title: { vi: "Bộ Sưu Tập Của Tôi", en: "My Gallery", ja: "私のギャラリー" },
  placeholder: {
    line1: { vi: "Không tìm thấy ảnh nào để hiển thị.", en: "No images found to display.", ja: "表示する画像が見つかりません。" },
    line2: { vi: "Vui lòng thêm ảnh vào thư mục `src/assets/gallery_images/`.", en: "Please add images to the `src/assets/gallery_images/` folder.", ja: "`src/assets/gallery_images/` フォルダに画像を追加してください。" },
  },
  navPrev: { vi: "Ảnh trước", en: "Previous image", ja: "前の画像" },
  navNext: { vi: "Ảnh kế", en: "Next image", ja: "次の画像" },
  viewLarger: { vi: "Xem ảnh {index} lớn hơn", en: "View image {index} larger", ja: "画像 {index} を拡大表示" },
  closeLightbox: { vi: "Đóng (Esc)", en: "Close (Esc)", ja: "閉じる (Esc)" },
  downloadImage: { vi: "Tải ảnh", en: "Download image", ja: "画像をダウンロード" },
  fullscreenEnter: { vi: "Toàn màn hình (F)", en: "Enter fullscreen (F)", ja: "フルスクリーン (F)" },
  fullscreenExit: { vi: "Thoát toàn màn hình (F)", en: "Exit fullscreen (F)", ja: "フルスクリーン終了 (F)" },
};

// For card name and title displayed in LanguageSelector
export const cardDisplayInfo = {
    name: { vi: "Rin", en: "Rin", ja: "リン" },
    title: {
        vi: "Sinh viên IT | An Ninh Mạng",
        en: "IT Student | Cyber Security",
        ja: "情報技術学生 | サイバーセキュリティ"
    }
};

//  For Guestbook view
export const guestbookViewTranslations = {
  title: { vi: "Sổ Lưu Bút Cảm Xúc", en: "Guestbook of Thoughts", ja: "ゲストブック・思いの記録" },
  formTitle: { vi: "Để lại lời nhắn của bạn", en: "Leave Your Message", ja: "メッセージを残してください" },
  nameLabel: { vi: "Tên của bạn (Nhà lữ hành)", en: "Your Name (Fellow Traveler)", ja: "お名前（旅人さん）" },
  namePlaceholder: { vi: "vd: Lãng khách ẩn danh...", en: "e.g., A Mysterious Wanderer...", ja: "例：名無しの風来坊。。。" },
  messageLabel: { vi: "Đôi dòng cảm nghĩ...", en: "Your thoughts here...", ja: "ご感想をどうぞ。。。" },
  messagePlaceholder: { vi: "Nơi này thật đẹp và bình yên...", en: "This place is beautiful and peaceful...", ja: "この場所は美しくて穏やかですね。。。" },
  submitButton: { vi: "Gửi Cảm Nghĩ", en: "Post Your Thought", ja: "感想を投稿する" },
  submittingText: { vi: "Đang gửi...", en: "Submitting...", ja: "送信中。。。" },
  
  promptWrite: { // NEW
    vi: "Bạn muốn chia sẻ đôi dòng tâm tình với Rin hong? ✨ <br/>Cảm ơn vì đã ghé thăm, ghi lại sự hiện diện của bạn tại đây nhé!",
    en: "Want to share some thoughts with Rin? ✨ <br/>Thanks for visiting, feel free to leave your mark!",
    ja: "リンに何か思いを伝えたいですか？ ✨ <br/>ご訪問ありがとうございます。あなたの足跡をここに記しませんか。"
  },
  writeButtonLabel: { vi: "Để lại lời nhắn", en: "Leave a Note", ja: "メッセージを書く" }, // NEW
  cancelButton: { vi: "Hủy bỏ", en: "Cancel", ja: "キャンセル" }, // NEW

  noEntries: {
    vi: "Chưa có ai để lại cảm nghĩ. Hãy là người đầu tiên chia sẻ nhé!",
    en: "No thoughts have been shared yet. Be the first one!",
    ja: "まだ感想はありません。最初の想いを綴りませんか？"
  },
  entryBy: { vi: "Lời nhắn từ", en: "A thought from", ja: "からのメッセージ" }, 
  entryDatePrefix: { vi: "Vào lúc", en: "On", ja: "記録日：" }
};


// Variant for Guestbook main container
export const guestbookViewContainerVariants = (delay: number = 0.1): Variants => ({ // Keep this variant here
    hidden: { opacity: 0, scale: 0.85, y: 50, filter: "blur(8px)" },
    visible: {
        opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
        transition: {
            type: "spring", stiffness: 160, damping: 22, mass: 1,
            delay,
            opacity: { duration: 0.6, ease: "easeOut", delay },
            filter: { duration: 0.5, ease: "easeOut", delay: delay + 0.1 }
        }
    },
    exit: {
        opacity: 0, scale: 0.9, y: 30, filter: "blur(5px)",
        transition: { duration: 0.3, ease: "anticipate" }
    }
});

// --- NEW GUESTBOOK ICONS ---
export const guestbookIconFeatherPen = `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.7_3.3a1 1 0 0 0-1.4 0L2.6 20.1a1 1 0 0 0 0 1.4l.4.4"/><path d="m17.6 6.7 3.1-3.1"/><path d="M2.6 20.1C5.9 19.4 10 18 13 15c2-2 3.3-4.2 4-6.3.4-1.1.6-2.3.5-3.5S17 3.2 16 3.3c-1 .1-2.3.7-3.7 2s-3 3.1-4.2 4.6c-1.9 2.4-3.8 4.6-5.3 6.8"/><path d="M10.7 11.3 2.6 20.1"/><path d="m19.2 5.2.4.4"/></svg>`;

export const guestbookIconInkSplatterCancel = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 20.5C6 20 4 17 4 12A8 8 0 0 1 12 4c5 0 7 2.5 7.5 7.5"/><path d="m18 18-5.5-5.5"/><path d="m12.5 18-5.5-5.5"/><path d="M4.5 10C5.7 9.3 6.5 8.2 7 7"/><path d="M7.5 3.5C9 4.2 10.8 5.1 11.5 6.5"/><circle cx="14" cy="5.5" r="0.5" fill="currentColor"/><circle cx="9" cy="3.5" r="0.5" fill="currentColor"/><circle cx="4.5" cy="6" r="0.5" fill="currentColor"/><circle cx="20.5" cy="11" r="0.5" fill="currentColor"/></svg>`;