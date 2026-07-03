"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PrivacyPolicyClient() {
  useEffect(() => {
    const revealOnScroll = () => {
      const windowHeight = window.innerHeight;
      const elementVisible = 80;
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

    const timer = setTimeout(revealOnScroll, 100);

    return () => {
      window.removeEventListener("scroll", revealOnScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <main className="policy-page-wrapper">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb reveal">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="current">Privacy Policy</span>
        </div>

        {/* Hero Section */}
        <header className="policy-hero reveal">
          <p className="section-label">Legal Information</p>
          <h1 className="policy-title">Privacy Policy</h1>
          <p className="policy-subtitle">
            Your privacy is highly important to us. At KitKart, we are committed to being transparent about how we collect, use, and safeguard your personal information.
          </p>
        </header>

        {/* Content Section */}
        <div className="policy-content reveal">
          <section className="policy-card">
            <h2 className="policy-sec-title">1. Information We Collect</h2>
            <p className="policy-text">
              We collect information to provide better services to our users and process your orders. This includes:
            </p>
            <ul className="policy-list">
              <li><strong>Personal details:</strong> Name, shipping/billing address, phone number, and email address provided during checkout.</li>
              <li><strong>Device information:</strong> IP address, browser type, and cookies used to improve your shopping experience.</li>
            </ul>
          </section>

          <section className="policy-card">
            <h2 className="policy-sec-title">2. How We Use Your Information</h2>
            <p className="policy-text">
              The information we collect is utilized for processing orders, managing customer support, sending notifications, and personalizing user experience. We never sell your personal data to third parties.
            </p>
          </section>

          <section className="policy-card">
            <h2 className="policy-sec-title">3. Data Security & Storage</h2>
            <p className="policy-text">
              We implement industry-standard security measures (including secure servers and encryption technologies) to ensure that your private details are protected against unauthorized access, alteration, or disclosure.
            </p>
          </section>

          <section className="policy-card">
            <h2 className="policy-sec-title">4. Cookies</h2>
            <p className="policy-text">
              Our website uses cookies to recognize your browser, capture certain session details, and keep track of items in your shopping cart. You can choose to disable cookies through your browser settings, though some site functionalities may be limited.
            </p>
          </section>
        </div>
      </div>

      <style jsx>{`
        .policy-page-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at bottom left, #161616 0%, #0b0b0b 100%);
          padding-top: 120px;
          padding-bottom: var(--sp-20);
          color: var(--clr-text);
          font-family: var(--ff-body);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--sp-6);
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

        .policy-hero {
          max-width: 800px;
          margin: 0 auto var(--sp-12) auto;
          text-align: center;
        }

        .section-label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--clr-gold);
          font-weight: 600;
        }

        .policy-title {
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

        .policy-subtitle {
          font-size: 1.1rem;
          color: var(--clr-text-secondary);
          line-height: 1.6;
        }

        .policy-content {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: var(--sp-6);
        }

        .policy-card {
          background: var(--clr-card);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-lg);
          padding: var(--sp-8);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .policy-sec-title {
          font-family: var(--ff-heading);
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--clr-text);
          margin-bottom: var(--sp-4);
        }

        .policy-text {
          color: var(--clr-text-secondary);
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .policy-list {
          margin-top: var(--sp-3);
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: var(--sp-2);
          color: var(--clr-text-secondary);
          line-height: 1.5;
          font-size: 0.95rem;
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

        @media (max-width: 768px) {
          .policy-page-wrapper {
            padding-top: 100px;
            padding-bottom: var(--sp-12);
          }

          .policy-title {
            font-size: 2.75rem;
          }

          .policy-card {
            padding: var(--sp-6);
          }
        }
      `}</style>
    </main>
  );
}
