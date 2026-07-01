"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ContactClient() {
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
    <main className="contact-page-wrapper">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb reveal">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="current">Contact Us</span>
        </div>

        {/* Hero Section */}
        <header className="contact-hero reveal">
          <p className="section-label">Get in Touch</p>
          <h1 className="contact-title">Contact KitKart</h1>
          <p className="contact-subtitle">
            Need help with your order or have a question? Our team is here to assist you.
          </p>
        </header>

        {/* Support Note Panel */}
        <div className="support-note-card reveal">
          <div className="support-note-header">
            <div className="support-note-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h2>We're Here For You</h2>
          </div>
          <p>
            Whether you need help choosing the right sports jersey, checking stock for professional football boots, tracking your order dispatch across India, or initiating a size exchange, feel free to contact us. We usually reply within a few hours!
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="contact-grid reveal reveal-stagger">
          {/* Email Card */}
          <a href="mailto:support.house25@gmail.com" className="contact-card email-card">
            <div className="card-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h3 className="card-title">Email Support</h3>
            <p className="card-desc">For order updates, bulk queries, and formal requests.</p>
            <span className="card-link-text">support.house25@gmail.com</span>
          </a>

          {/* Phone Card */}
          <a href="tel:+918849376973" className="contact-card phone-card">
            <div className="card-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3 className="card-title">Call Us</h3>
            <p className="card-desc">Speak directly with our support representatives.</p>
            <span className="card-link-text">+91 88493 76973</span>
          </a>

          {/* WhatsApp Card */}
          <div className="contact-card whatsapp-card">
            <div className="whatsapp-header-wrap">
              <div className="card-icon-wrap wa-icon-bg">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
              </div>
              <div className="wa-status-badge">
                <span className="dot"></span>
                <span>Active</span>
              </div>
            </div>
            <h3 className="card-title">WhatsApp Support</h3>
            <p className="card-desc">Get instant assistance for sizing, custom printing, or immediate product queries.</p>
            <div className="wa-cta-container">
              <a
                href="https://wa.me/918849376973"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-large"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-page-wrapper {
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

        .contact-hero {
          max-width: 800px;
          margin: 0 auto var(--sp-12) auto;
          text-align: center;
        }

        .contact-title {
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

        .contact-subtitle {
          font-size: 1.1rem;
          color: var(--clr-text-secondary);
          line-height: 1.6;
        }

        .support-note-card {
          background: linear-gradient(135deg, var(--clr-card) 0%, rgba(19, 19, 19, 0.6) 100%);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-lg);
          padding: var(--sp-8);
          max-width: 900px;
          margin: 0 auto var(--sp-12) auto;
          position: relative;
          overflow: hidden;
        }

        .support-note-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--clr-gold);
        }

        .support-note-header {
          display: flex;
          align-items: center;
          gap: var(--sp-3);
          margin-bottom: var(--sp-3);
        }

        .support-note-icon {
          color: var(--clr-gold);
          display: flex;
          align-items: center;
        }

        .support-note-icon svg {
          width: 24px;
          height: 24px;
        }

        .support-note-card h2 {
          font-family: var(--ff-heading);
          font-size: 1.35rem;
          font-weight: 600;
          color: var(--clr-text);
        }

        .support-note-card p {
          color: var(--clr-text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--sp-6);
          max-width: 900px;
          margin: 0 auto;
        }

        .contact-card {
          background: var(--clr-card);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-lg);
          padding: var(--sp-8);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: border-color var(--t-med), transform var(--t-med), background var(--t-med);
          text-decoration: none;
          color: inherit;
        }

        a.contact-card:hover {
          border-color: var(--clr-gold);
          transform: translateY(-4px);
          background: rgba(197, 160, 89, 0.02);
        }

        .card-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: var(--r-md);
          background: var(--clr-surface-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--clr-gold);
          margin-bottom: var(--sp-6);
          transition: background var(--t-fast);
        }

        a.contact-card:hover .card-icon-wrap {
          background: var(--clr-gold-dim);
        }

        .card-icon-wrap svg {
          width: 24px;
          height: 24px;
        }

        .card-title {
          font-family: var(--ff-heading);
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: var(--sp-2);
          color: var(--clr-text);
        }

        .card-desc {
          font-size: 0.9rem;
          color: var(--clr-text-secondary);
          line-height: 1.45;
          margin-bottom: var(--sp-6);
          flex-grow: 1;
        }

        .card-link-text {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--clr-gold);
          transition: color var(--t-fast);
          word-break: break-all;
        }

        a.contact-card:hover .card-link-text {
          color: var(--clr-text);
        }

        /* WhatsApp Custom Card styles */
        .whatsapp-card {
          grid-column: span 2;
        }

        .whatsapp-header-wrap {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
        }

        .card-icon-wrap.wa-icon-bg {
          color: #25D366;
        }

        .wa-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(37, 211, 102, 0.08);
          border: 1px solid rgba(37, 211, 102, 0.2);
          color: #25D366;
          padding: 4px 10px;
          border-radius: var(--r-full);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .wa-status-badge .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #25D366;
          box-shadow: 0 0 8px #25D366;
          display: inline-block;
        }

        .wa-cta-container {
          width: 100%;
          margin-top: var(--sp-4);
        }

        .btn-whatsapp-large {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--sp-3);
          background-color: #25D366;
          color: #fff;
          padding: var(--sp-4) var(--sp-8);
          border-radius: var(--r-full);
          font-family: var(--ff-heading);
          font-weight: 700;
          font-size: 1.05rem;
          text-decoration: none;
          transition: transform var(--t-fast), background-color var(--t-fast), box-shadow var(--t-fast);
          width: 100%;
          max-width: 320px;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
        }

        .btn-whatsapp-large:hover {
          background-color: #20ba59;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
        }

        .btn-whatsapp-large svg {
          width: 22px;
          height: 22px;
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
        .reveal-stagger.active > *:nth-child(3) { transition-delay: 0.25s; }

        .reveal-stagger.active > * {
          opacity: 1;
          transform: translateY(0);
        }

        /* Responsive Layouts */
        @media (max-width: 768px) {
          .contact-page-wrapper {
            padding-top: 100px;
            padding-bottom: var(--sp-12);
          }

          .contact-title {
            font-size: 2.75rem;
          }

          .contact-grid {
            grid-template-columns: 1fr;
            gap: var(--sp-4);
          }

          .whatsapp-card {
            grid-column: span 1;
          }

          .btn-whatsapp-large {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .contact-title {
            font-size: 2.25rem;
          }
        }
      `}</style>
    </main>
  );
}
