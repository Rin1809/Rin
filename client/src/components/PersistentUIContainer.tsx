import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import './styles/PersistentUIContainer.css'; // Tạo file CSS này
import flourishImage from '../assets/flourish.png';
import PersonalCard from './PersonalCard';
import Gallery from './Gallery';

// Import particle riêng biệt - chỉ khi poeticStars được sử dụng
import Particles, { initParticlesEngine as initPoeticParticlesEngine } from "@tsparticles/react"; // Alias để tránh xung đột
import type { ISourceOptions as PoeticISourceOptions, Engine as PoeticEngine } from "@tsparticles/engine"; // Alias
import { loadEmittersPlugin } from "@tsparticles/plugin-emitters";
import { loadExternalTrailInteraction } from "@tsparticles/interaction-external-trail";
import { loadCircleShape } from "@tsparticles/shape-circle";
import { loadStarShape } from "@tsparticles/shape-star";


// --- CẤU HÌNH PARTICLE CHO STAGE CHỌN NGÔN NGỮ (Poetic Stars) ---
const poeticStarsOptionsDefinition: PoeticISourceOptions = {
    fpsLimit: 120,
    particles: {
        number: { value: 300, density: { enable: true } }, // Giảm số lượng để cải thiện hiệu suất khi chạy cùng particles chính
        color: { value: ["#FFFFFF", "#F0E68C", "#ADD8E6", "#FFDAB9"] },
        shape: { type: "star" },
        opacity: { value: { min: 0.1, max: 0.5 }, animation: { enable: true, speed: 0.8, sync: false } },
        size: { value: { min: 0.5, max: 1.2 }, animation: { enable: true, speed: 2, sync: false } },
        links: { enable: false },
        move: { enable: true, speed: 0.3, direction: "none", random: true, straight: false, outModes: { default: "out" } },
    },
    interactivity: { events: { onHover: { enable: false }, onClick: { enable: false }, resize: { enable: true } } },
    detectRetina: true,
    style: { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', pointerEvents: 'none'}, // zIndex 0 để nằm sau nội dung
    // Emitters có thể được thêm lại nếu muốn, nhưng bắt đầu đơn giản
};


// --- VARIANTS ANIMATION (Chuyển thể từ LanguageSelector và CardIntro) ---
const langSelButtonVariants: Variants = { // Đổi tên để tránh xung đột
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: (delay: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }
  }),
  hover: { 
    scale: 1.03, y: -6,
    backgroundColor: "rgba(var(--highlight-color-poetic-rgb), 0.08)",
    borderColor: "rgba(var(--highlight-color-poetic-rgb), 0.35)",
    boxShadow: "0 7px 25px -6px rgba(var(--highlight-color-poetic-rgb), 0.25)",
    transition: { type: "spring", stiffness: 320, damping: 20 }
  },
  tap: { scale: 0.97, y: -2, transition: { type: "spring", stiffness: 380, damping: 22 } }
};
const cardIntroButtonVariants = langSelButtonVariants; // Có thể giống hoặc khác

const contentBlockVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.07 } },
  exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } }
};

