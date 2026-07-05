"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  text: string;
}

// Testimonials data structured in pairs for vertical stacking per slide
const TESTIMONIALS_PAIRS: Testimonial[][] = [
  [
    {
      id: "t-1",
      name: "Saim Hari Murti",
      city: "Basti, India",
      rating: 5,
      text: "The jersey quality is amazing. The fabric is  comfortable and breathable. Delivery was fast. Highly recommended KitKart! 💯",
    },
    {
      id: "t-2",
      name: "Kshitiz Pandey",
      city: "Lucknow, India",
      rating: 5,
      text: "I ordered Spain jersey and it exceeded my expectations. Perfect fit and excellent quality. Will definitely order again!",
    }
  ],
  [
    {
      id: "t-3",
      name: "Prakharsh ",
      city: "Lucknow, India",
      rating: 5,
      text: "Got 2 jerseys from Kitkart. The Quality was too good for price and I wear it everyday.",
    },
    {
      id: "t-4",
      name: "Ansh Singh",
      city: "Chandigarh, India",
      rating: 5,
      text: "I'm super happy with this Real Madrid jersey and Adidas grip socks set! The fabric is soft, lightweight, and breathable, making it really comfortable to wear, whether I'm playing or just chilling.The socks are also great",
    }
  ],
  [
    {
      id: "t-5",
      name: "Virat Gautam ",
      city: "Azamgarh, India",
      rating: 5,
      text: "The boots are amazing. Fitting is perfect and it's comfortable too. It is looking attractive. Loved it!",
    },
    {
      id: "t-6",
      name: "Nikhil",
      city: "Gorakhpur, India",
      rating: 5,
      text: "The quality of Jersey is too good. Thankyou Kitkart for giving it in affordable price.",
    }
  ],
  [
    {
      id: "t-7",
      name: "Kushagra Srivastava",
      city: "Lucknow, India",
      rating: 5,
      text: "Got my cricket jersey yesterday. The fit is perfect and the gold detailing looks extremely premium. Will definitely order again for my next match.",
    },
    {
      id: "t-8",
      name: "Ayansh Srivastava",
      city: "Kanpur, India",
      rating: 5,
      text: "Excellent customer service and packaging. The jersey looks exactly like the ones worn by pros on the pitch. Outstanding value for money.",
    }
  ]
];

interface ShowcasePhoto {
  id: string;
  url: string;
  caption: string;
  subcaption: string;
  tagline: string;
}

