"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface SearchProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  contactForPrice?: boolean;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [productsList, setProductsList] = useState<SearchProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path) ?? false;
  };

  useEffect(() => {
    if (mobileOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen && productsList.length === 0) {
      const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
          const querySnapshot = await getDocs(collection(db, "products"));
          const list: SearchProduct[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.status !== "Draft") {
              list.push({
                id: docSnap.id,
                name: data.name || "",
                price: typeof data.price === 'string' ? parseFloat(data.price) : (data.price || 0),
                image: data.mainImage || data.image || "",
                category: data.category || "",
                contactForPrice: data.contactForPrice === true
              });
            }
          });
          setProductsList(list);
        } catch (err) {
          console.error("Error loading products for search:", err);
        } finally {
          setLoadingProducts(false);
        }
      };
      fetchProducts();
    }
  }, [searchOpen, productsList.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // 1. Navbar Scroll Effect
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    // 2. Cart System Integration
    const updateCartBadge = () => {
      const cart = JSON.parse(localStorage.getItem("kitkart_cart") || "[]");
      const totalCount = cart.reduce(
        (total: number, item: any) => total + item.quantity,
        0
      );
      setCartCount(totalCount);
    };

    updateCartBadge(); // Initial load

    // Listen to storage event (cross-tab)
    window.addEventListener("storage", updateCartBadge);

    // Listen to custom event for same-tab updates
    window.addEventListener("cart_updated", updateCartBadge);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", updateCartBadge);
      window.removeEventListener("cart_updated", updateCartBadge);
    };
  }, []);

  const isHomePage = pathname === "/";

  return (
    <>
      {isHomePage && (
        <div className={`promo-ribbon ${scrolled ? "hidden" : ""}`}>
          <div className="promo-ticker">
            <div className="promo-ticker-track">
              <span className="promo-ticker-item">
                Shop Jerseys worth <span className="highlight">Rs. 1500</span>, Get one pair of Socks worth <span className="highlight">Rs. 200</span> @ <span className="highlight-gold">Rs. 50 Only</span>
                <span className="highlight">Use Code- SOCKS50</span>
                <span className="bullet">&bull;</span>
              </span>
              <span className="promo-ticker-item">
                Shop Jerseys worth <span className="highlight">Rs. 1500</span>, Get one pair of Socks worth <span className="highlight">Rs. 200</span> @ <span className="highlight-gold">Rs. 50 Only</span>
                <span className="highlight">Use Code- SOCKS50</span>
                <span className="bullet">&bull;</span>
              </span>
              <span className="promo-ticker-item">
                Shop Jerseys worth <span className="highlight">Rs. 1500</span>, Get one pair of Socks worth <span className="highlight">Rs. 200</span> @ <span className="highlight-gold">Rs. 50 Only</span>
                <span className="highlight">Use Code- SOCKS50</span>
                <span className="bullet">&bull;</span>
              </span>
              <span className="promo-ticker-item">
                Shop Jerseys worth <span className="highlight">Rs. 1500</span>, Get one pair of Socks worth <span className="highlight">Rs. 200</span> @ <span className="highlight-gold">Rs. 50 Only</span>
                <span className="highlight">Use Code- SOCKS50</span>
                <span className="bullet">&bull;</span>
              </span>
            </div>
          </div>
        </div>
      )}
      <nav className={`navbar ${scrolled ? "scrolled" : ""} ${isHomePage && !scrolled ? "has-ribbon" : ""}`} id="navbar">
        <div className="container">
          {/* Brand */}
          <Link href="/" className="navbar-brand">
            <img
              src="/assets/KitKart-LogoT1.png"
              alt="KitKart Logo"
              style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover" }} />
            KITKART
          </Link>

          {/* Center Nav */}
          <ul className="navbar-nav">
            <li>
              <Link href="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" className={`nav-link ${isActive("/shop") ? "active" : ""}`}>
                Shop
              </Link>
            </li>
            <li>
              <Link href="/categories" className={`nav-link ${isActive("/categories") ? "active" : ""}`}>
                Categories
              </Link>
            </li>
            <li>
              <Link href="/" className="nav-link">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className={`nav-link ${isActive("/contact") ? "active" : ""}`}>
                Contact
              </Link>
            </li>
          </ul>

          <div className="nav-icons">
            <button
              className="nav-icon-btn"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* User Account / Auth Status Dropdown */}
            <div
              className="nav-user-dropdown-container"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                className="nav-icon-btn"
                aria-label="Account"
                onClick={() => setDropdownOpen(prev => !prev)}
              >
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              <div className={`nav-user-dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                {user ? (
                  <>
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-name">Hi, {user.displayName?.split(' ')[0] || "Fan"}</span>
                    </div>
                    <Link href="/account" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      My Account
                    </Link>
                    <Link href="/account/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="dropdown-item logout-item"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </div>

            <style>{`
            /* Promo Ribbon Styles */
            .promo-ribbon {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 40px;
              background: linear-gradient(90deg, #0b0b0b 0%, #1a150c 50%, #0b0b0b 100%);
              border-bottom: 1px solid rgba(197, 160, 89, 0.3);
              z-index: 999;
              display: flex;
              align-items: center;
              overflow: hidden;
              transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .promo-ribbon.hidden {
              transform: translateY(-100%);
              opacity: 0;
              pointer-events: none;
            }
            .promo-ticker {
              width: 100%;
              overflow: hidden;
              white-space: nowrap;
              display: flex;
              align-items: center;
            }
            .promo-ticker-track {
              display: flex;
              width: max-content;
              animation: marquee 35s linear infinite;
            }
            .promo-ticker-track:hover {
              animation-play-state: paused;
            }
            .promo-ticker-item {
              display: flex;
              align-items: center;
              font-family: var(--ff-heading);
              font-size: 0.82rem;
              letter-spacing: 0.05em;
              font-weight: 500;
              color: var(--clr-text-secondary);
              padding-right: 4rem;
              text-transform: uppercase;
            }
            .promo-ticker-item .highlight {
              color: var(--clr-text);
              font-weight: 700;
              margin: 0 4px;
            }
            .promo-ticker-item .highlight-gold {
              color: var(--clr-gold);
              font-weight: 700;
              margin: 0 4px;
              text-shadow: 0 0 8px rgba(197, 160, 89, 0.3);
            }
            .promo-ticker-item .bullet {
              color: var(--clr-gold);
              margin-left: 4rem;
              opacity: 0.6;
            }
            @keyframes marquee {
              0% {
                transform: translate3d(0, 0, 0);
              }
              100% {
                transform: translate3d(-50%, 0, 0);
              }
            }
            .navbar.has-ribbon {
              top: 40px;
            }

            /* Search Overlay Styles */
            .search-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 10000;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              padding-top: 80px;
            }
            .search-overlay-backdrop {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(10, 10, 10, 0.85);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            }
            .search-overlay-container {
              position: relative;
              z-index: 1;
              width: 100%;
              max-width: 680px;
              margin: 0 var(--sp-4);
              background: rgba(19, 19, 19, 0.95);
              border: 1px solid var(--clr-border);
              border-radius: var(--r-xl);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
              overflow: hidden;
              animation: searchSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes searchSlideDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .search-overlay-header {
              display: flex;
              align-items: center;
              gap: var(--sp-3);
              padding: var(--sp-4) var(--sp-5);
              border-bottom: 1px solid var(--clr-border);
            }
            .search-input-wrapper {
              position: relative;
              flex-grow: 1;
              display: flex;
              align-items: center;
            }
            .search-icon {
              position: absolute;
              left: var(--sp-3);
              width: 20px;
              height: 20px;
              stroke: var(--clr-text-secondary);
              pointer-events: none;
            }
            .search-overlay-input {
              width: 100%;
              padding: var(--sp-3) var(--sp-10) var(--sp-3) var(--sp-10);
              background: rgba(255, 255, 255, 0.03);
              border: 1px solid var(--clr-border);
              border-radius: var(--r-lg);
              color: var(--clr-text);
              font-size: 1rem;
              outline: none;
              transition: all var(--t-fast);
            }
            .search-overlay-input:focus {
              border-color: var(--clr-gold);
              background: rgba(255, 255, 255, 0.05);
            }
            .search-clear-btn {
              position: absolute;
              right: var(--sp-3);
              background: none;
              border: none;
              cursor: pointer;
              padding: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .search-clear-btn svg {
              width: 16px;
              height: 16px;
              stroke: var(--clr-text-secondary);
              transition: stroke var(--t-fast);
            }
            .search-clear-btn:hover svg {
              stroke: var(--clr-text);
            }
            .search-close-btn {
              background: none;
              border: 1px solid var(--clr-border);
              border-radius: var(--r-md);
              color: var(--clr-text-secondary);
              padding: var(--sp-2) var(--sp-4);
              font-size: 0.85rem;
              cursor: pointer;
              transition: all var(--t-fast);
            }
            .search-close-btn:hover {
              color: var(--clr-text);
              border-color: var(--clr-text-secondary);
              background: rgba(255, 255, 255, 0.03);
            }
            .search-results-container {
              max-height: 400px;
              overflow-y: auto;
              padding: var(--sp-5);
            }
            .search-status {
              text-align: center;
              color: var(--clr-text-secondary);
              font-size: 0.9rem;
              padding: var(--sp-6) 0;
            }
            .search-suggestions h4 {
              font-family: var(--ff-heading);
              font-size: 0.85rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: var(--clr-text-muted);
              margin-bottom: var(--sp-3);
            }
            .suggestion-pills {
              display: flex;
              flex-wrap: wrap;
              gap: var(--sp-2);
            }
            .suggestion-pill {
              font-size: 0.85rem;
              color: var(--clr-text-secondary);
              background: rgba(255, 255, 255, 0.03);
              border: 1px solid var(--clr-border);
              padding: var(--sp-2) var(--sp-4);
              border-radius: var(--r-full);
              transition: all var(--t-fast);
              text-decoration: none;
            }
            .suggestion-pill:hover {
              color: var(--clr-gold);
              border-color: var(--clr-gold-dim);
              background: rgba(197, 160, 89, 0.05);
            }
            .search-results-list {
              display: flex;
              flex-direction: column;
              gap: var(--sp-2);
            }
            .search-result-item {
              display: flex;
              align-items: center;
              gap: var(--sp-4);
              padding: var(--sp-3);
              background: rgba(255, 255, 255, 0.01);
              border: 1px solid transparent;
              border-radius: var(--r-lg);
              text-decoration: none;
              color: inherit;
              transition: all var(--t-fast);
            }
            .search-result-item:hover {
              background: rgba(255, 255, 255, 0.03);
              border-color: var(--clr-border);
            }
            .search-result-img {
              width: 50px;
              height: 60px;
              object-fit: cover;
              border-radius: var(--r-md);
              background: rgba(0, 0, 0, 0.2);
            }
            .search-result-info {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              gap: 2px;
            }
            .search-result-name {
              font-size: 0.95rem;
              font-weight: 500;
              color: var(--clr-text);
            }
            .search-result-category {
              font-size: 0.8rem;
              color: var(--clr-text-secondary);
            }
            .search-result-price {
              font-size: 0.9rem;
              font-weight: 600;
              color: var(--clr-text);
              text-align: right;
            }
            .search-see-all {
              text-align: center;
              padding-top: var(--sp-4);
              border-top: 1px solid rgba(255, 255, 255, 0.05);
              margin-top: var(--sp-2);
            }
            .see-all-link {
              font-size: 0.9rem;
              color: var(--clr-gold);
              font-weight: 500;
              text-decoration: none;
              transition: opacity var(--t-fast);
            }
            .see-all-link:hover {
              opacity: 0.85;
            }

            .nav-user-dropdown-container {
              position: relative;
              display: inline-block;
            }
            .nav-user-dropdown-menu {
              position: absolute;
              top: 100%;
              right: 0;
              background: rgba(19, 19, 19, 0.95);
              border: 1px solid var(--clr-border);
              border-radius: var(--r-md);
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
              min-width: 160px;
              padding: 8px 0;
              z-index: 1000;
              opacity: 0;
              transform: translateY(10px);
              pointer-events: none;
              transition: opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1), transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .nav-user-dropdown-menu.show {
              opacity: 1;
              transform: translateY(0);
              pointer-events: auto;
            }
            .dropdown-user-info {
              padding: var(--sp-2) var(--sp-4);
              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
              margin-bottom: var(--sp-1);
              text-align: left;
            }
            .dropdown-user-name {
              font-size: 0.8rem;
              color: var(--clr-gold);
              font-weight: 600;
            }
            .dropdown-item {
              display: block;
              width: 100%;
              padding: var(--sp-2) var(--sp-4);
              color: var(--clr-text-secondary);
              font-size: 0.85rem;
              transition: all var(--t-fast);
              text-align: left;
              background: none;
              border: none;
            }
            .dropdown-item:hover {
              background: rgba(255, 255, 255, 0.03);
              color: var(--clr-text);
              padding-left: var(--sp-5);
            }
            .logout-item {
              color: #ff4757;
              border-top: 1px solid rgba(255, 255, 255, 0.03);
              margin-top: var(--sp-1);
            }
             .logout-item:hover {
              color: #ff6b81 !important;
              background: rgba(255, 71, 87, 0.05);
            }
            
            /* Mobile Nav Drawer Styles */
            .mobile-nav-drawer {
              position: fixed;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              z-index: 9999;
              visibility: hidden;
              pointer-events: none;
              transition: visibility var(--t-fast);
            }
            .mobile-nav-drawer.open {
              visibility: visible;
              pointer-events: auto;
            }
            .mobile-nav-backdrop {
              position: absolute;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              background: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              opacity: 0;
              transition: opacity var(--t-med);
            }
            .mobile-nav-drawer.open .mobile-nav-backdrop {
              opacity: 1;
            }
            .mobile-nav-content {
              position: absolute;
              top: 0;
              right: 0;
              bottom: 0;
              width: 320px;
              max-width: 85%;
              background: rgba(19, 19, 19, 0.98);
              border-left: 1px solid var(--clr-border);
              box-shadow: -10px 0 40px rgba(0, 0, 0, 0.8);
              display: flex;
              flex-direction: column;
              padding: var(--sp-6) var(--sp-8);
              transform: translateX(100%);
              transition: transform var(--t-med);
            }
            .mobile-nav-drawer.open .mobile-nav-content {
              transform: translateX(0);
            }
            .mobile-nav-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: var(--sp-10);
            }
            .mobile-nav-close {
              background: none;
              border: none;
              cursor: pointer;
              padding: var(--sp-1);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .mobile-nav-close svg {
              width: 24px;
              height: 24px;
              stroke: var(--clr-text);
              fill: none;
              stroke-width: 2;
              transition: stroke var(--t-fast);
            }
            .mobile-nav-close:hover svg {
              stroke: var(--clr-gold);
            }
            .mobile-nav-links {
              display: flex;
              flex-direction: column;
              gap: var(--sp-6);
            }
            .mobile-nav-link {
              font-family: var(--ff-heading);
              font-size: 1.3rem;
              font-weight: 600;
              color: var(--clr-text-secondary);
              display: block;
              transition: color var(--t-fast), padding-left var(--t-fast);
            }
            .mobile-nav-link:hover,
            .mobile-nav-link.active {
              color: var(--clr-gold);
              padding-left: var(--sp-2);
            }
            .mobile-nav-footer {
              margin-top: auto;
              border-top: 1px solid rgba(255, 255, 255, 0.05);
              padding-top: var(--sp-6);
            }
            .mobile-nav-user {
              display: flex;
              flex-direction: column;
              gap: var(--sp-3);
            }
            .mobile-nav-user-info {
              display: flex;
              flex-direction: column;
            }
            .mobile-nav-user-title {
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: var(--clr-text-muted);
            }
            .mobile-nav-user-name {
              font-size: 1rem;
              color: var(--clr-gold);
              font-weight: 600;
              margin-bottom: var(--sp-1);
            }
            .mobile-nav-user-email {
              font-size: 0.8rem;
              color: var(--clr-text-secondary);
              word-break: break-all;
            }
            .mobile-btn-primary {
              display: block;
              text-align: center;
              background: var(--clr-gold);
              color: var(--clr-bg);
              padding: var(--sp-3) var(--sp-6);
              border-radius: var(--r-md);
              font-weight: 600;
              font-size: 0.9rem;
              transition: background var(--t-fast);
            }
            .mobile-btn-primary:hover {
              background: var(--clr-gold-hover);
            }
            .mobile-btn-outline {
              display: block;
              text-align: center;
              background: transparent;
              border: 1px solid var(--clr-border);
              color: var(--clr-text);
              padding: var(--sp-3) var(--sp-6);
              border-radius: var(--r-md);
              font-weight: 600;
              font-size: 0.9rem;
              transition: all var(--t-fast);
            }
            .mobile-btn-outline:hover {
              border-color: #ff4757;
              color: #ff4757;
              background: rgba(255, 71, 87, 0.05);
            }
          `}</style>

            <Link href="/cart" className="nav-icon-btn" aria-label="Cart">
              <svg
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span className="cart-badge" id="cart-count">
                {cartCount}
              </span>
            </Link>
            <button
              className="mobile-menu-btn"
              aria-label="Menu"
              onClick={() => setMobileOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        <div className={`mobile-nav-drawer ${mobileOpen ? "open" : ""}`}>
          <div className="mobile-nav-backdrop" onClick={() => setMobileOpen(false)} />
          <div className="mobile-nav-content">
            <div className="mobile-nav-header">
              <Link href="/" className="navbar-brand" onClick={() => setMobileOpen(false)}>
                <img
                  src="/assets/KitKart-LogoT1.png"
                  alt="KitKart Logo"
                  style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover" }} />
                KITKART
              </Link>
              <button
                className="mobile-nav-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <ul className="mobile-nav-links">
              <li>
                <Link
                  href="/"
                  className={`mobile-nav-link ${isActive("/") ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className={`mobile-nav-link ${isActive("/shop") ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className={`mobile-nav-link ${isActive("/categories") ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="mobile-nav-link"
                  onClick={() => setMobileOpen(false)}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={`mobile-nav-link ${isActive("/contact") ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  Contact
                </Link>
              </li>
            </ul>

            <div className="mobile-nav-footer">
              {user ? (
                <div className="mobile-nav-user">
                  <div className="mobile-nav-user-info">
                    <span className="mobile-nav-user-title">Logged In As</span>
                    <span className="mobile-nav-user-name">
                      {user.displayName || "Sports Fan"}
                    </span>
                    <span className="mobile-nav-user-email">{user.email}</span>
                  </div>
                  <Link
                    href="/account"
                    className="mobile-btn-outline"
                    onClick={() => setMobileOpen(false)}
                    style={{ display: "block", textAlign: "center", textDecoration: "none" }}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="mobile-btn-outline"
                    style={{ width: "100%" }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="mobile-btn-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <div className="search-overlay">
            <div className="search-overlay-backdrop" onClick={() => setSearchOpen(false)} />
            <div className="search-overlay-container">
              <div className="search-overlay-header">
                <div className="search-input-wrapper">
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search premium jerseys, boots..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-overlay-input"
                    autoFocus
                  />
                  {searchQuery && (
                    <button className="search-clear-btn" onClick={() => setSearchQuery("")} aria-label="Clear search">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
                <button className="search-close-btn" onClick={() => setSearchOpen(false)}>
                  Close
                </button>
              </div>

              <div className="search-results-container">
                {loadingProducts ? (
                  <div className="search-status">Searching catalog...</div>
                ) : searchQuery.trim() === "" ? (
                  <div className="search-suggestions">
                    <h4>Popular Categories</h4>
                    <div className="suggestion-pills">
                      <Link href="/shop?category=Football%20Jerseys" onClick={() => setSearchOpen(false)} className="suggestion-pill">Football Jerseys</Link>
                      <Link href="/shop?category=Cricket%20Jerseys" onClick={() => setSearchOpen(false)} className="suggestion-pill">Cricket Jerseys</Link>
                      <Link href="/shop?category=Boots" onClick={() => setSearchOpen(false)} className="suggestion-pill">Football Boots</Link>
                      <Link href="/shop?category=Player%20Jerseys" onClick={() => setSearchOpen(false)} className="suggestion-pill">Player Jerseys</Link>
                    </div>
                  </div>
                ) : productsList.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                  <div className="search-results-list">
                    {productsList
                      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(0, 5)
                      .map((prod) => {
                        const isContact = prod.contactForPrice === true ||
                          prod.category?.toLowerCase() === "boots" ||
                          prod.category?.toLowerCase() === "football boots" ||
                          prod.category?.toLowerCase().includes("boot");
                        return (
                          <Link
                            href={`/product/${prod.id}?id=${prod.id}&name=${encodeURIComponent(prod.name)}&price=${prod.price}${prod.image.startsWith('data:') ? '' : `&image=${encodeURIComponent(prod.image)}`}${isContact ? '&contactForPrice=true' : ''}`}
                            key={prod.id}
                            className="search-result-item"
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            <img src={prod.image || "/assets/jersey1.jpg"} alt={prod.name} className="search-result-img" />
                            <div className="search-result-info">
                              <span className="search-result-name">{prod.name}</span>
                              <span className="search-result-category">{prod.category || "Uncategorized"}</span>
                            </div>
                            <div className="search-result-price">
                              {isContact ? (
                                <span style={{ color: "var(--clr-gold)", fontWeight: 600, fontSize: "0.85rem" }}>Contact for Price</span>
                              ) : (
                                <span>₹{prod.price.toLocaleString("en-IN")}</span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    <div className="search-see-all">
                      <Link
                        href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="see-all-link"
                      >
                        See all results for "{searchQuery}" →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="search-status">No matches found for "{searchQuery}"</div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
