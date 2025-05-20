// client/src/components/Blog.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import './styles/Blog.css'; 
import { aboutNavIconLeft } from './languageSelector/languageSelector.constants'; // Icon quay lai

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

const Blog: React.FC<BlogProps> = ({ language, onBack }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatDate = (dateString: string) => {
     const date = new Date(dateString);
     if (isNaN(date.getTime())) return language === 'vi' ? 'Ngày không hợp lệ' : language === 'en' ? 'Invalid date' : '無効な日付';
     const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
     return new Intl.DateTimeFormat(language, options).format(date);
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
      
      <div className="blog-posts-list">
        <AnimatePresence>
          {isLoading && (
            <motion.p key="loading" className="blog-status-message" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              {t.loading[language]}
            </motion.p>
          )}
          {error && (
            <motion.p key="error" className="blog-status-message error" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              {t.error[language]} <br/> ({error})
            </motion.p>
          )}
          {!isLoading && !error && posts.length === 0 && (
            <motion.p key="no-posts" className="blog-status-message" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              {t.noPosts[language]}
            </motion.p>
          )}
          {!isLoading && !error && posts.map((post) => (
            <motion.article 
              key={post.id} 
              className="blog-post-item"
              variants={blogPostItemVariants}
              whileHover="hover" whileTap="tap"
              initial="hidden" animate="visible" exit="exit" 
              layout 
            >
              <h3 className="blog-post-title">{post.title}</h3>
              {post.image_url && (
                <motion.img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="blog-post-image" 
                  initial={{ opacity: 0, height: 0}}
                  animate={{ opacity: 1, height: 'auto', transition: {duration: 0.5, delay: 0.1} }}
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
        </AnimatePresence>
      </div>

      {onBack && (
         <motion.button
             className="card-view-back-button blog-back-button" 
             onClick={onBack}
             initial={{ opacity: 0, y: 30, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.5, duration: 0.6, ease: [0.23, 1, 0.32, 1] } }}
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