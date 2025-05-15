// client/src/components/Guestbook.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/Guestbook.css';
import { guestbookViewTranslations as t } from './languageSelector/languageSelector.constants';
import type { GuestbookEntry } from '../data/guestbook.data';

// Icon Components (giữ nguyên như trong file gốc)
const IconFeatherPen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.7 3.3a1 1 0 0 0-1.4 0L2.6 20.1a1 1 0 0 0 0 1.4l.4.4"/>
    <path d="m17.6 6.7 3.1-3.1"/>
    <path d="M2.6 20.1C5.9 19.4 10 18 13 15c2-2 3.3-4.2 4-6.3.4-1.1.6-2.3.5-3.5S17 3.2 16 3.3c-1 .1-2.3.7-3.7 2s-3 3.1-4.2 4.6c-1.9 2.4-3.8 4.6-5.3 6.8"/>
    <path d="M10.7 11.3 2.6 20.1"/>
    <path d="m19.2 5.2.4.4"/>
  </svg>
);

const IconInkSplatterCancel = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 20.5C6 20 4 17 4 12A8 8 0 0 1 12 4c5 0 7 2.5 7.5 7.5"/>
    <path d="m18 18-5.5-5.5"/>
    <path d="m12.5 18-5.5-5.5"/>
    <path d="M4.5 10C5.7 9.3 6.5 8.2 7 7"/>
    <path d="M7.5 3.5C9 4.2 10.8 5.1 11.5 6.5"/>
    <circle cx="14" cy="5.5" r="0.5" fill="currentColor"/>
    <circle cx="9" cy="3.5" r="0.5" fill="currentColor"/>
    <circle cx="4.5" cy="6" r="0.5" fill="currentColor"/>
    <circle cx="20.5" cy="11" r="0.5" fill="currentColor"/>
  </svg>
);
// Props Interface (giữ nguyên)
interface GuestbookProps {
  language: 'vi' | 'en' | 'ja';
  onBack: () => void;
  entries: GuestbookEntry[];
  onAddEntry: (name: string, message: string, lang: 'vi' | 'en' | 'ja') => Promise<void>;
}

// --- VARIANTS NÂNG CẤP ---
const bookCoreVariants = { // Variants cho div.book-core (khung sách chính)
  hidden: { opacity: 0, y: 60, scale: 0.9, filter: "blur(10px) saturate(0.5)" },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: "blur(0px) saturate(1)",
    transition: {
      type: "spring", stiffness: 120, damping: 20, mass: 1, // Giữ spring cho hiệu ứng "nảy" nhẹ
      staggerChildren: 0.07, // delay giữa các children của book-core
      delayChildren: 0.2  // delay trước khi children bắt đầu animate
    }
  },
  exit: {
    opacity: 0, y: 45, scale: 0.92, filter: "blur(8px) saturate(0.65)",
    transition: { duration: 0.35, ease: [0.6, 0.05, 0.25, 0.95] } // easeOutQuint
  }
};

const guestbookInteractiveSectionVariants = { // Variants cho form/prompt viết
  hidden: { opacity: 0, y: 18, filter: "blur(1.5px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: {
      opacity: { duration: 0.3, ease: "easeOut" },
      y: { type: "spring", stiffness: 190, damping: 17, delay: 0.04 }, // Tinh chỉnh spring
      filter: { duration: 0.2, delay: 0.08 },
      staggerChildren: 0.06, // Delay cho children của form (labels, inputs)
      when: "beforeChildren" // Children anim sau parent
    }
  },
  exit: {
    opacity: 0, y: -13, filter: "blur(1.5px)",
    transition: {
      opacity: { duration: 0.18, ease: "easeIn" },
      filter: { duration: 0.13 },
      when: "afterChildren" // Children anim exit trước parent
    }
  }
};

