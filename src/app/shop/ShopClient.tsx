"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
  status?: string;
  category?: string;
  createdAt?: any;
  stock?: number;
}

const getTimestamp = (createdAt: any): number => {
  if (!createdAt) return 0;
  if (typeof createdAt === 'object' && createdAt.seconds !== undefined) {
    return createdAt.seconds * 1000;
  }
  if (typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
    return createdAt.toDate().getTime();
  }
  const parsed = Date.parse(createdAt);
  if (!isNaN(parsed)) return parsed;
  return Number(createdAt) || 0;
};

const LOCAL_PRODUCTS: Product[] = [
  {
    id: "home-jersey-2024",
    name: "Home Jersey 2024",
    price: 999,
    image: "/assets/jersey1.jpg",
    badge: "New",
    category: "Football Jerseys",
    createdAt: "2024-01-01"
  },
  {
    id: "away-kit-2024",
    name: "Away Kit 2024",
    price: 999,
    image: "/assets/jersey2.jpg",
    badge: "New",
    category: "Football Jerseys",
    createdAt: "2024-01-02"
  },
  {
    id: "international-jersey-2024",
    name: "International Jersey 2024",
    price: 999,
    image: "/assets/jersey3.jpg",
    badge: "New",
    category: "Cricket Jerseys",
    createdAt: "2024-01-03"
  },
  {
    id: "training-top-2024",
    name: "Training Top 2024",
    price: 999,
    image: "/assets/jersey4.jpg",
    badge: "New",
    category: "Training Wear",
    createdAt: "2024-01-04"
  }
];

const CATEGORIES = [
  "All Products",
  "Cricket Jerseys",
  "Football Jerseys",
  "Player Jerseys",
  "Club Jerseys",
  "Football Boots"
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" }
];

