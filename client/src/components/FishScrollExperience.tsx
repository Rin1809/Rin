// client/src/components/FishScrollExperience.tsx

import React, { useEffect, useRef, useState } from 'react';
import './styles/FishScrollExperience.css';
import { Canvas } from '@react-three/fiber';
import { ScrollVideoScreen } from './ScrollVideoScreen';

declare const gsap: any;
declare const ScrollTrigger: any;
declare const MotionPathPlugin: any;

type ScrollTriggerInstance = {
  direction: number;
  [key: string]: any;
};

interface FishScrollExperienceProps {
  onScrollEnd: () => void;
}

interface StorySection {
  type: 'text' | 'spacer';
  text?: string; 
  videoSrc?: string;
  spacerHeight?: string; 
}

const storyContent: StorySection[] = [
    { type: 'text', text: "Hey there" },
    { type: 'text', text: "Welcome to my Card" },
    { type: 'text', text: "Actually i dont have too much information to introduce" },
    { type: 'text', text: "Lets read a story..." },
    { type: 'text', text: "13.8 billion years ago, a silent bang echoed into existence...", videoSrc: "/videos/cosmos_intro.mp4" },
    { type: 'spacer', spacerHeight: '50vh' },
    { type: 'text', text: "13.6 billion years ago, the first stardust began to swirl and dream...", videoSrc: "/videos/stars_forming.mp4" },
    { type: 'spacer', spacerHeight: '50vh' },
    { type: 'text', text: "10 billion years ago, our Milky Way started its slow, majestic waltz...", videoSrc: "/videos/milkyway.mp4" },
    { type: 'spacer', spacerHeight: '50vh' },
    { type: 'text', text: "4.6 billion years ago, a young star claimed its court, our Solar System...", videoSrc: "/videos/solar_system.mp4" },
    { type: 'spacer', spacerHeight: '50vh' },
    { type: 'text', text: "4.5 billion years ago, a blue marble, our Earth, took its first breath...", videoSrc: "/videos/earth.mp4" },
    { type: 'spacer', spacerHeight: '50vh' },
    { type: 'text', text: "300,000 years ago, Homo Sapiens first looked up and wondered at the stars...", videoSrc: "/videos/humans.mp4" },
    { type: 'spacer', spacerHeight: '50vh' },
    { type: 'text', text: "And now, on this very day, you, a traveler of time, have arrived.", videoSrc: "/videos/arrival.mp4" },
    { type: 'spacer', spacerHeight: '50vh' },
    { type: 'text', text: `(${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })})` },
    { type: 'text', text: "A fleeting, beautiful moment in the grand cosmic tapestry." },
    { type: 'text', text: "Welcome." }
];

