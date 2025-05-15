// client/src/components/PersonalCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
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

type AboutSubSection = 'intro' | 'github' | 'github-stats-ii' | 'github-stats-iii' | 'discord-presence' | 'socials';
const aboutSubSectionsOrder: AboutSubSection[] = [
    'intro',
    'github',
    'github-stats-ii',
    'github-stats-iii',
    'discord-presence',
    'socials'
];

const aboutSectionContentVariants: { [key: string]: any } = {
  enter: (direction: number) => ({
    rotateY: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.95,
    originX: direction > 0 ? 0 : 1,
    filter: "blur(4px) brightness(0.8)",
  }),
  center: {
    zIndex: 1,
    rotateY: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px) brightness(1)",
    transition: { type: "spring", stiffness: 200, damping: 25, mass: 0.85, duration: 0.55 }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    rotateY: direction < 0 ? -60 : 60,
    opacity: 0,
    scale: 0.95,
    originX: direction < 0 ? 1 : 0,
    filter: "blur(4px) brightness(0.8)",
    transition: { type: "tween", ease: [0.6, 0.05, 0.25, 0.95], duration: 0.35 }
  })
};

const aboutSectionTitleAnimVariants = {
    initial: { opacity: 0, y: -20, filter: "blur(3px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1], delay:0.05 } },
    exit: { opacity: 0, y: 10, filter: "blur(2px)", transition: {duration: 0.2}}
};

const PersonalCard: React.FC<PersonalCardProps> = ({ style, name, section, githubUsername, language }) => {
  const containerClassName = section === 'about' ? 'personal-card-about-view' : 'personal-card-container';
  const [currentAboutSubSection, setCurrentAboutSubSection] = useState<AboutSubSection>('intro');
  const [slideDirection, setSlideDirection] = useState(0);

  const [githubData, setGithubData] = useState<any>(null);
  const [githubLoading, setGithubLoading] = useState<boolean>(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  const discordUserId = "873576591693873252";

  const contentWrapperControls = useAnimation();
  const currentContentRef = useRef<HTMLDivElement>(null);
  const contentWrapperOuterRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number | null>(null);


  useEffect(() => {
    if (section === 'about' && currentAboutSubSection === 'github' && !githubData && githubUsername) {
      const fetchGithubData = async () => {
        setGithubLoading(true);
        setGithubError(null);
        try {
          const userRes = await fetch(`https://api.github.com/users/${githubUsername}`);
          if (!userRes.ok) throw new Error(`GitHub user API error: ${userRes.status}`);
          const userData = await userRes.json();
          setGithubData({ user: userData });
        } catch (error: any) {
          console.error("Failed to fetch GitHub data:", error);
          setGithubError(error.message || "Could not load GitHub data.");
        } finally {
          setGithubLoading(false);
        }
      };
      fetchGithubData();
    }
  }, [section, currentAboutSubSection, githubData, githubUsername]);

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
        setCurrentAboutSubSection(aboutSubSectionsOrder[nextIndex]);
    }
  };

  useEffect(() => {
    if (section === 'about' && currentContentRef.current) {
        const newHeight = currentContentRef.current.offsetHeight;

        if (newHeight > 0 && (prevHeightRef.current === null || prevHeightRef.current !== newHeight)) {
            contentWrapperControls.start({
                height: newHeight,
                transition: { type: "spring", stiffness: 260, damping: 30, mass: 0.9, duration: 0.45 }
            });
            prevHeightRef.current = newHeight;
        } else if (prevHeightRef.current === null && newHeight === 0) {
            contentWrapperControls.start({ height: 'auto' });
        }
        if (contentWrapperOuterRef.current) {
            contentWrapperOuterRef.current.scrollTop = 0;
        }
    }
  }, [currentAboutSubSection, githubLoading, githubData, githubError, section, contentWrapperControls, language]); // Added language as dependency

  const socialLinksData = [
    {
        id: 'github',
        url: `https://github.com/${githubUsername || 'Rin1809'}`,
        translationKey: 'github' as keyof typeof personalCardTranslations.socialLinks
    },
    {
        id: 'tiktok',
        url: "https://www.tiktok.com/@rinrinn1913",
        translationKey: 'tiktok' as keyof typeof personalCardTranslations.socialLinks
    },
    {
        id: 'discordProfile',
        url: `https://discord.com/users/873576591693873252`,
        translationKey: 'discordProfile' as keyof typeof personalCardTranslations.socialLinks
    },
    {
        id: 'discordServer',
        url: "https://discord.com/invite/homqua",
        translationKey: 'discordServer' as keyof typeof personalCardTranslations.socialLinks
    },
    {
        id: 'youtube',
        url: "https://www.youtube.com/@RinnRin1913",
        translationKey: 'youtube' as keyof typeof personalCardTranslations.socialLinks
    }
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
            case 'socials': return personalCardTranslations.sectionTitles.socials[currentLang]; // Added
            default: return "Information";
        }
    };
    

    const bioPart1 = personalCardTranslations.introBio.part1[currentLang].replace(personalCardTranslations.introBio.namePlaceholder, name);
    const bioPart2 = personalCardTranslations.introBio.part2[currentLang];
    const bioPart3 = personalCardTranslations.introBio.part3[currentLang];
    const bioPart4 = personalCardTranslations.introBio.part4[currentLang];
    const bioPart5 = personalCardTranslations.introBio.part5[currentLang];

    const fullBioHtml = `${bioPart1}<br/><br/>${bioPart2}<br/><br/>${bioPart3}<br/><br/>${bioPart4}<br/><br/>${bioPart5}`;

    return (
      <motion.div
        className={containerClassName}
        style={style}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.1 } }}
        exit={{ opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.3 } }}
      >
        <div className="about-sub-section-navigation">
            <motion.button
                className="about-nav-arrow prev"
                onClick={() => changeSubSection('prev')}
                aria-label="Previous section"
                initial={{ opacity: 0, x: -10 }}
                animate={{
                    opacity: isFirstSection ? 0.3 : 1,
                    x: 0,
                    pointerEvents: isFirstSection ? 'none' : 'auto'
                }}
                whileHover={{ scale: !isFirstSection ? 1.15 : 1, x: !isFirstSection ? -3 : 0,
                              color: !isFirstSection ? "var(--primary-color)" : "var(--highlight-color-poetic)",
                              boxShadow: !isFirstSection ? "0 0 10px rgba(var(--primary-color-rgb),0.3)" : "none"
                            }}
                whileTap={{ scale: !isFirstSection ? 0.92 : 1 }}
                transition={{type:"spring", stiffness:320, damping:18}}
            >
                <span dangerouslySetInnerHTML={{ __html: aboutNavIconLeft }} />
            </motion.button>

            <AnimatePresence mode="wait">
                <motion.h2
                    key={currentAboutSubSection + "-title-" + currentLang} // Added currentLang to key
                    className="about-section-title"
                    variants={aboutSectionTitleAnimVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    {getSectionTitleText()}
                </motion.h2>
            </AnimatePresence>

            <motion.button
                className="about-nav-arrow next"
                onClick={() => changeSubSection('next')}
                aria-label="Next section"
                initial={{ opacity: 0, x: 10 }}
                animate={{
                    opacity: isLastSection ? 0.3 : 1,
                    x: 0,
                    pointerEvents: isLastSection ? 'none' : 'auto'
                }}
                whileHover={{ scale: !isLastSection ? 1.15 : 1, x: !isLastSection ? 3 : 0,
                              color: !isLastSection ? "var(--primary-color)" : "var(--highlight-color-poetic)",
                              boxShadow: !isLastSection ? "0 0 10px rgba(var(--primary-color-rgb),0.3)" : "none"
                            }}
                whileTap={{ scale: !isLastSection ? 0.92 : 1 }}
                transition={{type:"spring", stiffness:320, damping:18}}
            >
               <span dangerouslySetInnerHTML={{ __html: aboutNavIconRight }} />
            </motion.button>
        </div>

        <motion.div
            ref={contentWrapperOuterRef}
            className="about-sub-section-content-wrapper"
            animate={contentWrapperControls}
            initial={{ height: 'auto' }}
        >
          <AnimatePresence
            initial={false}
            custom={slideDirection}
            mode="wait"
          >
            <motion.div
              ref={currentContentRef}
              key={currentAboutSubSection + currentLang} // Added currentLang to key
              className="about-sub-section-content"
              custom={slideDirection}
              variants={aboutSectionContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {currentAboutSubSection === 'intro' && (
                <div className="sub-section-inner-padding">
                  <p className="bio-text" dangerouslySetInnerHTML={{ __html: fullBioHtml }} />
                </div>
              )}

              {currentAboutSubSection === 'github' && (
                <div className="sub-section-inner-padding">
                  {githubLoading && <p className="loading-text">{personalCardTranslations.loadingText[currentLang]}</p>}
                  {githubError && <p className="error-text">{personalCardTranslations.errorTextPrefix[currentLang]}{githubError}</p>}
                  {githubData?.user && (
                    <div className="github-stats-container api-stats">
                        <div className="github-user-header">
                            <motion.img
                                src={githubData.user.avatar_url}
                                alt={`${githubData.user.login}'s avatar`}
                                className="github-avatar"
                                whileHover={{ scale: 1.1, rotate: 2, y: -2, boxShadow: "0 0 25px rgba(var(--primary-color-rgb),0.6), 0 0 10px rgba(var(--primary-color-rgb),0.8)"}}
                                transition={{type: "spring", stiffness:300, damping:10}}
                            />
                            <div className="github-user-info">
                                <h3>{githubData.user.name || githubData.user.login}</h3>
                                <p className="github-bio">{githubData.user.bio || personalCardTranslations.githubUserBioDefault[currentLang]}</p>
                            </div>
                        </div>
                        <div className="github-stats-grid">
                            <motion.div className="stat-item" whileHover={{y:-4, boxShadow:"0 6px 18px rgba(var(--highlight-color-poetic-rgb),0.2)"}}>
                                <span className="stat-value">{githubData.user.followers}</span>
                                <span className="stat-label">{githubSectionTranslations.followers[currentLang]}</span>
                            </motion.div>
                            <motion.div className="stat-item" whileHover={{y:-4, boxShadow:"0 6px 18px rgba(var(--highlight-color-poetic-rgb),0.2)"}}>
                                <span className="stat-value">{githubData.user.public_repos}</span>
                                <span className="stat-label">{githubSectionTranslations.publicRepos[currentLang]}</span>
                            </motion.div>
                        </div>
                        {githubData.user.html_url && (
                            <motion.a
                                href={githubData.user.html_url} target="_blank" rel="noopener noreferrer"
                                className="github-profile-link"
                                whileHover={{scale:1.05, y: -2, boxShadow: "0 0 15px rgba(var(--highlight-color-poetic-rgb),0.4)"}}
                                whileTap={{scale:0.95}}
                            >
                                {githubSectionTranslations.profileLink[currentLang]}
                            </motion.a>
                        )}
                    </div>
                  )}
                </div>
              )}
              {currentAboutSubSection === 'github-stats-ii' && githubUsername && (
                <div className="github-stats-image-container sub-section-inner-padding">
                    <motion.img
                        src={`https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${githubUsername}&theme=tokyonight`}
                        alt="GitHub Profile Details"
                        className="github-stat-image"
                         whileHover={{y:-5, scale:1.03, transition:{type:"spring", stiffness:300, damping:12}}}
                    />
                    <motion.img
                        src={`https://github-readme-activity-graph.vercel.app/graph?username=${githubUsername}&theme=tokyonight&hide_border=true&area=true&line=BB9AF7&point=79E6F3`}
                        alt="GitHub Activity Graph"
                        className="github-stat-image wide-image"
                        whileHover={{y:-5, scale:1.03, transition:{type:"spring", stiffness:300, damping:12}}}
                    />
                </div>
              )}
              {currentAboutSubSection === 'github-stats-iii' && githubUsername && (
                <div className="github-stats-image-container grid-2x2 sub-section-inner-padding">
                    <motion.img
                        src={`https://github-profile-summary-cards.vercel.app/api/cards/productive-time?username=${githubUsername}&theme=tokyonight&utcOffset=7`}
                        alt="GitHub Productive Time"
                        className="github-stat-image"
                        whileHover={{y:-5, scale:1.03, transition:{type:"spring", stiffness:300, damping:12}}}
                    />
                    <motion.img
                        src={`https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=${githubUsername}&theme=tokyonight`}
                        alt="GitHub Most Committed Language"
                        className="github-stat-image"
                         whileHover={{y:-5, scale:1.03, transition:{type:"spring", stiffness:300, damping:12}}}
                    />
                    <motion.img
                        src={`https://github-readme-stats.vercel.app/api/top-langs?username=${githubUsername}&show_icons=true&locale=en&layout=compact&theme=tokyonight`}
                        alt="GitHub Top Languages"
                        className="github-stat-image"
                        whileHover={{y:-5, scale:1.03, transition:{type:"spring", stiffness:300, damping:12}}}
                    />
                    <motion.img
                        src={`https://streak-stats.demolab.com/?user=${githubUsername}&theme=tokyonight&date_format=M%20j%5B%2C%20Y%5D`}
                        alt="GitHub Streak Stats"
                        className="github-stat-image"
                        whileHover={{y:-5, scale:1.03, transition:{type:"spring", stiffness:300, damping:12}}}
                    />
                </div>
              )}
              {currentAboutSubSection === 'discord-presence' && (
                <div className="discord-presence-container sub-section-inner-padding">
                    <motion.img
                        src={`https://lanyard-profile-readme.vercel.app/api/${discordUserId}?theme=dark&bg=1A1B26&animated=true&borderRadius=10px&titleColor=BB9AF7&statusColor=79E6F3&hideDiscrim=false&idleMessage=%C4%90ang%20chill...`}
                        alt="Discord Presence"
                        className="discord-presence-image"
                        whileHover={{y:-5, scale:1.03, transition:{type:"spring", stiffness:300, damping:12}}}
                    />
                </div>
              )}
              {currentAboutSubSection === 'socials' && (
                <div className="sub-section-inner-padding">
                    <div className="social-media-links-container">
                        {socialLinksData.map(link => (
                            <motion.a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-media-link"
                                whileHover={{ y: -3, scale:1.03, boxShadow: "0 5px 15px rgba(var(--highlight-color-poetic-rgb),0.2)" }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                                {personalCardTranslations.socialLinks[link.translationKey][currentLang]}
                            </motion.a>
                        ))}
                    </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  }

  // Fallback for section="all" or other unhandled cases
  return (
    <div className={containerClassName} style={style}>
      <div className="card-main-header">
          <img
              src={cardData.avatarUrl}
              alt={`${name}'s avatar`}
              className="my-avatar"
          />
          <div className="my-name-title">
              <h2>{name}</h2>
              <p className="my-title">{cardData.title}</p>
          </div>
      </div>
      <div className="card-section">
        <h3 className="section-heading">Giới Thiệu</h3>
        <p className="bio-text">
          Chào bạn! Mình là {name}, một người đam mê công nghệ với kinh nghiệm trong phát triển phần mềm và quản trị hệ thống.
          Mình thích khám phá những công nghệ mới và xây dựng các giải pháp sáng tạo.
          Mình tin vào sức mạnh của mã nguồn mở và cộng đồng.
        </p>
      </div>
      <div className="card-section">
        <h3 className="section-heading">Kỹ Năng</h3>
        <ul className="skills-list">
          <li className="skill-tag">Python</li>
          <li className="skill-tag">JavaScript/TypeScript</li>
          <li className="skill-tag">React</li>
          <li className="skill-tag">Node.js</li>
          <li className="skill-tag">Docker</li>
          <li className="skill-tag">Linux</li>
          <li className="skill-tag">SQL/NoSQL</li>
          <li className="skill-tag">Git</li>
          <li className="skill-tag">Cloud (AWS/GCP cơ bản)</li>
        </ul>
      </div>
      <div className="card-section">
        <h3 className="section-heading">Liên Hệ</h3>
        <div className="contact-links">
          <a href={`https://github.com/${githubUsername || 'Rin1809'}`} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.facebook.com/profile.php?id=100010587553539" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="mailto:khoavo1809@gmail.com">Email</a>
        </div>
      </div>
    </div>
  );
};

const cardData = {
    avatarUrl: "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=128",
    title: "IT Student | Cyber Security "
};

export default PersonalCard;