const guestbookItemVariants = { // Variants cho các item nhỏ (tiêu đề, group input)
  hidden: { opacity: 0, y: 13, filter: "blur(2px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 220, damping: 19, mass: 0.85 } },
  exit: { opacity: 0, y: -9, filter: "blur(1.5px)", transition: { duration: 0.13 }} // Exit nhanh
};

const entryCardVariants = { // Variants cho mỗi thẻ entry
  initial: { opacity: 0, y: 50, x: 0, scale: 0.9, rotate: 0, filter: "blur(5px) saturate(0.6) brightness(0.85)" },
  animate: (i: number) => ({ // Custom prop 'i' cho stagger
    opacity: 1, y: 0, x:0, scale: 1, rotate:0, filter: "blur(0px) saturate(1) brightness(1)",
    transition: {
      type: "spring", stiffness: 150, damping: 22, mass: 0.75, // Điều chỉnh spring cho card
      delay: i * 0.09 + 0.2, // Stagger effect, bắt đầu sau khi bookCore anim xong (delayChildren của bookCore)
    }
  }),
  exit: { // Khi card bị xóa (hiếm khi xảy ra trừ khi có filter)
    opacity: 0, scale: 0.94, y: -20, x: 5, rotate: 0.8, filter: "blur(4px) saturate(0.75)",
    transition: { duration: 0.22, ease:"circIn" }
  },
  whileHover: { // Hiệu ứng khi hover lên entry card
    y: -7, scale: 1.02, // Nhấc lên và phóng to nhẹ
    boxShadow: "0 14px 38px -10px rgba(var(--guestbook-highlight-rgb),0.3), 0 0 22px rgba(var(--guestbook-highlight-rgb),0.18) inset, 3px 3px 10px rgba(var(--paper-bg-rgb), 0.12)",
    transition: { type: "spring", stiffness: 220, damping: 12, mass: 0.65 } // Spring nhanh, đàn hồi
  }
};

const feedbackMessageVariants = { // Variants cho thông báo lỗi/thành công
  initial: { opacity: 0, y: 15, height: 0, marginTop: 0, marginBottom: 0, filter:"blur(2px) saturate(0.5)" },
  animate: {
    opacity: 1, y: 0, height: 'auto', filter:"blur(0px) saturate(1)",
    marginTop: '0.4rem', marginBottom: '0.6rem', /* Thêm margin khi hiển thị */
    transition: { type: "spring", stiffness: 200, damping: 18, mass: 0.9 }
  },
  exit: {
    opacity: 0, y: -10, height: 0, filter:"blur(2px) saturate(0.5)",
    marginTop: 0, marginBottom: 0,
    transition: { duration: 0.25, ease: [0.6, 0.05, 0.25, 0.95] }
  }
};

const writePromptButtonVariants = { // Variants cho nút "Để lại lời nhắn"
    initial: { opacity: 0, scale: 0.82, y: 10, rotate:3.5 }, // Hơi nghiêng
    animate: {
        opacity: 1, scale: 1, y: 0, rotate:0,
        transition: { type: "spring", stiffness: 210, damping: 14, delay: 0.18 } // delay nhẹ sau khi prompt anim
    },
    exit: { opacity: 0, scale: 0.87, y: 7, rotate: -2, transition: { duration: 0.13, ease:"easeIn" } }
};

const bookPagesWrapperVariants = { // Variants cho wrapper 2 trang sách
  hidden: { opacity: 0 }, // Chỉ ẩn để staggerChildren của bookCore có tác dụng
  visible: { opacity: 1, transition: { delay: 0.05, staggerChildren: 0.08, when: "beforeChildren" } }, // Chờ parent anim, rồi anim children (hai page)
  exit: { opacity: 0 }
};


// Guestbook Component
const Guestbook: React.FC<GuestbookProps> = ({ language, entries, onAddEntry, onBack }) => { // Thêm onBack
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'read' | 'write'>('read');

  // Logic handleSubmit (giữ nguyên, có thể tối ưu thông báo lỗi nếu muốn)
   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setSubmitError(language === 'vi' ? 'Tên và cảm nghĩ không được để trống!' : language === 'en' ? 'Name and message cannot be empty!' : 'お名前とメッセージは必須です！');
      setTimeout(() => setSubmitError(null), 4000);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      await onAddEntry(name.trim(), message.trim(), language);
      setName('');
      setMessage('');
      setSubmitSuccess(language === 'vi' ? 'Cảm ơn bạn đã chia sẻ!' : language === 'en' ? 'Thank you for sharing!' : 'ご感想ありがとうございます！');
      setTimeout(() => {
        setSubmitSuccess(null);
        setViewMode('read'); // Quay lại view 'read' sau khi thành công
      }, 3500); // Thời gian hiển thị thông báo thành công
    } catch (error: any) { // Bắt lỗi cụ thể hơn nếu có từ onAddEntry
      console.error("Lỗi gửi entry Guestbook.tsx:", error);
      let userErrorMessage = language === 'vi' ? 'Gửi thất bại, vui lòng thử lại.' : language === 'en' ? 'Submission failed, please try again.' : '送信に失敗しました。もう一度お試しください。';
      // Kiểm tra nếu lỗi từ server có message cụ thể
      if (error && typeof error.message === 'string' && error.message.startsWith('Failed to submit:')) { // Giả sử server trả lỗi có prefix này
         userErrorMessage = `${userErrorMessage} (${error.message.replace('Failed to submit: ', '')})`;
      } else if (error && typeof error.message === 'string') {
        // Nếu có message nhưng không phải format cụ thể, thì dùng message đó
        userErrorMessage = error.message;
      }
      setSubmitError(userErrorMessage);
      setTimeout(() => setSubmitError(null), 5000); // Thời gian hiển thị thông báo lỗi
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleCancelWrite = () => {
    setViewMode('read');
    setName(''); // Xóa input
    setMessage(''); // Xóa input
    setSubmitError(null); // Xóa lỗi
    setSubmitSuccess(null); // Xóa thông báo thành công
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        // Trả về chuỗi tùy theo ngôn ngữ nếu ngày không hợp lệ
        return language === 'vi' ? 'Không rõ TG' : language === 'en' ? 'Unknown time' : '時刻不明';
    }
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: language === 'en' // format 12h cho tiếng Anh
    };
    return new Intl.DateTimeFormat(language, options).format(date);
  };

  // Sắp xếp entries mới nhất lên đầu
  const displayedEntries = [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <motion.div
      className="book-core" // Container chính của cuốn sổ
      variants={bookCoreVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
        {/* Tiêu đề "Sổ Lưu Bút Cảm Xúc" */}
        <motion.h2
            className="guestbook-title"
            variants={guestbookItemVariants} // Dùng chung item variant
            initial="hidden" animate="visible" exit="hidden" // Ẩn khi exit
        >
            {t.title[language]}
        </motion.h2>

        {/* Wrapper cho hai trang sách */}
        <motion.div
            className="book-pages-wrapper"
            variants={bookPagesWrapperVariants}
            initial="hidden" animate="visible" exit="exit"
        >
            {/* Trang Trái: Prompt hoặc Form */}
            <div className="book-page page-left">
                <div className="page-content-scrollable left-page-scroll">
                    <AnimatePresence mode="wait"> {/* Cho phép anim exit/enter mượt mà */}
                    {viewMode === 'read' && (
                        <motion.div
                            key="read-prompt" // Key để AnimatePresence nhận diện
                            className="guestbook-write-prompt"
                            variants={guestbookInteractiveSectionVariants}
                            initial="hidden" animate="visible" exit="exit"
                        >
                            <motion.p variants={guestbookItemVariants} dangerouslySetInnerHTML={{ __html: t.promptWrite[language] }} />
                            <motion.button
                                className="guestbook-write-button poetic-button"
                                onClick={() => setViewMode('write')}
                                variants={writePromptButtonVariants} // Variants riêng cho nút này
                                initial="initial" animate="animate" exit="exit"
                                whileHover={{ // Hiệu ứng hover nâng cấp cho nút "để lại lời nhắn"
                                    scale: 1.08, y: -6, rotate: -5,
                                    boxShadow: "0 12px 32px -8px rgba(var(--guestbook-highlight-rgb),0.45), 0 0 20px rgba(var(--guestbook-highlight-rgb),0.3) inset"
                                }}
                                whileTap={{ scale: 0.95, y: -1, rotate: 2 }}
                                transition={{type: "spring", stiffness:280, damping:12}}
                            >
                                <IconFeatherPen />
                                <span>{t.writeButtonLabel[language]}</span>
                            </motion.button>
                        </motion.div>
                    )}

                    {viewMode === 'write' && (
                        <motion.form
                            key="write-form"
                            onSubmit={handleSubmit}
                            className="guestbook-form"
                            variants={guestbookInteractiveSectionVariants}
                            initial="hidden" animate="visible" exit="exit"
                        >
                            <motion.h3 className="guestbook-form-title" variants={guestbookItemVariants}>{t.formTitle[language]}</motion.h3>
                            <motion.div className="form-group" variants={guestbookItemVariants}>
                            <label htmlFor="guestName">{t.nameLabel[language]}</label>
                            <motion.input // Sử dụng motion.input
                                type="text" id="guestName" value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t.namePlaceholder[language]}
                                disabled={isSubmitting} maxLength={100}
                                whileFocus={{ // Hiệu ứng khi focus
                                    borderColor: "var(--guestbook-highlight)", // Hoặc var(--guestbook-primary-action)
                                    boxShadow: "0 0 12px 3px rgba(var(--guestbook-highlight-rgb),0.3), inset 0 1px 3px rgba(0,0,0,0.1)",
                                    scale: 1.015
                                }}
                                transition={{type:"spring", stiffness:320, damping:16}} // Spring cho focus
                            />
                            </motion.div>
                            <motion.div className="form-group" variants={guestbookItemVariants}>
                            <label htmlFor="guestMessage">{t.messageLabel[language]}</label>
                            <motion.textarea // Sử dụng motion.textarea
                                id="guestMessage" value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t.messagePlaceholder[language]}
                                rows={5} disabled={isSubmitting} maxLength={1000}
                                whileFocus={{
                                    borderColor: "var(--guestbook-highlight)",
                                    boxShadow: "0 0 12px 3px rgba(var(--guestbook-highlight-rgb),0.3), inset 0 1px 3px rgba(0,0,0,0.1)",
                                    scale: 1.015
                                }}
                                transition={{type:"spring", stiffness:320, damping:16}}
                            />
                            </motion.div>
                            {/* Feedback Messages Container */}
                            <div className="form-feedback-container">
                            <AnimatePresence mode="wait">
                                {submitError && (
                                    <motion.p key="error" className="submit-feedback error"
                                    variants={feedbackMessageVariants} initial="initial" animate="animate" exit="exit">
                                    {submitError}
                                    </motion.p>
                                )}
                                {submitSuccess && (
                                    <motion.p key="success" className="submit-feedback success"
                                    variants={feedbackMessageVariants} initial="initial" animate="animate" exit="exit">
                                    {submitSuccess}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            </div>
                            {/* Form Actions: Submit, Cancel */}
                            <motion.div className="form-actions" variants={guestbookItemVariants}>
                                <motion.button
                                    type="button" // QUAN TRỌNG: type="button" cho nút cancel
                                    className="guestbook-cancel-button poetic-button-subtle"
                                    onClick={handleCancelWrite}
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.06, filter: "brightness(0.95)", borderColor: "rgba(var(--guestbook-subtext-rgb),0.6)" }} // Nâng cấp hover
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ type: "spring", stiffness: 360, damping: 20 }}
                                >
                                    <IconInkSplatterCancel /> {/* Icon cancel */}
                                    <span>{t.cancelButton[language]}</span>
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    className="guestbook-submit-button poetic-button-primary"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.04, y: -3.5, filter: "brightness(1.15) saturate(1.1)", boxShadow:"0 7px 22px -4px rgba(var(--guestbook-highlight-rgb),0.42), 0 3px 10px rgba(var(--guestbook-primary-action-rgb),0.3)"}} // Hover nổi bật
                                    whileTap={{ scale: 0.98, y: -1, filter: "brightness(0.92)" }}
                                    transition={{ type: "spring", stiffness: 360, damping: 16 }}
                                >
                                    {isSubmitting ? ( // Hiển thị spinner khi submitting
                                    <>
                                        <span className="button-spinner"></span>
                                        {t.submittingText[language]}
                                    </>
                                    ) : t.submitButton[language]}
                                </motion.button>
                            </motion.div>
                        </motion.form>
                    )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Trang Phải: Danh sách Entries */}
            <div className="book-page page-right">
                <div className="page-content-scrollable right-page-scroll">
                    <div className="guestbook-entries-list-wrapper">
                    {displayedEntries.length > 0 ? (
                    <AnimatePresence>
                        {displayedEntries.map((entry, index) => (
                        <motion.div
                            key={entry.id || `entry-${index}`} // Sử dụng ID từ DB
                            className="guestbook-entry"
                            custom={index} // Pass index cho stagger
                            variants={entryCardVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit" // Mặc dù ít khi dùng exit ở đây trừ khi xóa entry
                            whileHover="whileHover" // Sử dụng whileHover từ variant
                            layout // Cho phép anim vị trí khi list thay đổi
                        >
                            {/* Nội dung entry */}
                            <blockquote className="entry-message-wrapper">
                                <p className="entry-message">{entry.message}</p>
                            </blockquote>
                            <div className="entry-meta">
                            <span className="entry-author">
                                {t.entryBy[language]} <strong>{entry.name}</strong>
                            </span>
                            {entry.timestamp && ( // Kiểm tra timestamp tồn tại
                                <span className="entry-timestamp">
                                {t.entryDatePrefix[language]} {formatDate(entry.timestamp)}
                                </span>
                            )}
                            </div>
                        </motion.div>
                        ))}
                    </AnimatePresence>
                    ) : (
                    <motion.p
                        className="no-entries-message"
                        variants={guestbookItemVariants}
                        initial="hidden"
                        animate={{...guestbookItemVariants.visible, transition: {...guestbookItemVariants.visible.transition, delay: (viewMode === 'read' ? 0.45 : 0.18) } }} // delay dựa trên viewMode
                        exit="hidden"
                    >
                        {t.noEntries[language]}
                    </motion.p>
                    )}
                    </div>
                </div>
            </div>
        </motion.div>
        {/* Không có nút Back ở đây vì Guestbook là 1 component con, nút back nên do component cha quản lý */}
    </motion.div>
  );
};

export default Guestbook;