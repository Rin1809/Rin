// client/src/components/Blog.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Variants, useAnimation } from 'framer-motion';
import './styles/Blog.css'; 
import { aboutNavIconLeft } from './languageSelector/languageSelector.constants'; 
import { logInteraction } from '../utils/logger';

// Enhanced Icons for Lightbox
const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"> {/* Thicker stroke */}
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const IconChevronLeftLightbox = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRightLightbox = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;


interface BlogPost {
  id: number;
  title: string;
  content?: string;
  image_url?: string;
  discord_author_id: string;
  timestamp: string;
}

interface BlogProps {
  language: 'vi' | 'en' | 'ja';
  onBack?: () => void;
}

// Using existing translations from constants file if defined, otherwise fallback or add new ones here
const blogTranslations = {
  title: { vi: "Nhật Ký Mơ Màng Của Rin", en: "Rin's Dreamy Diary", ja: "リンの夢日記" },
  loading: { vi: "Đang lật giở những trang ký ức...", en: "Turning the pages of memory...", ja: "記憶のページをめくっています。。。" },
  error: { vi: "Không thể tìm thấy mực để viết tiếp. Vui lòng thử lại sau.", en: "Couldn't find ink to write. Please try again later.", ja: "書くためのインクが見つかりませんでした。後でもう一度お試しください。" },
  noPosts: { vi: "Những trang giấy còn đang chờ đợi câu chuyện đầu tiên...", en: "The pages await their first story...", ja: "最初の物語を待っているページ。。。" },
  postedOn: { vi: "Khắc vào ngày", en: "Inscribed on", ja: "記された日："},
  readMore: { vi: "Lạc vào câu chuyện...", en: "Lose yourself in the story...", ja: "物語に浸る。。。" },
  backButton: { vi: "Trở Về Cõi Mộng", en: "Return to Dreams", ja: "夢の国へ戻る" }, // More poetic
  closeLightbox: { vi: "Thoát khỏi giấc mơ (Esc)", en: "Escape the dream (Esc)", ja: "夢から覚める (Esc)" },
  prevPost: { vi: "Giấc mơ trước", en: "Previous Dream", ja: "前の夢" },
  nextPost: { vi: "Giấc mơ kế", en: "Next Dream", ja: "次の夢" },
  authorName: { vi: "Người Kể Chuyện", en: "The Storyteller", ja: "語り部" }, 
};

// --- ENHANCED FRAMER MOTION VARIANTS ---
const blogContainerVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96, filter: "blur(5px)" },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], staggerChildren: 0.12, delayChildren: 0.25 }
  },
  exit: { opacity: 0, y: 25, scale: 0.97, filter: "blur(4px)", transition: { duration: 0.35 } }
};

const blogPostItemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95, filter: "blur(4px) saturate(0.7)" },
  visible: { 
    opacity: 1, y: 0, scale: 1, filter: "blur(0px) saturate(1)",
    transition: { type: "spring", stiffness: 140, damping: 22, mass: 0.85 }
  },
  hover: {
     y: -8, 
     scale: 1.035,
     boxShadow: "0 18px 45px -15px var(--blog-card-hover-glow), 0 0 25px rgba(var(--highlight-color-poetic-rgb), 0.22) inset, 0 0 10px rgba(var(--primary-color-rgb),0.1) inset",
     borderColor: "rgba(var(--highlight-color-poetic-rgb), 0.45)",
     transition: { type: "spring", stiffness: 320, damping: 16 }
  },
  tap: { 
    scale: 0.97, 
    boxShadow: "0 10px 30px -12px var(--blog-card-tap-glow), 0 0 15px rgba(var(--highlight-color-poetic-rgb), 0.15) inset",
    transition: { type: "spring", stiffness: 380, damping: 22 } 
  },
  exit: { opacity: 0, y: 18, scale: 0.96, filter: "blur(3px)", transition: { duration: 0.3, ease: "easeIn" } }
};

