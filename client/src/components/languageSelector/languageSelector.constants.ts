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
      duration: 0.8,
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
      duration: 0.6,
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
      opacity: { duration: 0.8, delay, ease: [0.23, 1, 0.32, 1] },
      y: { duration: 0.8, delay, ease: [0.23, 1, 0.32, 1] },
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
        opacity: 0, y: 20, scale: 0.8, rotate: initialRotate, filter: "drop-shadow(0 0 0px transparent)"
    },
    visibleBase: { 
        opacity: 0.85, 
        rotate: initialRotate,
        y: 0, 
        filter: baseFlourishVisibleFilterKeyframes[0],
    },
    hover: (custom: { baseScale: number }) => ({
        y: initialRotate === 0 ? -12 : 12,
        scale: (custom?.baseScale || 1) * 1.05,
        filter: "drop-shadow(0 0 30px rgba(var(--highlight-color-poetic-rgb), 0.75)) drop-shadow(0 0 15px rgba(var(--highlight-color-poetic-rgb), 0.5))",
        transition: { type: "spring", stiffness: 300, damping: 22, mass: 0.8 }
    })
});


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
    transition: { duration: 0.6, delay: delay, ease: "easeOut" }
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
  introTagline: {
      vi: "Chào mừng đến với thế giới của tui !",
      en: "Welcome to my world!",
      ja: "アタシの世界へよこそう！ "
  },
  aboutIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  galleryIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
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
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
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

export const githubSectionTranslations = { // Renamed or use a more general name like 'aboutSubSectionTitles'
  title: { vi: "Thống kê GitHub", en: "GitHub Statistics", ja: "GitHub統計" },
  followers: { vi: "Người theo dõi", en: "Followers", ja: "フォロワー" },
  publicRepos: { vi: "Kho lưu trữ", en: "Public Repos", ja: "公開リポジトリ" },
  profileLink: { vi: "Xem trên GitHub", en: "View on GitHub", ja: "GitHubで表示" },
  titlePart2: { vi: "Thống kê GitHub II", en: "GitHub Statistics II", ja: "GitHub統計 II" },
  titlePart3: { vi: "Thống kê GitHub III", en: "GitHub Statistics III", ja: "GitHub統計 III" },
  discordPresenceTitle: { vi: "Trạng thái Discord", en: "Discord Presence", ja: "Discordステータス"},
};

// For LanguageSelector's card intro preview
export const languageSelectorPreviewTranslations = {
  aboutSnippetTitle: { vi: "Giới thiệu sơ lược", en: "About Me Snippet", ja: "自己紹介（概要）" },
  gallerySneakPeekTitle: { vi: "Xem trước bộ sưu tập", en: "Gallery Sneak Peek", ja: "ギャラリー予告編" },
  aboutSnippetContent: {
    vi: "Chào ! Mình là Rin,...ừm, là Rin, hết rồi đó? mong chờ gì?",
    en: "Hi! I'm Rin,... well, just Rin, that's it? What were you expecting?",
    ja: "こんにちは！リンです。えっと、リンです、それだけ？何を期待してたの？"
  },
  galleryPreviewAlt: { vi: "Xem trước bộ sưu tập {index}", en: "Gallery preview {index}", ja: "ギャラリープレビュー {index}" }
};

// For PersonalCard component (about section)
export const personalCardTranslations = {
  sectionTitles: {
    intro: { vi: "Giới Thiệu Bản Thân", en: "Introduction", ja: "自己紹介" },
    github: { vi: "Thống kê GitHub", en: "GitHub Statistics", ja: "GitHub統計" },
    githubStatsIi: { vi: "Thống kê GitHub II", en: "GitHub Statistics II", ja: "GitHub統計 II" },
    githubStatsIii: { vi: "Thống kê GitHub III", en: "GitHub Statistics III", ja: "GitHub統計 III" },
    discordPresence: { vi: "Trạng thái Discord", en: "Discord Presence", ja: "Discordステータス" },
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
  loadingText: {
    vi: "Đang dệt những vì sao từ GitHub...",
    en: "Weaving stars from GitHub...",
    ja: "GitHubから星を紡いでいます..."
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