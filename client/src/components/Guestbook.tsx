// client/src/components/Guestbook.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/Guestbook.css';
import { guestbookViewTranslations as t } from './languageSelector/languageSelector.constants'; 
import type { GuestbookEntry } from '../data/guestbook.data'; 

// --- ICONS ---
const IconPencil = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    <path d="m15 5 4 4"></path>
  </svg>
);

const IconXCircle = () => ( // More visually distinct cancel icon
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
);
// --- END ICONS ---

interface GuestbookProps {
  language: 'vi' | 'en' | 'ja';
  onBack: () => void;
  entries: GuestbookEntry[];
  onAddEntry: (name: string, message: string, lang: 'vi' | 'en' | 'ja') => Promise<void>; 
}

// --- FRAMER MOTION VARIANTS ---
const guestbookContainerVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95, filter: "blur(5px)" },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { 
      type: "spring", stiffness: 180, damping: 28, mass: 1,
      staggerChildren: 0.08, delayChildren: 0.1 
    }
  },
  exit: { opacity: 0, y: 20, scale: 0.97, filter: "blur(3px)", transition: { duration: 0.25 } }
};

const guestbookInteractiveSectionVariants = { // For form OR write prompt
  hidden: { opacity: 0, height: 0, y: 20, marginBottom: 0 },
  visible: { opacity: 1, height: 'auto', y: 0, marginBottom: "2.5rem", transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.07, when: "beforeChildren" } },
  exit: { opacity: 0, height: 0, y: -15, marginBottom: 0, transition: { duration: 0.3, ease: "easeIn", when: "afterChildren" } }
};

const guestbookItemVariants = {
  hidden: { opacity: 0, x: -20, filter: "blur(2px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 220, damping: 20, mass: 0.9 } },
};

const entryCardVariants = {
  initial: { opacity: 0, y: 40, scale: 0.92, filter: "blur(4px) saturate(0.7)" },
  animate: (i: number) => ({
    opacity: 1, y: 0, scale: 1, filter: "blur(0px) saturate(1)",
    transition: {
      type: "spring", stiffness: 200, damping: 25, mass: 0.85,
      delay: i * 0.07 + 0.15,
    }
  }),
  exit: { opacity: 0, scale: 0.95, y: -20, filter: "blur(3px) saturate(0.8)", transition: { duration: 0.22 } }
};

const feedbackMessageVariants = {
  initial: { opacity: 0, y: 15, height: 0, marginTop: 0, marginBottom: 0 },
  animate: { 
    opacity: 1, y: 0, height: 'auto', 
    marginTop: '0.3rem', marginBottom: '0.5rem', 
    transition: { type: "spring", stiffness: 250, damping: 22 } 
  },
  exit: { 
    opacity: 0, y: -10, height: 0, 
    marginTop: 0, marginBottom: 0, 
    transition: { duration: 0.25, ease:"easeIn" } 
  }
};

const writePromptButtonVariants = {
    initial: { opacity: 0, scale: 0.8, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 18, delay: 0.2 } },
    exit: { opacity: 0, scale: 0.85, y: 5, transition: { duration: 0.15 } }
}


