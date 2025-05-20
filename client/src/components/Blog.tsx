// client/src/components/Blog.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Variants, useAnimation, AnimationControls } from 'framer-motion';
import './styles/Blog.css'; 
import { aboutNavIconLeft } from './languageSelector/languageSelector.constants'; 
import { logInteraction } from '../utils/logger';

// ktra mobile
const IS_MOBILE_DEVICE = typeof window !== 'undefined' && window.innerWidth < 768;

// icons dep hon
const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <motion.line x1="18" y1="6" x2="6" y2="18" variants={{ hover: { rotate: 90 }, tap: { rotate: 180 } }} />
    <motion.line x1="6" y1="6" x2="18" y2="18" variants={{ hover: { rotate: 90 }, tap: { rotate: 180 } }}/>
  </svg>
);
const IconChevronLeftLightbox = () => <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRightLightbox = () => <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;


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
  title: { vi: "Nhật Ký Mơ Màng Của Rin", en: "Rin's Dreamy Diary", ja: "リンの夢日記" },
  loading: { vi: "Đang lật giở những trang ký ức...", en: "Turning the pages of memory...", ja: "記憶のページをめくっています。。。" },
  error: { vi: "Không thể tìm thấy mực để viết tiếp. Vui lòng thử lại sau.", en: "Couldn't find ink to write. Please try again later.", ja: "書くためのインクが見つかりませんでした。後でもう一度お試しください。" },
  noPosts: { vi: "Những trang giấy còn đang chờ đợi câu chuyện đầu tiên...", en: "The pages await their first story...", ja: "最初の物語を待っているページ。。。" },
  postedOn: { vi: "Khắc vào ngày", en: "Inscribed on", ja: "記された日："},
  readMore: { vi: "Lạc vào câu chuyện...", en: "Lose yourself in the story...", ja: "物語に浸る。。。" },
  backButton: { vi: "Trở Về Cõi Mộng", en: "Return to Dreams", ja: "夢の国へ戻る" },
  closeLightbox: { vi: "Thoát khỏi giấc mơ (Esc)", en: "Escape the dream (Esc)", ja: "夢から覚める (Esc)" },
  prevPost: { vi: "Giấc mơ trước", en: "Previous Dream", ja: "前の夢" },
  nextPost: { vi: "Giấc mơ kế", en: "Next Dream", ja: "次の夢" },
  authorName: { vi: "Người Kể Chuyện", en: "The Storyteller", ja: "語り部" }, 
};

// --- VARIANTS ---
const blogRootContainerVariants: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.9, filter: "blur(10px) saturate(0.6)" }, 
  visible: {
    opacity: 1, y: 0, scale: 1, filter: "blur(0px) saturate(1)",
    transition: { 
      type: "spring", stiffness: 120, damping: 24, mass: 1.2, 
      staggerChildren: 0.15, 
      delayChildren: 0.3  
    }
  },
  exit: { 
    opacity: 0, y: 40, scale: 0.92, filter: "blur(8px) saturate(0.7)", 
    transition: { duration: 0.4, ease: [0.8, 0, 0.2, 1] } 
  }
};

const blogTitleVariants: Variants = {
  hidden: { opacity: 0, y: -35, filter: "blur(6px) brightness(0.75)" },
  visible: { 
    opacity: 1, y: 0, filter: "blur(0px) brightness(1)",
    transition: { type: "spring", stiffness: 170, damping: 22, duration: 0.75, delay:0.15 } 
  }
};

const blogPostListWrapperVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: "circOut", delay: 0.25 } },
};

const fireflyParticleVariants = (delayMultiplier: number = 0, size: string = '4px'): Variants => ({
    initial: { opacity: 0, scale: 0, x: "50%", y: "50%" }, 
    hover: {
        opacity: [0, 0.6 + Math.random() * 0.3, 0.4 + Math.random() * 0.2, 0.7 + Math.random() * 0.2, 0], 
        scale: [0, 1, 0.8, 1.2, 0].map(s => s * (parseFloat(size) / 4)), 
        x: `calc(50% + ${Math.random() * 80 - 40}px)`, 
        y: `calc(50% + ${Math.random() * 80 - 40}px)`,
        transition: {
            duration: Math.random() * 1.8 + 1.8, 
            delay: delayMultiplier * 0.25 + Math.random() * 0.6, 
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut" 
        }
    },
    rest: { opacity: 0, scale: 0, transition: { duration: 0.35, delay: delayMultiplier * 0.1 } } 
});

