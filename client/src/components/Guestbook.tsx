// client/src/components/Guestbook.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/Guestbook.css';
import { guestbookViewTranslations as t } from './languageSelector/languageSelector.constants';
import type { GuestbookEntry } from '../data/guestbook.data';

// --- NEW ICONS (Feather Pen and Ink Splatter Cancel) ---
const IconFeatherPen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.7 3.3a1 1 0 0 0-1.4 0L2.6 20.1a1 1 0 0 0 0 1.4l.4.4"/>
    <path d="m17.6 6.7 3.1-3.1"/>
    <path d="M2.6 20.1C5.9 19.4 10 18 13 15c2-2 3.3-4.2 4-6.3.4-1.1.6-2.3.5-3.5S17 3.2 16 3.3c-1 .1-2.3.7-3.7 2s-3 3.1-4.2 4.6c-1.9 2.4-3.8 4.6-5.3 6.8"/>
    <path d="M10.7 11.3 2.6 20.1"/>
    <path d="m19.2 5.2.4.4"/>
  </svg>
);

const IconInkSplatterCancel = () => ( // More thematic cancel icon
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


interface GuestbookProps {
  language: 'vi' | 'en' | 'ja';
  onBack: () => void; // Keep onBack from original props
  entries: GuestbookEntry[];
  onAddEntry: (name: string, message: string, lang: 'vi' | 'en' | 'ja') => Promise<void>;
}

// --- FRAMER MOTION VARIANTS (ENHANCED) ---
const guestbookContainerVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9, filter: "blur(8px) saturate(0.5)" },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: "blur(0px) saturate(1)",
    transition: {
      type: "spring", stiffness: 150, damping: 25, mass: 1.1,
      staggerChildren: 0.1, delayChildren: 0.15
    }
  },
  exit: { opacity: 0, y: 30, scale: 0.92, filter: "blur(5px) saturate(0.7)", transition: { duration: 0.3, ease:"anticipate" } }
};

const guestbookInteractiveSectionVariants = {
  hidden: { opacity: 0, height: 0, y: 25, filter:"blur(3px)", marginBottom: 0 },
  visible: {
    opacity: 1, height: 'auto', y: 0, filter:"blur(0px)", marginBottom: "2.8rem",
    transition: {
      opacity: { duration: 0.4, ease: "easeOut" },
      height: { type:"spring", stiffness: 200, damping: 28, delay:0.05 },
      y: {type:"spring", stiffness:220, damping:20, delay: 0.1 },
      filter: { duration: 0.3, delay: 0.15},
      staggerChildren: 0.08,
      when: "beforeChildren"
    }
  },
  exit: {
    opacity: 0, height: 0, y: -20, filter:"blur(3px)", marginBottom: 0,
    transition: {
      opacity: { duration: 0.25, ease: "easeIn" },
      height: { type:"spring", stiffness: 230, damping: 30, duration: 0.35 },
      filter: {duration: 0.2},
      when: "afterChildren"
    }
  }
};

