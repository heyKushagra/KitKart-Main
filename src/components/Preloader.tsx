"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [show, setShow] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    try {
      const hasSeenSplash = sessionStorage.getItem("kitkart_splash_shown");

      if (!hasSeenSplash) {
        setShow(true);
        sessionStorage.setItem("kitkart_splash_shown", "true");

        // Hide scrollbar while preloader is active
        document.body.style.overflow = 'hidden';

        // Start fading out after 3 seconds
        const fadeOutTimer = setTimeout(() => {
          setIsFadingOut(true);
          revealMainContent();
        }, 3000);

        // Completely unmount after 3.5 seconds
        const hideTimer = setTimeout(() => {
          setShow(false);
          document.body.style.overflow = '';
        }, 3500);

        return () => {
          clearTimeout(fadeOutTimer);
          clearTimeout(hideTimer);
          document.body.style.overflow = '';
          revealMainContent();
        };
      } else {
        revealMainContent();
      }
    } catch (e) {
      // Fallback if sessionStorage is not available
      revealMainContent();
    }
  }, []);

  const revealMainContent = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.removeProperty('--content-opacity');
      document.documentElement.classList.remove('splash-active');
    }
  };

  if (!isMounted || !show) return null;

  return (
    <div className={`preloader-overlay ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="preloader-content">
        <div className="logo-container">
          <img
            src="/assets/KitKart-LogoT1.png"
            alt="KitKart Logo"
            className="preloader-logo"
          />
        </div>
        <p className="preloader-text"><strong>Loading Matchday Experience....</strong></p>

        <div className="loading-track-container">
          <div className="loading-track">
            <div className="loading-fill"></div>
            <div className="football-icon-container">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="football-icon"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                <path d="M2 12h20"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .preloader-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at center, #1c1c1c 0%, #0B0B0B 70%);
          z-index: 99999;
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 1;
          transition: opacity 0.5s ease-in-out;
        }

        .preloader-overlay.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        .preloader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo-container {
          opacity: 0;
          transform: scale(0.95);
          animation: logoEntrance 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .preloader-logo {
          width: 72px;
          height: 72px;
          border-radius: 8px;
          object-fit: cover;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .preloader-text {
          margin-top: 24px;
          color: #ffffff;
          font-family: var(--ff-body, 'Inter', sans-serif);
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          opacity: 0;
          animation: textEntrance 0.8s ease-out 0.3s forwards;
        }

        .loading-track-container {
          margin-top: 32px;
          width: 240px;
          opacity: 0;
          animation: fade 0.6s ease-out 0.5s forwards;
        }

        .loading-track {
          position: relative;
          width: 100%;
          height: 3px;
          background-color: #252525;
          border-radius: 4px;
        }

        .loading-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background-color: #ffffff;
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.6); /* Green glow #22C55E */
          width: 0%;
          animation: loadingProgress 2.5s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
        }

        .football-icon-container {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translate(-50%, -50%);
          width: 18px;
          height: 18px;
          color: #ffffff;
          animation: moveFootball 2.5s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
          z-index: 2;
        }

        .football-icon {
          width: 100%;
          height: 100%;
          animation: spinFootball 2.5s linear 0.5s forwards;
        }

        @keyframes logoEntrance {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes textEntrance {
          0% {
            opacity: 0;
            transform: translateY(5px);
          }
          100% {
            opacity: 0.85;
            transform: translateY(0);
          }
        }

        @keyframes fade {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes loadingProgress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes moveFootball {
          0% {
            left: 0%;
          }
          100% {
            left: 100%;
          }
        }

        @keyframes spinFootball {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-container, .preloader-text, .loading-track-container, .loading-fill, .football-icon-container, .football-icon {
            animation: none !important;
          }
          .logo-container {
            opacity: 1;
            transform: scale(1);
          }
          .preloader-text {
            opacity: 0.85;
          }
          .loading-track-container {
            opacity: 1;
          }
          .loading-fill {
            width: 100%;
          }
          .football-icon-container {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}
