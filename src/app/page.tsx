"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Testimonials from "@/components/Testimonials";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
  status?: string;
  stock?: number;
  createdAt?: string;
  category?: string;
  contactForPrice?: boolean;
}

const LOCAL_PRODUCTS: Product[] = [
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fbProducts: any[] = [];
        querySnapshot.forEach((docSnap) => {
          fbProducts.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Merge keeping local products first, updating them with Firebase data if exists
        const merged = LOCAL_PRODUCTS.map(lp => {
          const fp = fbProducts.find(f => f.id === lp.id);
          if (fp) {
            return {
              ...lp,
              price: typeof fp.price === 'string' ? parseFloat(fp.price) : fp.price,
              image: fp.mainImage || fp.image || lp.image,
              badge: fp.badge || fp.tag || lp.badge || "",
              stock: fp.stock !== undefined ? Number(fp.stock) : 10,
              status: fp.status || "In Stock",
              createdAt: fp.createdAt || "2024-01-01",
              category: fp.category || lp.category || "",
              contactForPrice: fp.contactForPrice === true
            };
          }
          return {
            ...lp,
            stock: 10,
            status: "In Stock",
            createdAt: "2024-01-01",
            category: "",
            contactForPrice: false
          };
        });

        fbProducts.forEach((fp) => {
          if (fp.status === "Draft") return;
          if (!merged.some((lp) => lp.id === fp.id)) {
            merged.push({
              id: fp.id,
              name: fp.name,
              price: typeof fp.price === 'string' ? parseFloat(fp.price) : fp.price,
              image: fp.mainImage || fp.image,
              badge: fp.badge || fp.tag || "",
              stock: fp.stock !== undefined ? Number(fp.stock) : 10,
              status: fp.status || "In Stock",
              createdAt: fp.createdAt || "2024-01-01",
              category: fp.category || "",
              contactForPrice: fp.contactForPrice === true
            });
          }
        });

        // Sort by createdAt descending so newly added products are in the first column
        const sorted = merged.sort((a, b) => {
          const dateA = a.createdAt || "2024-01-01";
          const dateB = b.createdAt || "2024-01-01";
          return dateB.localeCompare(dateA);
        });

        setProducts(sorted);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to fetch products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // 2. Scroll Reveal Animations
    const revealOnScroll = () => {
      const windowHeight = window.innerHeight;
      const elementVisible = 100; // Trigger threshold
      const revealElements = document.querySelectorAll(".reveal");

      revealElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add("active");
        }
      });
    };

    window.addEventListener("scroll", revealOnScroll);

    // Trigger immediately and after a short delay to ensure elements are rendered
    revealOnScroll();
    const timer = setTimeout(revealOnScroll, 100);

    return () => {
      window.removeEventListener("scroll", revealOnScroll);
      clearTimeout(timer);
    };
  }, [products]);

  const handleQuickAdd = (
    e: React.MouseEvent,
    product: { id: string; name: string; price: number; image: string; size: string }
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const cart = JSON.parse(localStorage.getItem("kitkart_cart") || "[]");
    const existingIndex = cart.findIndex((cItem: any) => cItem.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("kitkart_cart", JSON.stringify(cart));

    // Dispatch custom event to update Navbar
    window.dispatchEvent(new Event("cart_updated"));

    // Quick visual indicator (pulse icon color to gold)
    const svg = (e.currentTarget as HTMLElement).querySelector("svg");
    if (svg) {
      const originalStroke = svg.style.stroke || "";
      svg.style.stroke = "var(--clr-gold)";
      setTimeout(() => {
        svg.style.stroke = originalStroke;
      }, 1000);
    }
  };

  return (
    <>
      {/* ===== HERO ===== */}
      <header className="hero">
        <div className="hero-bg-image">
          <img src="/assets/FootBall-BG.png" alt="" />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-label">Premium Sports Jerseys</span>
            <h1 className="hero-title">
              Wear The<br />Game.
            </h1>
            <p className="hero-text">
              Premium quality jerseys crafted for fans who expect more than just merchandise.
            </p>
            <div className="hero-ctas">
              <Link href="/shop" className="btn btn-primary">
                Shop Collection
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
              <Link href="/categories" className="btn btn-outline">
                Explore Categories
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* ===== NEW ARRIVALS ===== */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div>
              <p className="section-label">New Arrivals</p>
              <h2 className="section-title">Fresh Drops</h2>
            </div>
            <Link href="/shop" className="section-link">
              View All Products
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
          <div className="products-grid reveal reveal-stagger">
            {products.slice(0, 8).map((product) => {
              const isOutOfStock = product.stock !== undefined ? (product.stock <= 0 || product.status === "Out of Stock") : false;
              const isContactForPrice = product.contactForPrice === true ||
                product.category?.toLowerCase() === "boots" ||
                product.category?.toLowerCase() === "football boots" ||
                product.category?.toLowerCase().includes("boot");
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}?id=${product.id}&name=${encodeURIComponent(product.name)}&price=${product.price}${product.image.startsWith('data:') ? '' : `&image=${encodeURIComponent(product.image)}`}${isContactForPrice ? '&contactForPrice=true' : ''}`}
                  className="product-card"
                >
                  <div className="product-img-wrapper">
                    {isOutOfStock ? (
                      <span className="product-badge" style={{ backgroundColor: '#ff4757', color: '#fff' }}>Out of Stock</span>
                    ) : (
                      product.badge && <span className="product-badge">{product.badge}</span>
                    )}
                    <img src={product.image} alt={product.name} className="product-img" />
                  </div>
                  <div className="product-meta">
                    <div>
                      <h3 className="product-title">{product.name}</h3>
                      {isContactForPrice ? (
                        <span className="product-price" style={{ color: "var(--clr-gold)", fontSize: "0.95rem", fontWeight: "600" }}>Contact for Price</span>
                      ) : (
                        <span className="product-price">₹{product.price}</span>
                      )}
                    </div>
                    {!isContactForPrice && (
                      <div
                        className="btn-icon"
                        aria-label="Add to cart"
                        style={isOutOfStock ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                        onClick={(e) => {
                          if (isOutOfStock) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          handleQuickAdd(e, {
                            id: `${product.id}-M`,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            size: "M"
                          });
                        }}
                      >
                        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="view-all-wrapper" style={{ display: "flex", justifyContent: "center", marginTop: "var(--sp-10)" }}>
            <Link href="/shop" className="btn btn-outline" style={{ borderRadius: "var(--r-full)", padding: "12px 36px", fontSize: "0.95rem" }}>
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <hr className="divider" />

      {/* ===== FEATURED CATEGORIES ===== */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div>
              <p className="section-label">Shop by Category</p>
              <h2 className="section-title">Find Your Jersey</h2>
            </div>
            <Link href="/categories" className="section-link">
              View All Categories
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
          <div className="categories-grid reveal reveal-stagger">
            <Link href="/shop?category=Football%20Jerseys" className="category-card">
              <div className="category-img-wrapper">
                <img src="/assets/football.jpg" alt="Football Jerseys" />
              </div>
              <h3 className="category-name">Football</h3>
              <span className="category-explore">
                Explore{" "}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
            <Link href="/shop?category=Cricket%20Jerseys" className="category-card">
              <div className="category-img-wrapper">
                <img src="/assets/IndJersey.jpg" alt="Cricket Jerseys" />
              </div>
              <h3 className="category-name">Cricket</h3>
              <span className="category-explore">
                Explore{" "}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
            {/* <Link href="/shop?category=Club%20Jerseys" className="category-card">
              <div className="category-img-wrapper">
                <img src="/assets/jersey3.jpg" alt="Club Jerseys" />
              </div>
              <h3 className="category-name">Club Jerseys</h3>
              <span className="category-explore">
                Explore{" "}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link> */}
            <Link href="/shop?category=Player%20Jerseys" className="category-card">
              <div className="category-img-wrapper">
                <img src="/assets/player.jpg" alt="Player Jerseys" />
              </div>
              <h3 className="category-name">Player's Jerseys</h3>
              <span className="category-explore">
                Explore{" "}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <hr className="divider" />



      {/* ===== WHY CHOOSE KITKART ===== */}
      <section className="section features-section">
        <div className="container">
          <p className="section-label reveal" style={{ textAlign: "center", marginBottom: "var(--sp-12)" }}>
            Why Choose KitKart
          </p>
          <div className="features-grid reveal reveal-stagger">
            <div className="feature-item">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="feature-title">Premium Quality</h3>
              <p className="feature-desc">High-grade fabric and premium finishes for long-lasting comfort.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <path d="M16 8h4l3 3v5a2 2 0 01-2 2h-1" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h3 className="feature-title">All India Delivery</h3>
              <p className="feature-desc">Fast and reliable delivery to every corner of India.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="feature-title">Secure Shopping</h3>
              <p className="feature-desc">Your payments and personal data are always protected.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3 className="feature-title">Trusted by Fans</h3>
              <p className="feature-desc">Loved by thousands of fans across the country.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <Testimonials />

      {/* ===== COMMUNITY ===== */}
      <section className="section community-section">
        <div className="container">
          <div className="community-inner reveal">
            <div className="community-text">
              <p className="section-label">Join Our Community</p>
              <h2 className="section-title" style={{ textAlign: "left" }}>
                Join the KitKart Community
              </h2>
              <p>
                Be part of a growing family of football and cricket fans. Follow us on Instagram for new drops, behind the scenes and exclusive collections.
              </p>
              <a
                href="https://www.instagram.com/kitkart.01/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Follow @kitkart.01
              </a>
            </div>
            <div className="community-images">
              <div className="community-img-wrap">
                <img src="/assets/boots.png" alt="Community" />
              </div>
              <div className="community-img-wrap">
                <img src="/assets/jerseyBG.jpg" alt="Community" />
              </div>
              <div className="community-img-wrap">
                <img src="/assets/player.jpg" alt="Community" />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-inner reveal">
            <svg className="newsletter-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <div className="newsletter-text">
              <h3>Stay Updated With New Drops</h3>
              <p>Subscribe to get early access to new collections and exclusive offers.</p>
            </div>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" className="newsletter-input" placeholder="Enter your email" aria-label="Email" />
              <button type="submit" className="btn-subscribe">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ===== WHATSAPP HELP ===== */}
      <div className="whatsapp-container">
        <a href="https://wa.me/917554995157" className="whatsapp-pill reveal">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          Text us on Whatsapp for better assistance
        </a>
      </div>
    </>
  );
}