const textItemVariants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
};
const titleTextVariants: Variants = {
    initial: { opacity: 0, y: 15, filter: "blur(3px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1], delay:0.1 } },
    exit: { opacity: 0, y: -10, filter: "blur(3px)", transition: { duration: 0.3 } }
};


// --- BẢN DỊCH ---
const translations = {
  langTitle: { vi: "Ngôn Ngữ", en: "Language", ja: "言語" },
  langSubtitle: { vi: "Chọn dòng chảy của bạn", en: "Choose your flow", ja: "流れを選んでください" },
  aboutButton: { vi: "Về tôi", en: "About Me", ja: "私について" },
  galleryButton: { vi: "Bộ sưu tập", en: "Gallery", ja: "ギャラリー" },
  backButton: { vi: "Quay lại", en: "Back", ja: "戻る" }
};

interface PersistentUIContainerProps {
  currentStage: 'languageSelection' | 'cardIntro' | 'cardAbout' | 'cardGallery';
  selectedLanguage: 'vi' | 'en' | 'ja';
  onSelectLanguage: (language: 'vi' | 'en' | 'ja') => void;
  onShowAbout: () => void;
  onShowGallery: () => void;
  onBackToCardIntro: () => void;
  cardData: { avatarUrl: string; name: string; title: string };
}

const PersistentUIContainer: React.FC<PersistentUIContainerProps> = ({
  currentStage,
  selectedLanguage,
  onSelectLanguage,
  onShowAbout,
  onShowGallery,
  onBackToCardIntro,
  cardData
}) => {
  const [poeticParticlesInitialized, setPoeticParticlesInitialized] = useState(false);
  const isMountedRef = useRef(true);
  const initInProgressRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    // Khởi tạo poeticStars particles chỉ khi cần và chưa được khởi tạo
    if (currentStage === 'languageSelection' && !poeticParticlesInitialized && !initInProgressRef.current) {
        initInProgressRef.current = true;
        initPoeticParticlesEngine(async (engine: PoeticEngine) => {
            await loadEmittersPlugin(engine); // Nếu sử dụng emitters
            await loadExternalTrailInteraction(engine); // Nếu sử dụng trails
            await loadCircleShape(engine);
            await loadStarShape(engine);
            if (isMountedRef.current) setPoeticParticlesInitialized(true);
        }).catch(error => {
            if (isMountedRef.current) console.error("PersistentUI: Lỗi khởi tạo poetic particles:", error);
        }).finally(() => {
            if (isMountedRef.current) initInProgressRef.current = false;
        });
    }
    return () => { isMountedRef.current = false; };
  }, [currentStage, poeticParticlesInitialized]);


  // Xác định thuộc tính animation cho flourish dựa trên currentStage
  // Điều này cho phép kiểm soát rõ ràng kích thước/lề nếu `layout` không đủ.
  const getFlourishAnimProps = (stage: PersistentUIContainerProps['currentStage']) => {
    let scale = 1;
    let opacity = 0.85;
    let y = 0; // Trục Y cho hiệu ứng "lơ lửng" nhẹ
    let marginVertical = "0.5rem"; // Lề trên/dưới mặc định

    if (stage === 'cardAbout' || stage === 'cardGallery') {
      scale = 0.75; // Nhỏ hơn khi xem card
      opacity = 0.7;
      y = -5;
      marginVertical = "0.2rem";
    } else if (stage === 'cardIntro') {
      scale = 0.9;
      marginVertical = "0.4rem";
    }
    return { scale, opacity, y, marginVertical};
  };
  
  const flourishAnim = getFlourishAnimProps(currentStage);


  return (
    <motion.div 
        className="persistent-ui-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.8, delay: 0.4 } }} // Trì hoãn để intro ban đầu mờ dần
        exit={{ opacity: 0 }}
    >
        {currentStage === 'languageSelection' && poeticParticlesInitialized && (
            <Particles
                id="tsparticles-poetic-stars"
                options={poeticStarsOptionsDefinition}
                key="poetic-particles" // Key để đảm bảo re-render đúng cách khi bật/tắt
            />
        )}

        <motion.img
            layoutId="top-flourish-image"
            src={flourishImage}
            alt="Họa tiết trang trí"
            className="flourish-image flourish-image-top"
            animate={{ scale: flourishAnim.scale, opacity: flourishAnim.opacity, y: flourishAnim.y, marginBottom: flourishAnim.marginVertical }}
            transition={{ type: 'spring', stiffness: 180, damping: 25, duration: 0.6 }}
        />

        <AnimatePresence mode="wait">
            <motion.div
                key={currentStage} // Quan trọng để AnimatePresence phát hiện thay đổi
                className="content-area"
                variants={contentBlockVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                {currentStage === 'languageSelection' && (
                    <div className="language-selection-content">
                        <motion.h2 variants={titleTextVariants}>{translations.langTitle[selectedLanguage]}</motion.h2>
                        <motion.p variants={textItemVariants} className="subtitle">{translations.langSubtitle[selectedLanguage]}</motion.p>
                        <motion.div className="options-group" variants={textItemVariants}>
                            {(['vi', 'en', 'ja'] as const).map((lang, index) => (
                                <motion.button
                                    key={lang}
                                    className={`item-button lang-button ${selectedLanguage === lang ? 'selected' : ''}`}
                                    onClick={() => onSelectLanguage(lang)}
                                    variants={langSelButtonVariants}
                                    custom={0.2 + index * 0.1} // Animation so le
                                    initial="initial" animate="animate" whileHover="hover" whileTap="tap"
                                >
                                    {lang === 'vi' ? '🇻🇳 Tiếng Việt' : lang === 'en' ? '🇬🇧 English' : '🇯🇵 日本語'}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                )}

                {currentStage === 'cardIntro' && (
                    <div className="card-intro-content">
                        <motion.img src={cardData.avatarUrl} alt={cardData.name} className="intro-avatar" variants={textItemVariants} custom={0.1} />
                        <motion.h2 className="intro-name" variants={titleTextVariants} custom={0.2}>{cardData.name}</motion.h2>
                        <motion.p className="intro-title subtitle" variants={textItemVariants} custom={0.3}>{cardData.title}</motion.p>
                        <motion.div className="options-group" variants={textItemVariants} custom={0.4}>
                            <motion.button onClick={onShowAbout} className="item-button" variants={cardIntroButtonVariants} custom={0.1} initial="initial" animate="animate" whileHover="hover" whileTap="tap">
                                {translations.aboutButton[selectedLanguage]}
                            </motion.button>
                            <motion.button onClick={onShowGallery} className="item-button" variants={cardIntroButtonVariants} custom={0.2} initial="initial" animate="animate" whileHover="hover" whileTap="tap">
                                {translations.galleryButton[selectedLanguage]}
                            </motion.button>
                        </motion.div>
                    </div>
                )}

                {currentStage === 'cardAbout' && (
                    <motion.div className="card-display-content" variants={textItemVariants} custom={0.1}>
                        <PersonalCard name={cardData.name} section="about" />
                        <motion.button onClick={onBackToCardIntro} className="item-button back-button" variants={cardIntroButtonVariants} custom={0.2} initial="initial" animate="animate" whileHover="hover" whileTap="tap">
                            {translations.backButton[selectedLanguage]}
                        </motion.button>
                    </motion.div>
                )}

                {currentStage === 'cardGallery' && (
                    <motion.div className="card-display-content" variants={textItemVariants} custom={0.1}>
                        <Gallery />
                         <motion.button onClick={onBackToCardIntro} className="item-button back-button" variants={cardIntroButtonVariants} custom={0.2} initial="initial" animate="animate" whileHover="hover" whileTap="tap">
                            {translations.backButton[selectedLanguage]}
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>

        <motion.img
            layoutId="bottom-flourish-image"
            src={flourishImage}
            alt="Họa tiết trang trí"
            className="flourish-image flourish-image-bottom"
            animate={{ scale: flourishAnim.scale, opacity: flourishAnim.opacity, y: -flourishAnim.y, rotate: 180, marginTop: flourishAnim.marginVertical }} // Giữ xoay cho flourish dưới, y ngược lại
            transition={{ type: 'spring', stiffness: 180, damping: 25, duration: 0.6 }}
        />
    </motion.div>
  );
};

export default React.memo(PersistentUIContainer);