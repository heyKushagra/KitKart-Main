import { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "KitKart FAQ - Shipping, Returns, Payments & Cancelations Support",
  description: "Have questions about ordering sports jerseys, football boots, or sportswear? Check our FAQ page for quick answers on delivery times, partial COD, returns, exchanges, and customer support in India.",
  keywords: "FAQ, KitKart, Buy Jerseys Online, Sports Jerseys, Football Boots, Cricket Jerseys, Sportswear, Sports Apparel India, Customer Support",
  openGraph: {
    title: "KitKart Frequently Asked Questions (FAQ)",
    description: "Get answers to your questions about orders, shipping, payments, returns, and exchanges on KitKart e-commerce store.",
    type: "website",
    url: "https://kitkart.in/faq",
  },
};

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long does delivery take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Orders are typically delivered within 5–6 business days."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer free shipping?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Free shipping is available on all products."
        }
      },
      {
        "@type": "Question",
        "name": "Which payment methods are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer Full Prepaid and Partial Cash on Delivery (Partial COD)."
        }
      },
      {
        "@type": "Question",
        "name": "What is Partial COD?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "With Partial COD, you pay a small advance amount online while placing the order. The remaining balance is paid at the time of delivery."
        }
      },
      {
        "@type": "Question",
        "name": "Can I cancel my order?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Orders can be cancelled within 1 hour of placing them."
        }
      },
      {
        "@type": "Question",
        "name": "What is your return policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Refunds are available after deducting the outward shipping and return shipping charges from the refund amount."
        }
      },
      {
        "@type": "Question",
        "name": "What is your exchange policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer free exchanges for damaged products and different size requests."
        }
      },
      {
        "@type": "Question",
        "name": "How can I contact KitKart?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If you need any assistance, simply visit our Contact Us page and our team will help you."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqClient />
    </>
  );
}
