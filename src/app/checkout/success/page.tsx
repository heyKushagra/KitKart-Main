"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          setOrderDetails(orderSnap.data());
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const orderDate = orderDetails?.createdAt?.toDate
    ? orderDetails.createdAt.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const estimatedDeliveryString = estimatedDelivery.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const paymentMethod = orderDetails?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment';

  return (
    <div className="success-container">
      <div className="success-card">
        {/* Animated Checkmark */}
        <div className="success-checkmark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="success-title">Order Placed Successfully!</h1>
        <p className="success-text">
          Thank you for shopping with KitKart. Your premium jerseys will be crafted and dispatched shortly.
        </p>

        <div className="order-details-grid">
          <div className="detail-item">
            <span className="detail-label">Order ID</span>
            <span className="detail-value">{orderId || "N/A"}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Order Date</span>
            <span className="detail-value">{loading ? "..." : orderDate}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Payment Method</span>
            <span className="detail-value">{loading ? "..." : paymentMethod}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estimated Delivery</span>
            <span className="detail-value">{estimatedDeliveryString}</span>
          </div>
        </div>

        <p className="success-subtext">
          Details of product will be shortly updated on website. Please check Order Status by clicking on <Link href="/account/orders">View My Orders</Link> button.
        </p>

        <div className="action-buttons">
          <Link href="/shop" className="btn-continue-shopping">
            Continue Shopping
          </Link>
          <Link href="/account/orders" className="btn-view-orders">
            View My Orders
          </Link>
        </div>
      </div>

      <style jsx>{`
        .success-container {
          min-height: 100vh;
          background: radial-gradient(circle at center, #161616 0%, #0b0b0b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px var(--sp-4) 60px;
          color: var(--clr-text);
          font-family: var(--ff-body);
        }

        .success-card {
          width: 100%;
          max-width: 600px;
          background: rgba(19, 19, 19, 0.65);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-lg);
          padding: var(--sp-10) var(--sp-8);
          box-shadow: 0 16px 64px rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(16px);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* Checkmark Animation */
        .success-checkmark {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(46, 213, 115, 0.1);
          border: 2px solid #2ed573;
          color: #2ed573;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--sp-6);
          box-shadow: 0 0 20px rgba(46, 213, 115, 0.2);
          animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .success-checkmark svg {
          width: 36px;
          height: 36px;
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: drawCheck 0.3s ease-out 0.3s forwards;
        }

        .success-title {
          font-family: var(--ff-heading);
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: var(--sp-3);
          color: var(--clr-gold);
        }

        .success-text {
          color: var(--clr-text-secondary);
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: var(--sp-8);
        }

        .order-details-grid {
          background: var(--clr-surface);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-md);
          padding: var(--sp-6) var(--sp-8);
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sp-6);
          margin-bottom: var(--sp-8);
          text-align: left;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: var(--sp-1);
        }
        
        .detail-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--clr-text-muted);
        }
        
        .detail-value {
          font-family: var(--ff-heading);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--clr-text);
        }

        .success-subtext {
          font-size: 0.9rem;
          color: var(--clr-text-muted);
          line-height: 1.5;
          margin-bottom: var(--sp-8);
          max-width: 480px;
        }
        
        .action-buttons {
          display: flex;
          gap: var(--sp-4);
          width: 100%;
        }

        .btn-continue-shopping, .btn-view-orders {
          flex: 1;
          font-family: var(--ff-heading);
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: var(--sp-4);
          border-radius: var(--r-full);
          transition: all var(--t-med);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        
        .btn-continue-shopping {
          background: var(--clr-gold);
          color: var(--clr-bg);
          box-shadow: 0 4px 14px rgba(197, 160, 89, 0.2);
        }
        
        .btn-continue-shopping:hover {
          background: var(--clr-gold-hover);
          box-shadow: 0 6px 20px rgba(197, 160, 89, 0.35);
          transform: translateY(-1px);
        }
        
        .btn-view-orders {
          background: transparent;
          color: var(--clr-text);
          border: 1px solid var(--clr-border);
        }
        
        .btn-view-orders:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--clr-text-secondary);
          transform: translateY(-1px);
        }

        .btn-continue-shopping:active, .btn-view-orders:active {
          transform: translateY(1px);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        
        @media (max-width: 600px) {
          .order-details-grid {
            grid-template-columns: 1fr;
            gap: var(--sp-4);
            padding: var(--sp-5);
          }
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default function Success() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--clr-bg)" }}>
        <div style={{ width: "48px", height: "48px", border: "3px solid var(--clr-border)", borderTop: "3px solid var(--clr-gold)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
