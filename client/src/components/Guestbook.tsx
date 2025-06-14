// client/src/components/Guestbook.tsx
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import './styles/Guestbook.css';
import { useGuestbookStore } from '../stores/guestbook.store'; 
import {
    guestbookViewTranslations as t,
    randomPoeticQuotes
} from './languageSelector/languageSelector.constants';
import { aboutNavIconLeft, cardIntroTranslations } from './languageSelector/languageSelector.constants';
import { logInteraction } from '../utils/logger';

// --- ICONS ---
const IconFeatherPen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.7 3.3a1 1 0 0 0-1.4 0L2.6 20.1a1 1 0 0 0 0 1.4l.4.4"/><path d="m17.6 6.7 3.1-3.1"/><path d="M2.6 20.1C5.9 19.4 10 18 13 15c2-2 3.3-4.2 4-6.3.4-1.1.6-2.3.5-3.5S17 3.2 16 3.3c-1 .1-2.3.7-3.7 2s-3 3.1-4.2 4.6c-1.9 2.4-3.8 4.6-5.3 6.8"/><path d="M10.7 11.3 2.6 20.1"/><path d="m19.2 5.2.4.4"/></svg>
);
const IconInkSplatterCancel = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5C6 20 4 17 4 12A8 8 0 0 1 12 4c5 0 7 2.5 7.5 7.5"/><path d="m18 18-5.5-5.5"/><path d="m12.5 18-5.5-5.5"/><path d="M4.5 10C5.7 9.3 6.5 8.2 7 7"/><path d="M7.5 3.5C9 4.2 10.8 5.1 11.5 6.5"/><circle cx="14" cy="5.5" r="0.5" fill="currentColor"/><circle cx="9" cy="3.5" r="0.5" fill="currentColor"/><circle cx="4.5" cy="6" r="0.5" fill="currentColor"/><circle cx="20.5" cy="11" r="0.5" fill="currentColor"/></svg>
);

// --- PROPS ---
interface GuestbookProps {
  language: 'vi' | 'en' | 'ja';
  onBack: () => void;
}

