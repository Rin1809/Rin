// client/src/components/Blog.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Variants, useAnimation, AnimationControls } from 'framer-motion';
import './styles/Blog.css'; 
import { aboutNavIconLeft } from './languageSelector/languageSelector.constants'; 
import { logInteraction } from '../utils/logger';

// Ktra mobile, them vao day
const IS_MOBILE_DEVICE = typeof window !== 'undefined' && window.innerWidth < 768;

// Icons dep hon, chi tiet hon
const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"> {/* stroke day hon */}
    <motion.line x1="18" y1="6" x2="6" y2="18" variants={{ hover: { rotate: 90 }, tap: { rotate: 180 } }} />
    <motion.line x1="6" y1="6" x2="18" y2="18" variants={{ hover: { rotate: 90 }, tap: { rotate: 180 } }}/>
  </svg>
);
const IconChevronLeftLightbox = () => <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>; // icon to hon
const IconChevronRightLightbox = () => <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>; // icon to hon


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

// --- ENHANCED FRAMER MOTION VARIANTS ---
const blogContainerVariants: Variants = { // container chinh
  hidden: { opacity: 0, y: 50, scale: 0.94, filter: "blur(6px)" },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.15, delayChildren: 0.3 }
  },
  exit: { opacity: 0, y: 30, scale: 0.95, filter: "blur(5px)", transition: { duration: 0.4 } }
};

const blogPostItemVariants: Variants = { // item card
  hidden: { opacity: 0, y: 35, scale: 0.93, filter: "blur(5px) saturate(0.6)" },
  visible: { 
    opacity: 1, y: 0, scale: 1, filter: "blur(0px) saturate(1)",
    transition: { type: "spring", stiffness: 150, damping: 24, mass: 0.9 }
  },
  hover: { // hieu ung khi hover
     y: -10, 
     scale: 1.04,
     boxShadow: "0 20px 50px -18px var(--blog-card-hover-glow), 0 0 30px rgba(var(--highlight-color-poetic-rgb), 0.25) inset, 0 0 12px rgba(var(--primary-color-rgb),0.12) inset",
     borderColor: "rgba(var(--highlight-color-poetic-rgb), 0.55)",
     transition: { type: "spring", stiffness: 300, damping: 15 }
  },
  tap: { // hieu ung khi nhan
    scale: 0.96, 
    boxShadow: "0 12px 35px -15px var(--blog-card-tap-glow), 0 0 18px rgba(var(--highlight-color-poetic-rgb), 0.18) inset",
    transition: { type: "spring", stiffness: 360, damping: 20 } 
  },
  exit: { opacity: 0, y: 20, scale: 0.94, filter: "blur(4px)", transition: { duration: 0.32, ease: "easeIn" } }
};

const textItemVariants: Variants = { // hieu ung text (tieu de, loading msg)
    initial: { opacity: 0, y: 22, filter: "blur(2.5px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.12 } },
    exit: { opacity: 0, y: -15, filter: "blur(2.5px)", transition: { duration: 0.32 } }
};

const lightboxOverlayVariants: Variants = { // lightbox overlay
    hidden: { opacity: 0, backdropFilter: "blur(0px) saturate(100%)" },
    visible: { opacity: 1, backdropFilter: "blur(22px) saturate(150%)", transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
    exit: { opacity: 0, backdropFilter: "blur(0px) saturate(100%)", transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay:0.15 } } 
};
const lightboxContentVariants: Variants = { // lightbox content
    hidden: { opacity: 0, scale: 0.8, y: 70, filter: "blur(12px) saturate(0.5) brightness(0.7)" },
    visible: { opacity: 1, scale: 1, y: 0, filter: "blur(0px) saturate(1) brightness(1)", 
        transition: { 
            type: "spring", stiffness: 200, damping: 28, mass: 1, 
            when: "beforeChildren", staggerChildren: 0.08, delayChildren:0.15, delay:0.1 
        } 
    },
    exit: { opacity: 0, scale: 0.85, y: 50, filter: "blur(10px) saturate(0.6) brightness(0.8)", 
        transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] } 
    }
};
const lightboxItemVariants: Variants = { // item trong lightbox khi chuyen
    initial: (direction: number) => ({ 
        opacity: 0, 
        x: direction > 0 ? 100 : -100, 
        scale: 0.9, 
        filter: "blur(6px) brightness(0.85)",
        rotateY: direction > 0 ? 18 : -18,
        transformOrigin: direction > 0 ? "left center" : "right center" // them xoay cho dep
    }),
    animate: { 
        opacity: 1, x: 0, scale: 1, filter: "blur(0px) brightness(1)", rotateY: 0,
        transition: { type: "spring", stiffness: 180, damping: 25, mass: 0.95, duration: 0.6 } 
    },
    exit: (direction: number) => ({ 
        opacity: 0, 
        x: direction < 0 ? 100 : -100, 
        scale: 0.9,
        filter: "blur(6px) brightness(0.85)",
        rotateY: direction < 0 ? -18 : 18,
        transformOrigin: direction < 0 ? "right center" : "left center",
        transition: { type: "tween", ease: "circIn", duration: 0.35 } 
    })
};
// --- END VARIANTS ---


