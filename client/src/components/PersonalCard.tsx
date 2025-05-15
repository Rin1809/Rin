// client/src/components/PersonalCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform, animate } from 'framer-motion';
import './styles/PersonalCard.css';
import {
    aboutNavIconLeft,
    aboutNavIconRight,
    githubSectionTranslations,
    personalCardTranslations,
} from './languageSelector/languageSelector.constants';

interface PersonalCardProps {
  style?: React.CSSProperties;
  name: string;
  section: 'about' | 'all';
  githubUsername?: string;
  language: 'vi' | 'en' | 'ja';
}

type AboutSubSection = 'intro' | 'github' | 'socials' | 'discord-presence' | 'github-stats-ii' | 'github-stats-iii';
const aboutSubSectionsOrder: AboutSubSection[] = [
    'intro',
    'github',
    'socials',
    'discord-presence',
    'github-stats-ii',
    'github-stats-iii',
];

// Icons SVG cho Mạng xã hội
const SocialIcons: { [key: string]: JSX.Element } = {
    github: (
        <svg viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
    ),
    tiktok: (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.49 3.15c-.1-.01-.2-.01-.3-.01s-.2 0-.3.01c-1.12.05-2.23.18-3.32.4S6.65 4.26 5.8 5c-.47.42-.93.9-1.34 1.4-.98 1.17-1.74 2.55-2.23 4.03-.2.58-.35 1.18-.45 1.78s-.15.9-.2 1.2c-.03.19-.05.38-.08.58l-.02.17c-.01.06-.02.11-.02.17s0 .11.01.17c.02.1.03.2.05.3.29.79.77 1.49 1.42 2.04.5.41 1.06.74 1.67.97.31.12.63.21.95.29.2.05.4.08.6.11.09.01.19.01.28.01h.1c.19 0 .39-.01.58-.03.76-.1 1.5-.28 2.19-.54.9-.34 1.73-.81 2.45-1.38.34-.27.64-.58.91-.92.47-.59.83-1.26 1.05-1.98.02-.07.03-.13.05-.2.09-.33.14-.67.18-1.01.05-.59.05-1.18.01-1.76-.11-1.65-.62-3.23-1.48-4.62-.5-.82-1.13-1.52-1.87-2.07-.35-.26-.73-.47-1.12-.64Zm-1.1 12.42c-.19.1-.38.2-.58.29-.01 0-.01 0-.02.01-.35.14-.72.25-1.1.33-.18.04-.36.06-.55.08-.07.01-.14.01-.22.01h-.15c-.13 0-.26-.01-.38-.02-.12-.01-.24-.03-.36-.05-.96-.16-1.84-.58-2.51-1.2-.22-.2-.42-.43-.59-.67-.2-.28-.34-.59-.42-.92-.03-.1-.04-.2-.06-.3v-.01c-.01-.06-.01-.12-.02-.18s0-.13.01-.19c.1-.95.57-1.81 1.27-2.46.28-.25.6-.46.94-.63.03-.01.05-.02.08-.03.32-.15.66-.27 1.01-.36.06-.01.11-.02.17-.03.09-.02.18-.03.27-.04.05-.01.09-.01.14-.01h.08c.09 0 .18.01.26.02.1.02.2.04.3.07.82.24 1.52.71 2.02 1.34.44.55.71 1.23.79 1.95.01.1.01.19.01.29v.03c-.01.08-.02.17-.03.25-.04.22-.1.43-.18.64Zm6.18-3.16c.06.07.11.14.17.22.1.11.19.23.27.35.31.47.52 1 .6 1.55.03.19.05.38.06.57.01.08.01.15.02.23s0 .12.01.18c.01.12.01.24.01.36 0 .55-.05 1.08-.16 1.6s-.28 1.02-.5 1.48c-.3.62-.72 1.15-1.25 1.57-.23.18-.49.34-.75.48-.43.22-.88.4-1.34.53s-.95.21-1.43.23h-.19c-.03 0-.06 0-.09.01-.06 0-.12-.01-.18-.01-.28-.02-.55-.07-.82-.14-.31-.08-.62-.19-.91-.33l-.08-.04c-.23-.11-.45-.24-.66-.38-.1-.07-.21-.14-.31-.22-.04-.03-.08-.07-.12-.1-.03-.03-.06-.05-.09-.08s-.08-.06-.11-.09c-.01-.01-.01-.01-.02-.02-.1-.08-.18-.16-.26-.25s-.14-.18-.21-.28l-.05-.06c-.13-.22-.23-.44-.32-.68-.05-.15-.1-.3-.14-.45-.02-.09-.04-.17-.05-.26-.02-.13-.03-.25-.04-.38v-.01c-.01-.18-.01-.36-.01-.54V9.2c.17-.67.53-1.29 1.05-1.8.42-.41.93-.73 1.49-.93.28-.1.57-.17.86-.21.21-.03.43-.04.64-.04h.05c.49 0 .97.06 1.43.17.75.18 1.43.54 1.98 1.04.36.33.66.72.87 1.15Z" />
        </svg>
    ),
    discordProfile: (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.256 6.091C17.762 5.243 16.132 4.645 14.42 4.228a.07.07 0 0 0-.075.046c-.233.907-.697 2.214-.957 3.097a12.517 12.517 0 0 0-4.735 0c-.275-.883-.738-2.19-.972-3.097a.07.07 0 0 0-.074-.046C5.853 4.645 4.223 5.243 2.728 6.09A.079.079 0 0 0 2.7 6.216c2.082 4.128 3.623 7.428 3.623 7.428a.075.075 0 0 0 .055.066c.397.159.816.288 1.25.392a.073.073 0 0 0 .078-.039c.097-.127.183-.26.264-.398a.065.065 0 0 0-.02-.087c-.299-.149-.586-.31-.861-.482a.067.067 0 0 1-.039-.074c.01-.022.01-.032.02-.043a12.17 12.17 0 0 0 .944-1.338s.597-.551.675-.634a.058.058 0 0 1 .062-.01c.01.01.01.01.02.023a9.079 9.079 0 0 1 3.622 0c0-.013.01-.023.02-.023a.058.058 0 0 1 .063.01c.077.083.675.634.675.634a12.129 12.129 0 0 0 .944 1.338c.01.01.01.022.02.043a.067.067 0 0 1-.04.074c-.274.173-.561.333-.86.482a.066.066 0 0 0-.02.087c.082.138.168.27.265.398a.072.072 0 0 0 .078.039c.434-.104.853-.233 1.25-.392a.075.075 0 0 0 .056-.066s1.54-3.299 3.623-7.428a.08.08 0 0 0-.029-.126Z" />
            <path d="M9.31 14.873c-.827 0-1.5-.743-1.5-1.658s.673-1.658 1.5-1.658c.826 0 1.499.743 1.5 1.658 0 .915-.673 1.658-1.5 1.658Zm5.38 0c-.827 0-1.5-.743-1.5-1.658s.673-1.658 1.5-1.658c.826 0 1.5.743 1.5 1.658.001.915-.674 1.658-1.5 1.658Z" />
        </svg>
    ),
    discordServer: (
         <svg viewBox="0 0 24 24" fill="currentColor">
           <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
    ),
    youtube: (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.582 7.072A2.493 2.493 0 0 0 19.81 5.28a28.784 28.784 0 0 0-7.807-.416A28.92 28.92 0 0 0 4.19 5.28a2.495 2.495 0 0 0-1.775 1.792A26.092 26.092 0 0 0 2 11.995a26.084 26.084 0 0 0 .415 4.923A2.49 2.49 0 0 0 4.19 18.71a28.954 28.954 0 0 0 7.81.417 28.76 28.76 0 0 0 7.807-.417A2.493 2.493 0 0 0 21.58 16.918a26.08 26.08 0 0 0 .417-4.923 26.092 26.092 0 0 0-.417-4.923ZM9.992 15.168V8.829l5.262 3.173-5.262 3.166Z" />
        </svg>
    )
};