const textItemVariants: Variants = { // For title, status messages
    initial: { opacity: 0, y: 20, filter: "blur(2px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1], delay: 0.1 } },
    exit: { opacity: 0, y: -12, filter: "blur(2px)", transition: { duration: 0.3 } }
};

const lightboxOverlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.55, ease: "easeInOut" } }, // Slower, more dramatic fade
    exit: { opacity: 0, transition: { duration: 0.45, ease: "easeInOut", delay:0.1 } } 
};
const lightboxContentVariants: Variants = {
    hidden: { opacity: 0, scale: 0.75, y: 60, filter: "blur(10px) saturate(0.6) brightness(0.8)" }, // More dramatic entry
    visible: { opacity: 1, scale: 1, y: 0, filter: "blur(0px) saturate(1) brightness(1)", 
        transition: { 
            type: "spring", stiffness: 220, damping: 26, mass: 0.95, 
            when: "beforeChildren", staggerChildren: 0.06, delayChildren:0.1, delay:0.05 
        } 
    },
    exit: { opacity: 0, scale: 0.8, y: 40, filter: "blur(8px) saturate(0.7) brightness(0.9)", 
        transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] } 
    }
};
const lightboxItemVariants: Variants = { 
    initial: (direction: number) => ({ 
        opacity: 0, 
        x: direction > 0 ? 90 : -90, // Increased slide distance
        scale: 0.88, 
        filter: "blur(5px) brightness(0.9)",
        rotateY: direction > 0 ? 15 : -15 // Add subtle rotation
    }),
    animate: { 
        opacity: 1, x: 0, scale: 1, filter: "blur(0px) brightness(1)", rotateY: 0,
        transition: { type: "spring", stiffness: 160, damping: 22, mass: 0.9 } 
    },
    exit: (direction: number) => ({ 
        opacity: 0, 
        x: direction < 0 ? 90 : -90, 
        scale: 0.88,
        filter: "blur(5px) brightness(0.9)",
        rotateY: direction < 0 ? -15 : 15,
        transition: { duration: 0.3, ease: "circIn" } 
    })
};
// --- END VARIANTS ---


const API_BASE_URL_BLOG = import.meta.env.VITE_API_BASE_URL || '';
const RIN_AVATAR_URL = "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=64"; // Or use a prop

const POST_ITEM_BASE_WIDTH_ESTIMATE_PX = 365; // Adjusted for potentially wider items
const POST_ITEM_MARGIN_RIGHT_REM = 1.8; 
const SCROLL_SPEED_PPS = 70; // Slightly slower scroll for smoother feel


