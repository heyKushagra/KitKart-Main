"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";

interface OrderProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: Timestamp;
  products: OrderProduct[];
  subtotal?: number;
  discount?: string | number;
  discountName?: string;
  discountValue?: number;
  discountAmount?: number;
  couponCode?: string;
}

export default function MyOrders() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Expanded order details state
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/account/orders");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("userId", "==", user.uid)
        );
        
        const snapshot = await getDocs(q);
        const fetchedOrders: Order[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        
        // Sort in memory to avoid needing a composite index
        fetchedOrders.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const handleToggleDetails = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "#f39c12";
      case "processing": return "#3498db";
      case "shipped": return "#9b59b6";
      case "delivered": return "#2ed573";
      case "cancelled": return "#e74c3c";
      default: return "#95a5a6";
    }
  };

  const getEstimatedDelivery = (date: Date) => {
    const estDate = new Date(date);
    estDate.setDate(estDate.getDate() + 5);
    return estDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  if (authLoading || loading) {
    return (
      <div className="orders-loader-container">
        <div className="orders-spinner"></div>
        <style jsx>{`
          .orders-loader-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--clr-bg);
          }
          .orders-spinner {
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
    <div className="orders-page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="orders-header">
          <Link href="/account" className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Account
          </Link>
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">Track, manage, and view your premium kit purchases.</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h2>No Orders Yet</h2>
            <p>Looks like you haven't bought any premium jerseys yet. Explore our latest collection.</p>
            <Link href="/shop" className="btn-continue-shopping">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Filters and Search */}
            <div className="orders-controls">
              <div className="search-bar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search by Order ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="status-filter">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="no-results">
                <p>No orders match your search or filter criteria.</p>
                <button onClick={() => { setSearchTerm(""); setStatusFilter("All"); }} className="btn-clear">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
                  const dateString = orderDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                  const timeString = orderDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={order.id} className={`order-card ${isExpanded ? 'expanded' : ''}`}>
                      <div className="order-summary" onClick={() => handleToggleDetails(order.id)}>
                        <div className="order-info-grid">
                          <div className="info-block id-block">
                            <span className="block-label">Order ID</span>
                            <span className="block-value id-value">#{order.id.slice(0, 8).toUpperCase()}...</span>
                          </div>
                          
                          <div className="info-block date-block">
                            <span className="block-label">Date Placed</span>
                            <span className="block-value">{dateString}</span>
                          </div>

                          <div className="info-block total-block">
                            <span className="block-label">Total Amount</span>
                            <span className="block-value price">₹{order.totalAmount.toLocaleString("en-IN")}</span>
                          </div>

                          <div className="info-block status-block">
                            <span className="block-label">Status</span>
                            <div className="status-badge" style={{ borderColor: getStatusColor(order.status), color: getStatusColor(order.status), backgroundColor: `${getStatusColor(order.status)}15` }}>
                              {order.status}
                            </div>
                          </div>
                        </div>

                        <div className="expand-indicator">
                          <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </div>

                      {/* Expanded Order Details */}
                      <div className="order-details-drawer">
                        <div className="drawer-inner">
                          <div className="drawer-header">
                            <div className="meta-info">
                              <p><strong>Order Placed:</strong> {dateString} at {timeString}</p>
                              <p><strong>Payment Method:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                              <p><strong>Estimated Delivery:</strong> {getEstimatedDelivery(orderDate)}</p>
                            </div>
                            <div className="meta-actions">
                              {/* Future feature: Invoice download */}
                              <button className="btn-secondary" disabled>Download Invoice</button>
                            </div>
                          </div>
                          
                          <div className="products-list">
                            <h4 className="products-title">Items in this order</h4>
                            {order.products?.map((product, idx) => (
                              <div key={`${product.id}-${idx}`} className="product-item">
                                <div className="product-img">
                                  <img src={product.image} alt={product.name} />
                                </div>
                                <div className="product-info">
                                  <h5>{product.name}</h5>
                                  <div className="product-meta">
                                    <span>Size: {product.size}</span>
                                    <span>Qty: {product.quantity} × ₹{product.price.toLocaleString("en-IN")}</span>
                                  </div>
                                </div>
                                <div className="product-price">
                                  ₹{(product.price * product.quantity).toLocaleString("en-IN")}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {(() => {
                            const subtotal = order.subtotal !== undefined ? order.subtotal : (order.products?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0);
                            const discountName = order.discountName || order.couponCode || (typeof order.discount === "string" ? order.discount : "");
                            const discount = order.discountValue !== undefined ? order.discountValue : (order.discountAmount !== undefined ? order.discountAmount : (typeof order.discount === "number" ? order.discount : Math.max(0, subtotal - order.totalAmount)));
                            return (
                              <div className="order-totals">
                                <div className="total-row">
                                  <span>Subtotal</span>
                                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                                </div>
                                {discount > 0 && (
                                  <div className="total-row discount-row" style={{ color: "var(--clr-primary, #25D366)" }}>
                                    <span>Discount Applied {discountName ? `(${discountName})` : ""}</span>
                                    <span>- ₹{discount.toLocaleString("en-IN")}</span>
                                  </div>
                                )}
                                <div className="total-row">
                                  <span>Shipping</span>
                                  <span style={{ color: "var(--clr-primary, #25D366)", fontWeight: "bold" }}>FREE</span>
                                </div>
                                <div className="total-row grand-total">
                                  <span>Grand Total</span>
                                  <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .orders-page-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at top left, #161616 0%, #0b0b0b 100%);
          padding-top: 120px;
          padding-bottom: var(--sp-20);
          color: var(--clr-text);
          font-family: var(--ff-body);
        }

        /* Header */
        .orders-header {
          margin-bottom: var(--sp-8);
          animation: slideInDown 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .back-link {
          font-size: 0.85rem;
          color: var(--clr-text-secondary);
          display: inline-flex;
          align-items: center;
          gap: var(--sp-2);
          margin-bottom: var(--sp-4);
          transition: color var(--t-fast);
        }
        .back-link:hover {
          color: var(--clr-gold);
        }
        .orders-title {
          font-family: var(--ff-heading);
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--clr-text);
          margin-bottom: var(--sp-2);
        }
        .orders-subtitle {
          color: var(--clr-text-secondary);
          font-size: 1rem;
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--sp-16) var(--sp-6);
          background: rgba(19, 19, 19, 0.5);
          border: 1px dashed var(--clr-border);
          border-radius: var(--r-lg);
          animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .empty-state svg {
          stroke: var(--clr-text-muted);
          margin-bottom: var(--sp-6);
        }
        .empty-state h2 {
          font-family: var(--ff-heading);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: var(--sp-2);
        }
        .empty-state p {
          color: var(--clr-text-secondary);
          margin-bottom: var(--sp-8);
          max-width: 400px;
          line-height: 1.5;
        }
        .btn-continue-shopping {
          background: var(--clr-gold);
          color: var(--clr-bg);
          font-family: var(--ff-heading);
          font-weight: 700;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: var(--sp-3) var(--sp-8);
          border-radius: var(--r-full);
          transition: all var(--t-med);
          box-shadow: 0 4px 14px rgba(197, 160, 89, 0.2);
        }
        .btn-continue-shopping:hover {
          background: var(--clr-gold-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(197, 160, 89, 0.35);
        }

        /* Controls: Search & Filter */
        .orders-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--sp-4);
          margin-bottom: var(--sp-8);
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .search-bar {
          position: relative;
          flex: 1;
          max-width: 400px;
        }
        .search-bar svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--clr-text-muted);
        }
        .search-bar input {
          width: 100%;
          background: rgba(19, 19, 19, 0.8);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-md);
          padding: var(--sp-3) var(--sp-4) var(--sp-3) 42px;
          color: var(--clr-text);
          font-size: 0.95rem;
          transition: all var(--t-fast);
        }
        .search-bar input:focus {
          outline: none;
          border-color: var(--clr-gold);
          box-shadow: 0 0 0 2px rgba(197, 160, 89, 0.1);
        }
        .status-filter select {
          background: rgba(19, 19, 19, 0.8);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-md);
          padding: var(--sp-3) var(--sp-8) var(--sp-3) var(--sp-4);
          color: var(--clr-text);
          font-size: 0.95rem;
          appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }
        .status-filter select:focus {
          outline: none;
          border-color: var(--clr-gold);
        }

        /* Orders List */
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: var(--sp-4);
          animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .no-results {
          padding: var(--sp-12);
          text-align: center;
          color: var(--clr-text-secondary);
          background: rgba(19, 19, 19, 0.5);
          border-radius: var(--r-lg);
          border: 1px solid var(--clr-border);
        }
        .btn-clear {
          background: transparent;
          color: var(--clr-gold);
          border: 1px solid var(--clr-gold);
          padding: var(--sp-2) var(--sp-6);
          border-radius: var(--r-md);
          margin-top: var(--sp-4);
          transition: all var(--t-fast);
        }
        .btn-clear:hover {
          background: rgba(197, 160, 89, 0.1);
        }

        /* Order Card */
        .order-card {
          background: rgba(19, 19, 19, 0.65);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-lg);
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        .order-card:hover {
          border-color: rgba(197, 160, 89, 0.4);
        }
        .order-card.expanded {
          border-color: var(--clr-gold);
          box-shadow: 0 8px 32px rgba(197, 160, 89, 0.15);
        }

        .order-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--sp-5) var(--sp-6);
          cursor: pointer;
          background: transparent;
          transition: background 0.3s ease;
        }
        .order-summary:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .order-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--sp-6);
          flex: 1;
        }

        .info-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .block-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--clr-text-secondary);
        }
        .block-value {
          font-size: 0.95rem;
          color: var(--clr-text);
          font-weight: 500;
        }
        .id-value {
          font-family: monospace;
          color: var(--clr-gold);
          font-size: 1rem;
        }
        .price {
          font-weight: 700;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 12px;
          border-radius: var(--r-full);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid;
          width: fit-content;
        }

        .expand-indicator {
          display: flex;
          align-items: center;
          gap: var(--sp-2);
          color: var(--clr-text-secondary);
          font-size: 0.85rem;
          padding-left: var(--sp-6);
        }

        /* Order Details Drawer */
        .order-details-drawer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0, 1, 0, 1);
        }
        .order-card.expanded .order-details-drawer {
          max-height: 2000px;
          transition: max-height 0.6s ease-in-out;
        }
        
        .drawer-inner {
          padding: 0 var(--sp-6) var(--sp-6);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: var(--sp-2);
          padding-top: var(--sp-6);
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--sp-6);
          padding-bottom: var(--sp-6);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .meta-info p {
          font-size: 0.85rem;
          color: var(--clr-text-secondary);
          margin-bottom: 4px;
        }
        .meta-info strong {
          color: var(--clr-text);
          font-weight: 500;
        }
        
        .btn-secondary {
          background: transparent;
          border: 1px solid var(--clr-border);
          color: var(--clr-text);
          padding: var(--sp-2) var(--sp-4);
          border-radius: var(--r-sm);
          font-size: 0.8rem;
          transition: all var(--t-fast);
        }
        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .products-title {
          font-size: 1.05rem;
          font-family: var(--ff-heading);
          margin-bottom: var(--sp-4);
          color: var(--clr-text);
        }
        
        .products-list {
          display: flex;
          flex-direction: column;
          gap: var(--sp-4);
          margin-bottom: var(--sp-6);
        }
        
        .product-item {
          display: flex;
          align-items: center;
          gap: var(--sp-4);
          background: rgba(0, 0, 0, 0.2);
          padding: var(--sp-3);
          border-radius: var(--r-md);
          border: 1px solid transparent;
        }
        .product-item:hover {
          border-color: rgba(255, 255, 255, 0.05);
        }
        
        .product-img {
          width: 60px;
          height: 60px;
          border-radius: var(--r-sm);
          overflow: hidden;
          background: var(--clr-surface);
        }
        .product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .product-info {
          flex: 1;
        }
        .product-info h5 {
          font-size: 0.95rem;
          margin-bottom: 2px;
        }
        .product-meta {
          font-size: 0.8rem;
          color: var(--clr-text-secondary);
          display: flex;
          gap: var(--sp-3);
        }
        
        .product-price {
          font-weight: 600;
          color: var(--clr-gold);
        }

        .order-totals {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: var(--sp-4);
          display: flex;
          flex-direction: column;
          gap: var(--sp-2);
          align-items: flex-end;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 250px;
          font-size: 0.9rem;
          color: var(--clr-text-secondary);
        }
        .grand-total {
          font-size: 1.1rem;
          color: var(--clr-text);
          font-weight: 700;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: var(--sp-2);
          margin-top: var(--sp-2);
        }
        .grand-total span:last-child {
          color: var(--clr-gold);
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .order-info-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--sp-4);
          }
        }

        @media (max-width: 576px) {
          .orders-controls {
            flex-direction: column;
            align-items: stretch;
          }
          .search-bar {
            max-width: 100%;
          }
          .order-summary {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--sp-4);
          }
          .order-info-grid {
            grid-template-columns: 1fr;
            width: 100%;
          }
          .expand-indicator {
            padding-left: 0;
            width: 100%;
            justify-content: center;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: var(--sp-3);
          }
          .drawer-header {
            flex-direction: column;
            gap: var(--sp-4);
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
      `}</style>
    </div>
  );
}
