import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
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
            </div>
            <p className="footer-desc">
              Premium Jerseys.<br />
              Delivered Across India.
            </p>
          </div>
          <div>
            <h4 className="footer-title">Shop</h4>
            <div className="footer-links">
              <Link href="/shop" className="footer-link">All Products</Link>
              <Link href="/shop?category=Football%20Jerseys" className="footer-link">Football Jerseys</Link>
              <Link href="/shop?category=Cricket%20Jerseys" className="footer-link">Cricket Jerseys</Link>
              <Link href="/shop?category=Club%20Jerseys" className="footer-link">Club Jerseys</Link>
              <Link href="/shop?category=Player%20Jerseys" className="footer-link">Player Jerseys</Link>
            </div>
          </div>
          <div>
            <h4 className="footer-title">Company</h4>
            <div className="footer-links">
              {/* <Link href="#" className="footer-link">About Us</Link> */}
              <Link href="#" className="footer-link">Our Story</Link>
              <Link href="/faq" className="footer-link">FAQ</Link>
              {/* <Link href="#" className="footer-link">Size Guide</Link> */}
              <Link href="/shipping-returns" className="footer-link">Shipping & Returns</Link>
            </div>
          </div>
          <div>
            <h4 className="footer-title">Help</h4>
            <div className="footer-links">
              <Link href="/contact" className="footer-link">Contact Us</Link>
              {/* <Link href="#" className="footer-link">Track Order</Link> */}
              {/* <Link href="#" className="footer-link">Privacy Policy</Link> */}
              <Link href="#" className="footer-link">Terms & Conditions</Link>
            </div>
          </div>
          <div>
            <h4 className="footer-title">Follow Us</h4>
            <div className="social-links">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/kitkart.01/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24">
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="#" className="social-link" aria-label="Twitter">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" className="social-link" aria-label="YouTube">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z"
                    fill="currentColor"
                  />
                  <polygon
                    points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"
                    fill="var(--clr-bg)"
                  />
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" className="social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 KitKart. All Rights Reserved. | Designed & Developed by <a href="https://kushworks.vercel.app" target="_blank" rel="noopener noreferrer"><strong>Kushagra Srivastava</strong></a></p>
        </div>
      </div>
    </footer>
  );
}
