"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || searchParams.get("order_id");

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
          Thank you for shopping with KitKart. Order details have been sent to your email address. Your premium jerseys will be dispatched shortly.
        </p>

        <div className="order-details-grid">
          <div className="detail-item">
            <span className="detail-label">Order ID</span>
            <span className="detail-value">{orderDetails?.order_id ? `#${orderDetails.order_id}` : (orderId || "N/A")}</span>
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
        {/* Cancellation Highlight Card */}
        <div className="cancel-info-card">
          <div className="cancel-info-content">
            <span className="cancel-info-badge">Order Cancellation</span>
            <p className="cancel-info-text">
              If you wish to <strong>Cancel your order</strong>, Please contact us on WhatsApp within <strong>12 hours</strong> to cancel it. Further your Partial COD Amount will not be refunded.
            </p>
          </div>
          <a
            href={`https://wa.me/918849376973?text=${encodeURIComponent(`Hi KitKart, I wish to cancel my order: ${orderDetails?.order_id ? `#${orderDetails.order_id}` : (orderId || '')}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-cancel"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
            <span>Cancel Order</span>
          </a>
        </div>

        <p className="success-subtext">
          Status of product will be shortly updated on website. Please check Order Status by clicking on <Link href="/account/orders"><strong>View My Orders</strong></Link> button. Confirmation Mail has been sent to your registered Email ID.
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

        .cancel-info-card {
          width: 100%;
          background: rgba(245, 158, 11, 0.07);
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: var(--r-md);
          padding: var(--sp-4) var(--sp-5);
          margin-bottom: var(--sp-6);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--sp-3);
          text-align: center;
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.08);
        }

        .cancel-info-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .cancel-info-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.15);
          padding: 3px 12px;
          border-radius: var(--r-full);
          border: 1px solid rgba(245, 158, 11, 0.35);
        }

        .cancel-info-text {
          font-size: 0.92rem;
          color: var(--clr-text);
          line-height: 1.5;
          margin: 0;
        }

        .cancel-info-text strong {
          color: #fbbf24;
        }

        .btn-whatsapp-cancel {
          display: inline-flex;
          align-items: center;
          gap: var(--sp-2);
          background: #dc2626;
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 8px 20px;
          border-radius: var(--r-full);
          text-decoration: none;
          transition: all var(--t-med);
          box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
        }

        .btn-whatsapp-cancel svg {
          width: 16px;
          height: 16px;
        }

        .btn-whatsapp-cancel:hover {
          background: #b91c1c;
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(220, 38, 38, 0.5);
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