const guestbookItemVariants = { // General item fade-in for title, form elements
  hidden: { opacity: 0, y: 18, filter: "blur(2.5px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 250, damping: 22, mass: 0.95 } },
};

const entryCardVariants = {
  initial: { opacity: 0, y: 55, x: -15, scale: 0.88, rotate: -3, filter: "blur(5px) saturate(0.6) brightness(0.8)" },
  animate: (i: number) => ({
    opacity: 1, y: 0, x:0, scale: 1, rotate:0, filter: "blur(0px) saturate(1) brightness(1)",
    transition: {
      type: "spring", stiffness: 190, damping: 26, mass: 0.9,
      delay: i * 0.1 + 0.2, // Staggered delay for each card
    }
  }),
  exit: { opacity: 0, scale: 0.9, y: -25, x:10, rotate: 2, filter: "blur(4px) saturate(0.7)", transition: { duration: 0.25, ease:"circIn" } }
};

const feedbackMessageVariants = {
  initial: { opacity: 0, y: 18, height: 0, marginTop: 0, marginBottom: 0, filter:"blur(2px)" },
  animate: {
    opacity: 1, y: 0, height: 'auto', filter:"blur(0px)",
    marginTop: '0.4rem', marginBottom: '0.6rem',
    transition: { type: "spring", stiffness: 260, damping: 24 }
  },
  exit: {
    opacity: 0, y: -12, height: 0, filter:"blur(2px)",
    marginTop: 0, marginBottom: 0,
    transition: { duration: 0.28, ease:"easeIn" }
  }
};

const writePromptButtonVariants = {
    initial: { opacity: 0, scale: 0.75, y: 15, rotate:5 },
    animate: {
        opacity: 1, scale: 1, y: 0, rotate:0,
        transition: { type: "spring", stiffness: 230, damping: 16, delay: 0.25 }
    },
    exit: { opacity: 0, scale: 0.8, y: 10, rotate: -3, transition: { duration: 0.18, ease:"easeIn" } }
}


const Guestbook: React.FC<GuestbookProps> = ({ language, entries, onAddEntry, onBack }) => { // Added onBack
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
        setViewMode('read'); 
      }, 3500);
    } catch (error: any) {
      console.error("Error submitting entry in Guestbook.tsx:", error);
      let userErrorMessage = language === 'vi' ? 'Gửi thất bại, vui lòng thử lại.' : language === 'en' ? 'Submission failed, please try again.' : '送信に失敗しました。もう一度お試しください。';
      if (error && typeof error.message === 'string' && error.message.startsWith('Failed to submit:')) {
         userErrorMessage = `${userErrorMessage} (${error.message.replace('Failed to submit: ', '')})`; // Cleaner message
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

  const displayedEntries = [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


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
                <motion.p variants={guestbookItemVariants} dangerouslySetInnerHTML={{ __html: t.promptWrite[language] }} />
                <motion.button
                    className="guestbook-write-button poetic-button" 
                    onClick={() => setViewMode('write')}
                    variants={writePromptButtonVariants}
                    initial="initial" animate="animate" exit="exit"
                    whileHover={{ scale: 1.07, y: -5, rotate: -4.5,
                        boxShadow: "0 10px 28px -6px rgba(var(--guestbook-highlight-rgb),0.4), 0 0 15px rgba(var(--guestbook-highlight-rgb),0.25) inset"
                    }}
                    whileTap={{ scale: 0.96, y: -2, rotate: 1.5 }}
                    transition={{type: "spring", stiffness:320, damping:14}}
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
                <motion.input
                    type="text" id="guestName" value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder[language]}
                    disabled={isSubmitting} maxLength={100}
                    whileFocus={{
                        borderColor: "var(--guestbook-highlight)",
                        boxShadow: "0 0 12px 3px rgba(var(--guestbook-highlight-rgb),0.3), inset 0 1px 3px rgba(0,0,0,0.1)",
                        scale: 1.015
                    }}
                    transition={{type:"spring", stiffness:320, damping:16}}
                />
                </motion.div>
                <motion.div className="form-group" variants={guestbookItemVariants}>
                <label htmlFor="guestMessage">{t.messageLabel[language]}</label>
                <motion.textarea
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
                        className="guestbook-cancel-button poetic-button-subtle"
                        onClick={handleCancelWrite}
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.06, filter: "brightness(0.95)", borderColor: "rgba(var(--subtext-color-poetic-rgb),0.6)" }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 360, damping: 20 }}
                    >
                        <IconInkSplatterCancel />
                        <span>{t.cancelButton[language]}</span>
                    </motion.button>
                    <motion.button
                        type="submit"
                        className="guestbook-submit-button poetic-button-primary"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.04, y: -3.5, filter: "brightness(1.15) saturate(1.1)", boxShadow:"0 7px 22px -4px rgba(var(--guestbook-highlight-rgb),0.42), 0 3px 10px rgba(var(--guestbook-primary-action-rgb),0.3)" }}
                        whileTap={{ scale: 0.98, y: -1, filter: "brightness(0.92)" }}
                        transition={{ type: "spring", stiffness: 360, damping: 16 }}
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
        initial="hidden" animate={{...guestbookItemVariants.visible, transition: {...guestbookItemVariants.visible.transition, delay: viewMode === 'read' ? 0.3 : 0.5} }} exit="hidden" 
      />

      <div className="guestbook-entries-list-wrapper">
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
                whileHover={{ y: -8, scale: 1.025,
                    boxShadow: "0 15px 40px -10px rgba(var(--guestbook-highlight-rgb),0.3), 0 0 22px rgba(var(--guestbook-highlight-rgb),0.18) inset, 5px 5px 15px rgba(var(--paper-bg-rgb), 0.18)"
                }}
                transition={{type: "spring", stiffness: 260, damping: 16, mass:0.8}}
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
            variants={guestbookItemVariants} // Re-use general item variant
            initial="hidden" animate={{...guestbookItemVariants.visible, transition: {...guestbookItemVariants.visible.transition, delay: 0.4} }} exit="hidden"
          >
            {t.noEntries[language]}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default Guestbook;