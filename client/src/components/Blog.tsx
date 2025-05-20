// client/src/components/Blog.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Variants, useAnimation } from 'framer-motion';
import './styles/Blog.css'; 
import { aboutNavIconLeft } from './languageSelector/languageSelector.constants'; 

// icons cho lightbox
const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const IconChevronLeftLightbox = () => <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRightLightbox = () => <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;


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

const blogTranslations = {
  title: { vi: "Blog Cá Nhân Của Rin", en: "Rin's Personal Blog", ja: "リンの個人ブログ" },
  loading: { vi: "Đang tải nhật ký...", en: "Loading entries...", ja: "記事を読み込み中。。。" },
  error: { vi: "Không thể tải nhật ký. Vui lòng thử lại sau.", en: "Could not load entries. Please try again later.", ja: "記事を読み込めませんでした。後でもう一度お試しください。" },
  noPosts: { vi: "Chưa có bài viết nào được đăng.", en: "No posts have been published yet.", ja: "まだ投稿がありません。" },
  postedOn: { vi: "Đăng vào", en: "Posted on", ja: "投稿日："},
  readMore: { vi: "Đọc thêm...", en: "Read more...", ja: "続きを読む..." },
  backButton: { vi: "Quay Lại", en: "Back", ja: "戻る" },
  closeLightbox: { vi: "Đóng (Esc)", en: "Close (Esc)", ja: "閉じる (Esc)" },
  prevPost: { vi: "Bài trước", en: "Previous Post", ja: "前の投稿" },
  nextPost: { vi: "Bài kế", en: "Next Post", ja: "次の投稿" },
  authorName: { vi: "Rin", en: "Rin", ja: "リン" }, 
};

// variants cho animation
const blogContainerVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1], staggerChildren: 0.1, delayChildren: 0.2 }
  },
  exit: { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.3 } }
};

const blogPostItemVariants: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.97, filter: "blur(3px)" },
  visible: { 
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { type: "spring", stiffness: 150, damping: 20, mass: 0.8 }
  },
  hover: {
     y: -6, // Adjusted from -5
     scale: 1.025, // Adjusted from 1.03
     // CSS will handle box-shadow on hover for consistency with new styles
     transition: { type: "spring", stiffness: 280, damping: 15 }
  },
  tap: { scale: 0.98, transition: { type: "spring", stiffness: 350, damping: 20 } },
  exit: { opacity: 0, y: 15, scale: 0.95, transition: { duration: 0.25, ease: "easeIn" } }
};

const textItemVariants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
};

const lightboxOverlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn", delay:0.05 } } 
};
const lightboxContentVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85, y: 30, filter: "blur(5px)" }, 
    visible: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 280, damping: 25, mass: 0.9 } },
    exit: { opacity: 0, scale: 0.88, y: 20, filter: "blur(4px)", transition: { duration: 0.25, ease: "easeIn" } }
};
const lightboxItemVariants: Variants = { 
    initial: (direction: number) => ({ 
        opacity: 0, 
        x: direction > 0 ? 70 : -70, // Increased x for a bit more movement
        scale: 0.9, // Slightly more pronounced scale
        filter: "blur(4px)"
    }),
    animate: { 
        opacity: 1, x: 0, scale: 1, filter: "blur(0px)",
        transition: { type: "spring", stiffness: 180, damping: 24, mass: 0.95 } // Adjusted spring
    },
    exit: (direction: number) => ({ 
        opacity: 0, 
        x: direction < 0 ? 70 : -70, 
        scale: 0.9,
        filter: "blur(4px)",
        transition: { duration: 0.25, ease: "circIn" } // Adjusted ease
    })
};

const API_BASE_URL_BLOG = import.meta.env.VITE_API_BASE_URL || '';
const RIN_AVATAR_URL = "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=64";