export default function ShopClient() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("featured");

  const [visibleCount, setVisibleCount] = useState(12);

  // Sync category query parameter on mount/load
  useEffect(() => {
    if (categoryParam) {
      const lowerParam = categoryParam.toLowerCase();
      if (lowerParam === "jerseys") {
        setActiveCategory("Jerseys");
      } else if (lowerParam === "boots" || lowerParam === "football boots") {
        setActiveCategory("Football Boots");
      } else {
        const matched = CATEGORIES.find(
          (c) => c.toLowerCase() === lowerParam
        );
        if (matched) {
          setActiveCategory(matched);
        }
      }
    }
  }, [categoryParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fbProducts: any[] = [];
        querySnapshot.forEach((docSnap) => {
          fbProducts.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Merge keeping local products first, updating them with Firebase data if exists
        const merged = LOCAL_PRODUCTS.map(lp => {
          const fp = fbProducts.find(f => f.id === lp.id);
          if (fp) {
            return {
              ...lp,
              price: typeof fp.price === 'string' ? parseFloat(fp.price) : fp.price,
              image: fp.mainImage || fp.image || lp.image,
              badge: fp.badge || fp.tag || lp.badge || "",
              category: fp.category || lp.category,
              createdAt: fp.createdAt || lp.createdAt || Date.now(),
              stock: fp.stock !== undefined ? Number(fp.stock) : 10,
              status: fp.status || "In Stock"
            };
          }
          return {
            ...lp,
            stock: 10,
            status: "In Stock"
          };
        });

        fbProducts.forEach((fp) => {
          if (fp.status === "Draft") return;
          if (!merged.some((lp) => lp.id === fp.id)) {
            merged.push({
              id: fp.id,
              name: fp.name,
              price: typeof fp.price === "string" ? parseFloat(fp.price) : fp.price,
              image: fp.mainImage || fp.image,
              badge: fp.badge || fp.tag || "",
              category: fp.category || "Uncategorized",
              createdAt: fp.createdAt || Date.now(),
              stock: fp.stock !== undefined ? Number(fp.stock) : 10,
              status: fp.status || "In Stock"
            });
          }
        });

        // Sort descending (newest first)
        merged.sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt));

        setProducts(merged);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        // Fallback to local products on error
        setProducts([...LOCAL_PRODUCTS]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuickAdd = (
    e: React.MouseEvent,
    product: { id: string; name: string; price: number; image: string; stock?: number; status?: string }
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const isOutOfStock = product.stock !== undefined ? (product.stock <= 0 || product.status === "Out of Stock") : false;
    if (isOutOfStock) return;

    const cart = JSON.parse(localStorage.getItem("kitkart_cart") || "[]");
    const existingIndex = cart.findIndex((cItem: any) => cItem.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1, size: "M" });
    }

    localStorage.setItem("kitkart_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart_updated"));

    const svg = (e.currentTarget as HTMLElement).querySelector("svg");
    if (svg) {
      const originalStroke = svg.style.stroke || "";
      svg.style.stroke = "var(--clr-gold)";
      setTimeout(() => {
        svg.style.stroke = originalStroke;
      }, 1000);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "All Products") {
      const lowerActive = activeCategory.toLowerCase();
      if (lowerActive === "jerseys") {
        result = result.filter(
          (p) => p.category?.toLowerCase().includes("jersey")
        );
      } else if (lowerActive === "football boots" || lowerActive === "boots") {
        result = result.filter(
          (p) => p.category?.toLowerCase().includes("boot")
        );
      } else {
        result = result.filter(
          (p) => p.category?.toLowerCase() === lowerActive
        );
      }
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(lowerQuery));
    }

    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt));
        break;
      case "featured":
      default:
        // Keep merged order
        break;
    }

    return result;
  }, [products, activeCategory, searchQuery, sortOption]);

  const visibleProducts = filteredAndSortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedProducts.length;

  return (
    <main>
      {/* Hero Section */}
      <section className="shop-hero">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="current">Shop</span>
        </div>
        <h1 className="shop-title">Premium Sports Jerseys & Fan Merchandise</h1>
        <p className="shop-subtitle">
          Explore authentic cricket, football, basketball, volleyball, badminton, esports, and custom team jerseys. Shop premium-quality sports apparel with fast delivery across India.
        </p>
      </section>

      <section className="shop-controls">
        <div className="filters-bar">
          <div className="category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`pill-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory(cat);
                  setVisibleCount(12);
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-sort-group">
            <div className="search-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="shop-results-meta">
          <span>Showing {visibleProducts.length} of {filteredAndSortedProducts.length} products</span>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="product-card skeleton" style={{ animation: 'pulse 1.5s infinite' }}>
                <div className="product-img-wrapper" style={{ background: 'var(--clr-border)' }}></div>
                <div className="product-meta">
                  <div style={{ background: 'var(--clr-border)', height: '20px', width: '70%', borderRadius: '4px' }}></div>
                  <div style={{ background: 'var(--clr-border)', height: '20px', width: '40px', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria.</p>
            <button
              className="btn-secondary"
              style={{ marginTop: 'var(--sp-4)' }}
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All Products");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {visibleProducts.map((product) => {
              const isOutOfStock = product.stock !== undefined ? (product.stock <= 0 || product.status === "Out of Stock") : false;
              return (
                <Link href={`/product/${product.id}`} className="product-card" key={product.id}>
                  <div className="product-img-wrapper">
                    {isOutOfStock ? (
                      <span className="product-badge" style={{ backgroundColor: '#ff4757', color: '#fff' }}>Out of Stock</span>
                    ) : (
                      product.badge && <span className="product-badge">{product.badge}</span>
                    )}
                    <Image
                      src={product.image || "/assets/jersey1.jpg"}
                      alt={product.name}
                      width={400}
                      height={500}
                      className="product-img"
                    />
                  </div>
                  <div className="product-meta">
                    <div>
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-category" style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)', marginBottom: '4px' }}>
                        {product.category || "Uncategorized"}
                      </p>
                      <div className="product-price">₹{product.price.toLocaleString("en-IN")}</div>
                    </div>
                    <button
                      className="quick-add-btn"
                      style={isOutOfStock ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                      onClick={(e) => {
                        if (isOutOfStock) {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }
                        handleQuickAdd(e, product);
                      }}
                      disabled={isOutOfStock}
                      aria-label="Quick Add to Cart"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && hasMore && (
          <div className="load-more-container">
            <button
              className="btn-secondary"
              onClick={() => setVisibleCount((prev) => prev + 12)}
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
