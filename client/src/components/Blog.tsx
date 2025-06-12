// client/src/components/Blog.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from 'react-use-gesture';
import { motion, AnimatePresence, Variants } from 'framer-motion';

import './styles/Blog.css'; 
import { useBlogStore } from '../stores/blog.store';
import { aboutNavIconLeft } from './languageSelector/languageSelector.constants';
import { logInteraction } from '../utils/logger';

// --- Interfaces & Translations ---
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
  error: { vi: "Không thể tìm thấy mực để viết tiếp. Vui lòng thử lại sau.", en: "Couldn't find ink to write. Please try again later.", ja: "書くためのインクが見つかりませんでした。" },
  noPosts: { vi: "Những trang giấy còn đang chờ đợi câu chuyện đầu tiên...", en: "The pages await their first story...", ja: "最初の物語を待っているページ。。。" },
  postedOn: { vi: "Khắc vào ngày", en: "Inscribed on", ja: "記された日："},
  authorName: { vi: "Người Kể Chuyện", en: "The Storyteller", ja: "語り部" },
  backButton: { vi: "Trở Về", en: "Back", ja: "戻る" },
  closeLightbox: { vi: "Đóng (Esc)", en: "Close (Esc)", ja: "閉じる (Esc)" },
};


const IconClose = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <motion.line x1="18" y1="6" x2="6" y2="18" variants={{ hover: { rotate: 90 }, tap: { rotate: 180 } }} />
      <motion.line x1="6" y1="6" x2="18" y2="18" variants={{ hover: { rotate: 90 }, tap: { rotate: 180 } }}/>
    </svg>
);

const lightboxOverlayVariants: Variants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: { opacity: 1, backdropFilter: "blur(16px)", transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } },
    exit: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.3, ease: "easeIn" } }
};

const lightboxContentVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 40 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 25, delay: 0.1 } },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.25, ease: "easeIn" } }
};

// --- Deck Animation Helpers ---
const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;


// --- Main Blog Component ---
const Blog: React.FC<BlogProps> = ({ language, onBack }) => {
  const { posts, isLoading, error, fetchPosts } = useBlogStore();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const t = blogTranslations;

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const [gone] = useState(() => new Set());
  const reversedPosts = [...posts].reverse();
  const [springProps, api] = useSprings(reversedPosts.length, i => ({ ...to(i), from: from(i) }));

  useEffect(() => {
      // Khi posts thay doi, cap nhat lai springs
      api.start(i => ({ ...to(i), from: from(i) }));
  }, [posts, api]);

  const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity, tap }) => {
    if (tap) {
      openLightbox(reversedPosts.length - 1 - index);
      return;
    }

    const trigger = velocity > 0.2;
    const dir = xDir < 0 ? -1 : 1;
    if (!down && trigger) gone.add(index);

    api.start(i => {
      if (index !== i) return;
      const isGone = gone.has(index);
      const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0;
      const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0);
      const scale = down ? 1.1 : 1;
      return { x, rot, scale, delay: undefined, config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 } };
    });

    if (!down && gone.size === reversedPosts.length)
      setTimeout(() => { gone.clear(); api.start(i => to(i)); }, 600);
  });

  const openLightbox = (postIndex: number) => {
    const post = posts[postIndex];
    if (post) {
      logInteraction('blog_post_opened', { postId: post.id, postTitle: post.title, language });
      setSelectedPost(post);
      setLightboxOpen(true);
    }
  };
  
  const closeLightbox = useCallback(() => { setSelectedPost(null); setLightboxOpen(false); }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (lightboxOpen && event.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(language, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  };

  return (
    <div className="blog-deck-container">
      <motion.h2
          className="blog-deck-title"
          initial={{ opacity: 0, y: -25, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, delay: 0.1, ease: "easeOut" } }}
      >
        {t.title[language]}
      </motion.h2>

      <div className="blog-deck-stage">
          <AnimatePresence>
            {isLoading && ( <p className="blog-status-message">{t.loading[language]}</p> )}
            {error && ( <p className="blog-status-message error">{t.error[language]} ({error})</p> )}
            {!isLoading && !error && posts.length === 0 && ( <p className="blog-status-message">{t.noPosts[language]}</p> )}
          </AnimatePresence>
          {
            springProps.map(({ x, y, rot, scale }, i) => {
                const post = reversedPosts[i];
                if (!post) return null;
                return (
                    <animated.div className="blog-card-deck" key={post.id} style={{ x, y }}>
                        <animated.div
                            {...bind(i)}
                            style={{ transform: interpolate([rot, scale], trans) }}
                        >
                            <div className="blog-card-inner-content">
                                <div
                                    className="blog-card-image-part"
                                    style={{
                                        backgroundImage: post.image_url
                                            ? `url(${post.image_url})`
                                            : 'linear-gradient(45deg, rgba(var(--primary-color-rgb), 0.5), rgba(var(--secondary-color-rgb), 0.5))'
                                    }}
                                ></div>
                                <div className="blog-card-text-part">
                                    <h4 className="blog-card-title">{post.title}</h4>
                                    {post.content && <p className="blog-card-snippet">{post.content}</p>}
                                </div>
                            </div>
                        </animated.div>
                    </animated.div>
                )
            })
          }
      </div>

      {onBack && (
        <motion.button
            className="blog-back-button-deck"
            onClick={onBack}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4 } }}
            whileHover={{ scale: 1.05, y: -3, color: "var(--primary-color)", backgroundColor: "rgba(var(--primary-color-rgb),0.1)" }}
            whileTap={{ scale: 0.98 }}
            transition={{type: "spring", stiffness: 350, damping: 15}}
        >
            <span dangerouslySetInnerHTML={{ __html: aboutNavIconLeft }} />
            <span>{t.backButton[language]}</span>
        </motion.button>
      )}

      <AnimatePresence>
        {lightboxOpen && selectedPost && (
          <motion.div
            className="blog-lightbox-overlay"
            variants={lightboxOverlayVariants}
            initial="hidden" animate="visible" exit="hidden"
            onClick={closeLightbox}
          >
            <motion.div
                className="blog-lightbox-content-wrapper"
                variants={lightboxContentVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="blog-lightbox-header">
                  <h3>{selectedPost.title}</h3>
                  <motion.button
                      className="blog-lightbox-close-button"
                      onClick={closeLightbox}
                      aria-label={t.closeLightbox[language]}
                      whileHover={{ scale: 1.2, rotate: 180, color: "var(--error-color)"}}
                      whileTap={{ scale: 0.9 }}
                    ><IconClose/></motion.button>
                </div>
                <div className="blog-lightbox-scrollable-content">
                    {selectedPost.image_url && (
                       <img src={selectedPost.image_url} alt={selectedPost.title} className="blog-lightbox-image"/>
                    )}
                    <div className="blog-lightbox-meta-container">
                      <p><strong>{t.authorName[language]}</strong></p>
                      <p className='blog-lightbox-meta-timestamp'>
                        {t.postedOn[language]} {formatDate(selectedPost.timestamp)}
                      </p>
                    </div>
                    <hr className="blog-lightbox-meta-divider" />
                    {selectedPost.content && (
                       <div className="blog-lightbox-full-content" dangerouslySetInnerHTML={{ __html: selectedPost.content.replace(/\n/g, '<br />') }}>
                       </div>
                    )}
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Blog;