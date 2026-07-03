"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function TermsOfServiceClient() {
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
          <span className="current">Terms of Service</span>
        </div>

        {/* Hero Section */}
        <header className="policy-hero reveal">
          <p className="section-label">Legal Information</p>
          <h1 className="policy-title">Terms of Service</h1>
          <p className="policy-subtitle">
            Please read these terms and conditions carefully before using our website or placing any orders.
          </p>
        </header>

        {/* Content Section */}
        <div className="policy-content reveal">
          <section className="policy-card">
            <h2 className="policy-sec-title">1. Introduction & Acceptance</h2>
            <p className="policy-text">
              By accessing and placing an order on KitKart, you confirm that you agree to and are bound by the terms of service contained in these Terms of Service outlined below. These terms apply to the entire website and any email or other type of communication between you and KitKart.
            </p>
          </section>

          <section className="policy-card">
            <h2 className="policy-sec-title">2. Products & Pricing</h2>
            <p className="policy-text">
              We make every effort to display the colors, specifications, and prices of our products as accurately as possible. Prices for our products are subject to change without notice. We reserve the right to modify or discontinue any product at any time.
            </p>
          </section>

          <section className="policy-card">
            <h2 className="policy-sec-title">3. Order Placement & Billing</h2>
            <p className="policy-text">
              You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the email and/or billing address/phone number provided at the time the order was made.
            </p>
          </section>

          <section className="policy-card">
            <h2 className="policy-sec-title">4. Changes to Terms of Service</h2>
            <p className="policy-text">
              You can review the most current version of the Terms of Service at any time on this page. We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes.
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