const Blog: React.FC<BlogProps> = ({ language, onBack }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [lightboxSlideDirection, setLightboxSlideDirection] = useState(0); 

  const listWrapperRef = useRef<HTMLDivElement>(null);
  const animationControls = useAnimation();
  const t = blogTranslations;
  const [wrapperWidth, setWrapperWidth] = useState(0);
  const [postItemFullWidth, setPostItemFullWidth] = useState(0);

  useEffect(() => {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    setPostItemFullWidth(POST_ITEM_BASE_WIDTH_ESTIMATE_PX + (POST_ITEM_MARGIN_RIGHT_REM * rootFontSize));
  }, []);


  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL_BLOG}/api/blog/posts`);
        if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
        const data = await response.json();
        setPosts(data);
      } catch (e: any) {
        console.error("Lỗi fetch blog posts:", e); 
        setError(e.message || "Lỗi không xác định khi tải bài viết."); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (listWrapperRef.current) {
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) { setWrapperWidth(entry.contentRect.width); }
      });
      observer.observe(listWrapperRef.current);
      setWrapperWidth(listWrapperRef.current.offsetWidth); 
      return () => observer.disconnect();
    }
  }, []);

  const canScroll = useMemo(() => {
    if (posts.length <= 1 || wrapperWidth === 0 || postItemFullWidth === 0) return false; // Changed to <= 1 for canScroll
    const totalOriginalPostsWidth = posts.length * postItemFullWidth;
    return totalOriginalPostsWidth > wrapperWidth;
  }, [posts, wrapperWidth, postItemFullWidth]);

  useEffect(() => {
    if (isLoading || !canScroll || postItemFullWidth === 0 || posts.length <= 1) {
      animationControls.stop();
      animationControls.set({ x: 0 }); 
      return;
    }
    
    const singleLoopWidth = posts.length * postItemFullWidth;
    const duration = singleLoopWidth / SCROLL_SPEED_PPS;

    animationControls.start({
      x: -singleLoopWidth, 
      transition: {
        x: { repeat: Infinity, repeatType: "loop", duration: duration, ease: "linear" },
      },
    });
    return () => animationControls.stop(); 
  }, [canScroll, posts, isLoading, animationControls, postItemFullWidth]);

  const formatDate = (dateString: string, lang: 'vi'|'en'|'ja') => {
     const date = new Date(dateString);
     if (isNaN(date.getTime())) return lang === 'vi' ? 'Ngày không hợp lệ' : lang === 'en' ? 'Invalid date' : '無効な日付'; 
     const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }; 
     return new Intl.DateTimeFormat(lang, options).format(date);
  };

  const listStyle = useMemo(() => {
    if (canScroll && postItemFullWidth > 0 && posts.length > 1) {
      return { width: `${posts.length * 2 * postItemFullWidth}px` };
    }
    return { display: 'flex', justifyContent: 'center', width: '100%' }; 
  }, [canScroll, posts, postItemFullWidth]);

  const openLightbox = (index: number) => {
    const postToLog = posts[index];
    setSelectedPostIndex(index);
    setLightboxSlideDirection(0); 
    setLightboxOpen(true);
    if (postToLog) {
        logInteraction('blog_post_opened', { 
            postId: postToLog.id, 
            postTitle: postToLog.title, 
            language 
        });
    }
  };

  const closeLightbox = useCallback(() => { setLightboxOpen(false); }, []);
  
  const changePostInLightbox = useCallback((direction: 'next' | 'prev') => {
    if (selectedPostIndex === null || posts.length <= 1) return;
    setLightboxSlideDirection(direction === 'next' ? 1 : -1);
    let newIndex;
    if (direction === 'next') { newIndex = (selectedPostIndex + 1) % posts.length; } 
    else { newIndex = (selectedPostIndex - 1 + posts.length) % posts.length; }
    setSelectedPostIndex(newIndex);
    logInteraction('blog_lightbox_navigated', {
        direction, currentPostId: posts[newIndex].id,
        currentPostTitle: posts[newIndex].title, language
    });
  }, [selectedPostIndex, posts, language]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (lightboxOpen) {
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowRight') changePostInLightbox('next');
        if (event.key === 'ArrowLeft') changePostInLightbox('prev');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, changePostInLightbox]);

  const currentLightboxPost = selectedPostIndex !== null ? posts[selectedPostIndex] : null;
  
  const isContentTruncated = (content: string | undefined, hasImage: boolean): boolean => {
      if (!content) return false;
      const maxLength = hasImage ? 140 : 300; // Increased limits
      return content.length > maxLength;
  };


  return (
    <motion.div 
      className="blog-view-container"
      variants={blogContainerVariants}
      initial="hidden" animate="visible" exit="exit"
      layout // Added layout for potential smoother transitions of container itself
    >
      <motion.h2 className="blog-view-title" variants={textItemVariants}>
        {t.title[language]}
      </motion.h2>
      
      <div ref={listWrapperRef} className="blog-posts-list-wrapper">
        <AnimatePresence>
          {isLoading && ( <motion.p key="loading" className="blog-status-message" variants={textItemVariants}> {t.loading[language]} </motion.p> )}
          {error && ( <motion.p key="error" className="blog-status-message error" variants={textItemVariants}> {t.error[language]} <br/> ({error}) </motion.p> )}
          {!isLoading && !error && posts.length === 0 && ( <motion.p key="no-posts" className="blog-status-message" variants={textItemVariants}> {t.noPosts[language]} </motion.p> )}
        </AnimatePresence>
        
        {!isLoading && !error && posts.length > 0 && postItemFullWidth > 0 && (
          <motion.div
            className="blog-posts-list"
            animate={animationControls} 
            style={listStyle} 
          >
            {(canScroll ? [...posts, ...posts] : posts).map((post, index) => {
                const originalIndex = index % posts.length;
                const showReadMore = isContentTruncated(post.content, !!post.image_url);
                const truncatedContent = post.content ? post.content.substring(0, post.image_url ? 140 : 300) : "";

                return (
                    <motion.article 
                        key={`${post.id}-${index}-${language}`} // Unique key
                        className={`blog-post-item ${post.image_url ? 'with-image' : 'no-image'}`} 
                        variants={blogPostItemVariants} 
                        initial="hidden" 
                        animate="visible" // Rely on parent stagger
                        whileHover="hover" 
                        whileTap="tap"
                        onClick={() => openLightbox(originalIndex)} 
                        layout // Added for smoother resizing if content changes, less relevant for static items but good practice
                    >
                        <div className="blog-post-header">
                            <motion.img src={RIN_AVATAR_URL} alt={t.authorName[language]} className="blog-post-avatar"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1, transition: { delay: 0.2, type: "spring", stiffness: 200, damping: 12 } }}
                            />
                            <div className="blog-post-author-info"> 
                                <span className="blog-post-author-name">{t.authorName[language]}</span>
                                <span className="blog-post-timestamp">{t.postedOn[language]} {formatDate(post.timestamp, language)}</span>
                            </div>
                        </div>

                        <div className="blog-post-body">
                            <h3 className="blog-post-title">{post.title}</h3>
                            {post.content && ( 
                                <p className={`blog-post-content ${showReadMore ? 'has-overflow' : ''}`}>
                                    {truncatedContent}
                                </p> 
                            )}
                        </div>
                        {showReadMore && <span className="read-more-prompt">{t.readMore[language]}</span>}

                        {post.image_url && ( 
                            <motion.img 
                                src={post.image_url} 
                                alt={post.title} 
                                className="blog-post-image" 
                                initial={{ opacity: 0, height: "0px", filter: "blur(5px)"}}
                                animate={{ opacity: 1, height: 'auto', filter: "blur(0px)", transition:{duration: 0.6, delay: 0.15, ease: [0.25, 1, 0.5, 1] } }} 
                                exit={{ opacity:0, height: "0px", filter: "blur(5px)" }}
                            /> 
                        )}
                    </motion.article>
                );
            })}
          </motion.div>
        )}
      </div>

      {onBack && (
         <motion.button
             className="card-view-back-button blog-back-button" 
             onClick={onBack}
             initial={{ opacity: 0, y: 35, scale: 0.92 }}
             animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: (posts.length > 0 ? 0.6 : 0.3), duration: 0.65, ease: [0.23, 1, 0.32, 1] } }}
             exit={{ opacity: 0, y: 22, scale: 0.94, transition: { duration: 0.3, ease: "easeIn" } }}
             whileHover={{ scale: 1.07, y: -5, boxShadow: "0 10px 25px -6px rgba(var(--primary-color-rgb), 0.4)", backgroundColor: "rgba(var(--primary-color-rgb), 0.12)" }}
             whileTap={{ scale: 0.95, y: -2 }}
             transition={{type:"spring", stiffness: 320, damping: 18}} // Shared spring for hover/tap
         >
             <motion.span className="button-icon-svg" dangerouslySetInnerHTML={{__html: aboutNavIconLeft}} 
                initial={{x:0}} whileHover={{x:-3}} transition={{type:"spring", stiffness:400, damping:15}}/>
             <span className="button-text">{t.backButton[language]}</span>
         </motion.button>
      )}

      <AnimatePresence>
        {lightboxOpen && currentLightboxPost && (
          <motion.div
            className="blog-lightbox-overlay"
            variants={lightboxOverlayVariants}
            initial="hidden" animate="visible" exit="exit"
            onClick={closeLightbox} 
            aria-modal="true" role="dialog"
          >
            <motion.div 
              className="blog-lightbox-content-wrapper"
              variants={lightboxContentVariants}
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="blog-lightbox-header">
                <motion.h3 className="blog-lightbox-title" layout="position">{currentLightboxPost.title}</motion.h3>
                <motion.button 
                    className="blog-lightbox-close-button" onClick={closeLightbox} 
                    aria-label={t.closeLightbox[language]}
                    whileHover={{scale: 1.15, rotate: 90, color: "var(--error-color)", backgroundColor: "rgba(var(--error-color-rgb), 0.2)"}}
                    whileTap={{scale:0.9}}
                    transition={{type:"spring", stiffness:350, damping:15}}
                >
                  <IconClose />
                </motion.button>
              </div>
              
              {posts.length > 1 && (
                <>
                  <motion.button 
                    className="blog-lightbox-nav-button prev" 
                    onClick={() => changePostInLightbox('prev')} 
                    disabled={selectedPostIndex === 0 && posts.length > 1} // Ensure disabling is correct based on actual first/last
                    aria-label={t.prevPost[language]}
                    whileHover={{scale:1.1, x:-4}} whileTap={{scale:0.95}}
                  ><IconChevronLeftLightbox /></motion.button>
                  <motion.button 
                    className="blog-lightbox-nav-button next" 
                    onClick={() => changePostInLightbox('next')} 
                    disabled={selectedPostIndex === posts.length - 1 && posts.length > 1}
                    aria-label={t.nextPost[language]}
                    whileHover={{scale:1.1, x:4}} whileTap={{scale:0.95}}
                  ><IconChevronRightLightbox /></motion.button>
                </>
              )}

              <div className="blog-lightbox-scrollable-content">
                <AnimatePresence mode="wait" custom={lightboxSlideDirection}>
                    <motion.div
                        key={`${currentLightboxPost.id}-${language}-lightbox`} 
                        custom={lightboxSlideDirection}
                        variants={lightboxItemVariants}
                        initial="initial" animate="animate" exit="exit"
                    >
                        <div className="blog-lightbox-meta-container">
                            <div className="blog-lightbox-meta-author">{t.authorName[language]}</div>
                            <div className="blog-lightbox-meta-timestamp">{t.postedOn[language]} {formatDate(currentLightboxPost.timestamp, language)}</div>
                        </div>
                        {currentLightboxPost.image_url && (
                           <motion.img src={currentLightboxPost.image_url} alt={currentLightboxPost.title} className="blog-lightbox-image" 
                             initial={{opacity:0, y:20}} animate={{opacity:1, y:0, transition:{duration:0.5, delay:0.1}}}/>
                        )}
                        <hr className="blog-lightbox-meta-divider" /> 
                        {currentLightboxPost.content && (
                           <div className="blog-lightbox-full-content" dangerouslySetInnerHTML={{ __html: currentLightboxPost.content.replace(/\n/g, '<br />') }}></div>
                        )}
                    </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Blog;