// --- Cac component va logic khac
interface TypewriterMessageProps {
  fullMessage: string;
  className?: string;
  staggerDuration?: number;
}
const TypewriterCharacterVariants: Variants = { hidden: { opacity: 0, y: 8, scaleX: 0.6, filter: "blur(2.5px)", transformOrigin: 'left center' }, visible: { opacity: 1, y: 0, scaleX: 1, filter: "blur(0px)", transition: { type: "spring", damping: 22, stiffness: 120, mass: 0.8, } } };
const TypewriterContainerVariants = (stagger: number): Variants => ({ hidden: {}, visible: { transition: { staggerChildren: stagger } } });
const TypewriterMessage: React.FC<TypewriterMessageProps> = React.memo(({ fullMessage, className = "entry-message", staggerDuration = 0.045,}) => {
  const characters = useMemo(() => fullMessage.split(''), [fullMessage]);
  const animationKey = useMemo(() => fullMessage, [fullMessage]);
  return (<div className={className}> <motion.p key={animationKey} variants={TypewriterContainerVariants(staggerDuration)} initial="hidden" animate="visible" style={{ margin: 0, padding: 0, whiteSpace: 'normal', overflowWrap: 'break-word', wordWrap: 'break-word', hyphens: 'none' }}> {characters.map((char, index) => ( <motion.span key={`${char}-${index}-${animationKey}`} variants={TypewriterCharacterVariants} style={{ display: 'inline', minWidth: char === ' ' ? '0.25em' : undefined }} > {char === ' ' ? '\u00A0' : char} </motion.span> ))} </motion.p> </div> );
});
TypewriterMessage.displayName = 'TypewriterMessage';
const bookCoreVariants = { hidden: { opacity: 0, y: 60, scale: 0.9, filter: "blur(10px) saturate(0.5)" }, visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px) saturate(1)", transition: { type: "spring", stiffness: 120, damping: 20, mass: 1, staggerChildren: 0.07, delayChildren: 0.2 } }, exit: { opacity: 0, y: 45, scale: 0.92, filter: "blur(8px) saturate(0.65)", transition: { duration: 0.35, ease: [0.6, 0.05, 0.25, 0.95] } } };
const guestbookInteractiveSectionVariants = { hidden: { opacity: 0, y: 18, filter: "blur(1.5px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { opacity: { duration: 0.3, ease: "easeOut" }, y: { type: "spring", stiffness: 190, damping: 17, delay: 0.04 }, filter: { duration: 0.2, delay: 0.08 }, staggerChildren: 0.1, when: "beforeChildren" } }, exit: { opacity: 0, y: -13, filter: "blur(1.5px)", transition: { opacity: { duration: 0.18, ease: "easeIn" }, filter: { duration: 0.13 }, when: "afterChildren" } }};
const guestbookItemVariants = { hidden: { opacity: 0, y: 13, filter: "blur(2px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 220, damping: 19, mass: 0.85 } }, exit: { opacity: 0, y: -9, filter: "blur(1.5px)", transition: { duration: 0.13 }} };
const entryCardVariants = { initial: { opacity: 0, y: 50, x: 0, scale: 0.9, rotate: 0, filter: "blur(5px) saturate(0.6) brightness(0.85)" }, animate: (i: number) => ({ opacity: 1, y: 0, x:0, scale: 1, rotate:0, filter: "blur(0px) saturate(1) brightness(1)", transition: { type: "spring", stiffness: 150, damping: 22, mass: 0.75, delay: i * 0.09 + 0.2, } }), exit: { opacity: 0, scale: 0.94, y: -20, x: 5, rotate: 0.8, filter: "blur(4px) saturate(0.75)", transition: { duration: 0.22, ease:"circIn" } }, };
const messageWrapperVariants: Variants = { hidden: { opacity: 0, height: 0, marginTop: "0rem", transition: { when: "afterChildren", opacity: { duration: 0.15, ease: "easeOut" }, height: { duration: 0.2, ease: "easeOut"}, marginTop: {duration: 0.2, ease: "easeOut"} } }, visible: { opacity: 1, height: "auto", marginTop: "1.1rem", transition: { when: "beforeChildren", opacity: { duration: 0.2, ease: "easeOut", delay: 0.05 }, height: { type: "spring", stiffness: 200, damping: 26, mass: 0.8, delay: 0.05 }, marginTop: { type: "spring", stiffness: 200, damping: 26, mass: 0.8, delay: 0.05 }, } }, };
const feedbackMessageVariants = { initial: { opacity: 0, y: 15, height: 0, marginTop: 0, marginBottom: 0, filter:"blur(2px) saturate(0.5)" }, animate: { opacity: 1, y: 0, height: 'auto', filter:"blur(0px) saturate(1)", marginTop: '0.4rem', marginBottom: '0.6rem', transition: { type: "spring", stiffness: 200, damping: 18, mass: 0.9 } }, exit: { opacity: 0, y: -10, height: 0, filter:"blur(2px) saturate(0.5)", marginTop: 0, marginBottom: 0, transition: { duration: 0.25, ease: [0.6, 0.05, 0.25, 0.95] } } };
const writePromptButtonVariants = { initial: { opacity: 0, scale: 0.82, y: 10, rotate:3.5 }, animate: { opacity: 1, scale: 1, y: 0, rotate:0, transition: { type: "spring", stiffness: 210, damping: 14, delay: 0.18 } }, exit: { opacity: 0, scale: 0.87, y: 7, rotate: -2, transition: { duration: 0.13, ease:"easeIn" } } };
const bookPagesWrapperVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.05, staggerChildren: 0.08, when: "beforeChildren" } }, exit: { opacity: 0 }};
const MIN_PANE_HEIGHT_PERCENT = 25;
const MAX_PANE_HEIGHT_PERCENT = 75;
const DIVIDER_HEIGHT = 10;

// --- Component chinh ---
const Guestbook: React.FC<GuestbookProps> = ({ language, onBack }) => {
  const { entries, addEntry, isLoading } = useGuestbookStore();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'read' | 'write'>('read');
  const [hoveredEntryId, setHoveredEntryId] = useState<string | number | null>(null);
  const [currentRandomQuote, setCurrentRandomQuote] = useState<string>('');
  const randomQuoteIntervalIdRef = useRef<number | null>(null);
  const hasLoggedViewRef = useRef<Set<string|number>>(new Set());
  const [leftPaneHeight, setLeftPaneHeight] = useState<number | null>(null);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const dragStartY = useRef(0);
  const dragStartLeftPaneHeight = useRef(0);
  const bookPagesWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const quotesForLang = randomPoeticQuotes[language];
    if (viewMode === 'read' && quotesForLang?.length > 0) {
      const selectNewQuote = () => setCurrentRandomQuote(`"${quotesForLang[Math.floor(Math.random() * quotesForLang.length)]}"`);
      selectNewQuote();
      if (randomQuoteIntervalIdRef.current) clearInterval(randomQuoteIntervalIdRef.current);
      randomQuoteIntervalIdRef.current = window.setInterval(selectNewQuote, 2500);
      return () => { if (randomQuoteIntervalIdRef.current) clearInterval(randomQuoteIntervalIdRef.current) };
    } else {
      if (randomQuoteIntervalIdRef.current) clearInterval(randomQuoteIntervalIdRef.current);
      setCurrentRandomQuote('');
    }
  }, [viewMode, language]);
  
   useEffect(() => {
    if (hoveredEntryId !== null && !hasLoggedViewRef.current.has(hoveredEntryId)) {
      const entry = entries.find(e => e.id === hoveredEntryId);
      logInteraction('guestbook_entry_viewed', { entryId: hoveredEntryId, messageSnippet: entry?.message.substring(0, 30) || 'N/A', language });
      hasLoggedViewRef.current.add(hoveredEntryId);
    }
   }, [hoveredEntryId, language, entries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setSubmitError(t.validationError[language]);
      setTimeout(() => setSubmitError(null), 4000);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      await addEntry(name.trim(), message.trim(), language);
      logInteraction('guestbook_entry_submitted', { name: name.trim(), messageSnippet: message.trim().substring(0, 30), language });
      setName('');
      setMessage('');
      setSubmitSuccess(t.submitSuccess[language]);
      setTimeout(() => { setSubmitSuccess(null); setViewMode('read'); }, 3500);
    } catch (error: any) {
      let userErrorMessage = error.message || t.submitError[language];
      setSubmitError(userErrorMessage);
      setTimeout(() => setSubmitError(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelWrite = () => {
    setViewMode('read'); setName(''); setMessage('');
    setSubmitError(null); setSubmitSuccess(null);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t.entryDatePrefix[language] + ' ...';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: language === 'en' };
    return new Intl.DateTimeFormat(language, options).format(date);
  };

  const handleDividerMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingDivider(true);
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    dragStartY.current = clientY;
    dragStartLeftPaneHeight.current = leftPaneHeight ?? ((bookPagesWrapperRef.current?.offsetHeight ?? 0) / 2 - DIVIDER_HEIGHT / 2);
  }, [leftPaneHeight]);

  useEffect(() => {
    const handleWindowMouseMove = (event: MouseEvent | TouchEvent) => {
      if (!isDraggingDivider || !bookPagesWrapperRef.current) return;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      const deltaY = clientY - dragStartY.current;
      const totalHeight = bookPagesWrapperRef.current.offsetHeight - DIVIDER_HEIGHT;
      const minHeightPx = (MIN_PANE_HEIGHT_PERCENT / 100) * totalHeight;
      const maxHeightPx = (MAX_PANE_HEIGHT_PERCENT / 100) * totalHeight;
      let newLeftPaneHeight = Math.max(minHeightPx, Math.min(dragStartLeftPaneHeight.current + deltaY, maxHeightPx));
      setLeftPaneHeight(newLeftPaneHeight);
    };

    const handleWindowMouseUp = () => setIsDraggingDivider(false);
    
    if (isDraggingDivider) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('touchmove', handleWindowMouseMove, { passive: false });
      window.addEventListener('mouseup', handleWindowMouseUp);
      window.addEventListener('touchend', handleWindowMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('touchmove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchend', handleWindowMouseUp);
    };
  }, [isDraggingDivider]);

  useEffect(() => {
    const initOrResetHeight = () => {
      if (bookPagesWrapperRef.current) {
        setLeftPaneHeight(bookPagesWrapperRef.current.offsetHeight / 2 - DIVIDER_HEIGHT / 2);
      }
    };
    initOrResetHeight();
    window.addEventListener('resize', initOrResetHeight);
    return () => window.removeEventListener('resize', initOrResetHeight);
  }, []);

  const leftPageStyle = leftPaneHeight !== null && window.innerWidth <= 640 ? { height: `${leftPaneHeight}px`, flexShrink: 0, flexBasis: `${leftPaneHeight}px` } : {};
  const rightPageStyle = leftPaneHeight !== null && window.innerWidth <= 640 && bookPagesWrapperRef.current ? { height: `${bookPagesWrapperRef.current.offsetHeight - leftPaneHeight - DIVIDER_HEIGHT}px`, flexShrink: 0, flexBasis: `${bookPagesWrapperRef.current.offsetHeight - leftPaneHeight - DIVIDER_HEIGHT}px` } : {};
  
  if (isLoading && entries.length === 0) {
      return (<motion.div className="book-core"><p>Loading guestbook...</p></motion.div>)
  }

  return (
    <motion.div className="book-core" variants={bookCoreVariants} initial="hidden" animate="visible" exit="exit">
        <motion.h2 className="guestbook-title" variants={guestbookItemVariants} initial="hidden" animate="visible" exit="hidden">{t.title[language]}</motion.h2>
        <motion.div ref={bookPagesWrapperRef} className="book-pages-wrapper" variants={bookPagesWrapperVariants} initial="hidden" animate="visible" exit="exit">
          
            <div className="book-page page-left" style={leftPageStyle}>
                <div className="page-content-scrollable left-page-scroll">
                    <AnimatePresence mode="wait">
                    {viewMode === 'read' ? (
                        <motion.div key="read" className="guestbook-left-content-read-mode" variants={guestbookInteractiveSectionVariants} initial="hidden" animate="visible" exit="exit">
                            <motion.div className="guestbook-write-prompt" variants={guestbookItemVariants} >
                                <motion.p variants={guestbookItemVariants} dangerouslySetInnerHTML={{ __html: t.promptWrite[language] }} />
                                <motion.button className="guestbook-write-button poetic-button" onClick={() => setViewMode('write')} variants={writePromptButtonVariants} whileHover={{ scale: 1.08, y: -6, rotate: -5 }} whileTap={{ scale: 0.95, y: -1, rotate: 2 }} >
                                    <IconFeatherPen /><span>{t.writeButtonLabel[language]}</span>
                                </motion.button>
                            </motion.div>
                            {currentRandomQuote && (<motion.div key="quote" className="guestbook-random-quote-wrapper" variants={guestbookItemVariants}> <AnimatePresence mode="wait"><TypewriterMessage key={currentRandomQuote+language} fullMessage={currentRandomQuote} className="random-quote-message-enhanced" /></AnimatePresence></motion.div>)}
                        </motion.div>
                    ) : (
                        <motion.form key="write" onSubmit={handleSubmit} className="guestbook-form" variants={guestbookInteractiveSectionVariants} initial="hidden" animate="visible" exit="exit">
                            <motion.h3 className="guestbook-form-title" variants={guestbookItemVariants}>{t.formTitle[language]}</motion.h3>
                            <motion.div className="form-group" variants={guestbookItemVariants}><label htmlFor="guestName">{t.nameLabel[language]}</label><motion.input type="text" id="guestName" value={name} onChange={(e)=>setName(e.target.value)} placeholder={t.namePlaceholder[language]} disabled={isSubmitting} maxLength={100} whileFocus={{borderColor: "var(--guestbook-highlight)", scale: 1.015}} /></motion.div>
                            <motion.div className="form-group" variants={guestbookItemVariants}><label htmlFor="guestMessage">{t.messageLabel[language]}</label><motion.textarea id="guestMessage" value={message} onChange={(e)=>setMessage(e.target.value)} placeholder={t.messagePlaceholder[language]} rows={5} disabled={isSubmitting} maxLength={1000} whileFocus={{borderColor: "var(--guestbook-highlight)", scale: 1.015}} /></motion.div>
                            <div className="form-feedback-container"><AnimatePresence mode="wait">{submitError && (<motion.p key="err" className="submit-feedback error" variants={feedbackMessageVariants} initial="initial" animate="animate" exit="exit">{submitError}</motion.p>)}{submitSuccess && (<motion.p key="succ" className="submit-feedback success" variants={feedbackMessageVariants} initial="initial" animate="animate" exit="exit">{submitSuccess}</motion.p>)}</AnimatePresence></div>
                            <motion.div className="form-actions" variants={guestbookItemVariants}><motion.button type="button" className="guestbook-cancel-button poetic-button-subtle" onClick={handleCancelWrite} disabled={isSubmitting} whileHover={{scale: 1.06}} whileTap={{scale:0.97}}><IconInkSplatterCancel/><span>{t.cancelButton[language]}</span></motion.button><motion.button type="submit" className="guestbook-submit-button poetic-button-primary" disabled={isSubmitting} whileHover={{scale: 1.04, y: -3.5}} whileTap={{scale:0.98,y:-1}}>{isSubmitting?(<><span className="button-spinner"></span>{t.submittingText[language]}</>):t.submitButton[language]}</motion.button></motion.div>
                        </motion.form>
                    )}
                    </AnimatePresence>
                </div>
                {/* Nut back dat o day */}
                <motion.button className="card-view-back-button" style={{margin:'auto auto 3rem auto'}} onClick={onBack} initial={{opacity:0}} animate={{opacity:1, transition:{delay:0.3}}} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} >
                    <span className="button-icon-svg" dangerouslySetInnerHTML={{__html:aboutNavIconLeft}}/>
                    <span>{cardIntroTranslations.backButton[language]}</span>
                </motion.button>
            </div>
            { window.innerWidth <= 640 && <motion.div className="guestbook-page-divider" onMouseDown={handleDividerMouseDown} onTouchStart={handleDividerMouseDown} /> }
            <div className="book-page page-right" style={rightPageStyle}>
                <div className="page-content-scrollable right-page-scroll">
                    <div className="guestbook-entries-list-wrapper">
                        {entries.length > 0 ? (
                        <AnimatePresence>
                            {[...entries].sort((a,b)=>new Date(b.timestamp).getTime()-new Date(a.timestamp).getTime()).map((entry,i) => (
                            <motion.div key={entry.id||`e-${i}`} className="guestbook-entry" custom={i} variants={entryCardVariants} initial="initial" animate="animate" exit="exit" onMouseEnter={()=>setHoveredEntryId(entry.id)} onMouseLeave={()=>setHoveredEntryId(null)} layout>
                                <div className="entry-meta"><span className="entry-author">{t.entryBy[language]} <strong>{entry.name}</strong></span>{entry.timestamp&&(<span className="entry-timestamp">{t.entryDatePrefix[language]} {formatDate(entry.timestamp)}</span>)}</div>
                                <AnimatePresence mode="wait">{hoveredEntryId===entry.id&&(<motion.blockquote key={`msg-${entry.id}`} className="entry-message-wrapper" variants={messageWrapperVariants} initial="hidden" animate="visible" exit="hidden"><TypewriterMessage fullMessage={entry.message} className="entry-message"/></motion.blockquote>)}</AnimatePresence>
                            </motion.div>))}
                        </AnimatePresence>
                        ) : (<motion.p className="no-entries-message" variants={guestbookItemVariants} initial="hidden" animate={{...guestbookItemVariants.visible, transition:{...guestbookItemVariants.visible.transition, delay: (viewMode==='read'?0.45:0.18)}}} exit="hidden">{t.noEntries[language]}</motion.p> )}
                    </div>
                </div>
            </div>
        </motion.div>
    </motion.div>
  );
};
export default Guestbook;