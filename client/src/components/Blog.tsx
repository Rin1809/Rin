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
  backButton: { vi: "Quay Lại", en: "Back", ja: "戻る" },
  closeLightbox: { vi: "Đóng (Esc)", en: "Close (Esc)", ja: "閉じる (Esc)" },
  prevPost: { vi: "Bài trước", en: "Previous Post", ja: "前の投稿" },
  nextPost: { vi: "Bài kế", en: "Next Post", ja: "次の投稿" },
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
  // hover va tap cho item (neu ko bi animation marquee override)
  hover: {
     y: -5, scale: 1.03,
     boxShadow: "0 12px 35px -8px rgba(var(--highlight-color-poetic-rgb), 0.3), 0 0 15px rgba(var(--highlight-color-poetic-rgb), 0.15) inset",
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
    exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn", delay:0.05 } } // them delay
};
const lightboxContentVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85, y: 30, filter: "blur(5px)" }, // them filter
    visible: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 280, damping: 25, mass: 0.9 } },
    exit: { opacity: 0, scale: 0.88, y: 20, filter: "blur(4px)", transition: { duration: 0.25, ease: "easeIn" } }
};
const lightboxItemVariants: Variants = { // variant cho content ben trong lightbox (khi prev/next)
    initial: (direction: number) => ({ 
        opacity: 0, 
        x: direction > 0 ? 60 : -60, // slide tu ben phai/trai
        scale: 0.92,
        filter: "blur(3px)"
    }),
    animate: { 
        opacity: 1, x: 0, scale: 1, filter: "blur(0px)",
        transition: { type: "spring", stiffness: 200, damping: 22, mass: 0.9 } 
    },
    exit: (direction: number) => ({ 
        opacity: 0, 
        x: direction < 0 ? 60 : -60, 
        scale: 0.92,
        filter: "blur(3px)",
        transition: { duration: 0.2, ease: "circIn" } 
    })
};


const API_BASE_URL_BLOG = import.meta.env.VITE_API_BASE_URL || '';

// uoc tinh width item (item width + margin-right)
const POST_ITEM_FULL_WIDTH_PX = 360 + 28.8; // (360px width + 1.8rem margin)
const SCROLL_SPEED_PPS = 80; // pixels per second, dieu chinh toc do cuon