const API_BASE_URL_BLOG = import.meta.env.VITE_API_BASE_URL || '';
const RIN_AVATAR_URL = "https://cdn.discordapp.com/avatars/873576591693873252/09da82dde1f9b5b144dd478e6e6dd106.webp?size=64"; 

const POST_ITEM_BASE_WIDTH_ESTIMATE_PX = 375; // uoc luong width
const POST_ITEM_MARGIN_RIGHT_REM = 1.8; 
const SCROLL_SPEED_PPS = IS_MOBILE_DEVICE ? 55 : 65; // toc do scroll


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


  useEffect(() => { // fetch posts
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

  useEffect(() => { // observer width
    if (listWrapperRef.current) {
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) { setWrapperWidth(entry.contentRect.width); }
      });
      observer.observe(listWrapperRef.current);
      setWrapperWidth(listWrapperRef.current.offsetWidth); 
      return () => observer.disconnect();
    }
  }, []);

  const canScroll = useMemo(() => { // co scroll dc ko
    if (posts.length <= 1 || wrapperWidth === 0 || postItemFullWidth === 0) return false;
    const totalOriginalPostsWidth = posts.length * postItemFullWidth;
    return totalOriginalPostsWidth > wrapperWidth;
  }, [posts, wrapperWidth, postItemFullWidth]);

  useEffect(() => { // auto scroll list
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
  }, [isLoading, canScroll, posts, animationControls, postItemFullWidth]);

  const formatDate = (dateString: string, lang: 'vi'|'en'|'ja') => { // format ngay thang
     const date = new Date(dateString);
     if (isNaN(date.getTime())) return lang === 'vi' ? 'Ngày không hợp lệ' : lang === 'en' ? 'Invalid date' : '無効な日付'; 
     const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }; 
     return new Intl.DateTimeFormat(lang, options).format(date);
  };

  const listStyle = useMemo(() => { // style cho list
    if (canScroll && postItemFullWidth > 0 && posts.length > 1) {
      return { width: `${posts.length * 2 * postItemFullWidth}px` }; // nhân đôi cho infinite scroll
    }
    return { display: 'flex', justifyContent: 'center', width: '100%' }; 
  }, [canScroll, posts, postItemFullWidth]);

  const openLightbox = (index: number) => { // mo lightbox
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
  
  const changePostInLightbox = useCallback((direction: 'next' | 'prev') => { // chuyen bai trong lightbox
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

  useEffect(() => { // event keydown
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
  
  const isContentTruncated = (content: string | undefined, hasImage: boolean): boolean => { // ktra content co dai qua k
      if (!content) return false;
      const maxLength = hasImage ? 150 : 320; // gioi han char
      return content.length > maxLength;
  };


  return (
    <motion.div 
      className="blog-view-container"
      variants={blogContainerVariants}
      initial="hidden" animate="visible" exit="exit"
      layout // Them layout
    >
      <motion.h2 className="blog-view-title" variants={textItemVariants}>
        {t.title[language]}
      </motion.h2>
      
      <div ref={listWrapperRef} className="blog-posts-list-wrapper">
        <AnimatePresence>
          {isLoading && ( <motion.p key="loading" className="blog-status-message" variants={textItemVariants} initial="initial" animate="animate" exit="exit"> {t.loading[language]} </motion.p> )}
          {error && ( <motion.p key="error" className="blog-status-message error" variants={textItemVariants} initial="initial" animate="animate" exit="exit"> {t.error[language]} <br/> ({error}) </motion.p> )}
          {!isLoading && !error && posts.length === 0 && ( <motion.p key="no-posts" className="blog-status-message" variants={textItemVariants} initial="initial" animate="animate" exit="exit"> {t.noPosts[language]} </motion.p> )}
        </AnimatePresence>
        
        {!isLoading && !error && posts.length > 0 && postItemFullWidth > 0 && (
          <motion.div
            className="blog-posts-list"
            animate={animationControls as AnimationControls & {x: number | string}} // cast de anim type dung
            style={listStyle} 
          >
            {(canScroll ? [...posts, ...posts] : posts).map((post, index) => { // nhan doi list neu co the scroll
                const originalIndex = index % posts.length;
                const showReadMore = isContentTruncated(post.content, !!post.image_url);
                const truncatedContent = post.content ? post.content.substring(0, post.image_url ? 150 : 320) : "";

                return (
                    <motion.article 
                        key={`${post.id}-${index}-${language}`} 
                        className={`blog-post-item ${post.image_url ? 'with-image' : 'no-image'}`} 
                        variants={blogPostItemVariants} 
                        onClick={() => openLightbox(originalIndex)} 
                        layout 
                    >
                        <div className="blog-post-header">
                            <motion.img src={RIN_AVATAR_URL} alt={t.authorName[language]} className="blog-post-avatar"
                                initial={{ scale: 0.7, opacity: 0, rotate: -15 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0, transition: { delay: 0.25, type: "spring", stiffness: 220, damping: 14 } }}
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
                                    initial={{ opacity: 0, scale:0.8, y:20, filter: "blur(6px) brightness(0.8)"}}
                                    animate={{ opacity: 1, scale:1, y:0, filter: "blur(0px) brightness(0.95)", transition:{duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] } }} 
                                    whileHover={{scale:1.08, filter:"brightness(1.1) saturate(1.1)"}}
                                    transition={{duration:0.4, ease: "circOut"}}
                                /> 
                            </motion.div>
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
             initial={{ opacity: 0, y: 40, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: (posts.length > 0 ? 0.65 : 0.35), duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
             exit={{ opacity: 0, y: 25, scale: 0.92, transition: { duration: 0.32, ease: "easeIn" } }}
             whileHover={{ scale: 1.08, y: -6, boxShadow: "0 12px 30px -8px rgba(var(--primary-color-rgb), 0.45)", backgroundColor: "rgba(var(--primary-color-rgb), 0.15)" }}
             whileTap={{ scale: 0.94, y: -2 }}
             transition={{type:"spring", stiffness: 300, damping: 16}}
         >
             <motion.span className="button-icon-svg" dangerouslySetInnerHTML={{__html: aboutNavIconLeft}} 
                initial={{x:0}} whileHover={{x:-3.5, rotate:-3}} transition={{type:"spring", stiffness:380, damping:12}}/>
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
                    variants={{
                        initial:{opacity:0, scale:0.5, rotate: -90},
                        animate:{opacity:1, scale:1, rotate:0, transition: {delay:0.3, type:"spring", stiffness:300, damping:15}},
                        hover: {scale: 1.2, rotate: 180, color: "var(--error-color)", backgroundColor: "rgba(var(--error-color-rgb), 0.22)", boxShadow:"0 0 18px rgba(var(--error-color-rgb),0.4)"},
                        tap: {scale:0.85, rotate:160}
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
                    disabled={selectedPostIndex === 0} 
                    aria-label={t.prevPost[language]}
                    initial={{opacity:0, x:-25}} animate={{opacity:1, x:0, transition:{delay:0.2, duration:0.4}}} exit={{opacity:0, x:-20}}
                    whileHover={{scale:1.12, x:-5}} whileTap={{scale:0.93}}
                  ><IconChevronLeftLightbox /></motion.button>
                  <motion.button 
                    className="blog-lightbox-nav-button next" 
                    onClick={() => changePostInLightbox('next')} 
                    disabled={selectedPostIndex === posts.length - 1}
                    aria-label={t.nextPost[language]}
                    initial={{opacity:0, x:25}} animate={{opacity:1, x:0, transition:{delay:0.2, duration:0.4}}} exit={{opacity:0, x:20}}
                    whileHover={{scale:1.12, x:5}} whileTap={{scale:0.93}}
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
                             initial={{opacity:0, y:25, filter:"blur(4px)"}} animate={{opacity:1, y:0, filter:"blur(0px)", transition:{duration:0.55, delay:0.12, ease:[0.23,1,0.32,1]}}}/>
                        )}
                        <hr className="blog-lightbox-meta-divider" /> 
                        {currentLightboxPost.content && (
                           <motion.div 
                             initial={{opacity:0, y:15}} animate={{opacity:1, y:0, transition:{duration:0.45, delay:currentLightboxPost.image_url?0.1:0.2}}}
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