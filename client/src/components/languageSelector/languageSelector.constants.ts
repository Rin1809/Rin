// client/src/components/languageSelector/languageSelector.constants.ts
import type { ISourceOptions } from "@tsparticles/engine";
import type { Variants } from 'framer-motion';
import React from "react";

// Ktra mobile
const IS_MOBILE_DEVICE = typeof window !== 'undefined' && window.innerWidth < 768;

export const poeticStarsOptionsDefinition: ISourceOptions = {
    fpsLimit: IS_MOBILE_DEVICE ? 45 : 120,
    particles: {
        number: {
            value: IS_MOBILE_DEVICE ? 100 : 500,
            density: { enable: true },
        },
        color: { value: ["#FFFFFF", "#F0E68C", "#ADD8E6", "#FFDAB9"] },
        shape: { type: "star" },
        opacity: {
            value: { min: 0.1, max: IS_MOBILE_DEVICE ? 0.7 : 0.6 },
            animation: { enable: true, speed: IS_MOBILE_DEVICE ? 1.2 : 0.8, sync: false },
        },
        size: {
            value: { min: 0.5, max: IS_MOBILE_DEVICE ? 1.8 : 1.5 },
            animation: { enable: !IS_MOBILE_DEVICE, speed: 2, sync: false },
        },
        links: { enable: false },
        move: {
            enable: true,
            speed: IS_MOBILE_DEVICE ? 0.25 : 0.4,
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
    detectRetina: !IS_MOBILE_DEVICE,
    style: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
    },
    emitters: IS_MOBILE_DEVICE ? [] : [
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
                    trail: { enable: !IS_MOBILE_DEVICE, length: 40, fill: { color: "#ffffff" } },
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
            rate: { quantity: IS_MOBILE_DEVICE ? 1 : 5, delay: 0.9 },
            position: { x: 0, y: 30 },
            particles: {
                move: {
                    direction: "right",
                    speed: { min: 12, max: 30 },
                    straight: true,
                    outModes: { default: "destroy" },
                    trail: { enable: !IS_MOBILE_DEVICE, length: 35, fill: { color: "#ffffff" } },
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
            rate: { quantity: IS_MOBILE_DEVICE ? 1 : 5, delay: 1.3 },
            position: { x: 0, y: 75 },
            particles: {
                move: {
                    direction: "right",
                    speed: { min: 18, max: 40 },
                    straight: true,
                    outModes: { default: "destroy" },
                    trail: { enable: !IS_MOBILE_DEVICE, length: 45, fill: { color: "#ffffff" } },
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
      duration: 1.0,
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
): Variants => {
  const isMobileInternal = typeof window !== 'undefined' && window.innerWidth < 768;
  if (isMobileInternal) {
      return {
          initial: { x: initialX, y: initialY, scale: 0.7, opacity: 0.3 },
          hover: { x: hoverX, y: hoverY, scale: 1, opacity: 0.6, transition: { duration: 0.25, delay: sparkleDelay } }
      };
  }
  return {
    initial: { x: initialX, y: initialY, scale: [0.8,0.9,1,0.95,0.85,0.8], opacity: [0.3,0.5,0.6,0.45,0.35,0.3], translateX: [0,8,-10,5,-12,3,0], translateY: [0,-12,5,10,-8,6,0], transition: { translateX: {repeat:Infinity,duration:floatDuration,ease:"easeInOut",delay:floatDelay}, translateY: {repeat:Infinity,duration:floatDuration,ease:"easeInOut",delay:floatDelay+(floatDuration/3)}, scale: {repeat:Infinity,duration:floatDuration,ease:"easeInOut",delay:floatDelay}, opacity: {repeat:Infinity,duration:floatDuration,ease:"easeInOut",delay:floatDelay}}},
    hover: { x: hoverX, y: hoverY, scale: 1.35, opacity: [0.9,0.6,1.0,0.7,0.9], boxShadow: ["0 0 3px 1px rgba(var(--highlight-color-poetic-rgb),0.7),0 0 6px 2px rgba(var(--highlight-color-poetic-rgb),0.5)","0 0 5px 2px rgba(var(--highlight-color-poetic-rgb),0.9),0 0 10px 4px rgba(var(--highlight-color-poetic-rgb),0.6)","0 0 2px 1px rgba(var(--highlight-color-poetic-rgb),0.6),0 0 5px 2px rgba(var(--highlight-color-poetic-rgb),0.4)","0 0 6px 3px rgba(var(--highlight-color-poetic-rgb),1.0),0 0 12px 5px rgba(var(--highlight-color-poetic-rgb),0.7)","0 0 3px 1px rgba(var(--highlight-color-poetic-rgb),0.7),0 0 6px 2px rgba(var(--highlight-color-poetic-rgb),0.5)"], transition: { x:{type:"spring",stiffness:180,damping:18,delay:sparkleDelay}, y:{type:"spring",stiffness:180,damping:18,delay:sparkleDelay}, scale:{type:"spring",stiffness:180,damping:18,delay:sparkleDelay}, opacity:{repeat:Infinity,duration:2.5,ease:"easeInOut",delay:sparkleDelay}, boxShadow:{repeat:Infinity,duration:2.5,ease:"easeInOut",delay:sparkleDelay}}}
  }
};

export const contentItemVariants = (delay: number): Variants => ({
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
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
    textShadow: IS_MOBILE_DEVICE ? titleInitialTextShadow : [
      titleIdleTextShadowStart,
      titleIdleTextShadowMid,
      titleIdleTextShadowStart
    ],
    transition: {
      opacity: { duration: 1.0, delay, ease: [0.23, 1, 0.32, 1] },
      y: { duration: 1.0, delay, ease: [0.23, 1, 0.32, 1] },
      textShadow: IS_MOBILE_DEVICE ? { duration: 0 } : { duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: delay + 0.5 }
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
        y: -40,
        scale: 0.8,
        rotate: initialRotate,
        filter: "drop-shadow(0 0 0px transparent)"
    },
    visibleBase: {
        opacity: 0.85,
        rotate: initialRotate,
        y: 0,
    },
    hover: (custom: { baseScale: number }) => ({
        y: initialRotate === 0 ? -12 : 12,
        scale: (custom?.baseScale || 1) * (IS_MOBILE_DEVICE ? 1.02 : 1.05),
        filter: IS_MOBILE_DEVICE ? baseFlourishVisibleFilterKeyframes[0] : "drop-shadow(0 0 30px rgba(var(--highlight-color-poetic-rgb), 0.75)) drop-shadow(0 0 15px rgba(var(--highlight-color-poetic-rgb), 0.5))",
        transition: { type: "spring", stiffness: IS_MOBILE_DEVICE ? 320 : 300, damping: IS_MOBILE_DEVICE ? 25 : 22, mass: 0.8 }
    })
});

export const SHARED_FLOURISH_SPRING_TRANSITION = {
    type: "spring", stiffness: 120, damping: 28, mass: 1.2
};

export const createFlourishLoopAnimation = (initialRotate: number) => {
    if (IS_MOBILE_DEVICE) {
        return {
             y: initialRotate === 0 ? 0 : 0,
             filter: baseFlourishVisibleFilterKeyframes[0],
             transition: { duration: 0 }
        };
    }
    return {
        y: initialRotate === 0 ? [0, -7, 0] : [0, 7, 0],
        filter: baseFlourishVisibleFilterKeyframes,
        transition: {
            y: { duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
            filter: { duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
        }
    }
};

export const layoutTransition = { duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] };

export const dividerVariants = (delay: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, delay: delay, ease: "easeOut" }
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
  guestbookButton: { vi: "Sổ Lưu Bút", en: "Guestbook", ja: "感想ノート" },
  spotifyButton: { vi: "Playlist Nhạc", en: "Music Playlists", ja: "音楽プレイリスト" },
  blogButton: { vi: "Blog Cá Nhân", en: "Personal Blog", ja: "個人ブログ" },
  introTagline: {
      vi: "Chào mừng đến với thế giới của tui !",
      en: "Welcome to my world!",
      ja: "アタシの世界へよこそう！ "
  },
  aboutIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  galleryIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
  guestbookIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"></path><path d="M12 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"></path><line x1="12" y1="22" x2="12" y2="6"></line></svg>`,
  spotifyIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
  blogIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`, 
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
    filter: IS_MOBILE_DEVICE ? "blur(0px)" : [
      "blur(0px) drop-shadow(0 0 10px rgba(var(--highlight-color-poetic-rgb), 0.4)) drop-shadow(0 0 18px rgba(var(--highlight-color-poetic-rgb), 0.25))",
      "blur(0px) drop-shadow(0 0 14px rgba(var(--highlight-color-poetic-rgb), 0.6)) drop-shadow(0 0 25px rgba(var(--highlight-color-poetic-rgb), 0.35))",
      "blur(0px) drop-shadow(0 0 10px rgba(var(--highlight-color-poetic-rgb), 0.4)) drop-shadow(0 0 18px rgba(var(--highlight-color-poetic-rgb), 0.25))"
    ],
    transition: {
      y: { delay: delayValue, duration: 0.7, ease: [0.23, 1, 0.32, 1] },
      opacity: { delay: delayValue, duration: 0.7, ease: [0.23, 1, 0.32, 1] },
      scale: { delay: delayValue, duration: 0.7, ease: [0.23, 1, 0.32, 1] },
      filter: IS_MOBILE_DEVICE ? { duration: 0 } : { duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: delayValue + 0.7 }
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

export const numSparkles = IS_MOBILE_DEVICE ? 2 : 5;

export const overlayEntryExitVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
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

export const previewIcons = {
  about: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  gallery: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
  guestbook: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"></path><path d="M12 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"></path><line x1="12" y1="22" x2="12" y2="6"></line></svg>`,
  spotify: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
  blog: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`,
};

export const languageSelectorPreviewTranslations = {
  aboutSnippetTitle: { vi: "Giới thiệu sơ lược", en: "About Me Snippet", ja: "自己紹介（概要）" },
  gallerySneakPeekTitle: { vi: "Xem trước bộ sưu tập", en: "Gallery Sneak Peek", ja: "ギャラリー予告編" },
  guestbookSneakPeekTitle: { vi: "Góc Cảm Xúc", en: "Corner of Feelings", ja: "思いのコーナー" },
  spotifySneakPeekTitle: { vi: "Giai Điệu Yêu Thích", en: "Favorite Tunes", ja: "お気に入りメロディー" },
  blogSneakPeekTitle: { vi: "Bài Viết Mới Nhất", en: "Latest Blog Post", ja: "最新のブログ投稿" }, 
  aboutSnippetContent: {
    vi: "Chào ! Mình là Rin,...ừm, là Rin, hết rồi đó? mong chờ gì?",
    en: "Hi! I'm Rin,... well, just Rin, that's it? What were you expecting?",
    ja: "こんにちは！リンです。えっと、リンです、それだけ？何を期待してたの？"
  },
  galleryPreviewAlt: { vi: "Xem trước bộ sưu tập {index}", en: "Gallery preview {index}", ja: "ギャラリープレビュー {index}" },
  guestbookSnippetContent: {
    vi: "Những dòng nhắn gửi, khoảnh khắc được sẻ chia và lưu giữ...",
    en: "Shared moments, treasured words, all kept here...",
    ja: "共有された瞬間、大切な言葉、すべてここに保管されています。。。"
  },
  spotifyPreviewContent: {
    vi: "Chìm đắm trong những giai điệu tuyệt vời từ Spotify...",
    en: "Immerse yourself in wonderful melodies from Spotify...",
    ja: "Spotifyの素晴らしいメロディーに浸ってください。。。"
  },
  blogSnippetContent: { 
    vi: "Khám phá những chia sẻ và câu chuyện từ Rin...",
    en: "Discover thoughts and stories from Rin...",
    ja: "リンの考えや物語を発見。。。"
  }
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


export const blogViewContainerVariants = (delay: number = 0.1): Variants => ({
    hidden: {
        opacity: 0,
        scale: 0.85, 
        y: 45,
        filter: "blur(12px) saturate(0.4) brightness(0.8)", 
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px) saturate(1) brightness(1)",
        transition: {
            type: "spring",
            stiffness: 145, 
            damping: 25, 
            mass: 0.9, 
            delay,
            opacity: { duration: 0.6, ease: "circOut", delay },
            scale: { type: "spring", stiffness: 145, damping: 25, delay },
            filter: { duration: 0.5, ease: [0.25, 1, 0.5, 1], delay: delay + 0.12 },
        }
    },
    exit: {
        opacity: 0,
        scale: 0.88, 
        y: 30,
        filter: "blur(10px) saturate(0.6) brightness(0.85)",
        transition: {
            duration: 0.38, 
            ease: "anticipate",
            opacity: { duration: 0.32, ease: "easeIn"},
        }
    }
});


export const aboutNavIconLeft = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
export const aboutNavIconRight = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

export interface LoadingMessages {
  preparing: { vi: string; en: string; ja: string };
  loadingIntro: { vi: string; en: string; ja: string };
  loadingGithub: { vi: string; en: string; ja: string };
  loadingTiktok: { vi: string; en: string; ja: string };
  loadingYoutube: { vi: string; en: string; ja: string };
  loadingDiscord: { vi: string; en: string; ja: string };
  loadingGithubStatsII: { vi: string; en: string; ja: string };
  loadingGithubStatsIII: { vi: string; en: string; ja: string };
  loadingSocials: { vi: string; en: string; ja: string };
  loadingFinalizing: { vi: string; en: string; ja: string };
}

export const personalCardTranslations = {
  sectionTitles: {
    intro: { vi: "Giới Thiệu Bản Thân", en: "Introduction", ja: "自己紹介" },
    github: { vi: "Thống kê GitHub", en: "GitHub Statistics", ja: "GitHub統計" },
    'github-stats-ii': { vi: "Thống kê GitHub II", en: "GitHub Statistics II", ja: "GitHub統計 II" },
    'github-stats-iii': { vi: "Thống kê GitHub III", en: "GitHub Statistics III", ja: "GitHub統計 III" },
    'discord-presence': { vi: "Trạng thái Discord", en: "Discord Presence", ja: "Discordステータス" },
    socials: { vi: "Mạng xã hội", en: "Social Media", ja: "ソーシャルメディア" },
    tiktok: { vi: "Thống kê TikTok", en: "TikTok Statistics", ja: "TikTok統計" },
    youtube: { vi: "Thống kê YouTube", en: "YouTube Statistics", ja: "YouTube統計" },
  },
  introBio: {
    namePlaceholder: "{name}",
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
  loadingMessages: {
    preparing: { vi: "Đang chuẩn bị không gian...", en: "Preparing the space...", ja: "スペースを準備しています。。。"},
    loadingIntro: { vi: "Đang tải lời giới thiệu...", en: "Loading introduction...", ja: "自己紹介を読み込み中。。。"},
    loadingGithub: { vi: "Đang kết nối với GitHub...", en: "Connecting to GitHub...", ja: "GitHubに接続中。。。"},
    loadingTiktok: { vi: "Lướt nhanh TikTok...", en: "Checking TikTok trends...", ja: "TikTokトレンドを確認中。。。"},
    loadingYoutube: { vi: "Tìm video hay trên YouTube...", en: "Fetching cool YouTube videos...", ja: "面白い動画を探しています。。。"},
    loadingDiscord: { vi: "Kiểm tra trạng thái Discord...", en: "Checking Discord status...", ja: "Discordの状況を確認中。。。"},
    loadingGithubStatsII: { vi: "Vẽ biểu đồ GitHub...", en: "Analyzing GitHub charts...", ja: "GitHubチャートを分析中。。。"},
    loadingGithubStatsIII: { vi: "Tổng hợp dữ liệu GitHub...", en: "Compiling GitHub data...", ja: "GitHubデータを集計中。。。"},
    loadingSocials: { vi: "Kết nối mạng xã hội...", en: "Connecting social networks...", ja: "ソーシャルネットワークに接続中。。。"},
    loadingFinalizing: { vi: "Hoàn tất! Đang vào thế giới của Rin...", en: "Finalizing! Entering Rin's world...", ja: "最終処理中！リンの世界へようこそ。。。"},
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
  githubLabels: {
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

export const cardDisplayInfo = {
    name: { vi: "Rin", en: "Rin", ja: "リン" },
    title: {
        vi: "Sinh viên CNTT | An Ninh Mạng",
        en: "IT Student | Cyber Security",
        ja: "情報技術学生 | サイバーセキュリティ"
    }
};

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

export const guestbookViewTranslations = {
  title: { vi: "Sổ Lưu Bút Cảm Xúc", en: "Guestbook of Thoughts", ja: "ゲストブック・思いの記録" },
  formTitle: { vi: "Để lại lời nhắn của bạn", en: "Leave Your Message", ja: "メッセージを残してください" },
  nameLabel: { vi: "Tên của bạn (Nhà lữ hành)", en: "Your Name (Fellow Traveler)", ja: "お名前（旅人さん）" },
  namePlaceholder: { vi: "vd: Lãng khách ẩn danh...", en: "e.g., A Mysterious Wanderer...", ja: "例：名無しの風来坊。。。" },
  messageLabel: { vi: "Đôi dòng cảm nghĩ...", en: "Your thoughts here...", ja: "ご感想をどうぞ。。。" },
  messagePlaceholder: { vi: "Nơi này thật đẹp và bình yên...", en: "This place is beautiful and peaceful...", ja: "この場所は美しくて穏やかですね。。。" },
  submitButton: { vi: "Gửi Cảm Nghĩ", en: "Post Your Thought", ja: "感想を投稿する" },
  submittingText: { vi: "Đang gửi...", en: "Submitting...", ja: "送信中。。。" },
  promptWrite: {
    vi: "Bạn muốn chia sẻ đôi dòng tâm tình với Rin hong? ✨ <br/>Cảm ơn vì đã ghé thăm, ghi lại sự hiện diện của bạn tại đây nhé!",
    en: "Want to share some thoughts with Rin? ✨ <br/>Thanks for visiting, feel free to leave your mark!",
    ja: "リンに何か思いを伝えたいですか？ ✨ <br/>ご訪問ありがとうございます。あなたの足跡をここに記しませんか。"
  },
  writeButtonLabel: { vi: "Để lại lời nhắn", en: "Leave a Note", ja: "メッセージを書く" },
  cancelButton: { vi: "Hủy bỏ", en: "Cancel", ja: "キャンセル" },
  noEntries: {
    vi: "Chưa có ai để lại cảm nghĩ. Hãy là người đầu tiên chia sẻ nhé!",
    en: "No thoughts have been shared yet. Be the first one!",
    ja: "まだ感想はありません。最初の想いを綴りませんか？"
  },
  entryBy: { vi: "Lời nhắn từ", en: "A thought from", ja: "からのメッセージ" },
  entryDatePrefix: { vi: "Vào lúc", en: "On", ja: "記録日：" },
  validationError: {
    vi: "Tên và cảm nghĩ không được để trống bạn ơi!",
    en: "Name and message cannot be empty, friend!",
    ja: "お名前とメッセージは必須です！"
  },
  submitSuccess: {
    vi: "Lời nhắn của bạn đã được gửi đi. Cảm ơn nhé! ♡",
    en: "Your message has been sent. Thank you! ♡",
    ja: "メッセージが送信されました。ありがとうございます！♡"
  },
  submitError: {
    vi: "Oops! Có lỗi xảy ra khi gửi. Bạn thử lại sau nha.",
    en: "Oops! An error occurred while sending. Please try again later.",
    ja: "おっと！送信中にエラーが発生しました。後でもう一度お試しください。"
  }
};
export const guestbookViewContainerVariants = (delay: number = 0.1): Variants => ({
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

export const spotifyViewContainerVariants = (delay: number = 0.1): Variants => ({
    hidden: { opacity: 0, scale: 0.88, y: 45, filter: "blur(10px) saturate(0.6)" },
    visible: {
        opacity: 1, scale: 1, y: 0, filter: "blur(0px) saturate(1)",
        transition: {
            type: "spring", stiffness: 150, damping: 24, mass: 0.95,
            delay,
            opacity: { duration: 0.55, ease: "circOut", delay },
            filter: { duration: 0.45, ease: "easeOut", delay: delay + 0.1 }
        }
    },
    exit: {
        opacity: 0, scale: 0.9, y: 35, filter: "blur(7px) saturate(0.7)",
        transition: { duration: 0.32, ease: "anticipate" }
    }
});

export const spotifyPlaylistsTranslations = {
    title: { vi: "Giai Điệu Cùng Rin ✨", en: "Tunes with Rin ✨", ja: "リンとのメロディー ✨" },
    loading: { vi: "Đang tìm kiếm những nốt nhạc...", en: "Searching for the notes...", ja: "音符を探しています..." },
    error: { vi: "Hmm, có vẻ như dây đàn bị đứt rồi. Thử lại sau nhé!", en: "Hmm, looks like a string broke. Try again later!", ja: "うーん、弦が切れたみたい。後でまた試してね！" },
    noPlaylists: { vi: "Kho nhạc của Rin tạm thời im lặng... 🤫", en: "Rin's music library is temporarily quiet... 🤫", ja: "リンの音楽ライブラリは一時的に静かです。。。🤫" },
    externalLink: { vi: "Nghe trên Spotify", en: "Listen on Spotify", ja: "Spotifyで聴く" },
    navPrev: { vi: "Playlist trước", en: "Previous playlist", ja: "前のプレイリスト" },
    navNext: { vi: "Playlist kế", en: "Next playlist", ja: "次のプレイリスト" },
};



export const guestbookIconFeatherPen = `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.7 3.3a1 1 0 0 0-1.4 0L2.6 20.1a1 1 0 0 0 0 1.4l.4.4"/><path d="m17.6 6.7 3.1-3.1"/><path d="M2.6 20.1C5.9 19.4 10 18 13 15c2-2 3.3-4.2 4-6.3.4-1.1.6-2.3.5-3.5S17 3.2 16 3.3c-1 .1-2.3.7-3.7 2s-3 3.1-4.2 4.6c-1.9 2.4-3.8 4.6-5.3 6.8"/><path d="M10.7 11.3 2.6 20.1"/><path d="m19.2 5.2.4.4"/></svg>`;
export const guestbookIconInkSplatterCancel = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 20.5C6 20 4 17 4 12A8 8 0 0 1 12 4c5 0 7 2.5 7.5 7.5"/><path d="m18 18-5.5-5.5"/><path d="m12.5 18-5.5-5.5"/><path d="M4.5 10C5.7 9.3 6.5 8.2 7 7"/><path d="M7.5 3.5C9 4.2 10.8 5.1 11.5 6.5"/><circle cx="14" cy="5.5" r="0.5" fill="currentColor"/><circle cx="9" cy="3.5" r="0.5" fill="currentColor"/><circle cx="4.5" cy="6" r="0.5" fill="currentColor"/><circle cx="20.5" cy="11" r="0.5" fill="currentColor"/></svg>`;


export const randomPoeticQuotes = {
  vi: [
    "Những vì sao kể chuyện ngàn năm...",
    "Trong giấc mơ, ta bay giữa ngân hà.",
    "Phép thuật ẩn mình trong từng hơi thở.",
    "Vần thơ nhẹ như cánh bướm đêm.",
    "Ảo mộng dệt nên từ ánh trăng.",
    "Nơi cuối trời, có một khu vườn bí mật.",
    "Lời thì thầm của gió qua kẽ lá.",
    "Bụi tiên lấp lánh trên con đường mòn.",
    "Hãy để trí tưởng tượng dẫn lối.",
    "Một chút mơ mộng cho ngày thêm xinh.",
    "Sương mai đọng trên phiến lá diệu kỳ.",
    "Cánh cửa hé mở vào thế giới thần tiên.",
    "Giai điệu cổ xưa vọng về từ rừng thẳm.",
    "Những bí mật được các vì sao canh giữ.",
    "Mỗi bông hoa là một nụ cười của tạo hóa.",
    "Dòng sông thời gian trôi về miền vô tận.",
    "Ánh sáng bình minh nhuộm hồng chân mây.",
    "Lời nguyện ước theo cánh chim bay xa.",
    "Trong tĩnh lặng, nghe tiếng lòng thổn thức.",
    "Cây bút thần vẽ nên những điều không tưởng.",
    "Hạt sương đêm long lanh tựa kim cương.",
    "Con đường mòn dẫn đến những điều kỳ diệu.",
    "Tiếng chuông gió ngân nga khúc ca êm đềm.",
    "Khu rừng già ẩn chứa bao điều huyền bí.",
    "Bay lên cùng những đám mây trắng xốp."
  ],
  en: [
    "Stars whisper tales of ancient times...",
    "In dreams, we soar through galaxies.",
    "Magic hides in every breath.",
    "Verses as light as a night butterfly's wing.",
    "Illusions woven from moonlight.",
    "At world's end, a secret garden lies.",
    "The wind's whisper through the leaves.",
    "Fairy dust glitters on the path.",
    "Let your imagination guide you.",
    "A little daydream for a brighter day.",
    "Morning dew clings to a magical leaf.",
    "A door ajar to a fairy-tale world.",
    "Ancient melodies echo from the deep forest.",
    "Secrets guarded by the celestial sphere.",
    "Every flower, a smile from creation.",
    "The river of time flows to an endless realm.",
    "Dawn's light tints the horizon rose.",
    "A wish carried afar on a bird's wing.",
    "In silence, hear the heart's murmur.",
    "The magic pen draws the unimaginable.",
    "Night dew drops, like diamonds, gleam.",
    "The winding path leads to wondrous things.",
    "Wind chimes sing a gentle, soothing song.",
    "The old forest holds many mysteries deep.",
    "Soar high with the fluffy white clouds."
  ],
  ja: [
    "星々は古の物語を囁く。。。" ,
    "夢の中で、銀河を飛び交う。",
    "魔法はあらゆる息吹に潜んでいる。",
    "夜の蝶の羽のように軽い詩。",
    "月光から織り成される幻想。",
    "世界の果てに、秘密の庭がある。",
    "木の葉を通り抜ける風のささやき。",
    "妖精の粉が小道で輝いている。",
    "想像力に導かれよう。",
    "少しの空想が、一日を彩る。",
    "朝露が魔法の葉にしがみつく。",
    "おとぎ話の世界への半開きの扉。",
    "古代の旋律が深い森から響く。",
    "天球に守られた秘密。",
    "すべての花は、創造からの微笑み。",
    "時の川は果てしない領域へと流れる。",
    "夜明けの光が地平線をバラ色に染める。",
    "鳥の翼に乗って遠くに運ばれる願い。",
    "静寂の中で、心のつぶやきを聞く。",
    "魔法のペンは想像を絶することを描く。",
    "夜露の雫、ダイヤモンドのように輝く。",
    "曲がりくねった道は素晴らしいものへと続く。",
    "風鈴が優しく心地よい歌を歌う。",
    "古い森は多くの深い謎を秘めている。",
    "ふわふわの白い雲と共に高く舞い上がれ。"
  ],
};