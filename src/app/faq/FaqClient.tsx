"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const FAQS: FaqItem[] = [
  {
    question: "How long does delivery take?",
    answer: "Orders are typically delivered within 5–6 business days."
  },
  {
    question: "Do you offer free shipping?",
    answer: "Yes. Free shipping is available on all products."
  },
  {
    question: "Which payment methods are available?",
    answer: (
      <span>
        We offer:
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem", listStyleType: "disc" }}>
          <li>Full Prepaid</li>
          <li>Partial Cash on Delivery (Partial COD)</li>
        </ul>
      </span>
    )
  },
  {
    question: "What is Partial COD?",
    answer: "With Partial COD, you pay a small advance amount online while placing the order. The remaining balance is paid at the time of delivery."
  },
  {
    question: "Can I cancel my order?",
    answer: "Yes. Orders can be cancelled within 1 hour of placing them."
  },
  {
    question: "What is your return policy?",
    answer: "Refunds are available after deducting the outward shipping and return shipping charges from the refund amount."
  },
  {
    question: "What is your exchange policy?",
    answer: (
      <span>
        We offer free exchanges for:
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem", listStyleType: "disc" }}>
          <li>Damaged products</li>
          <li>Different size requests</li>
        </ul>
      </span>
    )
  },
  {
    question: "How can I contact KitKart?",
    answer: (
      <span>
        If you need any assistance, simply visit our <Link href="/contact" className="faq-inline-link">Contact Us</Link> page and our team will help you.
      </span>
    )
  }
];

export default function FaqClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="faq-page-wrapper">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb reveal">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="current">FAQ</span>
        </div>

        {/* Hero Banner */}
        <header className="faq-hero reveal">
          <p className="section-label">Support Center</p>
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <p className="faq-subtitle">
            Find answers to commonly asked questions about orders, shipping, payments, exchanges, and returns at KitKart.
          </p>
        </header>

        {/* FAQ Accordion Section */}
        <section className="faq-section reveal">
          <h2 className="sr-only">List of Frequently Asked Questions</h2>
          <div className="faq-accordion-list">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className={`faq-item-card ${isOpen ? "open" : ""}`}>
                  <h3>
                    <button
                      className="faq-question-btn"
                      onClick={() => handleToggle(idx)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-content-${idx}`}
                      id={`faq-btn-${idx}`}
                    >
                      <span className="faq-question-text">{faq.question}</span>
                      <span className="faq-icon-wrapper" aria-hidden="true">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="faq-arrow-icon"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-content-${idx}`}
                    className={`faq-answer-wrapper ${isOpen ? "open" : ""}`}
                    role="region"
                    aria-labelledby={`faq-btn-${idx}`}
                  >
                    <div className="faq-answer-content">
                      <p className="faq-answer-text">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <style jsx>{`
        .faq-page-wrapper {
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

        .faq-hero {
          max-width: 800px;
          margin: 0 auto var(--sp-16) auto;
          text-align: center;
        }

        .section-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--clr-gold);
          font-weight: 600;
          margin-bottom: var(--sp-2);
        }

        .faq-title {
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

        .faq-subtitle {
          font-size: 1.1rem;
          color: var(--clr-text-secondary);
          line-height: 1.6;
        }

        .faq-section {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-accordion-list {
          display: flex;
          flex-direction: column;
          gap: var(--sp-4);
        }

        .faq-item-card {
          background: var(--clr-card);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-lg);
          overflow: hidden;
          transition: transform var(--t-med), border-color var(--t-med), box-shadow var(--t-med);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .faq-item-card:hover {
          border-color: rgba(197, 160, 89, 0.25);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .faq-item-card.open {
          border-color: rgba(197, 160, 89, 0.4);
          background: linear-gradient(135deg, var(--clr-card) 0%, rgba(19, 19, 19, 0.6) 100%);
        }

        .faq-question-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
          background: none;
          border: none;
          padding: var(--sp-6) var(--sp-8);
          color: var(--clr-text);
          font-family: var(--ff-heading);
          font-size: 1.15rem;
          font-weight: 600;
          cursor: pointer;
          transition: color var(--t-fast);
        }

        .faq-question-btn:hover {
          color: var(--clr-gold);
        }

        .faq-question-text {
          padding-right: var(--sp-4);
          line-height: 1.4;
        }

        .faq-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: var(--r-full);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--clr-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all var(--t-fast);
        }

        .faq-question-btn:hover .faq-icon-wrapper {
          background: var(--clr-gold-dim);
          border-color: var(--clr-gold);
          color: var(--clr-gold);
        }

        .faq-arrow-icon {
          width: 16px;
          height: 16px;
          transition: transform var(--t-med);
        }

        .faq-item-card.open .faq-arrow-icon {
          transform: rotate(180deg);
        }

        .faq-answer-wrapper {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s ease-in-out;
        }

        .faq-answer-wrapper.open {
          grid-template-rows: 1fr;
        }

        .faq-answer-content {
          overflow: hidden;
          min-height: 0;
        }

        .faq-answer-text {
          padding: 0 var(--sp-8) var(--sp-6) var(--sp-8);
          color: var(--clr-text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .faq-inline-link {
          color: var(--clr-gold);
          text-decoration: none;
          font-weight: 500;
          transition: color var(--t-fast);
        }

        .faq-inline-link:hover {
          color: var(--clr-text);
          text-decoration: underline;
        }

        /* Screen reader utility for accessibilty */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
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

        /* Responsive Styles */
        @media (max-width: 768px) {
          .faq-page-wrapper {
            padding-top: 100px;
            padding-bottom: var(--sp-12);
          }

          .faq-title {
            font-size: 2.75rem;
          }

          .faq-question-btn {
            padding: var(--sp-5) var(--sp-6);
            font-size: 1.05rem;
          }

          .faq-answer-text {
            padding: 0 var(--sp-6) var(--sp-5) var(--sp-6);
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .faq-title {
            font-size: 2.25rem;
          }
        }
      `}</style>
    </main>
  );
}