// Estimate blog item width. The CSS uses clamp(330px, 28vw, 380px). We'll use an average.
// And margin-right: 1.8rem.
const POST_ITEM_BASE_WIDTH_ESTIMATE_PX = 355; // Average of clamp
const POST_ITEM_MARGIN_RIGHT_REM = 1.8; 
const SCROLL_SPEED_PPS = 80; 

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
    // Calculate actual post item width based on current styles
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    setPostItemFullWidth(POST_ITEM_BASE_WIDTH_ESTIMATE_PX + (POST_ITEM_MARGIN_RIGHT_REM * rootFontSize));
  }, []);


  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL_BLOG}/api/blog/posts`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPosts(data);
      } catch (e: any)
      {
        console.error("Loi fetch blog posts:", e); 
        setError(e.message || "Loi ko xdinh"); 
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
    if (posts.length === 0 || wrapperWidth === 0 || postItemFullWidth === 0) return false; 
    const totalOriginalPostsWidth = posts.length * postItemFullWidth;
    return totalOriginalPostsWidth > wrapperWidth;
  }, [posts, wrapperWidth, postItemFullWidth]);

  useEffect(() => {
    if (isLoading || !canScroll || postItemFullWidth === 0) {
      animationControls.stop();
      animationControls.set({ x: 0 }); 
      return;
    }
    
    const singleLoopWidth = posts.length * postItemFullWidth;
    const duration = singleLoopWidth / SCROLL_SPEED_PPS;

    animationControls.start({
      x: -singleLoopWidth, 
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop", 
          duration: duration, 
          ease: "linear", 
        },
      },
    });
    return () => animationControls.stop(); 
  }, [canScroll, posts, isLoading, animationControls, postItemFullWidth]);

  const formatDate = (dateString: string, lang: 'vi'|'en'|'ja') => {
     const date = new Date(dateString);
     if (isNaN(date.getTime())) return lang === 'vi' ? 'Ngay ko hop le' : lang === 'en' ? 'Invalid date' : '無効な日付'; 
     const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }; 
     return new Intl.DateTimeFormat(lang, options).format(date);
  };

  const listStyle = useMemo(() => {
    if (canScroll && postItemFullWidth > 0) {
      return { width: `${posts.length * 2 * postItemFullWidth}px` };
    }
    return { display: 'flex', justifyContent: 'center', width: '100%' }; 
  }, [canScroll, posts, postItemFullWidth]);

  const openLightbox = (index: number) => {
    setSelectedPostIndex(index);
    setLightboxSlideDirection(0); 
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);
  
  const changePostInLightbox = useCallback((direction: 'next' | 'prev') => {
    if (selectedPostIndex === null || posts.length <= 1) return;
    setLightboxSlideDirection(direction === 'next' ? 1 : -1);
    let newIndex;
    if (direction === 'next') {
      newIndex = (selectedPostIndex + 1) % posts.length;
    } else {
      newIndex = (selectedPostIndex - 1 + posts.length) % posts.length;
    }
    setSelectedPostIndex(newIndex);
  }, [selectedPostIndex, posts.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (lightboxOpen) {
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowRight' && (selectedPostIndex !== posts.length -1) ) changePostInLightbox('next'); // Check for boundaries
        if (event.key === 'ArrowLeft' && selectedPostIndex !== 0) changePostInLightbox('prev'); // Check for boundaries
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, changePostInLightbox, selectedPostIndex, posts.length]); // Added selectedPostIndex, posts.length

  const currentLightboxPost = selectedPostIndex !== null ? posts[selectedPostIndex] : null;
  
  const isContentTruncated = (content: string | undefined, hasImage: boolean): boolean => {
      if (!content) return false;
      const maxLength = hasImage ? 120 : 280;
      return content.length > maxLength;
  };


  return (
    <motion.div 
      className="blog-view-container"
      variants={blogContainerVariants}
      initial="hidden" animate="visible" exit="exit"
    >
      <motion.h2 className="blog-view-title" variants={textItemVariants}>
        {t.title[language]}
      </motion.h2>
      
      <div 
        ref={listWrapperRef}
        className="blog-posts-list-wrapper"
      >
        <AnimatePresence>
          {isLoading && ( <motion.p key="loading" className="blog-status-message" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}> {t.loading[language]} </motion.p> )}
          {error && ( <motion.p key="error" className="blog-status-message error" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}> {t.error[language]} <br/> ({error}) </motion.p> )}
          {!isLoading && !error && posts.length === 0 && ( <motion.p key="no-posts" className="blog-status-message" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}> {t.noPosts[language]} </motion.p> )}
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
                return (
                    <motion.article 
                        key={`${post.id}-${index}-${language}`} 
                        className={`blog-post-item ${post.image_url ? 'with-image' : 'no-image'}`} 
                        variants={blogPostItemVariants} 
                        initial="hidden" 
                        animate="visible"
                        whileHover="hover" 
                        whileTap="tap"
                        onClick={() => openLightbox(originalIndex)} 
                    >
                        <div className="blog-post-header">
                        <img src={RIN_AVATAR_URL} alt={t.authorName[language]} className="blog-post-avatar" />
                        <div className="blog-post-author-info"> 
                            <span className="blog-post-author-name">{t.authorName[language]}</span>
                            <span className="blog-post-timestamp">{t.postedOn[language]} {formatDate(post.timestamp, language)}</span>
                        </div>
                        </div>

                        <div className="blog-post-body">
                        <h3 className="blog-post-title">{post.title}</h3>
                        {post.content && ( 
                            <p className={`blog-post-content ${showReadMore ? 'has-overflow' : ''}`}>
                                {post.content.substring(0, post.image_url ? 120 : 280)}
                                {showReadMore ? "" : ""} {/* Ellipsis now handled by CSS if desired, or remove */}
                            </p> 
                        )}
                        </div>
                        {showReadMore && <span className="read-more-prompt">{t.readMore[language]}</span>}

                        {post.image_url && ( 
                            <motion.img 
                                src={post.image_url} 
                                alt={post.title} 
                                className="blog-post-image" 
                                initial={{ opacity: 0, height: "0px"}}
                                animate={{ opacity: 1, height: 'auto', transition: {duration: 0.5, delay: 0.1} }} 
                                exit={{ opacity:0, height: "0px" }}
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
             initial={{ opacity: 0, y: 30, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: posts.length > 0 ? 0.5 : 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] } }}
             exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.25, ease: "easeIn" } }}
             whileHover={{ scale: 1.08, y: -4, boxShadow: "0 8px 20px -5px rgba(var(--primary-color-rgb), 0.35)", backgroundColor: "rgba(var(--primary-color-rgb), 0.1)" }}
             whileTap={{ scale: 0.96, y: -1 }}
             transition={{type:"spring", stiffness: 300, damping: 15}}
         >
             <span className="button-icon-svg" dangerouslySetInnerHTML={{__html: aboutNavIconLeft}} />
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
                <h3 className="blog-lightbox-title">{currentLightboxPost.title}</h3>
                <button className="blog-lightbox-close-button" onClick={closeLightbox} aria-label={t.closeLightbox[language]}>
                  <IconClose />
                </button>
              </div>
              
              {posts.length > 1 && (
                <>
                  <button 
                    className="blog-lightbox-nav-button prev" 
                    onClick={() => changePostInLightbox('prev')} 
                    disabled={selectedPostIndex === 0} 
                    aria-label={t.prevPost[language]}
                  ><IconChevronLeftLightbox /></button>
                  <button 
                    className="blog-lightbox-nav-button next" 
                    onClick={() => changePostInLightbox('next')} 
                    disabled={selectedPostIndex === posts.length - 1} 
                    aria-label={t.nextPost[language]}
                  ><IconChevronRightLightbox /></button>
                </>
              )}

              <div className="blog-lightbox-scrollable-content">
                <AnimatePresence mode="wait" custom={lightboxSlideDirection}>
                    <motion.div
                        key={`${currentLightboxPost.id}-${language}-lightbox`} 
                        custom={lightboxSlideDirection}
                        variants={lightboxItemVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {/* Metadata (author, date) displayed above content */}
                        <div className="blog-lightbox-meta-container">
                            <div className="blog-lightbox-meta-author">{t.authorName[language]}</div>
                            <div className="blog-lightbox-meta-timestamp">{t.postedOn[language]} {formatDate(currentLightboxPost.timestamp, language)}</div>
                        </div>
                        {currentLightboxPost.image_url && (
                           <img src={currentLightboxPost.image_url} alt={currentLightboxPost.title} className="blog-lightbox-image" />
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