const aboutSectionContentVariants: { [key: string]: any } = {
  enter: (direction: number) => ({
    rotateY: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.97,
    originX: direction > 0 ? 0 : 1,
    filter: "blur(5px) brightness(0.75)",
  }),
  center: {
    zIndex: 1,
    rotateY: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px) brightness(1)",
    transition: { type: "spring", stiffness: 180, damping: 26, mass: 0.9, duration: 0.6 }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    rotateY: direction < 0 ? -50 : 50,
    opacity: 0,
    scale: 0.97,
    originX: direction < 0 ? 1 : 0,
    filter: "blur(5px) brightness(0.75)",
    transition: { type: "tween", ease: [0.75, 0.05, 0.35, 0.95], duration: 0.4 }
  })
};

const aboutSectionTitleAnimVariants = {
    initial: { opacity: 0, y: -25, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1], delay:0.08 } },
    exit: { opacity: 0, y: 15, filter: "blur(3px)", transition: {duration: 0.25}}
};

const bioParagraphVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(2px)" },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            delay: i * 0.2,
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1]
        }
    })
};

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
    const [currentValue, setCurrentValue] = useState(0);
    const nodeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(currentValue, value, {
            type: "spring",
            stiffness: 100,
            damping: 20,
            onUpdate: (latest) => {
                setCurrentValue(Math.round(latest));
            }
        });
        return () => controls.stop();
    }, [value, currentValue]);

    return <motion.span ref={nodeRef}>{currentValue}</motion.span>;
};