// Hieu ung tho cho card khi scroll
const breathingCardActiveTarget = { 
    scale: [1, 0.988, 1.003, 0.992, 1], 
    opacity: [1, 0.95, 1, 0.97, 1], 
    filter: ["brightness(1) saturate(1)", "brightness(0.97) saturate(0.95)", "brightness(1.01) saturate(1.02)", "brightness(0.98) saturate(0.97)", "brightness(1) saturate(1)"], 
    transition: {
        duration: 4, 
        repeat: Infinity,
        ease: "easeInOut"
    }
};
const breathingCardInactiveTarget = { 
    scale: 1,
    opacity: 1,
    filter: "brightness(1) saturate(1)",
    transition: { duration: 0.4, ease: "easeOut" }
};


const blogPostItemVariants: Variants = {
  hidden: { opacity: 0, y: 45, scale: 0.88, filter: "blur(7px) saturate(0.4)" },
  visible: { // Đây là trạng thái "scrollInactive" mặc định
    opacity: 1, y: 0, scale: 1, filter: "blur(0px) saturate(1)",
    transition: { type: "spring", stiffness: 150, damping: 26, mass: 1 }
  },
  hover: { 
     y: -15, 
     scale: 1.055, 
     rotateX: IS_MOBILE_DEVICE ? 0 : 7, 
     rotateY: IS_MOBILE_DEVICE ? 0 : (Math.random() > 0.5 ? 4 : -4),
     boxShadow: "0 30px 70px -28px var(--blog-card-hover-glow), 0 0 50px rgba(var(--highlight-color-poetic-rgb), 0.38) inset, 0 0 22px rgba(var(--primary-color-rgb),0.22) inset",
     transition: { type: "spring", stiffness: 270, damping: 11 } 
  },
  tap: {
    scale: 0.93, 
    rotateX: 0, rotateY: 0,
    boxShadow: "0 10px 30px -15px var(--blog-card-tap-glow), 0 0 25px rgba(var(--highlight-color-poetic-rgb), 0.25) inset",
    transition: { type: "spring", stiffness: 360, damping: 18 } 
  },
  exit: { opacity: 0, y: 30, scale: 0.9, filter: "blur(6px)", transition: { duration: 0.32, ease: "easeIn" } },
  // Thêm các target cho breathing effect vào variants này
  scrollActive: breathingCardActiveTarget,
  scrollInactive: breathingCardInactiveTarget,
};

const statusMessageItemVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, y: -20, filter: "blur(4px)", transition: { duration: 0.32 } }
};

const lightboxOverlayVariants: Variants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px) saturate(100%) brightness(100%)" },
    visible: { 
        opacity: 1, 
        backdropFilter: "blur(32px) saturate(190%) brightness(0.7)", 
        transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } 
    },
    exit: { 
        opacity: 0, 
        backdropFilter: "blur(0px) saturate(100%) brightness(100%)", 
        transition: { duration: 0.65, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 } 
    } 
};

const lightboxContentVariants: Variants = {
    hidden: { opacity: 0, scale: 0.78, y: 100, filter: "blur(20px) saturate(0.25) brightness(0.55)" },
    visible: { 
        opacity: 1, scale: 1, y: 0, filter: "blur(0px) saturate(1) brightness(1)", 
        transition: { 
            type: "spring", stiffness: 170, damping: 24, mass: 1.15, 
            when: "beforeChildren", staggerChildren: 0.13, delayChildren: 0.25, delay: 0.22 
        } 
    },
    exit: { 
        opacity: 0, scale: 0.84, y: 80, filter: "blur(18px) saturate(0.35) brightness(0.65)", 
        transition: { duration: 0.55, ease: [0.8, 0, 0.2, 1] } 
    }
};

