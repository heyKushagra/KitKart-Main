"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

export default function Account() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in memory to avoid needing a composite index
        fetched.sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        setRecentOrders(fetched.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch recent orders", err);
      } finally {
        setOrdersLoading(false);
      }
    };
    if (user && !loading) {
      fetchRecentOrders();
    }
  }, [user, loading]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Get Initials for Profile Avatar
  const getInitials = () => {
    if (!user || !user.displayName) return "U";
    const parts = user.displayName.split(" ");
    return parts.map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

  // Format Account Creation Date
  const getJoinedDate = () => {
    if (!user || !user.metadata.creationTime) return "N/A";
    const date = new Date(user.metadata.creationTime);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading || !user) {
    return (
      <div className="account-loader-container">
        <div className="account-spinner"></div>
        <style jsx>{`
          .account-loader-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--clr-bg);
          }
          .account-spinner {
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
    <div className="account-page-wrapper">
      <div className="container">
        {/* Welcome Section */}
        <div className="account-header">
          <div className="avatar-wrapper">
            <div className="avatar-circle">{getInitials()}</div>
          </div>
          <div className="header-text">
            <span className="welcome-label">Welcome back,</span>
            <h1 className="user-name">{user.displayName || "Fan"}</h1>
            <p className="joined-date">Member since {getJoinedDate()}</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="account-grid">
          {/* Left Column: Account Details & Settings */}
          <div className="left-column">
            {/* Account Info Card */}
            <div className="dashboard-card info-card">
              <div className="card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <h2>Personal Details</h2>
              </div>
              <div className="card-body">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user.displayName || "Not Specified"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mobile Number</span>
                  <span className="info-value text-muted">Not Added (Placeholder)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Settings Card */}
            <div className="dashboard-card actions-card">
              <div className="card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <h2>Account Settings</h2>
              </div>
              <div className="card-body action-list">
                <button className="action-row" disabled>
                  <span>Edit Profile Details</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button className="action-row" disabled>
                  <span>Change Password</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button className="action-row" disabled>
                  <span>Notification Preferences</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button onClick={handleLogout} className="action-row logout-row">
                  <span>Sign Out of Account</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order History & Addresses */}
          <div className="right-column">
            {/* Recent Orders Card */}
            <div className="dashboard-card orders-card">
              <div className="card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <h2>Recent Orders</h2>
              </div>
              <div className="card-body">
                {ordersLoading ? (
                  <div className="recent-orders-loader">Loading...</div>
                ) : recentOrders.length === 0 ? (
                  <div className="empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <h3>No Orders Yet</h3>
                    <p>Looks like you haven't bought any premium jerseys yet.</p>
                    <Link href="/shop" className="btn-start-shopping">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="recent-orders-list">
                    {recentOrders.map((order) => {
                      const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A";
                      return (
                        <div key={order.id} className="recent-order-item">
                          <div className="recent-order-info">
                            <span className="recent-order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                            <span className="recent-order-date">{date}</span>
                          </div>
                          <div className="recent-order-meta">
                            <span className="recent-order-price">₹{order.totalAmount?.toLocaleString("en-IN") || "0"}</span>
                            <span className="recent-order-status" style={{ color: order.status === 'Delivered' ? '#2ed573' : 'var(--clr-gold)' }}>{order.status}</span>
                          </div>
                        </div>
                      );
                    })}
                    <Link href="/account/orders" className="btn-view-all-orders">
                      View All Orders
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Addresses Card */}
            <div className="dashboard-card address-card">
              <div className="card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <h2>Saved Addresses</h2>
              </div>
              <div className="card-body address-body">
                <div className="address-placeholder">
                  <p className="placeholder-title">No Saved Addresses</p>
                  <p className="placeholder-desc">Add a shipping address for faster and smoother checkouts.</p>
                  <button className="btn-add-address" disabled>+ Add Shipping Address</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .account-page-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at top right, #161616 0%, #0b0b0b 100%);
          padding-top: 120px;
          padding-bottom: var(--sp-20);
          color: var(--clr-text);
          font-family: var(--ff-body);
        }

        /* Header Welcome Styles */
        .account-header {
          display: flex;
          align-items: center;
          gap: var(--sp-6);
          margin-bottom: var(--sp-12);
          animation: slideInDown 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .avatar-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--clr-gold);
          color: var(--clr-bg);
          font-family: var(--ff-heading);
          font-size: 2rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(197, 160, 89, 0.3);
        }

        .header-text {
          display: flex;
          flex-direction: column;
        }

        .welcome-label {
          font-size: 0.9rem;
          color: var(--clr-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .user-name {
          font-family: var(--ff-heading);
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--clr-text);
          margin-bottom: var(--sp-1);
        }

        .joined-date {
          font-size: 0.85rem;
          color: var(--clr-text-muted);
        }

        /* Dashboard Grid Layout */
        .account-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: var(--sp-8);
          animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .left-column, .right-column {
          display: flex;
          flex-direction: column;
          gap: var(--sp-8);
        }

        /* Card System */
        .dashboard-card {
          background: rgba(19, 19, 19, 0.65);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-lg);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(12px);
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: var(--sp-3);
          padding: var(--sp-5) var(--sp-6);
          border-bottom: 1px solid var(--clr-border);
          color: var(--clr-gold);
        }

        .card-header h2 {
          font-family: var(--ff-heading);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--clr-text);
          margin: 0;
        }

        .card-header svg {
          stroke: var(--clr-gold);
        }

        .card-body {
          padding: var(--sp-6);
        }

        /* Account Info Details */
        .info-item {
          display: flex;
          flex-direction: column;
          gap: var(--sp-1);
          margin-bottom: var(--sp-4);
        }
        .info-item:last-child {
          margin-bottom: 0;
        }

        .info-label {
          font-size: 0.75rem;
          color: var(--clr-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .info-value {
          font-size: 1rem;
          color: var(--clr-text);
          font-weight: 500;
        }

        /* Settings Action List */
        .action-list {
          display: flex;
          flex-direction: column;
          gap: var(--sp-2);
          padding: var(--sp-4) var(--sp-6);
        }

        .action-row {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--sp-3) 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          color: var(--clr-text);
          font-size: 0.95rem;
          transition: all var(--t-fast);
          text-align: left;
        }
        .action-row:last-child {
          border-bottom: none;
        }
        .action-row:hover:not(:disabled) {
          color: var(--clr-gold);
          transform: translateX(3px);
        }
        .action-row:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .logout-row {
          color: #ff4757;
        }
        .logout-row:hover {
          color: #ff6b81 !important;
        }

        /* Recent Orders - Empty state styling */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--sp-12) var(--sp-6);
          color: var(--clr-text-secondary);
        }
        .empty-state svg {
          stroke: var(--clr-text-muted);
          margin-bottom: var(--sp-4);
        }
        .empty-state h3 {
          font-family: var(--ff-heading);
          color: var(--clr-text);
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: var(--sp-1);
        }
        .empty-state p {
          font-size: 0.85rem;
          max-width: 280px;
          line-height: 1.4;
          margin-bottom: var(--sp-4);
        }
        .btn-start-shopping {
          display: inline-block;
          background: var(--clr-gold);
          color: var(--clr-bg);
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: var(--sp-2) var(--sp-6);
          border-radius: var(--r-full);
          text-decoration: none;
          transition: all var(--t-fast);
        }
        .btn-start-shopping:hover {
          background: var(--clr-gold-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(197, 160, 89, 0.3);
        }

        /* Recent Orders List Styling */
        .recent-orders-loader {
          text-align: center;
          padding: var(--sp-8);
          color: var(--clr-text-secondary);
          font-size: 0.9rem;
        }
        .recent-orders-list {
          display: flex;
          flex-direction: column;
        }
        .recent-order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--sp-4) 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .recent-order-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .recent-order-id {
          font-family: monospace;
          font-weight: 600;
          color: var(--clr-text);
          font-size: 0.95rem;
        }
        .recent-order-date {
          font-size: 0.75rem;
          color: var(--clr-text-secondary);
        }
        .recent-order-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .recent-order-price {
          font-weight: 600;
          color: var(--clr-text);
          font-size: 0.95rem;
        }
        .recent-order-status {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .btn-view-all-orders {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--sp-2);
          margin-top: var(--sp-4);
          padding: var(--sp-3);
          background: rgba(197, 160, 89, 0.1);
          color: var(--clr-gold);
          border-radius: var(--r-md);
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all var(--t-fast);
          text-decoration: none;
        }
        .btn-view-all-orders:hover {
          background: rgba(197, 160, 89, 0.2);
        }
        .btn-view-all-orders svg {
          transition: transform var(--t-fast);
        }
        .btn-view-all-orders:hover svg {
          transform: translateX(3px);
        }

        /* Address list styling */
        .address-placeholder {
          text-align: center;
          padding: var(--sp-6) var(--sp-4);
          color: var(--clr-text-secondary);
        }
        .placeholder-title {
          font-weight: 600;
          color: var(--clr-text);
          font-size: 0.95rem;
          margin-bottom: var(--sp-1);
        }
        .placeholder-desc {
          font-size: 0.8rem;
          line-height: 1.4;
          margin-bottom: var(--sp-4);
        }
        .btn-add-address {
          background: none;
          border: 1px dashed var(--clr-border);
          border-radius: var(--r-md);
          color: var(--clr-gold);
          padding: var(--sp-2) var(--sp-4);
          font-size: 0.85rem;
          font-weight: 600;
          transition: all var(--t-fast);
        }
        .btn-add-address:hover:not(:disabled) {
          border-color: var(--clr-gold);
          background: rgba(197, 160, 89, 0.05);
        }
        .btn-add-address:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .account-grid {
            grid-template-columns: 1fr;
            gap: var(--sp-8);
          }
        }

        @media (max-width: 576px) {
          .account-header {
            flex-direction: column;
            text-align: center;
            gap: var(--sp-4);
          }
          .user-name {
            font-size: 2rem;
          }
          .account-page-wrapper {
            padding-top: 100px;
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
