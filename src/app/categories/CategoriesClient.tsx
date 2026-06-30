"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CategoriesClient() {
  useEffect(() => {
    // Scroll Reveal Animations setup
    const revealOnScroll = () => {
      const windowHeight = window.innerHeight;
      const elementVisible = 80; // Trigger threshold
      const revealElements = document.querySelectorAll(".reveal");

      revealElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add("active");
        }
      });
    };

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();

    // Trigger immediately and after a short delay to ensure elements are rendered
    const timer = setTimeout(revealOnScroll, 100);

    return () => {
      window.removeEventListener("scroll", revealOnScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <main className="categories-page-wrapper">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb reveal">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="current">Categories</span>
        </div>

        {/* Hero Section */}
        <header className="categories-hero reveal">
          <p className="section-label">Collections</p>
          <h1 className="categories-title">Shop by Category</h1>
          <p className="categories-subtitle">
            Explore premium sports jerseys and football boots designed for performance, comfort, and style. Find the perfect gear for training, match day, or everyday wear.
          </p>
        </header>

        {/* Categories Two-Column Grid */}
        <div className="categories-grid reveal reveal-stagger">
          {/* CATEGORY CARD: JERSEYS */}
          <Link href="/shop?category=Jerseys" className="category-item-card" id="category-jerseys">
            <div className="card-image-wrapper">
              <img src="/assets/jersey1.jpg" alt="Premium Sports Jerseys Collection" />
              <div className="card-image-overlay"></div>
            </div>
            <div className="card-content">
              <div>
                <span className="card-tag">Match & Fan Wear</span>
                <h2 className="card-heading">Jerseys</h2>
                <p className="card-description">
                  Discover premium football, cricket, basketball, volleyball, badminton, esports, and custom team jerseys crafted for players and fans.
                </p>
              </div>
              <span className="card-cta">
                Explore Jerseys
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </div>
          </Link>

          {/* CATEGORY CARD: FOOTBALL BOOTS */}
          <Link href="/shop?category=Boots" className="category-item-card" id="category-boots">
            <div className="card-image-wrapper">
              <img src="/assets/boots.png" alt="High-Performance Football Boots Cleats" />
              <div className="card-image-overlay"></div>
            </div>
            <div className="card-content">
              <div>
                <span className="card-tag">Performance Footwear</span>
                <h2 className="card-heading">Football Boots</h2>
                <p className="card-description">
                  Browse high-quality football boots built for comfort, grip, speed, and performance on every surface.
                </p>
              </div>
              <span className="card-cta">
                Explore Boots
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .categories-page-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at bottom left, #161616 0%, #0b0b0b 100%);
          padding-top: 120px;
          padding-bottom: var(--sp-20);
          color: var(--clr-text);
          font-family: var(--ff-body);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: var(--sp-2);
          font-size: 0.85rem;
          color: var(--clr-text-secondary);
          margin-bottom: var(--sp-10);
        }

        .breadcrumb a {
          color: var(--clr-text-secondary);
          transition: color var(--t-fast);
        }

        .breadcrumb a:hover {
          color: var(--clr-gold);
        }

        .breadcrumb span {
          color: var(--clr-text-muted);
        }

        .breadcrumb .current {
          color: var(--clr-text);
          font-weight: 500;
        }

        .categories-hero {
          max-width: 800px;
          margin: 0 auto var(--sp-16) auto;
          text-align: center;
        }

        .categories-title {
          font-family: var(--ff-heading);
          font-size: 3.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-top: var(--sp-2);
          margin-bottom: var(--sp-4);
          background: linear-gradient(135deg, var(--clr-text) 30%, var(--clr-gold) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .categories-subtitle {
          font-size: 1.1rem;
          color: var(--clr-text-secondary);
          line-height: 1.6;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sp-10);
          max-width: 1100px;
          margin: 0 auto;
          align-items: stretch;
        }

        .category-item-card {
          display: flex;
          flex-direction: column;
          background: var(--clr-card);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-xl);
          overflow: hidden;
          transition: transform var(--t-med), border-color var(--t-med), box-shadow var(--t-med);
          text-decoration: none;
          color: inherit;
        }

        .category-item-card:hover {
          transform: translateY(-6px);
          border-color: rgba(197, 160, 89, 0.4);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .card-image-wrapper {
          width: 100%;
          height: 340px;
          overflow: hidden;
          position: relative;
          background: #111111;
        }

        .card-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--t-slow);
        }

        .category-item-card:hover .card-image-wrapper img {
          transform: scale(1.06);
        }

        .card-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(11, 11, 11, 0.5) 100%);
          pointer-events: none;
        }

        .card-content {
          padding: var(--sp-8);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex-grow: 1;
        }

        .card-tag {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--clr-gold);
          font-weight: 600;
          margin-bottom: var(--sp-2);
          display: block;
        }

        .card-heading {
          font-family: var(--ff-heading);
          font-size: 1.85rem;
          font-weight: 700;
          color: var(--clr-text);
          margin-bottom: var(--sp-3);
        }

        .card-description {
          font-size: 0.95rem;
          color: var(--clr-text-secondary);
          line-height: 1.6;
          margin-bottom: var(--sp-6);
        }

        .card-cta {
          display: inline-flex;
          align-items: center;
          gap: var(--sp-2);
          color: var(--clr-bg);
          background: var(--clr-text);
          border: 1px solid var(--clr-text);
          padding: 0.75rem 1.5rem;
          border-radius: var(--r-full);
          font-family: var(--ff-heading);
          font-weight: 600;
          font-size: 0.9rem;
          align-self: flex-start;
          transition: all var(--t-med);
        }

        .card-cta svg {
          width: 16px;
          height: 16px;
          transition: transform var(--t-fast);
        }

        .category-item-card:hover .card-cta {
          background: var(--clr-gold);
          border-color: var(--clr-gold);
          color: var(--clr-bg);
          box-shadow: 0 4px 15px var(--clr-gold-dim);
        }

        .category-item-card:hover .card-cta svg {
          transform: translateX(4px);
        }

        /* Scroll Reveal Animation Styles */
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: all 0.7s var(--ease);
        }

        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        .reveal-stagger > * {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s var(--ease);
        }

        .reveal-stagger.active > *:nth-child(1) { transition-delay: 0.05s; }
        .reveal-stagger.active > *:nth-child(2) { transition-delay: 0.15s; }

        .reveal-stagger.active > * {
          opacity: 1;
          transform: translateY(0);
        }

        /* Responsive Layouts */
        @media (max-width: 992px) {
          .categories-grid {
            gap: var(--sp-8);
          }
        }

        @media (max-width: 768px) {
          .categories-page-wrapper {
            padding-top: 100px;
            padding-bottom: var(--sp-12);
          }

          .categories-title {
            font-size: 2.75rem;
          }

          .categories-grid {
            grid-template-columns: 1fr;
            max-width: 500px;
          }

          .card-image-wrapper {
            height: 280px;
          }

          .card-content {
            padding: var(--sp-6);
          }
        }

        @media (max-width: 480px) {
          .categories-title {
            font-size: 2.25rem;
          }
        }
      `}</style>
    </main>
  );
}