const lightboxItemSlideVariants: Variants = { 
    initial: (direction: number) => ({ 
        opacity: 0, 
        x: direction > 0 ? "95%" : "-95%", 
        scale: 0.88, 
        filter: "blur(12px) brightness(0.7) saturate(0.5)",
        rotateY: direction > 0 ? 35 : -35, 
        transformOrigin: direction > 0 ? "center left" : "center right" 
    }),
    animate: { 
        opacity: 1, x: "0%", scale: 1, filter: "blur(0px) brightness(1) saturate(1)", rotateY: 0,
        transition: { type: "spring", stiffness: 150, damping: 20, mass: 1.1, duration: 0.75 } 
    },
    exit: (direction: number) => ({ 
        opacity: 0, 
        x: direction < 0 ? "95%" : "-95%", 
        scale: 0.88,
        filter: "blur(12px) brightness(0.7) saturate(0.5)",
        rotateY: direction < 0 ? -35 : 35,
        transformOrigin: direction < 0 ? "center right" : "center left",
        transition: { type: "tween", ease: [0.7, 0, 0.3, 1], duration: 0.5 } 
    })
};

const rippleVariants = {
    initial: { scale: 0, opacity: 0.7 },
    animate: {
      scale: 6, 
      opacity: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

const thumbnailSparkleVariants: Variants = { 
    initial: { opacity: 0, scale: 0 },
    animate: (i: number) => ({
        opacity: [0, 0.5 + Math.random() * 0.4, 0],
        scale: [0, 0.4 + Math.random() * 0.5, 0], 
        x: `${Math.random() * 100}%`, 
        y: `${Math.random() * 100}%`,
        rotate: Math.random() * 360,
        transition: {
            duration: 2 + Math.random() * 2.5,
            repeat: Infinity,
            repeatType: "loop",
            delay: i * 0.4 + Math.random() * 1.5, 
            ease: "linear"
        }
    })
};
const NUM_THUMBNAIL_SPARKLES = IS_MOBILE_DEVICE ? 2 : 4; 

// --- END VARIANTS ---


const API_BASE_URL_BLOG = import.meta.env.VITE_API_BASE_URL || '';
const RIN_AVATAR_URL = "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=64"; 

const POST_ITEM_BASE_WIDTH_ESTIMATE_PX = IS_MOBILE_DEVICE ? 320 : 380; 
const POST_ITEM_MARGIN_RIGHT_REM = IS_MOBILE_DEVICE ? 1.5 : 1.8; 
const SCROLL_SPEED_PPS = IS_MOBILE_DEVICE ? 45 : 55; 


const Blog: React.FC<BlogProps> = ({ language, onBack }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [lightboxSlideDirection, setLightboxSlideDirection] = useState(0); 
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null); 
  const [ripplePosition, setRipplePosition] = useState<{ x: number, y: number } | null>(null); 
  const [showRipple, setShowRipple] = useState(false); 
  const [isScrollingList, setIsScrollingList] = useState(false); 

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
        console.error("Loi fetch blog posts:", e); 
        setError(e.message || "Loi ko xd khi tai bv."); 
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
    if (posts.length <= 1 || wrapperWidth === 0 || postItemFullWidth === 0) return false;
    const totalOriginalPostsWidth = posts.length * postItemFullWidth;
    return totalOriginalPostsWidth > wrapperWidth;
  }, [posts, wrapperWidth, postItemFullWidth]);

  useEffect(() => {
    if (isLoading || !canScroll || postItemFullWidth === 0 || posts.length <= 1) {
      animationControls.stop();
      animationControls.set({ x: 0 }); 
      setIsScrollingList(false); 
      return;
    }
    
    setIsScrollingList(true); 
    const singleLoopWidth = posts.length * postItemFullWidth;
    const duration = singleLoopWidth / SCROLL_SPEED_PPS;

    animationControls.start({
      x: -singleLoopWidth, 
      transition: {
        x: { repeat: Infinity, repeatType: "loop", duration: duration, ease: "linear" },
      },
    });
    return () => {
        animationControls.stop();
        setIsScrollingList(false); 
    }
  }, [isLoading, canScroll, posts, animationControls, postItemFullWidth]);

  const formatDate = (dateString: string, lang: 'vi'|'en'|'ja') => {
     const date = new Date(dateString);
     if (isNaN(date.getTime())) return lang === 'vi' ? 'Ngay ko hop le' : lang === 'en' ? 'Invalid date' : '無効な日付'; 
     const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: lang === 'en' }; 
     return new Intl.DateTimeFormat(lang, options).format(date);
  };

  const listStyle = useMemo(() => {
    if (canScroll && postItemFullWidth > 0 && posts.length > 1) {
      return { width: `${posts.length * 2 * postItemFullWidth}px` };
    }
    return { display: 'flex', justifyContent: 'center', width: '100%' }; 
  }, [canScroll, posts, postItemFullWidth]);

  const openLightbox = (index: number, event?: React.MouseEvent<HTMLElement>) => { 
    if (event && !IS_MOBILE_DEVICE) { 
        const rect = event.currentTarget.getBoundingClientRect();
        setRipplePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 700); 
    }

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
      const maxLength = hasImage ? (IS_MOBILE_DEVICE ? 100 : 160) : (IS_MOBILE_DEVICE ? 240 : 350);
      return content.length > maxLength;
  };

  return (
    <motion.div 
      className="blog-view-container"
      variants={blogRootContainerVariants}
      initial="hidden" animate="visible" exit="exit"
      layout 
    >
      <motion.h2 className="blog-view-title poetic-title-shimmer" variants={blogTitleVariants}>
        {t.title[language]}
      </motion.h2>
      
      <motion.div 
        ref={listWrapperRef} 
        className="blog-posts-list-wrapper"
        variants={blogPostListWrapperVariants}
      >
        <AnimatePresence>
          {isLoading && ( <motion.p key="loading" className="blog-status-message" variants={statusMessageItemVariants} initial="hidden" animate="visible" exit="hidden"> {t.loading[language]} </motion.p> )}
          {error && ( <motion.p key="error" className="blog-status-message error" variants={statusMessageItemVariants} initial="hidden" animate="visible" exit="hidden"> {t.error[language]} <br/> ({error}) </motion.p> )}
          {!isLoading && !error && posts.length === 0 && ( <motion.p key="no-posts" className="blog-status-message" variants={statusMessageItemVariants} initial="hidden" animate="visible" exit="hidden"> {t.noPosts[language]} </motion.p> )}
        </AnimatePresence>
        
        {!isLoading && !error && posts.length > 0 && postItemFullWidth > 0 && (
          <motion.div
            className="blog-posts-list"
            animate={animationControls as AnimationControls & {x: number | string}}
            style={listStyle} 
          >
            {(canScroll ? [...posts, ...posts] : posts).map((post, index) => {
                const originalIndex = index % posts.length;
                const showReadMore = isContentTruncated(post.content, !!post.image_url);

                const truncatedContent = post.content ? post.content.substring(0, post.image_url ? (IS_MOBILE_DEVICE ? 100 : 160) : (IS_MOBILE_DEVICE ? 240 : 350)) : "";
                const itemAnimateState = (isScrollingList && canScroll && (!hoveredCardId || hoveredCardId !== post.id))
                                         ? "scrollActive"
                                         : "visible";
                return (
                    <motion.article
                        key={`${post.id}-${index}-${language}`}
                        className={`blog-post-item ${post.image_url ? 'with-image' : 'no-image'}`}
                        variants={blogPostItemVariants}
                        initial="hidden"
                        animate={itemAnimateState} 
                        exit="exit" 
                        onClick={(e) => openLightbox(originalIndex, e)}
                        whileHover="hover"
                        whileTap="tap"
                        onHoverStart={() => !IS_MOBILE_DEVICE && setHoveredCardId(post.id)}
                        onHoverEnd={() => !IS_MOBILE_DEVICE && setHoveredCardId(null)}
                        layout
                    >
                        {showRipple && ripplePosition && (
                            <motion.div
                            className="ripple-effect"
                            style={{ top: ripplePosition.y, left: ripplePosition.x }}
                            variants={rippleVariants}
                            initial="initial"
                            animate="animate"
                            />
                        )}

                        {!IS_MOBILE_DEVICE && (
                            <>
                                <motion.div className="firefly-particle" style={{ width: '5px', height: '5px' }} variants={fireflyParticleVariants(0, '5px')} animate={hoveredCardId === post.id ? "hover" : "rest"} />
                                <motion.div className="firefly-particle" style={{ width: '3px', height: '3px', left: '20%', top: '70%' }} variants={fireflyParticleVariants(0.3, '3px')} animate={hoveredCardId === post.id ? "hover" : "rest"} />
                                <motion.div className="firefly-particle" style={{ width: '4px', height: '4px', right: '15%', bottom: '25%' }} variants={fireflyParticleVariants(0.6, '4px')} animate={hoveredCardId === post.id ? "hover" : "rest"} />
                            </>
                        )}

                        <div className="blog-post-header">
                            <motion.img src={RIN_AVATAR_URL} alt={t.authorName[language]} className="blog-post-avatar"
                                initial={{ scale: 0.6, opacity: 0, rotate: -20, filter: "brightness(0.7)" }}
                                animate={{ scale: 1, opacity: 1, rotate: 0, filter: "brightness(1)", transition: { delay: 0.3, type: "spring", stiffness: 200, damping: 12 } }}
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
                            <motion.div className="blog-post-image-wrapper">
                                <motion.img
                                    src={post.image_url}
                                    alt={post.title}
                                    className="blog-post-image"
                                    initial={{ opacity: 0, scale:0.85, y:25, filter: "blur(8px) brightness(0.75) saturate(0.6)"}}
                                    animate={{ opacity: 1, scale:1, y:0, filter: "blur(0px) brightness(0.92) saturate(0.88)", transition:{duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] } }}
                                />
                                {!IS_MOBILE_DEVICE && Array.from({ length: NUM_THUMBNAIL_SPARKLES }).map((_, i) => (
                                    <motion.div
                                        key={`thumb-sparkle-${post.id}-${i}`}
                                        className="thumbnail-sparkle"
                                        custom={i}
                                        variants={thumbnailSparkleVariants}
                                        initial="initial"
                                        animate={hoveredCardId === post.id || isScrollingList ? "animate" : "initial"}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </motion.article>
                );
            })}
          </motion.div>
        )}
      </motion.div>

      {onBack && (
         <motion.button
             className="card-view-back-button blog-back-button"
             onClick={onBack}
             initial={{ opacity: 0, y: 45, scale: 0.88 }}
             animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: (posts.length > 0 ? 0.7 : 0.4), duration: 0.75, ease: [0.16, 1, 0.3, 1] } }}
             exit={{ opacity: 0, y: 30, scale: 0.9, transition: { duration: 0.35, ease: "easeIn" } }}
             whileHover={{ scale: 1.09, y: -7, boxShadow: "0 14px 35px -10px rgba(var(--primary-color-rgb), 0.5)", backgroundColor: "rgba(var(--primary-color-rgb), 0.18)" }}
             whileTap={{ scale: 0.93, y: -2.5 }}
             transition={{type:"spring", stiffness: 320, damping: 15}}
         >
             <motion.span className="button-icon-svg" dangerouslySetInnerHTML={{__html: aboutNavIconLeft}}
                initial={{x:0, rotate:0}} whileHover={{x:-4, rotate:-4}} transition={{type:"spring", stiffness:400, damping:10}}/>
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
            {!IS_MOBILE_DEVICE && Array.from({ length: 12 }).map((_, i) => ( 
                <motion.div
                    key={`shooting-star-${i}`}
                    className={`shooting-star ${i % 3 === 0 ? 'long-tail' : ''}`} 
                    initial={{
                        opacity: 0,
                        x: `${Math.random() * 100}vw`,
                        y: `${Math.random() * -60 - 30}vh`,
                    }}
                    animate={{
                        opacity: [0, 0.7 + Math.random() * 0.2, 0], 
                        x: `calc(${Math.random() * 100}vw - ${Math.random() * 250 - 125}px)`,
                        y: '125vh',
                        transition: {
                            duration: Math.random() * 2.5 + 2.5, 
                            delay: Math.random() * 6 + i * 0.25,
                            repeat: Infinity,
                            ease: "linear",
                        }
                    }}
                />
            ))}
            <motion.div
              className="blog-lightbox-content-wrapper"
              variants={lightboxContentVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="blog-lightbox-header">
                <motion.h3 className="blog-lightbox-title poetic-text-glow" layoutId={`blog-title-${currentLightboxPost.id}`}>{currentLightboxPost.title}</motion.h3>
                <motion.button
                    className="blog-lightbox-close-button" onClick={closeLightbox}
                    aria-label={t.closeLightbox[language]}
                    variants={{
                        initial:{opacity:0, scale:0.4, rotate: -120},
                        animate:{opacity:1, scale:1, rotate:0, transition: {delay:0.35, type:"spring", stiffness:320, damping:14}},
                        hover: {scale: 1.22, rotate: 180, color: "var(--error-color)", backgroundColor: "rgba(var(--error-color-rgb), 0.25)", boxShadow:"0 0 20px rgba(var(--error-color-rgb),0.45)"},
                        tap: {scale:0.88, rotate:150}
                    }}
                    initial="initial" animate="animate" whileHover="hover" whileTap="tap"
                >
                  <IconClose />
                </motion.button>
              </div>

              {posts.length > 1 && (
                <>
                  <motion.button
                    className="blog-lightbox-nav-button prev"
                    onClick={() => changePostInLightbox('prev')}
                    disabled={selectedPostIndex === 0 && posts.length <=1 }
                    aria-label={t.prevPost[language]}
                    initial={{opacity:0, x:-30, filter: "blur(3px)"}} animate={{opacity:1, x:0, filter: "blur(0px)", transition:{delay:0.25, duration:0.45, ease: "circOut"}}} exit={{opacity:0, x:-25, filter: "blur(3px)"}}
                    whileHover={{scale:1.15, x:-6, filter: "drop-shadow(0 0 8px rgba(var(--primary-color-rgb),0.4))"}} whileTap={{scale:0.9}}
                  ><IconChevronLeftLightbox /></motion.button>
                  <motion.button
                    className="blog-lightbox-nav-button next"
                    onClick={() => changePostInLightbox('next')}
                    disabled={selectedPostIndex === posts.length - 1 && posts.length <=1}
                    aria-label={t.nextPost[language]}
                    initial={{opacity:0, x:30, filter: "blur(3px)"}} animate={{opacity:1, x:0, filter: "blur(0px)", transition:{delay:0.25, duration:0.45, ease: "circOut"}}} exit={{opacity:0, x:25, filter: "blur(3px)"}}
                    whileHover={{scale:1.15, x:6, filter: "drop-shadow(0 0 8px rgba(var(--primary-color-rgb),0.4))"}} whileTap={{scale:0.9}}
                  ><IconChevronRightLightbox /></motion.button>
                </>
              )}

              <div className="blog-lightbox-scrollable-content">
                <AnimatePresence mode="wait" custom={lightboxSlideDirection}>
                    <motion.div
                        key={`${currentLightboxPost.id}-${language}-lightbox`}
                        custom={lightboxSlideDirection}
                        variants={lightboxItemSlideVariants}
                        initial="initial" animate="animate" exit="exit"
                    >
                        <div className="blog-lightbox-meta-container">
                            <div className="blog-lightbox-meta-author poetic-text-glow">{t.authorName[language]}</div>
                            <div className="blog-lightbox-meta-timestamp">{t.postedOn[language]} {formatDate(currentLightboxPost.timestamp, language)}</div>
                        </div>
                        {currentLightboxPost.image_url && (
                           <motion.img src={currentLightboxPost.image_url} alt={currentLightboxPost.title} className="blog-lightbox-image"
                             initial={{opacity:0, y:30, filter:"blur(5px) brightness(0.85) saturate(0.7)"}}
                             animate={{opacity:1, y:0, filter:"blur(0px) brightness(1) saturate(1)", transition:{duration:0.6, delay:0.15, ease:[0.23,1,0.32,1]}}}/>
                        )}
                        <hr className="blog-lightbox-meta-divider" />
                        {currentLightboxPost.content && (
                           <motion.div
                             initial={{opacity:0, y:20}} animate={{opacity:1, y:0, transition:{duration:0.5, delay:currentLightboxPost.image_url?0.15:0.25}}}
                             className="blog-lightbox-full-content" dangerouslySetInnerHTML={{ __html: currentLightboxPost.content.replace(/\n/g, '<br />') }}>
                           </motion.div>
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