const FishScrollExperience: React.FC<FishScrollExperienceProps> = ({ onScrollEnd }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [activeVideoSrc, setActiveVideoSrc] = useState<string | null>(null);
    const [isVideoActive, setIsVideoActive] = useState(false);

    useEffect(() => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof MotionPathPlugin === 'undefined') {
            console.error("GSAP is not loaded!");
            return;
        }

        gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

        const rx = window.innerWidth < 1000 ? window.innerWidth / 1200 : 1;
        const ry = window.innerHeight < 700 ? window.innerHeight / 1200 : 1;
        
        const path = [
            { x: 800, y: 200 }, { x: 900, y: 20 }, { x: 1100, y: 100 },
            { x: 1000, y: 200 }, { x: 900, y: 20 }, { x: 10, y: 500 },
            { x: 100, y: 300 }, { x: 500, y: 400 }, { x: 1000, y: 200 },
            { x: 1100, y: 300 }, { x: 400, y: 400 }, { x: 200, y: 250 },
            { x: 100, y: 300 }, { x: 500, y: 450 }, { x: 1100, y: 500 }
        ];
        const scaledPath = path.map(({ x, y }) => ({ x: x * rx, y: y * ry }));

        const sections = [...document.querySelectorAll('.fish-experience-container section')] as HTMLElement[];
        const butterfly = document.querySelector('.fish-experience-container .butterfly');
        const butterflyBodyAndHead = [
            ...document.querySelectorAll('.fish-experience-container .butterfly__head'),
            ...document.querySelectorAll('.fish-experience-container .butterfly__body')
        ];
        const nebulaGlow = document.querySelector('.fish-experience-container [data-rays]');

        const stardustTl = gsap.timeline({ paused: true });
        stardustTl.set('.fish-experience-container .stardust__particle', { y: 100 });
        stardustTl.to('.fish-experience-container .stardust__particle', { scale: 1.2, y: -300, opacity: 1, duration: 2, stagger: 0.2 });
        stardustTl.to('.fish-experience-container .stardust__particle', { scale: 1, opacity: 0, duration: 1 }, '-=1');
        
        const tl = gsap.timeline({ scrollTrigger: { scrub: 1.5 } });
        tl.to(butterfly, { motionPath: { path: scaledPath, align: 'self', alignOrigin: [0.5, 0.5], autoRotate: true }, duration: 10, immediateRender: true });
        tl.to('.fish-experience-container .indicator', { opacity: 0 }, 0);
        tl.to(butterfly, { rotateX: 180 }, 1);
        tl.to(butterfly, { rotateX: 0 }, 2.5);
        tl.to(butterfly, { z: -500, duration: 2 }, 2.5);
        tl.to(butterfly, { rotateX: 180 }, 4);
        tl.to(butterfly, { rotateX: 0 }, 5.5);
        tl.to(butterfly, { z: -50, duration: 2 }, 5);
        tl.to(butterfly, { rotate: 0, duration: 1 }, '-=1');
        tl.to('.fish-experience-container .butterfly__soul', { opacity: 0.6, duration: 0.1, repeat: 4 }, '-=3');
        tl.to(butterflyBodyAndHead, { opacity: 0, duration: 0.1, repeat: 4 }, '-=3');
        tl.to('.fish-experience-container .butterfly__inner', { opacity: 0.1, duration: 1 }, '-=1');
        tl.to('.fish-experience-container .butterfly__soul', { opacity: 0.1, duration: 1 }, '-=1');

        stardustTl.play();
        tl.pause();

        const createStardust = (p: HTMLElement | null, i: number) => {
            if (!butterfly || !p) return;
            gsap.to(p, { opacity: 1, duration: 1 });
            const { top, left } = butterfly.getBoundingClientRect();
            gsap.set('.fish-experience-container .stardust', { x: left, y: top });
            if (stardustTl.paused()) stardustTl.restart();
            if (i > 6) gsap.to('.fish-experience-container .stardust', { opacity: 0 });
        };

        const rotateButterfly = (self: ScrollTriggerInstance) => {
            gsap.to(butterfly, { rotationY: self.direction === -1 ? 180 : 0, duration: 0.4 });
        };

        const hideText = (p: HTMLElement | null) => {
            if (p) gsap.to(p, { opacity: 0, duration: 1 });
        };

        sections.forEach((section, i) => {
            const p = section.querySelector('p');
            const sectionData = storyContent[i];
            
            if (sectionData.type === 'text' && p) {
                gsap.set(p, { opacity: 0 });
            }

            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                onEnter: (self: ScrollTriggerInstance) => {
                    if(sectionData.type === 'text') createStardust(p, i);
                    if (sectionData.videoSrc) {
                        setActiveVideoSrc(sectionData.videoSrc);
                        setIsVideoActive(true);
                    }
                    rotateButterfly(self);
                },
                onEnterBack: (self: ScrollTriggerInstance) => {
                    if (i <= 6 && sectionData.type === 'text') gsap.to('.fish-experience-container .stardust', { opacity: 1 });
                     if (sectionData.videoSrc) {
                        setActiveVideoSrc(sectionData.videoSrc);
                        setIsVideoActive(true);
                    }
                    rotateButterfly(self);
                },
                onLeave: () => {
                    if(sectionData.type === 'text') hideText(p);
                    if (sectionData.videoSrc) {
                        setIsVideoActive(false);
                    }
                    if (i === 0 && nebulaGlow) gsap.to(nebulaGlow, { opacity: 0, y: -500, duration: 8, ease: 'power4.in' });
                },
                onLeaveBack: () => {
                     if(sectionData.type === 'text') hideText(p);
                     if (sectionData.videoSrc) {
                        setIsVideoActive(false);
                    }
                }
            });
        });

        const lastSection = sections[sections.length - 1];
        if (lastSection) {
            ScrollTrigger.create({
                trigger: lastSection,
                start: "center center",
                onEnter: () => {
                    if (wrapperRef.current) {
                        gsap.to(wrapperRef.current, {
                            opacity: 0, duration: 1.5,
                            onComplete: () => {
                                onScrollEnd();
                                ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
                            }
                        });
                    }
                },
                once: true,
            });
        }

        return () => {
            ScrollTrigger.getAll().forEach((t: any) => t.kill());
        };
    }, [onScrollEnd]);

    return (
        <div ref={wrapperRef} className="fish-experience-container">
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none' }}>
              <Canvas>
                  <color attach="background" args={['#0c0e1a']} />
                  <ScrollVideoScreen videoSrc={activeVideoSrc} isActive={isVideoActive} />
              </Canvas>
            </div>

            <div className="starfield" style={{ zIndex: 2 }}></div>
            <div className="shooting-stars" style={{ zIndex: 2 }}></div>
            <p className="indicator" style={{ zIndex: 3 }}>
                <span>scroll down the fish</span>
                <span>↓</span>
            </p>
            <div className="butterfly-wrapper" style={{ zIndex: 3 }}>
                <div className="butterfly">
                    <div className="butterfly__soul"></div>
                    <div className="butterfly__inner">
                        <div className="butterfly__body"></div>
                        <div className="butterfly__body"></div>
                        <div className="butterfly__body"></div>
                        <div className="butterfly__body"></div>
                        <div className="butterfly__head"></div>
                        <div className="butterfly__head butterfly__head--2"></div>
                        <div className="butterfly__head butterfly__head--3"></div>
                        <div className="butterfly__head butterfly__head--4"></div>
                        <div className="butterfly__wing butterfly__wing--main-left"></div>
                        <div className="butterfly__wing butterfly__wing--main-right"></div>
                        <div className="butterfly__wing butterfly__wing--lower-left"></div>
                        <div className="butterfly__wing butterfly__wing--lower-right"></div>
                    </div>
                </div>
            </div>
            <div className="stardust" style={{ zIndex: 3 }}>
                <div className="stardust__inner">
                    {[...Array(5)].map((_, i) => <div key={i} className="stardust__particle"></div>)}
                </div>
            </div>
            <div className="nebula-glow" style={{ zIndex: 2 }}><div data-rays></div></div>
            
            <div className="content" style={{ zIndex: 3 }}>
                {storyContent.map((item, i) => (
                    <section 
                        key={i} 
                        className={item.type === 'spacer' ? 'spacer-section' : ''}
                        style={item.type === 'spacer' ? { height: item.spacerHeight || '50vh' } : {}}
                    >
                        {item.type === 'text' && (
                            <div className="section__content">
                                <p>{item.text}</p>
                            </div>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
};

export default FishScrollExperience;