const SHOWCASE_PHOTOS: ShowcasePhoto[] = [
  {
    id: "photo-1",
    url: "/assets/SaimJ.jpg",
    caption: "Real Fans. Real Passion.",
    subcaption: "Thanks for being a part of the KitKart family! (Saim)",
    tagline: "Worn by KitKart Community"
  },
  {
    id: "photo-2",
    url: "/assets/KshitizJ.jpg",
    caption: "Premium Wear. Professional Quality.",
    subcaption: "Jerseys designed for fans who expect more. (Kshitiz)",
    tagline: "Worn by KitKart Community"
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  // Showcase state & autoplay functionality (Cycles every 6 seconds)
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveShowcaseIndex((prevIndex) =>
        prevIndex === SHOWCASE_PHOTOS.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 6000 milliseconds = 6 seconds (Change this value to adjust duration)

    return () => clearInterval(timer);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (!isPaused) {
      autoplayTimer.current = setInterval(() => {
        handleNext();
      }, 8000); // Change slide every 8 seconds
    }

    return () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current);
      }
    };
  }, [activeIndex, isPaused]);

  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? TESTIMONIALS_PAIRS.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === TESTIMONIALS_PAIRS.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  // Structured Data (JSON-LD Schema) for SEO - flatten the pairs
  const allTestimonials = TESTIMONIALS_PAIRS.flat();
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "KitKart Premium Sports Jerseys",
    "image": "https://kitkart.01/assets/KitKart-Logo.jpg",
    "description": "Premium quality sports jerseys and football boots crafted for fans who expect more than just merchandise.",
    "brand": {
      "@type": "Brand",
      "name": "KitKart"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": allTestimonials.map((t) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": t.name
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": t.rating,
        "bestRating": "5"
      },
      "reviewBody": t.text
    }))
  };

  // Generate stars dynamically based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        viewBox="0 0 24 24"
        className={i < rating ? "star-filled" : "star-empty"}
        width="16"
        height="16"
        fill={i < rating ? "var(--clr-gold)" : "var(--clr-border)"}
        style={{ marginRight: "3px" }}
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ));
  };

  const currentShowcase = SHOWCASE_PHOTOS[activeShowcaseIndex];

  return (
    <section className="section testimonials-section">
      {/* Injecting SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <div className="container">

        {/* CENTERED HEADER SECTION */}
        <div className="testimonials-header-centered reveal">
          <span className="testimonials-badge">
            Customer Love 💛
          </span>
          <h2 className="section-title testimonials-main-title">
            What Our Customers Have to Say
          </h2>
          <p className="testimonials-subheading">
            Real reviews from real customers who love our jerseys.
          </p>
        </div>

        <div className="testimonials-grid">

          {/* LEFT SECTION: Vertical Testimonials Carousel */}
          <div className="testimonials-left reveal">
            <div
              className="testimonials-carousel-outer"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Absolute Navigation Buttons positioned on outer borders */}
              <button
                className="testimonial-btn-arrow btn-prev"
                onClick={handlePrev}
                aria-label="Previous Slide"
              >
                <svg viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button
                className="testimonial-btn-arrow btn-next"
                onClick={handleNext}
                aria-label="Next Slide"
              >
                <svg viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <div className="testimonials-track-wrapper">
                <div
                  className="testimonials-track"
                  style={{
                    transform: `translateX(-${activeIndex * 100}%)`,
                  }}
                >
                  {TESTIMONIALS_PAIRS.map((pair, pairIndex) => (
                    <div className="testimonial-slide" key={pairIndex}>
                      <div className="testimonial-vertical-stack">
                        {pair.map((testimonial) => (
                          <div className="testimonial-card" key={testimonial.id}>
                            {/* Quote icon at top-left */}
                            <span className="testimonial-quote-mark">“</span>

                            <blockquote className="testimonial-text">
                              {testimonial.text}
                            </blockquote>

                            <div className="testimonial-footer-meta">
                              <div className="testimonial-rating">
                                {renderStars(testimonial.rating)}
                              </div>
                              <span className="testimonial-author-name">
                                {testimonial.name}
                              </span>
                              <span className="testimonial-author-city">
                                {testimonial.city}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slider Dot Indicators */}
            <div className="testimonial-dots" role="tablist">
              {TESTIMONIALS_PAIRS.map((_, index) => (
                <button
                  key={index}
                  role="tab"
                  aria-selected={activeIndex === index}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`testimonial-dot ${activeIndex === index ? "active" : ""
                    }`}
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT SECTION: Showcase Card */}
          <div className="testimonials-right reveal">
            <div className="showcase-card">
              <div className="showcase-image-container">
                {SHOWCASE_PHOTOS.map((photo, index) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt={photo.caption}
                    className={`showcase-image ${index === activeShowcaseIndex ? "active" : ""}`}
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="showcase-footer-bar">
                <div className="showcase-camera-icon-wrap">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div className="showcase-meta-content">
                  <h3 className="showcase-caption-text">
                    {currentShowcase.caption}
                  </h3>
                  <p className="showcase-subcaption-text">
                    {currentShowcase.subcaption}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM CENTERED CTA */}
        <div className="testimonials-cta-wrapper reveal">
          <Link href="/shop" className="btn btn-testimonials-cta">
            Shop Best Sellers
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
