"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, serverTimestamp, runTransaction, doc } from "firebase/firestore";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function Checkout() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Form State
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const applyCoupon = () => {
    // Example: You can change "KITKART10" to any keyword, and adjust the discount math (e.g., subtotal * 0.1 for 10% off)
    if (couponCode.toUpperCase() === "NEW10") {
      setDiscountAmount(100);
      showToast("success", "Coupon applied successfully!");
    } else {
      setDiscountAmount(0);
      showToast("error", "Invalid coupon code");
    }
  };

  // Prefill Name & Email from authenticated user
  useEffect(() => {
    if (user) {
      setShippingForm((prev) => ({
        ...prev,
        fullName: user.displayName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Load Cart from LocalStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("kitkart_cart") || "[]");
    setCart(savedCart);
    setLoaded(true);
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [name]: value }));
  };

  // Totals calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0; // Set to always 0 for Free Shipping
  const total = subtotal + shipping - discountAmount;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (cart.length === 0) {
      showToast("error", "Your shopping cart is empty.");
      return;
    }

    // Client-side validations
    const { fullName, email, phone, address, city, state, pincode, country } = shippingForm;
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim() || !country.trim()) {
      showToast("error", "Please fill in all shipping details.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("error", "Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/[\s-+]/g, ""))) {
      showToast("error", "Please enter a valid 10-digit mobile number.");
      return;
    }

    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode.trim())) {
      showToast("error", "Please enter a valid 6-digit Pincode.");
      return;
    }

    setLoading(true);
    try {
      // 1. Aggregate quantities by product ID to handle multiple sizes of the same product
      const productQuantities: { [productId: string]: { name: string; quantity: number } } = {};
      for (const item of cart) {
        const suffix = `-${item.size.toUpperCase()}`;
        const productId = item.id.endsWith(suffix) ? item.id.slice(0, -suffix.length) : item.id;
        if (!productQuantities[productId]) {
          productQuantities[productId] = { name: item.name, quantity: 0 };
        }
        productQuantities[productId].quantity += item.quantity;
      }

      const orderCollectionRef = collection(db, "orders");
      const orderRef = doc(orderCollectionRef);

      // 2. Run Firestore transaction to update stock and save order
      await runTransaction(db, async (transaction) => {
        const productRefsAndData: Array<{
          productRef: any;
          newStock: number;
          name: string;
        }> = [];

        // Read all product documents first
        for (const productId in productQuantities) {
          const { name, quantity } = productQuantities[productId];
          const productRef = doc(db, "products", productId);
          const productDoc = await transaction.get(productRef);

          if (!productDoc.exists()) {
            throw new Error(`Product "${name}" not found in database.`);
          }

          const data = productDoc.data();
          const currentStock = data.stockQuantity !== undefined
            ? Number(data.stockQuantity)
            : (data.stock !== undefined ? Number(data.stock) : 10);

          const newStock = currentStock - quantity;
          if (newStock < 0) {
            throw new Error(`Insufficient stock for "${name}". Only ${currentStock} items left.`);
          }

          productRefsAndData.push({ productRef, newStock, name });
        }

        // Perform all updates (writes) after reads
        for (const { productRef, newStock } of productRefsAndData) {
          const updateData: any = {
            stockQuantity: newStock,
            stock: newStock,
          };
          if (newStock === 0) {
            updateData.status = "Out of Stock";
          }
          transaction.update(productRef, updateData);
        }

        // Save order document within the same transaction
        const orderData = {
          userId: user?.uid || "guest",
          customerDetails: shippingForm,
          products: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            size: item.size,
            quantity: item.quantity
          })),
          totalAmount: total,
          paymentMethod: paymentMethod,
          status: "Pending",
          createdAt: serverTimestamp(),
        };

        transaction.set(orderRef, orderData);
      });

      // Clear the local cart
      localStorage.setItem("kitkart_cart", "[]");
      window.dispatchEvent(new Event("cart_updated"));

      showToast("success", "Order placed successfully! Redirecting...");
      setTimeout(() => {
        router.replace(`/checkout/success?orderId=${orderRef.id}`);
      }, 1500);

    } catch (err: any) {
      console.error("Order creation error:", err);
      showToast("error", err.message || "Failed to create order. Please try again.");
      setLoading(false);
    }
  };

  if (authLoading || !user || !loaded) {
    return (
      <div className="checkout-loader-container">
        <div className="checkout-spinner"></div>
        <style jsx>{`
          .checkout-loader-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--clr-bg);
          }
          .checkout-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid var(--clr-border);
            border-top: 3px solid var(--clr-gold);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      {/* Toast Notifications */}
      <div className="toasts-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card toast-${t.type}`}>
            {t.type === "success" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <div className="container">
        <div className="checkout-title-row">
          <Link href="/cart" className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Cart
          </Link>
          <h1 className="checkout-title">Secure Checkout</h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="checkout-grid">
          {/* Shipping Address */}
          <div className="checkout-shipping-column">
            <div className="checkout-section-card">
              <div className="section-card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <h2>Shipping Information</h2>
              </div>
              <div className="section-card-body">
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={shippingForm.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={shippingForm.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={shippingForm.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={shippingForm.address}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, street name"
                      required
                    />
                  </div>
                </div>

                <div className="form-row tripartite">
                  <div className="input-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingForm.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={shippingForm.state}
                      onChange={handleInputChange}
                      placeholder="Maharashtra"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="pincode">Pincode</label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={shippingForm.pincode}
                      onChange={handleInputChange}
                      placeholder="400001"
                      required
                    />
                  </div>
                </div>


              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="checkout-payment-column">
            <div className="checkout-section-card">
              <div className="section-card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <h2>Payment Method</h2>
              </div>
              <div className="section-card-body payment-options">
                <label className={`payment-option-label ${paymentMethod === "cod" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <div className="option-info">
                    <span className="option-title">Cash on Delivery (COD)</span>
                    <span className="option-desc">Pay with cash when your package is delivered to your doorstep.</span>
                  </div>
                </label>

                <label className={`payment-option-label disabled ${paymentMethod === "online" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    disabled
                  />
                  <div className="option-info">
                    <span className="option-title">Online Payment (UPI, Card, Netbanking)</span>
                    <span className="option-desc text-gold-dim">Online heckout integration coming soon.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button (Hidden on desktop, visible on mobile to sit under form flow) */}
            <button type="submit" disabled={loading} className="btn-place-order mobile-only">
              {loading ? <div className="btn-spinner"></div> : <span>Place Order</span>}
            </button>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="checkout-summary-column">
            <div className="sticky-summary-card">
              <h2 className="summary-card-title">Order Summary</h2>

              <div className="summary-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-item-img">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="summary-item-details">
                      <h3>{item.name}</h3>
                      <span className="summary-item-meta">Size: {item.size} • Qty: {item.quantity}</span>
                    </div>
                    <div className="summary-item-price">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-calculations">
                <div className="calc-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="calc-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span style={{ color: "var(--clr-primary, #25D366)", fontWeight: "bold" }}>FREE</span> : `₹${shipping}`}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="calc-row discount-row" style={{ color: "var(--clr-primary, #25D366)" }}>
                    <span>Discount ({couponCode})</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {/* Coupon Code Section */}
                <div style={{ margin: "16px 0", display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--clr-border)", background: "transparent", color: "var(--clr-text)" }}
                  />
                  <button
                    onClick={applyCoupon}
                    type="button"
                    style={{ padding: "10px 16px", borderRadius: "8px", background: "var(--clr-primary, #25D366)", color: "#fff", fontWeight: "bold", border: "none", cursor: "pointer" }}
                  >
                    Apply
                  </button>
                </div>

                <div className="calc-row total-row">
                  <span>Total</span>
                  <span className="total-val">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn-place-order desktop-only"
              >
                {loading ? <div className="btn-spinner"></div> : <span>Place Order • ₹{total.toLocaleString("en-IN")}</span>}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .checkout-page-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at bottom left, #161616 0%, #0b0b0b 100%);
          padding-top: 120px;
          padding-bottom: var(--sp-20);
          color: var(--clr-text);
          font-family: var(--ff-body);
        }

        /* Toasts Container */
        .toasts-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }
        .toast-card {
          display: flex;
          align-items: center;
          gap: var(--sp-3);
          padding: var(--sp-4) var(--sp-6);
          border-radius: var(--r-md);
          background: rgba(19, 19, 19, 0.9);
          backdrop-filter: blur(12px);
          color: var(--clr-text);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
          font-size: 0.9rem;
          font-weight: 500;
          pointer-events: auto;
          animation: slideInToast 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          max-width: 320px;
        }
        .toast-success {
          border: 1px solid rgba(46, 213, 115, 0.3);
          color: #2ed573;
        }
        .toast-error {
          border: 1px solid rgba(255, 71, 87, 0.3);
          color: #ff4757;
        }
        @keyframes slideInToast {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Title block */
        .checkout-title-row {
          margin-bottom: var(--sp-8);
          animation: slideInDown 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .back-link {
          font-size: 0.85rem;
          color: var(--clr-text-secondary);
          display: inline-flex;
          align-items: center;
          gap: var(--sp-2);
          margin-bottom: var(--sp-2);
          transition: color var(--t-fast);
        }
        .back-link:hover {
          color: var(--clr-gold);
        }
        .back-link svg {
          transition: transform var(--t-fast);
        }
        .back-link:hover svg {
          transform: translateX(-3px);
        }
        .checkout-title {
          font-family: var(--ff-heading);
          font-size: 2.25rem;
          font-weight: 700;
        }

        /* Grid */
        .checkout-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          grid-template-areas: 
            "shipping summary"
            "payment summary";
          gap: var(--sp-8);
          animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .checkout-shipping-column {
          grid-area: shipping;
        }

        .checkout-payment-column {
          grid-area: payment;
          display: flex;
          flex-direction: column;
          gap: var(--sp-8);
        }

        .checkout-summary-column {
          grid-area: summary;
        }

        /* Section Cards */
        .checkout-section-card {
          background: rgba(19, 19, 19, 0.65);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-lg);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(12px);
          overflow: hidden;
          margin-bottom: var(--sp-6);
        }

        .section-card-header {
          display: flex;
          align-items: center;
          gap: var(--sp-3);
          padding: var(--sp-5) var(--sp-6);
          border-bottom: 1px solid var(--clr-border);
          color: var(--clr-gold);
        }
        .section-card-header h2 {
          font-family: var(--ff-heading);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--clr-text);
          margin: 0;
        }
        .section-card-header svg {
          stroke: var(--clr-gold);
        }

        .section-card-body {
          padding: var(--sp-6);
        }

        /* Form Controls */
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sp-4);
          margin-bottom: var(--sp-4);
        }
        .form-row.tripartite {
          grid-template-columns: 1fr 1fr 1fr;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: var(--sp-2);
          margin-bottom: var(--sp-4);
        }
        .input-group:last-child {
          margin-bottom: 0;
        }
        .input-group label {
          color: var(--clr-text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .input-group input, .input-group select {
          background: var(--clr-surface);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-md);
          color: var(--clr-text);
          padding: var(--sp-3) var(--sp-4);
          font-size: 0.95rem;
          transition: all var(--t-fast);
          width: 100%;
        }
        .input-group input:focus, .input-group select:focus {
          outline: none;
          border-color: var(--clr-gold);
          box-shadow: 0 0 12px rgba(197, 160, 89, 0.15);
        }

        /* Payment Options */
        .payment-options {
          display: flex;
          flex-direction: column;
          gap: var(--sp-4);
        }
        .payment-option-label {
          display: flex;
          align-items: flex-start;
          gap: var(--sp-4);
          padding: var(--sp-5);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-md);
          background: var(--clr-surface);
          cursor: pointer;
          transition: all var(--t-fast);
        }
        .payment-option-label:hover:not(.disabled) {
          border-color: rgba(197, 160, 89, 0.4);
        }
        .payment-option-label.active {
          border-color: var(--clr-gold);
          background: rgba(197, 160, 89, 0.05);
        }
        .payment-option-label input[type="radio"] {
          margin-top: 4px;
          accent-color: var(--clr-gold);
        }
        .payment-option-label.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .option-info {
          display: flex;
          flex-direction: column;
          gap: var(--sp-1);
        }
        .option-title {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--clr-text);
        }
        .option-desc {
          font-size: 0.8rem;
          color: var(--clr-text-secondary);
          line-height: 1.4;
        }
        .text-gold-dim {
          color: var(--clr-gold) !important;
          opacity: 0.7;
        }

        /* Sticky Summary Column */
        .sticky-summary-card {
          position: sticky;
          top: 100px;
          background: rgba(19, 19, 19, 0.65);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-lg);
          padding: var(--sp-6) var(--sp-8);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(12px);
        }
        .summary-card-title {
          font-family: var(--ff-heading);
          font-size: 1.25rem;
          font-weight: 700;
          border-bottom: 1px solid var(--clr-border);
          padding-bottom: var(--sp-4);
          margin-bottom: var(--sp-4);
        }

        .summary-items-list {
          max-height: 240px;
          overflow-y: auto;
          margin-bottom: var(--sp-4);
          display: flex;
          flex-direction: column;
          gap: var(--sp-4);
        }
        .summary-item {
          display: flex;
          align-items: center;
          gap: var(--sp-4);
        }
        .summary-item-img {
          width: 50px;
          height: 50px;
          border-radius: var(--r-sm);
          overflow: hidden;
          background: var(--clr-surface);
          border: 1px solid var(--clr-border);
        }
        .summary-item-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .summary-item-details {
          flex: 1;
        }
        .summary-item-details h3 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 2px;
          color: var(--clr-text);
        }
        .summary-item-meta {
          font-size: 0.75rem;
          color: var(--clr-text-secondary);
        }
        .summary-item-price {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--clr-gold);
        }

        .summary-calculations {
          border-top: 1px solid var(--clr-border);
          padding-top: var(--sp-4);
          margin-bottom: var(--sp-6);
          display: flex;
          flex-direction: column;
          gap: var(--sp-3);
        }
        .calc-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--clr-text-secondary);
        }
        .discount-row {
          color: #2ed573;
        }
        .total-row {
          border-top: 1px solid var(--clr-border);
          padding-top: var(--sp-4);
          font-size: 1.15rem;
          color: var(--clr-text);
          font-weight: 700;
        }
        .total-val {
          color: var(--clr-gold);
        }

        .btn-place-order {
          width: 100%;
          background: var(--clr-gold);
          color: var(--clr-bg);
          font-family: var(--ff-heading);
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: var(--sp-4);
          border-radius: var(--r-full);
          transition: all var(--t-med);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(197, 160, 89, 0.2);
        }
        .btn-place-order:hover:not(:disabled) {
          background: var(--clr-gold-hover);
          box-shadow: 0 6px 20px rgba(197, 160, 89, 0.35);
          transform: translateY(-1px);
        }
        .btn-place-order:active:not(:disabled) {
          transform: translateY(1px);
        }
        .btn-place-order:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--clr-bg);
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .desktop-only { display: flex; }
        .mobile-only { display: none; }

        /* Responsive */
        @media (max-width: 992px) {
          .checkout-grid {
            grid-template-columns: 1fr;
            grid-template-areas:
              "shipping"
              "summary"
              "payment";
            gap: var(--sp-8);
          }
          .sticky-summary-card {
            position: static;
          }
          .desktop-only { display: none; }
          .mobile-only { display: flex; }
        }

        @media (max-width: 576px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          .form-row.tripartite {
            grid-template-columns: 1fr;
          }
          .checkout-title {
            font-size: 1.75rem;
          }
          .checkout-page-wrapper {
            padding-top: 100px;
          }
        }

        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