interface ParallaxImageProps {
  src: string;
  alt: string;
  className: string;
  wide?: boolean;
  onImageLoad?: () => void;
  onImageError?: () => void;
}

const ParallaxImage: React.FC<ParallaxImageProps> = ({ src, alt, className, wide, onImageLoad, onImageError }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xTransform = useTransform(x, [-100, 100], [-15, 15]);
    const yTransform = useTransform(y, [-100, 100], [-10, 10]);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (ref.current) {
            const rect = (ref.current as HTMLDivElement).getBoundingClientRect();
            const newX = event.clientX - rect.left - rect.width / 2;
            const newY = event.clientY - rect.top - rect.height / 2;
            x.set(newX);
            y.set(newY);
        }
    };
    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            className={`parallax-image-wrapper ${wide ? 'wide-image-wrapper' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1000 }}
            whileHover={{ scale:1.03 }}
            transition={{type:"spring", stiffness:300, damping:12}}
        >
            <motion.img
                src={src}
                alt={alt}
                className={className}
                style={{ x: xTransform, y: yTransform }}
                onLoad={onImageLoad}
                onError={onImageError || onImageLoad}
            />
        </motion.div>
    );
};


const PersonalCard: React.FC<PersonalCardProps> = ({ style, name, section, githubUsername, language }) => {
  const containerClassName = section === 'about' ? 'personal-card-about-view' : 'personal-card-container';
  const [currentAboutSubSection, setCurrentAboutSubSection] = useState<AboutSubSection>('intro');
  const [slideDirection, setSlideDirection] = useState(0);

  const [githubData, setGithubData] = useState<any>(null);
  const [githubLoading, setGithubLoading] = useState<boolean>(false); // Only for GitHub API call
  const [githubError, setGithubError] = useState<string | null>(null);

  const discordUserId = "873576591693873252";

  const contentWrapperControls = useAnimation();
  const currentContentRef = useRef<HTMLDivElement>(null);
  const contentWrapperOuterRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number | 'auto' | null>(null);

  const [imagesToLoadCount, setImagesToLoadCount] = useState(0);
  const [isSectionLoadingContent, setIsSectionLoadingContent] = useState(false); // Overall loading state for the section's content

  const measureAndAnimateHeight = (forceMeasure = false) => {
    requestAnimationFrame(() => { // Ensure measurement after layout updates
      if (contentWrapperOuterRef.current && currentContentRef.current) {
        if (isSectionLoadingContent && !forceMeasure) {
            // If still loading and not forced, don't measure yet,
            // or set to a temporary loading height if desired.
            // For now, we'll just skip to avoid measuring partially loaded content.
            return;
        }

        const contentHeight = currentContentRef.current.offsetHeight;
        const newHeightValue = contentHeight > 0 ? contentHeight : 'auto';

        if (prevHeightRef.current !== newHeightValue || forceMeasure) {
          contentWrapperControls.start(
            { height: newHeightValue },
            { type: "spring", stiffness: 260, damping: 30, mass: 0.9, delay: forceMeasure ? 0.05 : 0 } // Add small delay if forced
          );
          prevHeightRef.current = newHeightValue;
        } else if (prevHeightRef.current === null && newHeightValue !== 'auto' && newHeightValue > 0) {
          contentWrapperControls.set({ height: newHeightValue });
          prevHeightRef.current = newHeightValue;
        }
      }
    });
  };

  const handleImageLoadedOrError = () => {
    setImagesToLoadCount(prevCount => Math.max(0, prevCount - 1));
  };

  // Effect to determine initial loading state and image count for a new section
  useEffect(() => {
    if (section === 'about') {
      let expectedImages = 0;
      if (currentAboutSubSection === 'discord-presence') expectedImages = 1;
      else if (currentAboutSubSection === 'github-stats-ii' && githubUsername) expectedImages = 2;
      else if (currentAboutSubSection === 'github-stats-iii' && githubUsername) expectedImages = 4;

      setImagesToLoadCount(expectedImages);

      const needsGithubAPICall = currentAboutSubSection === 'github' && !githubData && githubUsername && !githubLoading;

      if (expectedImages > 0 || needsGithubAPICall) {
        setIsSectionLoadingContent(true);
        // Optionally set a temporary height for the loading state
        // contentWrapperControls.start({ height: 250 }, { duration: 0.1 });
      } else {
        setIsSectionLoadingContent(false);
      }
    }
  }, [currentAboutSubSection, section, githubUsername, githubData, githubLoading]); // Added githubLoading

  // Effect for fetching GitHub API data
  useEffect(() => {
    if (section === 'about' && currentAboutSubSection === 'github' && !githubData && githubUsername && !githubLoading) {
      setIsSectionLoadingContent(true); // Ensure loading state is true
      const fetchGithubData = async () => {
        setGithubLoading(true); // Specific for API call
        setGithubError(null);
        try {
          const userRes = await fetch(`https://api.github.com/users/${githubUsername}`);
          if (!userRes.ok) throw new Error(`Lỗi API GitHub: ${userRes.status}`);
          const userData = await userRes.json();
          setGithubData({ user: userData });
        } catch (error: any) {
          console.error("Không thể tải dữ liệu GitHub:", error);
          setGithubError(error.message || "Không thể tải dữ liệu GitHub.");
        } finally {
          setGithubLoading(false); // API call finished
          // Don't set setIsSectionLoadingContent(false) here directly. Let the combined logic handle it.
        }
      };
      fetchGithubData();
    }
  }, [section, currentAboutSubSection, githubData, githubUsername, githubLoading]);

  // Effect to update overall section loading state based on GitHub API and image loading
  useEffect(() => {
    if (section === 'about') {
      const isGithubAPILoading = currentAboutSubSection === 'github' && githubLoading;
      const areImagesStillLoading = imagesToLoadCount > 0 &&
        (currentAboutSubSection === 'discord-presence' ||
         currentAboutSubSection === 'github-stats-ii' ||
         currentAboutSubSection === 'github-stats-iii');

      setIsSectionLoadingContent(isGithubAPILoading || areImagesStillLoading);
    } else {
      setIsSectionLoadingContent(false);
    }
  }, [section, currentAboutSubSection, githubLoading, imagesToLoadCount]);

  // Effect to measure height AFTER content is loaded and visible
  useEffect(() => {
    if (section === 'about' && !isSectionLoadingContent && contentWrapperOuterRef.current) {
        // Key change in motion.div should re-render currentContentRef.
        // Wait for a couple of frames to ensure new content is laid out.
        const measureTimeout = setTimeout(() => {
            measureAndAnimateHeight(true); // Force measure after loading is done
        }, 100); // Increased delay slightly

        if (contentWrapperOuterRef.current) {
            contentWrapperOuterRef.current.scrollTop = 0;
        }
        return () => clearTimeout(measureTimeout);
    }
  }, [isSectionLoadingContent, section, currentAboutSubSection, language, name, githubData]); // Added githubData

  const changeSubSection = (direction: 'next' | 'prev') => {
    const currentIndex = aboutSubSectionsOrder.indexOf(currentAboutSubSection);
    let nextIndex;

    if (direction === 'next') {
      setSlideDirection(1);
      nextIndex = (currentIndex + 1) % aboutSubSectionsOrder.length;
    } else {
      setSlideDirection(-1);
      nextIndex = (currentIndex - 1 + aboutSubSectionsOrder.length) % aboutSubSectionsOrder.length;
    }
    if (currentIndex !== nextIndex) {
        // Reset height related refs when section changes to allow fresh measurement
        // prevHeightRef.current = null; // Let's try without this first, might cause jump
        setCurrentAboutSubSection(aboutSubSectionsOrder[nextIndex]);
    }
  };

  const socialLinksData = [
    { id: 'github', url: `https://github.com/${githubUsername || 'Rin1809'}`, translationKey: 'github' as keyof typeof personalCardTranslations.socialLinks, icon: SocialIcons.github },
    { id: 'tiktok', url: "https://www.tiktok.com/@rinrinn1913", translationKey: 'tiktok' as keyof typeof personalCardTranslations.socialLinks, icon: SocialIcons.tiktok },
    { id: 'discordProfile', url: `https://discord.com/users/873576591693873252`, translationKey: 'discordProfile' as keyof typeof personalCardTranslations.socialLinks, icon: SocialIcons.discordProfile },
    { id: 'discordServer', url: "https://discord.com/invite/homqua", translationKey: 'discordServer' as keyof typeof personalCardTranslations.socialLinks, icon: SocialIcons.discordServer },
    { id: 'youtube', url: "https://www.youtube.com/@RinnRin1913", translationKey: 'youtube' as keyof typeof personalCardTranslations.socialLinks, icon: SocialIcons.youtube }
  ];

  if (section === 'about') {
    const currentLang = language;
    const currentIndex = aboutSubSectionsOrder.indexOf(currentAboutSubSection);
    const isFirstSection = currentIndex === 0;
    const isLastSection = currentIndex === aboutSubSectionsOrder.length - 1;

    const getSectionTitleText = () => {
        switch(currentAboutSubSection) {
            case 'intro': return personalCardTranslations.sectionTitles.intro[currentLang];
            case 'github': return personalCardTranslations.sectionTitles.github[currentLang];
            case 'github-stats-ii': return personalCardTranslations.sectionTitles.githubStatsIi[currentLang];
            case 'github-stats-iii': return personalCardTranslations.sectionTitles.githubStatsIii[currentLang];
            case 'discord-presence': return personalCardTranslations.sectionTitles.discordPresence[currentLang];
            case 'socials': return personalCardTranslations.sectionTitles.socials[currentLang];
            default: return "Thông tin";
        }
    };

    const bioPart1 = personalCardTranslations.introBio.part1[currentLang].replace(personalCardTranslations.introBio.namePlaceholder, `<span class="bio-name-highlight">${name}</span>`);
    const bioPart2 = personalCardTranslations.introBio.part2[currentLang];
    const bioPart3 = personalCardTranslations.introBio.part3[currentLang];
    const bioPart4 = personalCardTranslations.introBio.part4[currentLang];
    const bioPart5 = personalCardTranslations.introBio.part5[currentLang];
    const bioParagraphs = [bioPart1, bioPart2, bioPart3, bioPart4, bioPart5].filter(p => p.trim() !== '');

    return (
      <motion.div
        className={containerClassName} style={style}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.1 } }}
        exit={{ opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.3 } }}
      >
        <div className="about-sub-section-header">
            <motion.button
                className="about-nav-arrow prev" onClick={() => changeSubSection('prev')} aria-label="Phần trước"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: isFirstSection ? 0.4 : 1, x: 0, pointerEvents: isFirstSection ? 'none' : 'auto' }}
                whileHover={{ scale: !isFirstSection ? 1.18 : 1, x: !isFirstSection ? -4 : 0, color: !isFirstSection ? "var(--primary-color)" : "currentColor", boxShadow: !isFirstSection ? "0 0 12px rgba(var(--primary-color-rgb),0.35)" : "none", borderColor: !isFirstSection ? "rgba(var(--primary-color-rgb),0.5)" : "currentColor" }}
                whileTap={{ scale: !isFirstSection ? 0.94 : 1 }}
                transition={{type:"spring", stiffness:350, damping:18}}
            ><span dangerouslySetInnerHTML={{ __html: aboutNavIconLeft }} /></motion.button>

            <AnimatePresence mode="wait">
                <motion.h2
                    key={currentAboutSubSection + "-title-" + currentLang} className="about-section-title"
                    variants={aboutSectionTitleAnimVariants} initial="initial" animate="animate" exit="exit"
                >{getSectionTitleText()}</motion.h2>
            </AnimatePresence>

            <motion.button
                className="about-nav-arrow next" onClick={() => changeSubSection('next')} aria-label="Phần kế tiếp"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: isLastSection ? 0.4 : 1, x: 0, pointerEvents: isLastSection ? 'none' : 'auto' }}
                whileHover={{ scale: !isLastSection ? 1.18 : 1, x: !isLastSection ? 4 : 0, color: !isLastSection ? "var(--primary-color)" : "currentColor", boxShadow: !isLastSection ? "0 0 12px rgba(var(--primary-color-rgb),0.35)" : "none", borderColor: !isLastSection ? "rgba(var(--primary-color-rgb),0.5)" : "currentColor" }}
                whileTap={{ scale: !isLastSection ? 0.94 : 1 }}
                transition={{type:"spring", stiffness:350, damping:18}}
            ><span dangerouslySetInnerHTML={{ __html: aboutNavIconRight }} /></motion.button>
        </div>

        <div className="about-navigation-indicator">
            {aboutSubSectionsOrder.map((sectionKey) => (
                <motion.div
                    key={`indicator-${sectionKey}`}
                    className={`indicator-dot ${sectionKey === currentAboutSubSection ? 'active' : ''}`}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: sectionKey === currentAboutSubSection ? 1.3 : 1, opacity: sectionKey === currentAboutSubSection ? 1 : 0.6, backgroundColor: sectionKey === currentAboutSubSection ? "var(--primary-color)" : "rgba(var(--highlight-color-poetic-rgb), 0.5)"}}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
            ))}
        </div>

        <motion.div
            ref={contentWrapperOuterRef} className="about-sub-section-content-wrapper"
            animate={contentWrapperControls} initial={{ height: 'auto' }}
        >
            <AnimatePresence mode="wait">
                {isSectionLoadingContent && (
                    <motion.div
                        key="loading-indicator"
                        className="section-loading-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="spinner"></div>
                        <p>{personalCardTranslations.loadingText[currentLang] || "Đang tải..."}</p>
                    </motion.div>
                )}
            </AnimatePresence>

          <AnimatePresence initial={false} custom={slideDirection} mode="wait" >
            <motion.div
              style={{
                opacity: isSectionLoadingContent ? 0 : 1,
                pointerEvents: isSectionLoadingContent ? 'none' : 'auto',
              }}
              transition={{ duration: 0.2, delay: isSectionLoadingContent ? 0 : 0.15 }} // Delay showing content until loading overlay is gone
              ref={currentContentRef}
              key={currentAboutSubSection + currentLang + name} // Ensure key changes to remount
              className="about-sub-section-content"
              custom={slideDirection} variants={aboutSectionContentVariants} initial="enter" animate="center" exit="exit"
            >
              {currentAboutSubSection === 'intro' && (
                <div className="sub-section-inner-padding">
                    {bioParagraphs.map((paragraph, index) => (
                        <motion.p
                            key={index} className="bio-text" custom={index} variants={bioParagraphVariants}
                            initial="hidden" animate="visible" dangerouslySetInnerHTML={{ __html: paragraph }}
                        />
                    ))}
                </div>
              )}

              {currentAboutSubSection === 'github' && (
                <div className="sub-section-inner-padding">
                  {githubError && !githubLoading && <p className="error-text">{personalCardTranslations.errorTextPrefix[currentLang]}{githubError}</p>}
                  {githubData?.user && !githubLoading && (
                    <div className="github-stats-container api-stats">
                        <div className="github-user-header">
                            <motion.img
                                src={githubData.user.avatar_url} alt={`${githubData.user.login}'s avatar`} className="github-avatar"
                                whileHover={{ scale: 1.12, rotate: 2.5, y: -3, boxShadow: "0 0 28px rgba(var(--primary-color-rgb),0.65), 0 0 12px rgba(var(--primary-color-rgb),0.85)"}}
                                transition={{type: "spring", stiffness:320, damping:12}}
                            />
                            <div className="github-user-info">
                                <h3>{githubData.user.name || githubData.user.login}</h3>
                                <p className="github-bio">{githubData.user.bio || personalCardTranslations.githubUserBioDefault[currentLang]}</p>
                            </div>
                        </div>
                        <div className="github-stats-grid">
                            <motion.div className="stat-item" whileHover={{y:-5, boxShadow:"0 7px 20px rgba(var(--highlight-color-poetic-rgb),0.22)"}}>
                                <span className="stat-value"><AnimatedNumber value={githubData.user.followers} /></span>
                                <span className="stat-label">{githubSectionTranslations.followers[currentLang]}</span>
                            </motion.div>
                            <motion.div className="stat-item" whileHover={{y:-5, boxShadow:"0 7px 20px rgba(var(--highlight-color-poetic-rgb),0.22)"}}>
                                <span className="stat-value"><AnimatedNumber value={githubData.user.public_repos} /></span>
                                <span className="stat-label">{githubSectionTranslations.publicRepos[currentLang]}</span>
                            </motion.div>
                        </div>
                        {githubData.user.html_url && (
                            <motion.a
                                href={githubData.user.html_url} target="_blank" rel="noopener noreferrer" className="github-profile-link"
                                whileHover={{scale:1.06, y: -2.5, boxShadow: "0 0 18px rgba(var(--highlight-color-poetic-rgb),0.45)"}}
                                whileTap={{scale:0.96}}
                            >{githubSectionTranslations.profileLink[currentLang]}</motion.a>
                        )}
                    </div>
                  )}
                </div>
              )}
              {currentAboutSubSection === 'socials' && (
                <div className="sub-section-inner-padding">
                    <div className="social-media-links-container">
                        {socialLinksData.map((link, index) => (
                            <motion.a
                                key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                                className={`social-media-link social-media-link-${link.id}`}
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: index * 0.1, type: 'spring', stiffness: 200, damping: 15 } }}
                                whileHover={{ y: -4, scale:1.04, boxShadow: "0 6px 18px rgba(var(--highlight-color-poetic-rgb),0.25), inset 0 0 8px rgba(var(--highlight-color-poetic-rgb),0.1)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="social-icon-wrapper">{link.icon}</span>
                                {personalCardTranslations.socialLinks[link.translationKey][currentLang]}
                            </motion.a>
                        ))}
                    </div>
                </div>
              )}
              {currentAboutSubSection === 'discord-presence' && (
                <div className="discord-presence-container sub-section-inner-padding">
                     <ParallaxImage
                        src={`https://lanyard-profile-readme.vercel.app/api/${discordUserId}?theme=dark&bg=1A1B26&animated=true&borderRadius=10px&titleColor=BB9AF7&statusColor=79E6F3&hideDiscrim=false&idleMessage=${encodeURIComponent("Đang chill...")}`}
                        alt="Trạng thái Discord" className="discord-presence-image github-stat-image"
                        onImageLoad={handleImageLoadedOrError}
                        onImageError={handleImageLoadedOrError}
                     />
                </div>
              )}
              {currentAboutSubSection === 'github-stats-ii' && githubUsername && (
                <div className="github-stats-image-container sub-section-inner-padding">
                    <ParallaxImage
                        src={`https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${githubUsername}&theme=tokyonight`}
                        alt="Chi tiết hồ sơ GitHub" className="github-stat-image"
                        onImageLoad={handleImageLoadedOrError} onImageError={handleImageLoadedOrError}
                    />
                    <ParallaxImage
                        src={`https://github-readme-activity-graph.vercel.app/graph?username=${githubUsername}&theme=tokyonight&hide_border=true&area=true&line=BB9AF7&point=79E6F3`}
                        alt="Biểu đồ hoạt động GitHub" className="github-stat-image" wide={true}
                        onImageLoad={handleImageLoadedOrError} onImageError={handleImageLoadedOrError}
                    />
                </div>
              )}
              {currentAboutSubSection === 'github-stats-iii' && githubUsername && (
                <div className="github-stats-image-container grid-2x2 sub-section-inner-padding">
                    <ParallaxImage
                        src={`https://github-profile-summary-cards.vercel.app/api/cards/productive-time?username=${githubUsername}&theme=tokyonight&utcOffset=7`}
                        alt="Thời gian hoạt động hiệu quả GitHub" className="github-stat-image"
                        onImageLoad={handleImageLoadedOrError} onImageError={handleImageLoadedOrError}
                    />
                    <ParallaxImage
                        src={`https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=${githubUsername}&theme=tokyonight`}
                        alt="Ngôn ngữ commit nhiều nhất GitHub" className="github-stat-image"
                        onImageLoad={handleImageLoadedOrError} onImageError={handleImageLoadedOrError}
                    />
                    <ParallaxImage
                        src={`https://github-readme-stats.vercel.app/api/top-langs?username=${githubUsername}&show_icons=true&locale=en&layout=compact&theme=tokyonight`}
                        alt="Các ngôn ngữ hàng đầu GitHub" className="github-stat-image"
                        onImageLoad={handleImageLoadedOrError} onImageError={handleImageLoadedOrError}
                    />
                    <ParallaxImage
                        src={`https://streak-stats.demolab.com/?user=${githubUsername}&theme=tokyonight&date_format=M%20j%5B%2C%20Y%5D`}
                        alt="Thống kê chuỗi GitHub" className="github-stat-image"
                        onImageLoad={handleImageLoadedOrError} onImageError={handleImageLoadedOrError}
                    />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  }

};


export default PersonalCard;