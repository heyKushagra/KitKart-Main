"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { initiateShiprocketCheckout } from "@/lib/shiprocket/checkout";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
};

export default function Cart() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem("kitkart_cart") || "[]");
      setCart(savedCart);
    };
    loadCart();
    setLoaded(true);
    window.addEventListener("cart_updated", loadCart);
    return () => window.removeEventListener("cart_updated", loadCart);
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("kitkart_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const changeQuantity = (id: string, delta: number) => {
    const newCart = [...cart];
    const itemIndex = newCart.findIndex((item) => item.id === id);

    if (itemIndex > -1) {
      newCart[itemIndex].quantity += delta;
      if (newCart[itemIndex].quantity <= 0) {
        newCart.splice(itemIndex, 1);
      }
      saveCart(newCart);
    }
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter((item) => item.id !== id);
    saveCart(newCart);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await initiateShiprocketCheckout(cart);
    } catch (error) {
      console.error("Shiprocket checkout error:", error);
      alert("Failed to initiate checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!loaded) return null; // Wait until local storage is loaded to avoid hydration mismatch

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 0; // Set to always 0 for Free Shipping
  const total = subtotal + shipping;

  return (
    <div style={{ paddingTop: "80px" }}>
      {/* ===== CART SECTION ===== */}
      <section className="section cart-section">
        <div className="container">
          <h1 className="cart-title-main">Shopping Cart</h1>

          {cart.length === 0 ? (
            /* Empty Cart Layout */
            <div className="cart-empty-wrapper">
              <svg
                className="cart-empty-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <h2 className="cart-empty-title">Your Cart is Empty</h2>
              <p className="cart-empty-text">
                Looks like you haven't added any jerseys to your cart yet.
              </p>
              <Link href="/" className="btn btn-primary cart-empty-btn">
                Continue Shopping
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="16"
                  height="16"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          ) : (
            /* Active Cart Container */
            <div className="cart-container">
              {/* Cart Items List */}
              <div className="cart-items-list">
                <div className="cart-item-header">
                  <span>Product</span>
                  <span>Description</span>
                  <span>Quantity</span>
                  <span>Total</span>
                  <span></span>
                </div>
                <div>
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-img"
                      />
                      <div className="cart-item-info">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <div className="cart-item-size">
                          Size: <span>{item.size}</span>
                        </div>
                      </div>
                      <div className="cart-item-qty-selector">
                        <button
                          className="qty-btn"
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          −
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="cart-item-price-total">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                      <button
                        className="cart-item-remove-btn"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="cart-summary-card">
                <h2 className="summary-title">Order Summary</h2>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="summary-row">
                  <span>Estimated Shipping</span>
                  <span>{shipping === 0 ? <span style={{ color: "var(--clr-primary, #25D366)", fontWeight: "bold" }}>FREE</span> : `₹${shipping}`}</span>
                </div>

                <div className="summary-row total-row">
                  <span>Total</span>
                  <span className="total-val">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="btn btn-primary checkout-btn"
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? "Loading Checkout..." : "Proceed to Checkout"}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="18"
                    height="18"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
