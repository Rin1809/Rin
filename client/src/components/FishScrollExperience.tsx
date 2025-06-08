import React, { useEffect, useRef } from 'react';
import './styles/FishScrollExperience.css';

declare const gsap: any;
declare const ScrollTrigger: any;
declare const MotionPathPlugin: any;

interface FishScrollExperienceProps {
  onScrollEnd: () => void;
}

const FishScrollExperience: React.FC<FishScrollExperienceProps> = ({ onScrollEnd }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Kiểm tra xem GSAP đã được tải từ CDN chưa
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof MotionPathPlugin === 'undefined') {
            console.error("GSAP is not loaded! Please add GSAP scripts to your index.html.");
            return;
        }

        gsap.registerPlugin(ScrollTrigger);
        gsap.registerPlugin(MotionPathPlugin);

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

        const createStardust = (p: HTMLElement, i: number) => {
            if (!butterfly) return;
            const { top, left } = butterfly.getBoundingClientRect();
            gsap.to(p, { opacity: 1, duration: 1 });
            gsap.set('.fish-experience-container .stardust', { x: left, y: top });
            if (stardustTl.paused()) {
                stardustTl.restart();
            }
            if (i > 6) {
                gsap.to('.fish-experience-container .stardust', { opacity: 0 });
            }
        };

        const rotateButterfly = (self: any) => {
            if (self.direction === -1) {
                gsap.to(butterfly, { rotationY: 180, duration: 0.4 });
            } else {
                gsap.to(butterfly, { rotationY: 0, duration: 0.4 });
            }
        };

        const hideText = (p: HTMLElement) => {
            gsap.to(p, { opacity: 0, duration: 1 });
        };

        sections.forEach((section, i) => {
            const p = section.querySelector('p');
            if (!p) return;
            gsap.set(p, { opacity: 0 });

            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                onEnter: () => createStardust(p, i),
                onEnterBack: () => {
                    if (i <= 6) {
                        gsap.to('.fish-experience-container .stardust', { opacity: 1 });
                    }
                },
                onLeave: () => {
                    hideText(p);
                    if (i === 0 && nebulaGlow) {
                        gsap.to(nebulaGlow, { opacity: 0, y: -500, duration: 8, ease: 'power4.in' });
                    }
                },
                onLeaveBack: () => hideText(p),
                onUpdate: (self: any) => rotateButterfly(self) 
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
                            opacity: 0,
                            duration: 1.5,
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
            <div className="starfield"></div>
            
            <div className="shooting-stars">
                {[...Array(5)].map((_, i) => <div key={i} className="star"></div>)}
            </div>

            <p className="indicator">
                <span>Khám Phá</span>
                <span>↓</span>
            </p>

            <div className="butterfly-wrapper">
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

            <div className="stardust">
                <div className="stardust__inner">
                    {[...Array(5)].map((_, i) => <div key={i} className="stardust__particle"></div>)}
                </div>
            </div>

            <div className="nebula-glow"><div data-rays></div></div>
            
            <div className="content">
                {[
                    "13.8 billion years ago, a silent bang echoed into existence...",
                    "13.6 billion years ago, the first stardust began to swirl and dream...",
                    "10 billion years ago, our Milky Way started its slow, majestic waltz...",
                    "4.6 billion years ago, a young star claimed its court, our Solar System...",
                    "4.5 billion years ago, a blue marble, our Earth, took its first breath...",
                    "300,000 years ago, Homo Sapiens first looked up and wondered at the stars...",
                    "And now, on this very day, you, a traveler of time, have arrived.",
                    `(${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })})`,
                    "A fleeting, beautiful moment in the grand cosmic tapestry.",
                    "Welcome."
                ].map((text, i) => (
                    <section key={i}><div className="section__content"><p>{text}</p></div></section>
                ))}
            </div>
        </div>
    );
};

export default FishScrollExperience;