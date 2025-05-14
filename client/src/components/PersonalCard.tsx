// client/src/components/PersonalCard.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/PersonalCard.css';
import { 
    aboutNavIconLeft, 
    aboutNavIconRight,
    githubSectionTranslations // Assuming 'vi' as default for now or pass lang
} from './languageSelector/languageSelector.constants'; // Or directly in this file if simpler

interface PersonalCardProps {
  style?: React.CSSProperties;
  name: string;
  section: 'about' | 'all';
  githubUsername?: string; // Make optional if PersonalCard can be used elsewhere without it
}

type AboutSubSection = 'intro' | 'github';

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

  useEffect(() => {
    if (section === 'about' && currentAboutSubSection === 'github' && !githubData && githubUsername) {
      const fetchGithubData = async () => {
        setGithubLoading(true);
        setGithubError(null);
        try {
          const userRes = await fetch(`https://api.github.com/users/${githubUsername}`);
          if (!userRes.ok) throw new Error(`GitHub user API error: ${userRes.status}`);
          const userData = await userRes.json();
          
          // Optional: Fetch repos if needed
          // const reposRes = await fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=5&sort=updated`);
          // if (!reposRes.ok) throw new Error(`GitHub repos API error: ${reposRes.status}`);
          // const reposData = await reposRes.json();
          
          setGithubData({ user: userData /*, repos: reposData */ });
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

  const handleNextSubSection = () => {
    if (currentAboutSubSection === 'intro') {
      setSlideDirection(1);
      setCurrentAboutSubSection('github');
    }
    // Add more sections if needed
  };

  const handlePrevSubSection = () => {
    if (currentAboutSubSection === 'github') {
      setSlideDirection(-1);
      setCurrentAboutSubSection('intro');
    }
    // Add more sections if needed
  };


  if (section === 'about') {
    const lang = 'vi'; // Hardcoded for simplicity, pass down from LanguageSelector if needed

    return (
      <div className={containerClassName} style={style}>
        <div className="about-sub-section-navigation">
            <motion.button
                className="about-nav-arrow prev"
                onClick={handlePrevSubSection}
                disabled={currentAboutSubSection === 'intro'}
                aria-label="Previous section"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: currentAboutSubSection === 'intro' ? 0.3 : 1, scale: 1, pointerEvents: currentAboutSubSection === 'intro' ? 'none' : 'auto' }}
                whileHover={{ scale: currentAboutSubSection !== 'intro' ? 1.15 : 1, x: currentAboutSubSection !== 'intro' ? -3 : 0 }}
                whileTap={{ scale: currentAboutSubSection !== 'intro' ? 0.9 : 1 }}
                transition={{type:"spring", stiffness:300, damping:15}}
            >
                <span dangerouslySetInnerHTML={{ __html: aboutNavIconLeft }} />
            </motion.button>
            
            <h2 className="about-section-title">
                {currentAboutSubSection === 'intro' && "Giới Thiệu"}
                {currentAboutSubSection === 'github' && githubSectionTranslations.title[lang]}
            </h2>

            <motion.button
                className="about-nav-arrow next"
                onClick={handleNextSubSection}
                disabled={currentAboutSubSection === 'github'} // Assuming only two sections for now
                aria-label="Next section"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: currentAboutSubSection === 'github' ? 0.3 : 1, scale: 1, pointerEvents: currentAboutSubSection === 'github' ? 'none' : 'auto'}}
                whileHover={{ scale: currentAboutSubSection !== 'github' ? 1.15 : 1, x: currentAboutSubSection !== 'github' ? 3 : 0 }}
                whileTap={{ scale: currentAboutSubSection !== 'github' ? 0.9 : 1 }}
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
                    <div className="github-stats-container">
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
                            {/* Add more stats as needed e.g. public_gists, following */}
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Fallback for section === 'all' or other future sections
  return (
    <div className={containerClassName} style={style}>
      {/* Header can be re-added here if needed for 'all' view */}
      {/* Example:
      <div className="card-main-header">
         ... avatar, name, title for 'all' view
      </div>
      */}

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
          {/* Dynamically update this if githubUsername is available for 'all' section too */}
          <a href={`https://github.com/${githubUsername || 'your-github-username'}`} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/your-linkedin-profile" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:your.email@example.com">Email</a>
        </div>
      </div>
    </div>
  );
};

export default PersonalCard;