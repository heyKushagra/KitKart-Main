"use client";

import { useEffect, useState } from "react";
import "./SplashScreen.css";

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [explode, setExplode] = useState(false);
  const [showText, setShowText] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasSeenSplash = sessionStorage.getItem("kitkart_splash_shown");
    const splashEnabled = true;

    if (!hasSeenSplash && splashEnabled) {
      setShow(true);
      sessionStorage.setItem("kitkart_splash_shown", "true");
      
      // We rely on the inline script in layout.tsx to hide content initially
      // When the splash is done, we reveal it.
      
      // Explosion trigger (sync with ball hitting screen at ~3.4s)
      const explodeTimer = setTimeout(() => {
        setExplode(true);
      }, 3400);

      // Text reveal trigger
      const textTimer = setTimeout(() => {
        setShowText(true);
      }, 3700);

      // Auto hide (8.5 seconds total duration)
      const hideTimer = setTimeout(() => {
        handleSkip();
      }, 8500);

      return () => {
        clearTimeout(explodeTimer);
        clearTimeout(textTimer);
        clearTimeout(hideTimer);
        revealMainContent();
      };
    } else {
      // If already seen, make sure content is revealed immediately
      revealMainContent();
    }
  }, []);

  const revealMainContent = () => {
    document.documentElement.style.removeProperty('--content-opacity');
    document.documentElement.classList.remove('splash-active');
  };

  const handleSkip = () => {
    setIsFadingOut(true);
    revealMainContent(); // Reveal website immediately when skipping
    setTimeout(() => {
      setShow(false);
    }, 600); // fade out duration
  };

  // Pre-calculate random trajectories for particles
  const particles = Array.from({ length: 50 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 50;
    const distance = 150 + Math.random() * 400;
    const tx = `${Math.cos(angle) * distance}px`;
    const ty = `${Math.sin(angle) * distance}px`;
    const delay = `${Math.random() * 0.15}s`;
    const size = `${4 + Math.random() * 6}px`;
    
    return { tx, ty, delay, size };
  });

  // Only render on client to avoid hydration mismatch
  if (!isMounted || !show) return null;

  return (
    <div className={`splash-container ${isFadingOut ? "hide" : ""}`}>
      <button className="splash-skip" onClick={handleSkip}>
        Skip
      </button>
      
      {/* Stadium Lights */}
      <div className="stadium-light light-left"></div>
      <div className="stadium-light light-right"></div>
      
      <div className="splash-scene">
        {/* Player Silhouette */}
        <div className="player-silhouette">
          <svg viewBox="50 150 250 250" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2CD" />
                <stop offset="50%" stopColor="#C5A059" />
                <stop offset="100%" stopColor="#8B6914" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#goldGrad)" 
              d="M129.2,197.8c-11.2,0-20.3,9.1-20.3,20.3s9.1,20.3,20.3,20.3s20.3-9.1,20.3-20.3S140.4,197.8,129.2,197.8z M233.1,304 c-8.1-6.1-18.7-7.2-27.8-2.6l-37.1,18.7l-15.1-34.3l37.8-26l21.2,30.3c5.3,7.6,15.7,9.5,23.3,4.2c7.6-5.3,9.5-15.7,4.2-23.3 l-28.5-40.8c-3.6-5.1-9.4-8.1-15.7-8.1c-3,0-6.1,0.7-8.9,2.2l-51.5,35.4c-6.8,4.7-11.3,11.8-12.7,19.9l-11.6,68.9l-35-26.2 c-7.3-5.5-17.7-3.9-23.2,3.5c-5.5,7.3-3.9,17.7,3.5,23.2l51.5,38.6c4.6,3.4,10.4,5,16,4.6c5.7-0.4,11-3.2,14.6-7.8l26.2-34l22,49.5 c3.4,7.7,12.3,11.2,20,7.8C233.8,324.9,237.3,316,233.1,304z"
            />
          </svg>
        </div>
        
        {/* The Impact Flash */}
        <div className="impact-flash"></div>
 
        {/* Football */}
        <div className={`football-wrapper ${explode ? "exploded" : ""}`}>
          <div className="football-body">
            <div className="football-pattern"></div>
          </div>
        </div>
 
        {/* Particles */}
        <div className={`particles-container ${explode ? "explode-active" : ""}`}>
          {particles.map((p, i) => (
             <div 
               key={i} 
               className="particle" 
               style={{
                 "--tx": p.tx, 
                 "--ty": p.ty, 
                 animationDelay: p.delay,
                 width: p.size,
                 height: p.size
               } as React.CSSProperties}
             ></div>
          ))}
        </div>
 
        {/* Text Reveal */}
        <div className={`welcome-container ${showText ? "text-active" : ""}`}>
          <h1 className="welcome-text">
            Welcome to the <span>KitKart</span> Family
          </h1>
          <p className="promo-text">
            Get <span className="highlight-discount">FLAT 5% OFF</span> on your First Order. Use Code- <span className="highlight-code">NEW5</span>
          </p>
        </div>
      </div>
    </div>
  );
}
