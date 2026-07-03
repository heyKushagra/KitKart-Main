"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path) ?? false;
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
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

        {/* Right Icons */}
        <div className="nav-icons">
          <button className="nav-icon-btn" aria-label="Search">
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
              <svg viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2L4 8v8c0 7.5 5.3 14.5 12 16 6.7-1.5 12-8.5 12-16V8L16 2z"
                  stroke="#C5A059"
                  strokeWidth="1.5"
                  fill="none"
                />
                <text
                  x="10"
                  y="21"
                  fontSize="14"
                  fontWeight="700"
                  fill="#C5A059"
                  fontFamily="Space Grotesk, sans-serif"
                >
                  K
                </text>
              </svg>
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
    </nav>
  );
}
