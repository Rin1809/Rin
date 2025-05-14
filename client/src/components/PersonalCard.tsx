// client/src/components/PersonalCard.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/PersonalCard.css';
import { 
    aboutNavIconLeft, 
    aboutNavIconRight,
    githubSectionTranslations // This now includes discordPresenceTitle
} from './languageSelector/languageSelector.constants';

interface PersonalCardProps {
  style?: React.CSSProperties;
  name: string;
  section: 'about' | 'all';
  githubUsername?: string;
  // We can add discordUserId directly here if it's static or pass it down like githubUsername
  // For now, the Lanyard URL uses a static ID from your example.
}

type AboutSubSection = 'intro' | 'github' | 'github-stats-ii' | 'github-stats-iii' | 'discord-presence'; // Added discord-presence
const aboutSubSectionsOrder: AboutSubSection[] = [
    'intro', 
    'github', 
    'github-stats-ii', 
    'github-stats-iii',
    'discord-presence' // Added discord-presence
];

const aboutSectionVariants: { [key: string]: any } = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 30, mass: 0.9 }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.9,
    transition: { type: "tween", ease: "anticipate", duration: 0.35 }
  })
};


const PersonalCard: React.FC<PersonalCardProps> = ({ style, name, section, githubUsername }) => {
  const containerClassName = section === 'about' ? 'personal-card-about-view' : 'personal-card-container';
  const [currentAboutSubSection, setCurrentAboutSubSection] = useState<AboutSubSection>('intro');
  const [slideDirection, setSlideDirection] = useState(0);

  const [githubData, setGithubData] = useState<any>(null);
  const [githubLoading, setGithubLoading] = useState<boolean>(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  
  // Static Discord User ID from your Lanyard URL
  const discordUserId = "873576591693873252";


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


  if (section === 'about') {
    const lang = 'vi'; // Hardcoded for simplicity
    const currentIndex = aboutSubSectionsOrder.indexOf(currentAboutSubSection);
    const isFirstSection = currentIndex === 0;
    const isLastSection = currentIndex === aboutSubSectionsOrder.length - 1;

    const getSectionTitle = () => {
        switch(currentAboutSubSection) {
            case 'intro': return "Giới Thiệu";
            case 'github': return githubSectionTranslations.title[lang];
            case 'github-stats-ii': return githubSectionTranslations.titlePart2[lang];
            case 'github-stats-iii': return githubSectionTranslations.titlePart3[lang];
            case 'discord-presence': return githubSectionTranslations.discordPresenceTitle[lang]; // Added title
            default: return "Thông tin";
        }
    };

    return (
      <div className={containerClassName} style={style}>
        <div className="about-sub-section-navigation">
            <motion.button
                className="about-nav-arrow prev"
                onClick={() => changeSubSection('prev')}
                disabled={isFirstSection}
                aria-label="Previous section"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: isFirstSection ? 0.3 : 1, scale: 1, pointerEvents: isFirstSection ? 'none' : 'auto' }}
                whileHover={{ scale: !isFirstSection ? 1.15 : 1, x: !isFirstSection ? -3 : 0 }}
                whileTap={{ scale: !isFirstSection ? 0.9 : 1 }}
                transition={{type:"spring", stiffness:300, damping:15}}
            >
                <span dangerouslySetInnerHTML={{ __html: aboutNavIconLeft }} />
            </motion.button>
            
            <h2 className="about-section-title">
                {getSectionTitle()}
            </h2>

            <motion.button
                className="about-nav-arrow next"
                onClick={() => changeSubSection('next')}
                disabled={isLastSection}
                aria-label="Next section"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: isLastSection ? 0.3 : 1, scale: 1, pointerEvents: isLastSection ? 'none' : 'auto'}}
                whileHover={{ scale: !isLastSection ? 1.15 : 1, x: !isLastSection ? 3 : 0 }}
                whileTap={{ scale: !isLastSection ? 0.9 : 1 }}
                transition={{type:"spring", stiffness:300, damping:15}}
            >
               <span dangerouslySetInnerHTML={{ __html: aboutNavIconRight }} />
            </motion.button>
        </div>

        <div className="about-sub-section-content-wrapper">
          <AnimatePresence initial={false} custom={slideDirection} mode="wait">
            <motion.div
              key={currentAboutSubSection}
              className="about-sub-section-content"
              custom={slideDirection}
              variants={aboutSectionVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {currentAboutSubSection === 'intro' && (
                <p className="bio-text">
                  Chào bạn! Mình là {name}, một người đam mê công nghệ với nhiều năm kinh nghiệm trong việc phát triển các giải pháp phần mềm sáng tạo và quản trị hạ tầng hệ thống vững chắc.
                  Niềm yêu thích của mình là không ngừng khám phá những công nghệ tiên tiến, từ đó xây dựng nên các sản phẩm không chỉ giải quyết vấn đề hiệu quả mà còn mang lại trải nghiệm người dùng tối ưu.
                  Mình tin tưởng mạnh mẽ vào tinh thần hợp tác, sức mạnh của cộng đồng mã nguồn mở, và luôn tìm kiếm cơ hội để đóng góp cũng như học hỏi từ những người cùng chí hướng.
                </p>
              )}

              {currentAboutSubSection === 'github' && (
                <>
                  {githubLoading && <p className="loading-text">Đang tải dữ liệu GitHub...</p>}
                  {githubError && <p className="error-text">Lỗi: {githubError}</p>}
                  {githubData && githubData.user && (
                    <div className="github-stats-container api-stats">
                        <div className="github-user-header">
                            <img src={githubData.user.avatar_url} alt={`${githubData.user.login}'s avatar`} className="github-avatar" />
                            <div className="github-user-info">
                                <h3>{githubData.user.name || githubData.user.login}</h3>
                                {githubData.user.bio && <p className="github-bio">{githubData.user.bio}</p>}
                            </div>
                        </div>
                        <div className="github-stats-grid">
                            <div className="stat-item">
                                <span className="stat-value">{githubData.user.followers}</span>
                                <span className="stat-label">{githubSectionTranslations.followers[lang]}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{githubData.user.public_repos}</span>
                                <span className="stat-label">{githubSectionTranslations.publicRepos[lang]}</span>
                            </div>
                        </div>
                        {githubData.user.html_url && (
                            <a href={githubData.user.html_url} target="_blank" rel="noopener noreferrer" className="github-profile-link">
                                {githubSectionTranslations.profileLink[lang]}
                            </a>
                        )}
                    </div>
                  )}
                </>
              )}
              {currentAboutSubSection === 'github-stats-ii' && githubUsername && (
                <div className="github-stats-image-container">
                    <img 
                        src={`https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${githubUsername}&theme=tokyonight`} 
                        alt="GitHub Profile Details" 
                        className="github-stat-image"
                    />
                    <img 
                        src={`https://github-readme-activity-graph.vercel.app/graph?username=${githubUsername}&theme=tokyonight&hide_border=true&area=true&line=BB9AF7&point=79E6F3`} 
                        alt="GitHub Activity Graph" 
                        className="github-stat-image"
                    />
                </div>
              )}
              {currentAboutSubSection === 'github-stats-iii' && githubUsername && (
                <div className="github-stats-image-container grid-2x2">
                    <img 
                        src={`https://github-profile-summary-cards.vercel.app/api/cards/productive-time?username=${githubUsername}&theme=tokyonight&utcOffset=7`} 
                        alt="GitHub Productive Time" 
                        className="github-stat-image"
                    />
                    <img 
                        src={`https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=${githubUsername}&theme=tokyonight`}
                        alt="GitHub Most Committed Language" 
                        className="github-stat-image"
                    />
                    <img 
                        src={`https://github-readme-stats.vercel.app/api/top-langs?username=${githubUsername}&show_icons=true&locale=en&layout=compact&theme=tokyonight`} 
                        alt="GitHub Top Languages" 
                        className="github-stat-image"
                    />
                    <img 
                        src={`https://streak-stats.demolab.com/?user=${githubUsername}&theme=tokyonight&date_format=M%20j%5B%2C%20Y%5D`} 
                        alt="GitHub Streak Stats" 
                        className="github-stat-image"
                    />
                </div>
              )}
              {currentAboutSubSection === 'discord-presence' && ( // Added Discord Presence Section
                <div className="discord-presence-container">
                    <img
                        src={`https://lanyard-profile-readme.vercel.app/api/${discordUserId}?theme=dark&bg=1A1B26&animated=true&borderRadius=10px&titleColor=BB9AF7&statusColor=79E6F3&hideDiscrim=false&idleMessage=%C4%90ang%20chill...`}
                        alt="Discord Presence"
                        className="discord-presence-image" // Use a specific class or reuse .github-stat-image
                    />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Fallback for section === 'all' or other future sections
  return (
    <div className={containerClassName} style={style}>
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
          <a href={`https://github.com/${githubUsername || 'your-github-username'}`} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/your-linkedin-profile" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:your.email@example.com">Email</a>
        </div>
      </div>
    </div>
  );
};

export default PersonalCard;