const Guestbook: React.FC<GuestbookProps> = ({ language, entries, onAddEntry }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'read' | 'write'>('read');


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
        setViewMode('read'); // Switch back to read mode
      }, 3500); 
    } catch (error: any) {
      console.error("Error submitting entry in Guestbook.tsx:", error);
      let userErrorMessage = language === 'vi' ? 'Gửi thất bại, vui lòng thử lại.' : language === 'en' ? 'Submission failed, please try again.' : '送信に失敗しました。もう一度お試しください。';
      if (error && typeof error.message === 'string' && error.message.startsWith('Failed to submit:')) { 
         userErrorMessage = `${userErrorMessage} (${error.message})`;
      } else if (error && typeof error.message === 'string') { 
        userErrorMessage = error.message;
      }
      setSubmitError(userErrorMessage);
      setTimeout(() => setSubmitError(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelWrite = () => {
    setViewMode('read');
    setName('');
    setMessage('');
    setSubmitError(null);
    setSubmitSuccess(null);
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
      variants={guestbookContainerVariants}
      initial="hidden" animate="visible" exit="exit"
    >
      <motion.h2 
        className="guestbook-title" 
        variants={guestbookItemVariants}
      >
        {t.title[language]}
      </motion.h2>

      <AnimatePresence mode="wait">
        {viewMode === 'read' && (
            <motion.div 
                key="read-prompt"
                className="guestbook-write-prompt"
                variants={guestbookInteractiveSectionVariants}
                initial="hidden" animate="visible" exit="exit"
            >
                <motion.p variants={guestbookItemVariants}>{t.promptWrite[language]}</motion.p>
                <motion.button 
                    className="guestbook-write-button" 
                    onClick={() => setViewMode('write')}
                    variants={writePromptButtonVariants}
                    initial="initial" animate="animate" exit="initial" // Exit to initial state
                    whileHover={{ scale: 1.08, y: -4, rotate: -3.5, 
                        boxShadow: "0 8px 22px -4px rgba(var(--highlight-color-poetic-rgb),0.35), 0 0 12px rgba(var(--highlight-color-poetic-rgb),0.2) inset"
                    }}
                    whileTap={{ scale: 0.95, y: -1, rotate: 1 }}
                    transition={{type: "spring", stiffness:300, damping:15}}
                >
                    <IconPencil />
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
                <motion.input
                    type="text" id="guestName" value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder[language]}
                    disabled={isSubmitting} maxLength={100}
                    whileFocus={{ 
                        borderColor: "var(--highlight-color-poetic)", 
                        boxShadow: "0 0 10px 2px rgba(var(--highlight-color-poetic-rgb),0.28)",
                        scale: 1.01
                    }}
                    transition={{type:"spring", stiffness:300, damping:15}}
                />
                </motion.div>
                <motion.div className="form-group" variants={guestbookItemVariants}>
                <label htmlFor="guestMessage">{t.messageLabel[language]}</label>
                <motion.textarea
                    id="guestMessage" value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.messagePlaceholder[language]}
                    rows={4} disabled={isSubmitting} maxLength={1000}
                    whileFocus={{ 
                        borderColor: "var(--highlight-color-poetic)", 
                        boxShadow: "0 0 10px 2px rgba(var(--highlight-color-poetic-rgb),0.28)",
                        scale: 1.01
                    }}
                    transition={{type:"spring", stiffness:300, damping:15}}
                />
                </motion.div>
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
                <motion.div className="form-actions" variants={guestbookItemVariants}>
                    <motion.button
                        type="button"
                        className="guestbook-cancel-button"
                        onClick={handleCancelWrite}
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.05, filter: "brightness(0.9)" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 18 }}
                    >
                        <IconXCircle />
                        <span>{t.cancelButton[language]}</span>
                    </motion.button>
                    <motion.button
                        type="submit"
                        className="guestbook-submit-button"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.05, y: -3, filter: "brightness(1.12)" }}
                        whileTap={{ scale: 0.97, y: -1, filter: "brightness(0.95)" }}
                        transition={{ type: "spring", stiffness: 350, damping: 18 }}
                    >
                        {isSubmitting ? (
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


      <motion.div 
        className="guestbook-divider" 
        variants={guestbookItemVariants}
      />

      {/* Entries list will be under guestbookSectionVariants in the main container's stagger */}
      <motion.div className="guestbook-entries-list-wrapper"> 
        {displayedEntries.length > 0 ? (
          <AnimatePresence>
            {displayedEntries.map((entry, index) => (
              <motion.div
                key={entry.id || `entry-${index}`}
                className="guestbook-entry"
                custom={index}
                variants={entryCardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover={{ y: -6, scale: 1.015, // Subtle scale
                    boxShadow: "0 12px 35px -8px rgba(var(--highlight-color-poetic-rgb),0.22), 0 0 18px rgba(var(--highlight-color-poetic-rgb),0.12) inset"
                }}
                transition={{type: "spring", stiffness: 280, damping: 15}}
                layout
              >
                <blockquote className="entry-message-wrapper">
                    <p className="entry-message">{entry.message}</p>
                </blockquote>
                <div className="entry-meta">
                  <span className="entry-author">
                    {t.entryBy[language]} <strong>{entry.name}</strong>
                  </span>
                  {entry.timestamp && (
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
            variants={guestbookItemVariants} // Can reuse for simple fade/slide
          >
            {t.noEntries[language]}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Guestbook;