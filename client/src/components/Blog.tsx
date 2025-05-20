// client/src/components/Blog.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, Variants, useAnimation } from 'framer-motion';
import './styles/Blog.css'; 
import { aboutNavIconLeft } from './languageSelector/languageSelector.constants';

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
};

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
     y: -5, scale: 1.02,
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

const API_BASE_URL_BLOG = import.meta.env.VITE_API_BASE_URL || '';

const POST_ITEM_AVERAGE_WIDTH = 340; // Approximate item width including some average padding/border (e.g. 300-380px item + margin)
const POST_ITEM_MARGIN_RIGHT_PX = 24; // 1.5rem in px (16px base)

const Blog: React.FC<BlogProps> = ({ language, onBack }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHoveringList, setIsHoveringList] = useState(false);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  const listWrapperRef = useRef<HTMLDivElement>(null);
  const animationControls = useAnimation();
  const t = blogTranslations;

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
      } catch (e: any) {
        console.error("Lỗi fetch blog posts:", e);
        setError(e.message || "Lỗi không xác định");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (listWrapperRef.current) {
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          setWrapperWidth(entry.contentRect.width);
        }
      });
      observer.observe(listWrapperRef.current);
      setWrapperWidth(listWrapperRef.current.offsetWidth); // Initial set
      return () => observer.disconnect();
    }
  }, []); // Empty dependency array, runs once on mount

  const canScroll = useMemo(() => {
    if (posts.length <= 1 || wrapperWidth === 0) return false;
    const totalOriginalPostsWidth = posts.length * (POST_ITEM_AVERAGE_WIDTH + POST_ITEM_MARGIN_RIGHT_PX) - POST_ITEM_MARGIN_RIGHT_PX;
    return totalOriginalPostsWidth > wrapperWidth;
  }, [posts, wrapperWidth]);

  useEffect(() => {
    if (isLoading) return;

    if (canScroll) {
      const singleLoopWidth = posts.length * (POST_ITEM_AVERAGE_WIDTH + POST_ITEM_MARGIN_RIGHT_PX);
      const durationPerPost = 8; // seconds per post for scrolling speed
      const totalDuration = posts.length * durationPerPost;

      const scrollAnimation = {
        x: [0, -singleLoopWidth],
        transition: {
          x: {
            repeat: Infinity,
            repeatType: "loop" as const,
            duration: totalDuration,
            ease: "linear" as const,
          },
        },
      };
      
      if (!isHoveringList) {
        animationControls.start(scrollAnimation);
      } else {
        animationControls.stop();
      }
    } else {
      animationControls.stop();
      animationControls.set({ x: 0 });
    }
    // Cleanup animation on unmount or when scroll conditions change
    return () => animationControls.stop();
  }, [canScroll, posts, isLoading, animationControls, isHoveringList]);

  const formatDate = (dateString: string) => {
     const date = new Date(dateString);
     if (isNaN(date.getTime())) return language === 'vi' ? 'Ngày không hợp lệ' : language === 'en' ? 'Invalid date' : '無効な日付';
     const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
     return new Intl.DateTimeFormat(language, options).format(date);
  };

  const listStyle = useMemo(() => {
    if (canScroll) {
      return { width: `${posts.length * 2 * (POST_ITEM_AVERAGE_WIDTH + POST_ITEM_MARGIN_RIGHT_PX)}px` };
    }
    return { justifyContent: 'center', width: '100%' };
  }, [canScroll, posts]);

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
        onMouseEnter={() => { if (canScroll) setIsHoveringList(true); }}
        onMouseLeave={() => { if (canScroll) setIsHoveringList(false); }}
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
            {(canScroll ? [...posts, ...posts] : posts).map((post, index) => (
              <motion.article 
                key={`${post.id}-${index}`} 
                className="blog-post-item"
                variants={blogPostItemVariants}
                initial="hidden" 
                animate="visible"
                whileHover="hover" 
                whileTap="tap"
              >
                <h3 className="blog-post-title">{post.title}</h3>
                {post.image_url && (
                  <motion.img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="blog-post-image" 
                    initial={{ opacity: 0, height: 0}}
                    animate={{ opacity: 1, height: '200px', transition: {duration: 0.5, delay: 0.1} }}
                    exit={{ opacity:0, height:0 }}
                   />
                )}
                {post.content && (
                  <p className="blog-post-content">{post.content}</p>
                )}
                <div className="blog-post-meta">
                  <span className="blog-post-timestamp">{t.postedOn[language]} {formatDate(post.timestamp)}</span>
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
    </motion.div>
  );
};

export default Blog;