const Blog: React.FC<BlogProps> = ({ language, onBack }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // state cho lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [lightboxSlideDirection, setLightboxSlideDirection] = useState(0); // 0: none, 1: next, -1: prev

  const listWrapperRef = useRef<HTMLDivElement>(null);
  const animationControls = useAnimation();
  const t = blogTranslations;
  const [wrapperWidth, setWrapperWidth] = useState(0);


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
        console.error("Lỗi fetch blog posts:", e);
        setError(e.message || "Lỗi không xác định");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // cap nhat wrapperWidth khi resize
  useEffect(() => {
    if (listWrapperRef.current) {
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) { setWrapperWidth(entry.contentRect.width); }
      });
      observer.observe(listWrapperRef.current);
      setWrapperWidth(listWrapperRef.current.offsetWidth); // set gia tri ban dau
      return () => observer.disconnect();
    }
  }, []);

  // check xem co can scroll ko
  const canScroll = useMemo(() => {
    if (posts.length === 0 || wrapperWidth === 0) return false; // ko scroll neu ko co post hoac wrapper ko width
    // chi scroll neu tong width cua post goc > width wrapper
    const totalOriginalPostsWidth = posts.length * POST_ITEM_FULL_WIDTH_PX - (posts.length > 0 ? parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.8 : 0) ; // tru margin cuoi
    return totalOriginalPostsWidth > wrapperWidth;
  }, [posts, wrapperWidth]);

  // xu ly scroll ngang
  useEffect(() => {
    if (isLoading || !canScroll) {
      animationControls.stop();
      animationControls.set({ x: 0 }); // reset vi tri
      return;
    }
    
    const singleLoopWidth = posts.length * POST_ITEM_FULL_WIDTH_PX;
    const duration = singleLoopWidth / SCROLL_SPEED_PPS; // tinh thoi gian scroll

    animationControls.start({
      x: -singleLoopWidth, // di chuyen sang trai bang tong width cua 1 loop
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop", // lap vo han
          duration: duration, // thoi gian 1 loop
          ease: "linear", // chuyen dong deu
        },
      },
    });
    return () => animationControls.stop(); // dung anim khi unmount hoac dieu kien thay doi
  }, [canScroll, posts, isLoading, animationControls]);

  const formatDate = (dateString: string, lang: 'vi'|'en'|'ja') => {
     const date = new Date(dateString);
     if (isNaN(date.getTime())) return lang === 'vi' ? 'Ngày không hợp lệ' : lang === 'en' ? 'Invalid date' : '無効な日付';
     const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
     return new Intl.DateTimeFormat(lang, options).format(date);
  };

  // style cho list (width dong)
  const listStyle = useMemo(() => {
    if (canScroll) {
      // gap doi width neu scroll de tao loop
      return { width: `${posts.length * 2 * POST_ITEM_FULL_WIDTH_PX}px` };
    }
    // can giua neu ko scroll
    return { display: 'flex', justifyContent: 'center', width: '100%' }; 
  }, [canScroll, posts]);

  // mo lightbox
  const openLightbox = (index: number) => {
    setSelectedPostIndex(index);
    setLightboxSlideDirection(0); // reset huong slide
    setLightboxOpen(true);
  };

  // dong lightbox
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);
  
  // chuyen post trong lightbox
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

  // kb nav cho lightbox
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

  // post hien tai trong lightbox
  const currentLightboxPost = selectedPostIndex !== null ? posts[selectedPostIndex] : null;

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
        
        {!isLoading && !error && posts.length > 0 && (
          <motion.div
            className="blog-posts-list"
            animate={animationControls}
            style={listStyle}
          >
            {/* duplicate posts cho loop neu canScroll */}
            {(canScroll ? [...posts, ...posts] : posts).map((post, index) => (
              <motion.article 
                key={`${post.id}-${index}`} // key unique cho duplicated items
                className="blog-post-item"
                variants={blogPostItemVariants} // variants cho item appear/hover/tap
                initial="hidden" 
                animate="visible"
                whileHover="hover" 
                whileTap="tap"
                onClick={() => openLightbox(index % posts.length)} // % de lay dung index cua post goc
              >
                <h3 className="blog-post-title">{post.title}</h3>
                {post.image_url && ( 
                    <motion.img 
                        src={post.image_url} 
                        alt={post.title} 
                        className="blog-post-image" 
                        initial={{ opacity: 0, height: 0}} 
                        animate={{ opacity: 1, height: '180px', transition: {duration: 0.5, delay: 0.1} }} // co dinh height img
                        exit={{ opacity:0, height:0 }} 
                    /> 
                )}
                {post.content && ( 
                    // chi hien thi 1 doan preview content
                    <p className="blog-post-content">{post.content.substring(0,150)}{post.content.length > 150 ? "..." : ""}</p> 
                )}
                <div className="blog-post-meta"> 
                    <span className="blog-post-timestamp">{t.postedOn[language]} {formatDate(post.timestamp, language)}</span> 
                </div>
              </motion.article>
            ))}
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

    {/* Lightbox section */}
      <AnimatePresence>
        {lightboxOpen && currentLightboxPost && (
          <motion.div
            className="blog-lightbox-overlay"
            variants={lightboxOverlayVariants}
            initial="hidden" animate="visible" exit="exit"
            onClick={closeLightbox} // click overlay de dong
            aria-modal="true" role="dialog"
          >
            <motion.div 
              className="blog-lightbox-content-wrapper"
              variants={lightboxContentVariants}
              onClick={(e) => e.stopPropagation()} // tranh close khi click content
            >
              <div className="blog-lightbox-header">
                <h3 className="blog-lightbox-title">{currentLightboxPost.title}</h3>
                <button className="blog-lightbox-close-button" onClick={closeLightbox} aria-label={t.closeLightbox[language]}>
                  <IconClose />
                </button>
              </div>
              
              {/* Nav buttons ben trong lightbox */}
              {posts.length > 1 && (
                <>
                  <button 
                    className="blog-lightbox-nav-button prev" 
                    onClick={() => changePostInLightbox('prev')} 
                    disabled={selectedPostIndex === 0} // disable neu la post dau
                    aria-label={t.prevPost[language]}
                  ><IconChevronLeftLightbox /></button>
                  <button 
                    className="blog-lightbox-nav-button next" 
                    onClick={() => changePostInLightbox('next')} 
                    disabled={selectedPostIndex === posts.length - 1} // disable neu la post cuoi
                    aria-label={t.nextPost[language]}
                  ><IconChevronRightLightbox /></button>
                </>
              )}

              <div className="blog-lightbox-scrollable-content">
                {/* Anim cho content thay doi khi prev/next */}
                <AnimatePresence mode="wait" custom={lightboxSlideDirection}>
                    <motion.div
                        key={currentLightboxPost.id} // key de trigger anim khi post thay doi
                        custom={lightboxSlideDirection}
                        variants={lightboxItemVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {currentLightboxPost.image_url && (
                        <img src={currentLightboxPost.image_url} alt={currentLightboxPost.title} className="blog-lightbox-image" />
                        )}
                        {currentLightboxPost.content && (
                        <p className="blog-lightbox-full-content">{currentLightboxPost.content}</p>
                        )}
                        <div className="blog-lightbox-meta">
                        {t.postedOn[language]} {formatDate(currentLightboxPost.timestamp, language)}
                        </div>
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