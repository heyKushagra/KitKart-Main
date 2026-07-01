"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

        {/* Center Nav */}
        <ul className="navbar-nav">
          <li>
            <Link href="/" className="nav-link active">
              Home
            </Link>
          </li>
          <li>
            <Link href="/shop" className="nav-link">
              Shop
            </Link>
          </li>
          <li>
            <Link href="/categories" className="nav-link">
              Categories
            </Link>
          </li>
          <li>
            <Link href="/" className="nav-link">
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" className="nav-link">
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
          <button className="mobile-menu-btn" aria-label="Menu">
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
    </nav>
  );
}
