// client/src/components/Guestbook.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/Guestbook.css';
import { guestbookViewTranslations as t } from './languageSelector/languageSelector.constants'; 
import type { GuestbookEntry } from '../data/guestbook.data'; 

interface GuestbookProps {
  language: 'vi' | 'en' | 'ja';
  onBack: () => void;
  entries: GuestbookEntry[];
  onAddEntry: (name: string, message: string, lang: 'vi' | 'en' | 'ja') => Promise<void>; 
}

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
};

const inputFieldVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 15 } },
};

const entryVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95, filter: "blur(3px)" },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring", stiffness: 220, damping: 25, mass: 0.8,
      delay: i * 0.1 + 0.1,
    }
  }),
  exit: { opacity: 0, scale: 0.9, y: -15, filter: "blur(2px)", transition: { duration: 0.2 } }
};


const Guestbook: React.FC<GuestbookProps> = ({ language, entries, onAddEntry }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setSubmitError(language === 'vi' ? 'Tên và cảm nghĩ không được để trống!' : language === 'en' ? 'Name and message cannot be empty!' : 'お名前とメッセージは必須です！');
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
      setTimeout(() => setSubmitSuccess(null), 3500); // Tăng thời gian hiển thị success
    } catch (error: any) {
      console.error("Error submitting entry in Guestbook.tsx:", error);
      let userErrorMessage = language === 'vi' ? 'Gửi thất bại, vui lòng thử lại.' : language === 'en' ? 'Submission failed, please try again.' : '送信に失敗しました。もう一度お試しください。';
      if (error && typeof error.message === 'string' && error.message.startsWith('Failed to submit:')) { // Lỗi HTTP từ fetch
         userErrorMessage = `${userErrorMessage} (${error.message})`;
      } else if (error && typeof error.message === 'string') { // Lỗi chung khác
        userErrorMessage = error.message;
      }
      setSubmitError(userErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Kiểm tra nếu date không hợp lệ (có thể do timestamp null từ DB hoặc lỗi parse)
    if (isNaN(date.getTime())) {
        return language === 'vi' ? 'Không rõ thời gian' : language === 'en' ? 'Unknown time' : '時刻不明';
    }
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: language === 'en'
    };
    return new Intl.DateTimeFormat(language, options).format(date);
  };

  const displayedEntries = [...entries].reverse(); 

  return (
    <motion.div
      className="guestbook-container"
      initial="hidden" animate="visible" exit="exit"
      variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
          exit: { opacity: 0 }
      }}
    >
      <motion.h2 className="guestbook-title" variants={formVariants}>{t.title[language]}</motion.h2>

      <motion.form onSubmit={handleSubmit} className="guestbook-form" variants={formVariants}>
        <motion.h3 className="guestbook-form-title" variants={inputFieldVariants}>{t.formTitle[language]}</motion.h3>
        <motion.div className="form-group" variants={inputFieldVariants}>
          <label htmlFor="guestName">{t.nameLabel[language]}</label>
          <input
            type="text"
            id="guestName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder[language]}
            disabled={isSubmitting}
            maxLength={100}
          />
        </motion.div>
        <motion.div className="form-group" variants={inputFieldVariants}>
          <label htmlFor="guestMessage">{t.messageLabel[language]}</label>
          <textarea
            id="guestMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.messagePlaceholder[language]}
            rows={4}
            disabled={isSubmitting}
            maxLength={1000}
          />
        </motion.div>
        <AnimatePresence mode="wait">
            {submitError && <motion.p key="error" className="submit-feedback error" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}}>{submitError}</motion.p>}
            {submitSuccess && <motion.p key="success" className="submit-feedback success" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}}>{submitSuccess}</motion.p>}
        </AnimatePresence>
        <motion.button
          type="submit"
          className="guestbook-submit-button"
          disabled={isSubmitting}
          variants={inputFieldVariants}
          whileHover={{ scale: 1.05, y: -2, boxShadow: "0 5px 15px rgba(var(--highlight-color-poetic-rgb),0.2)" }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? t.submittingText[language] : t.submitButton[language]}
        </motion.button>
      </motion.form>

      <motion.div className="guestbook-divider" variants={inputFieldVariants} />

      <div className="guestbook-entries-list">
        {displayedEntries.length > 0 ? (
          <AnimatePresence>
            {displayedEntries.map((entry, index) => (
              <motion.div
                key={entry.id || `entry-${index}`} // Sử dụng ID từ DB nếu có, fallback index
                className="guestbook-entry"
                custom={index}
                variants={entryVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <p className="entry-message">{entry.message}</p>
                <p className="entry-meta">
                  <span className="entry-author">{t.entryBy[language]} <strong>{entry.name}</strong></span>
                  {entry.timestamp && <span className="entry-timestamp">({t.entryDatePrefix[language]} {formatDate(entry.timestamp)})</span>}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.p className="no-entries-message" variants={formVariants}>{t.noEntries[language]}</motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default Guestbook;