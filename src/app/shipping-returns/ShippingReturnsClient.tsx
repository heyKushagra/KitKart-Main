"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ShippingReturnsClient() {
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
    <main className="policy-page-wrapper">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb reveal">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="current">Shipping & Returns</span>
        </div>

        {/* Hero Banner */}
        <header className="policy-hero reveal">
          <p className="section-label">Customer Support</p>
          <h1 className="policy-title">Shipping & Returns</h1>
          <p className="policy-subtitle">
            At KitKart, we strive to deliver your orders safely and on time while ensuring a smooth exchange process whenever applicable.
          </p>
        </header>

        {/* Core Policy Grid */}
        <div className="policy-grid reveal reveal-stagger">

          {/* SHIPPING POLICY CARD */}
          <section className="policy-card" id="shipping-policy">
            <div className="card-header">
              <div className="card-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-1" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h2 className="card-title">Shipping Policy</h2>
            </div>

            <ul className="policy-list">
              <li className="policy-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>We currently ship across India.</span>
              </li>
              <li className="policy-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Orders are processed and dispatched as quickly as possible after confirmation.</span>
              </li>
              <li className="policy-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Delivery timelines may vary depending on your location and courier service availability.</span>
              </li>
              <li className="policy-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Once your order is shipped, tracking details will be shared (where available).</span>
              </li>
            </ul>

            {/* COD Football Boots Warning */}
            <div className="callout-box warning" id="cod-restriction">
              <div className="callout-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <circle cx="12" cy="17" r="1" />
                </svg>
              </div>
              <div className="callout-content">
                <strong>Partial Cash on Delivery (COD) Available</strong>
                <p> Partial Cash on Delivery (COD) is Available for Jerseys. Boots must be prepaid before dispatch.</p>
              </div>
            </div>
          </section>

          {/* RETURNS & EXCHANGE POLICY CARD */}
          <section className="policy-card" id="exchange-policy">
            <div className="card-header">
              <div className="card-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 1v22M23 5l-6-4-6 4M1 19l6 4 6-4" />
                  <path d="M7 23V1" />
                </svg>
              </div>
              <h2 className="card-title">Returns & Exchanges</h2>
            </div>

            <p className="exchange-disclaimer">
              Returns and exchanges are <strong>available for all products</strong> under the terms and conditions outlined below.
            </p>

            {/* Sub-section 1: Return & Refund Policy */}
            <div className="policy-sub-section">
              <h3 className="sub-title">
                1. Return & Refund Policy
                <span>Refundable</span>
              </h3>
              <p className="sub-desc">
                If you are not satisfied with your purchase, you can return any product for a refund.
              </p>
              <div className="callout-box info" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <div className="callout-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <div className="callout-content">
                  <strong>Refund Deductions & Charges</strong>
                  <p>Your refund will be processed after deducting the <strong>original outward shipping charges</strong> and the <strong>return pickup shipping/handling fees</strong> required to return the package to our warehouse.</p>
                </div>
              </div>
            </div>

            {/* Sub-section 2: Size Exchange */}
            <div className="policy-sub-section">
              <h3 className="sub-title">
                2. Size Exchange Policy
                <span>Subject to Stock</span>
              </h3>
              <p className="sub-desc">
                If you wish to exchange a product for a different size, the exchange is subject to product availability.
              </p>
              <div className="callout-box info" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <div className="callout-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <div className="callout-content">
                  <strong>Shipping Fee Obligations</strong>
                  <p>For standard size exchanges, the customer is responsible for shipping charges of both the return shipment and the replacement shipment typically ₹150 to ₹200 total. </p>
                </div>
              </div>
            </div>

            {/* Sub-section 3: Damaged Product */}
            <div className="policy-sub-section">
              <h3 className="sub-title">
                3. Damaged Product Exchange
                <span>Free Exchange</span>
              </h3>
              <p className="sub-desc">
                If you receive a product that is damaged during delivery or is incorrect, you are eligible for a free exchange.
              </p>
              <div className="steps-container">
                <p className="steps-label">To request a free exchange:</p>
                <ol className="steps-list">
                  <li>Contact our support team within 48 hours of receiving the order.</li>
                  <li>Provide clear photos or videos showing the damage or issue along with your order details.</li>
                  <li>Once verified, we will arrange the exchange at no extra shipping cost to you.</li>
                </ol>
              </div>
            </div>
          </section>

        </div>

        {/* IMPORTANT NOTES FULL-WIDTH CARD */}
        <section className="notes-card reveal" id="important-notes">
          <h2 className="notes-title">Important Notes</h2>
          <p className="notes-desc">
            Please make sure you carefully read and understand the following terms before placing your order.
          </p>

          <div className="notes-grid">
            <div className="note-box">
              <div className="note-bullet" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="note-content">
                <h3>Refund Policy</h3>
                <p>Refunds are <strong>available for all products</strong>. The final refund amount will be credited after deducting outward and return shipping fees.</p>
              </div>
            </div>

            <div className="note-box">
              <div className="note-bullet" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="note-content">
                <h3>Stock Availability</h3>
                <p>Exchanges are strictly subject to stock availability at the time the exchange is processed.</p>
              </div>
            </div>

            <div className="note-box">
              <div className="note-bullet" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="note-content">
                <h3>Original Condition Required</h3>
                <p>Products must be returned in their original condition with all tags and packaging intact whenever applicable.</p>
              </div>
            </div>

            <div className="note-box">
              <div className="note-bullet" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="note-content">
                <h3>Right to Decline</h3>
                <p>KitKart reserves the right to decline exchange or return requests that do not meet the specified conditions.</p>
              </div>
            </div>
          </div>
        </section>
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
          margin: 0 auto var(--sp-16) auto;
          text-align: center;
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

        .policy-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sp-8);
          margin-bottom: var(--sp-12);
          align-items: start;
        }

        .policy-card {
          background: var(--clr-card);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-lg);
          padding: var(--sp-8);
          transition: transform var(--t-med), border-color var(--t-med), box-shadow var(--t-med);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .policy-card:hover {
          transform: translateY(-4px);
          border-color: rgba(197, 160, 89, 0.3);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: var(--sp-4);
          margin-bottom: var(--sp-8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: var(--sp-5);
        }

        .card-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: var(--r-md);
          background: var(--clr-gold-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--clr-gold);
          flex-shrink: 0;
        }

        .card-icon-wrap svg {
          width: 22px;
          height: 22px;
        }

        .card-title {
          font-family: var(--ff-heading);
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--clr-text);
        }

        .policy-list {
          display: flex;
          flex-direction: column;
          gap: var(--sp-4);
          margin-bottom: var(--sp-8);
        }

        .policy-item {
          display: flex;
          align-items: flex-start;
          gap: var(--sp-3);
          color: var(--clr-text-secondary);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .policy-item svg {
          width: 18px;
          height: 18px;
          color: var(--clr-gold);
          flex-shrink: 0;
          margin-top: 3px;
        }

        .exchange-disclaimer {
          color: var(--clr-text-secondary);
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: var(--sp-6);
          padding: var(--sp-4);
          background: rgba(255, 255, 255, 0.02);
          border-left: 3px solid var(--clr-gold);
          border-radius: 0 var(--r-sm) var(--r-sm) 0;
        }

        .policy-sub-section {
          margin-top: var(--sp-6);
          padding-top: var(--sp-6);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .sub-title {
          font-family: var(--ff-heading);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--clr-text);
          margin-bottom: var(--sp-2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sub-title span {
          font-family: var(--ff-body);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--clr-gold);
          border: 1px solid var(--clr-gold-dim);
          background: var(--clr-gold-dim);
          padding: 2px 8px;
          border-radius: var(--r-full);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sub-desc {
          font-size: 0.9rem;
          color: var(--clr-text-secondary);
          line-height: 1.5;
          margin-bottom: var(--sp-4);
        }

        .steps-container {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-md);
          padding: var(--sp-4);
        }

        .steps-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--clr-text);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--sp-3);
        }

        .steps-list {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: var(--sp-2);
        }

        .steps-list li {
          font-size: 0.9rem;
          color: var(--clr-text-secondary);
          line-height: 1.4;
        }

        .callout-box {
          display: flex;
          gap: var(--sp-3);
          padding: var(--sp-4);
          border-radius: var(--r-md);
          align-items: flex-start;
        }

        .callout-box.warning {
          background: rgba(197, 160, 89, 0.03);
          border: 1px solid rgba(197, 160, 89, 0.15);
        }

        .callout-box.info {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--clr-border);
        }

        .callout-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .callout-box.warning .callout-icon {
          color: var(--clr-gold);
        }

        .callout-box.info .callout-icon {
          color: var(--clr-text-secondary);
        }

        .callout-content {
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .callout-content strong {
          display: block;
          font-size: 0.9rem;
          color: var(--clr-text);
          margin-bottom: 2px;
        }

        .callout-content p {
          color: var(--clr-text-secondary);
        }

        /* IMPORTANT NOTES CARD */
        .notes-card {
          background: linear-gradient(135deg, var(--clr-card) 0%, rgba(19, 19, 19, 0.6) 100%);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-lg);
          padding: var(--sp-10);
          position: relative;
          overflow: hidden;
        }

        .notes-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--clr-gold);
        }

        .notes-title {
          font-family: var(--ff-heading);
          font-size: 2rem;
          font-weight: 700;
          color: var(--clr-text);
          margin-bottom: var(--sp-2);
        }

        .notes-desc {
          color: var(--clr-text-secondary);
          font-size: 0.95rem;
          margin-bottom: var(--sp-8);
        }

        .notes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sp-6) var(--sp-10);
        }

        .note-box {
          display: flex;
          align-items: flex-start;
          gap: var(--sp-4);
        }

        .note-bullet {
          width: 28px;
          height: 28px;
          border-radius: var(--r-full);
          background: var(--clr-gold-dim);
          color: var(--clr-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 4px;
        }


        .note-bullet svg {
          width: 14px;
          height: 14px;
        }

        .note-content h3 {
          font-family: var(--ff-heading);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--clr-text);
          margin-bottom: 4px;
        }

        .note-content p {
          color: var(--clr-text-secondary);
          font-size: 0.9rem;
          line-height: 1.45;
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
          .policy-grid {
            grid-template-columns: 1fr;
            gap: var(--sp-6);
          }
          
          .notes-grid {
            grid-template-columns: 1fr;
            gap: var(--sp-6);
          }
        }

        @media (max-width: 768px) {
          .policy-page-wrapper {
            padding-top: 100px;
            padding-bottom: var(--sp-12);
          }

          .policy-title {
            font-size: 2.75rem;
          }

          .policy-card, .notes-card {
            padding: var(--sp-6);
          }

          .notes-title {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 480px) {
          .policy-title {
            font-size: 2.25rem;
          }

          .sub-title {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--sp-2);
          }
        }
      `}</style>
    </main>
  );
}
