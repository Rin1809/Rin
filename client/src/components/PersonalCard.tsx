// client/src/components/PersonalCard.tsx
import React, { useState, useEffect, useRef } from 'react'; // Thêm useRef
import { motion, AnimatePresence, useAnimation } from 'framer-motion'; // Thêm useAnimation
import './styles/PersonalCard.css';
import { 
    aboutNavIconLeft, 
    aboutNavIconRight,
    githubSectionTranslations 
} from './languageSelector/languageSelector.constants';

interface PersonalCardProps {
  style?: React.CSSProperties;
  name: string;
  section: 'about' | 'all';
  githubUsername?: string;
}

type AboutSubSection = 'intro' | 'github' | 'github-stats-ii' | 'github-stats-iii' | 'discord-presence';
const aboutSubSectionsOrder: AboutSubSection[] = [
    'intro', 
    'github', 
    'github-stats-ii', 
    'github-stats-iii',
    'discord-presence'
];

const aboutSectionVariants: { [key: string]: any } = {
  enter: (direction: number) => ({
    rotateY: direction > 0 ? 70 : -70,
    opacity: 0,
    scale: 0.92,
    originX: direction > 0 ? 0 : 1,
    filter: "blur(5px) brightness(0.7)",
  }),
  center: {
    zIndex: 1,
    rotateY: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px) brightness(1)",
    transition: { type: "spring", stiffness: 220, damping: 28, mass: 0.9, duration: 0.6 }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    rotateY: direction < 0 ? -70 : 70,
    opacity: 0,
    scale: 0.92,
    originX: direction < 0 ? 1 : 0,
    filter: "blur(5px) brightness(0.7)",
    transition: { type: "tween", ease: [0.76, 0, 0.24, 1], duration: 0.4 }
  })
};

const PersonalCard: React.FC<PersonalCardProps> = ({ style, name, section, githubUsername }) => {
  const containerClassName = section === 'about' ? 'personal-card-about-view' : 'personal-card-container';
  const [currentAboutSubSection, setCurrentAboutSubSection] = useState<AboutSubSection>('intro');
  const [slideDirection, setSlideDirection] = useState(0);

  const [githubData, setGithubData] = useState<any>(null);
  const [githubLoading, setGithubLoading] = useState<boolean>(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  
  const discordUserId = "873576591693873252";

  // Ref cho content wrapper để điều khiển animation chiều cao
  const contentWrapperControls = useAnimation();
  // Ref cho content hiện tại để đo chiều cao
  const currentContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentContentRef.current) {
      const currentContentHeight = currentContentRef.current.offsetHeight;
      // Animate chiều cao của wrapper
      contentWrapperControls.start({
        height: currentContentHeight,
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } // easeOutQuint
      });
    }
  }, [currentAboutSubSection, contentWrapperControls]); // Chạy khi section thay đổi


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
    const lang = 'vi';
    const currentIndex = aboutSubSectionsOrder.indexOf(currentAboutSubSection);
    const isFirstSection = currentIndex === 0;
    const isLastSection = currentIndex === aboutSubSectionsOrder.length - 1;

    const getSectionTitle = () => {
        switch(currentAboutSubSection) {
            case 'intro': return "Giới Thiệu";
            case 'github': return githubSectionTranslations.title[lang];
            case 'github-stats-ii': return githubSectionTranslations.titlePart2[lang];
            case 'github-stats-iii': return githubSectionTranslations.titlePart3[lang];
            case 'discord-presence': return githubSectionTranslations.discordPresenceTitle[lang];
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

        <motion.div
            className="about-sub-section-content-wrapper"
            initial={{ height: 'auto' }} // Bắt đầu với height tự động
            animate={contentWrapperControls} // Sử dụng controls để animate chiều cao
        >
          <AnimatePresence 
            initial={false} 
            custom={slideDirection} 
            mode="wait"
            // Không cần onExitComplete ở đây nếu useEffect đã xử lý chiều cao
          >
            <motion.div
              key={currentAboutSubSection}
              ref={currentContentRef} // Gán ref cho content hiện tại để đo
              className="about-sub-section-content"
              custom={slideDirection}
              variants={aboutSectionVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ position: 'absolute', width: '100%' }} // Giúp AnimatePresence xử lý tốt hơn với mode="wait"
            >
              {/* Nội dung các section, ví dụ: */}
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
              {currentAboutSubSection === 'discord-presence' && (
                <div className="discord-presence-container">
                    <img
                        src={`https://lanyard-profile-readme.vercel.app/api/${discordUserId}?theme=dark&bg=1A1B26&animated=true&borderRadius=10px&titleColor=BB9AF7&statusColor=79E6F3&hideDiscrim=false&idleMessage=%C4%90ang%20chill...`}
                        alt="Discord Presence"
                        className="discord-presence-image"
                    />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

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