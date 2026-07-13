"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const LOCAL_PRODUCTS = [
  {
    id: "home-jersey-2024",
    name: "Home Jersey 2024",
    price: 999,
    image: "/assets/jersey1.jpg",
  },
  {
    id: "away-kit-2024",
    name: "Away Kit 2024",
    price: 999,
    image: "/assets/jersey2.jpg",
  },
  {
    id: "international-jersey-2024",
    name: "International Jersey 2024",
    price: 999,
    image: "/assets/jersey3.jpg",
  },
  {
    id: "training-top-2024",
    name: "Training Top 2024",
    price: 999,
    image: "/assets/jersey4.jpg",
  }
];

function ProductContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const pathId = pathname.split('/').pop() || "";

  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isHomeHovered, setIsHomeHovered] = useState(false);

  const local = LOCAL_PRODUCTS.find(p => p.id === pathId);
  const [productData, setProductData] = useState({
    name: searchParams.get("name") || (local ? local.name : "Loading..."),
    price: searchParams.get("price") || (local ? local.price.toString() : "0"),
    image: searchParams.get("image") || (local ? local.image : ""),
    optionalImages: [] as string[],
    id: searchParams.get("id") || pathId || (local ? local.id : "kitkart-premium-jersey"),
    stock: 10,
    status: "In Stock",
    category: "",
    description: "",
    sizes: [] as string[],
    contactForPrice: searchParams.get("contactForPrice") === "true"
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!pathId) return;

      const local = LOCAL_PRODUCTS.find(p => p.id === pathId);
      const initialData = {
        id: pathId,
        name: searchParams.get("name") || (local ? local.name : "Loading..."),
        price: searchParams.get("price") || (local ? local.price.toString() : "0"),
        image: searchParams.get("image") || (local ? local.image : ""),
        optionalImages: [] as string[],
        stock: 10,
        status: "In Stock",
        category: "",
        description: "",
        sizes: [] as string[],
        contactForPrice: searchParams.get("contactForPrice") === "true"
      };

      try {
        const docRef = doc(db, "products", pathId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProductData({
            id: docSnap.id,
            name: data.name || initialData.name,
            price: data.price?.toString() || initialData.price,
            image: data.mainImage || data.image || initialData.image,
            optionalImages: data.optionalImages || initialData.optionalImages,
            stock: data.stock !== undefined ? Number(data.stock) : 10,
            status: data.status || "In Stock",
            category: data.category || "",
            description: data.description || "",
            sizes: data.sizes || [],
            contactForPrice: data.contactForPrice === true
          });
        } else {
          setProductData(initialData);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setProductData(initialData);
      }
    };
    fetchProduct();
  }, [pathId]);

  const { name, price, image, id, stock, status, optionalImages, category, description, sizes, contactForPrice } = productData;
  const isOutOfStock = stock !== undefined ? (stock <= 0 || status === "Out of Stock") : false;

  const isOversizedTshirt = category?.toLowerCase().includes("oversized") || name?.toLowerCase().includes("oversized");
  const whatsappNumber = isOversizedTshirt ? "918840887100" : "918849376973";

  const isContactForPrice = contactForPrice === true ||
    category?.toLowerCase() === "boots" ||
    category?.toLowerCase() === "football boots" ||
    category?.toLowerCase().includes("boot");

  const availableSizes = sizes && sizes.length > 0 ? sizes : ["xs", "s", "m", "l", "xl", "xxl"];
  const [selectedSize, setSelectedSize] = useState("m");

  useEffect(() => {
    if (sizes && sizes.length > 0) {
      if (!sizes.includes(selectedSize)) {
        setSelectedSize(sizes[0]);
      }
    }
  }, [sizes, selectedSize]);
  const [isAdded, setIsAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(image);

  useEffect(() => {
    setActiveImage(image);
  }, [image]);

  const allImages = [image, ...(optionalImages || [])].filter(Boolean);
  const currentIndex = allImages.indexOf(activeImage);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length <= 1) return;
    const prevIdx = (currentIndex - 1 + allImages.length) % allImages.length;
    setActiveImage(allImages[prevIdx]);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length <= 1) return;
    const nextIdx = (currentIndex + 1) % allImages.length;
    setActiveImage(allImages[nextIdx]);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const item = {
      id: `${id}-${selectedSize.toUpperCase()}`,
      name: name,
      price: parseFloat(price.replace(/[^\d]/g, "")),
      image: image,
      size: selectedSize.toUpperCase(),
      quantity: 1,
    };

    let cart = JSON.parse(localStorage.getItem("kitkart_cart") || "[]");
    const existingIndex = cart.findIndex((cItem: any) => cItem.id === item.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(item);
    }

    localStorage.setItem("kitkart_cart", JSON.stringify(cart));

    // Update badge
    window.dispatchEvent(new Event("cart_updated"));

    // Provide button feedback
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const item = {
      id: `${id}-${selectedSize.toUpperCase()}`,
      name: name,
      price: parseFloat(price.replace(/[^\d]/g, "")),
      image: image,
      size: selectedSize.toUpperCase(),
      quantity: 1,
    };

    let cart = JSON.parse(localStorage.getItem("kitkart_cart") || "[]");
    const existingIndex = cart.findIndex((cItem: any) => cItem.id === item.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(item);
    }

    localStorage.setItem("kitkart_cart", JSON.stringify(cart));

    // Update badge
    window.dispatchEvent(new Event("cart_updated"));

    // Redirect to checkout
    router.push("/checkout");
  };

  return (
    <div style={{ paddingTop: "90px" }}>
      {/* ===== PRODUCT DETAILS ===== */}
      <section className="section product-page-section" style={{ paddingTop: '10px' }}>
        <div className="container">
          <div className="product-layout">
            {/* Product Image Gallery */}
            <div className="product-gallery">
              {/* Back Link */}
              <div className="gallery-back-nav" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => router.back()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: isHomeHovered ? 'var(--clr-gold, #C5A059)' : 'var(--clr-text-secondary, #9A9A9A)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'color 0.2s ease',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={() => setIsHomeHovered(true)}
                  onMouseLeave={() => setIsHomeHovered(false)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="16"
                    height="16"
                    style={{
                      transform: isHomeHovered ? 'translateX(-4px)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Back
                </button>
              </div>
              <div className="product-image-main">
                {activeImage ? (
                  <>
                    <img src={activeImage} alt={name} />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="gallery-nav-btn gallery-nav-btn-left"
                          aria-label="Previous image"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="gallery-nav-btn gallery-nav-btn-right"
                          aria-label="Next image"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ width: "100%", aspectRatio: "3/4", backgroundColor: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--r-md)" }}>
                    Just a sec...
                  </div>
                )}
              </div>

              {/* Optional Images Thumbnails */}
              {optionalImages && optionalImages.length > 0 && (
                <div className="product-thumbnails" style={{ display: 'flex', gap: '10px', marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                  <img
                    src={image}
                    alt="Main thumbnail"
                    onClick={() => setActiveImage(image)}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer', borderRadius: 'var(--r-md)', border: activeImage === image ? '2px solid var(--clr-gold, #f5c518)' : '2px solid transparent', flexShrink: 0 }}
                  />
                  {optionalImages.map((optImg: string, idx: number) => (
                    <img
                      key={idx}
                      src={optImg}
                      alt={`Thumbnail ${idx + 1}`}
                      onClick={() => setActiveImage(optImg)}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer', borderRadius: 'var(--r-md)', border: activeImage === optImg ? '2px solid var(--clr-gold, #f5c518)' : '2px solid transparent', flexShrink: 0 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-details">
              {isOversizedTshirt && (
                <div style={{ marginBottom: "16px", display: "block" }}>
                  <span className="exclusive-badge" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid var(--clr-gold, #C5A059)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: '#FFFFFF',
                    padding: '6px 14px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    letterSpacing: '0.25em',
                    borderRadius: '2px',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--ff-heading)',
                    width: 'fit-content',
                    lineHeight: 1
                  }}>
                    <span style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--clr-gold, #C5A059)',
                      display: 'inline-block'
                    }}></span>
                    EXCLUSIVE LAUNCH
                  </span>
                </div>
              )}
              {isOutOfStock && (
                <div style={{ marginBottom: "12px" }}>
                  <span className="product-page-out-of-stock-badge" style={{ display: 'inline-block', backgroundColor: '#ff4757', color: '#fff', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '4px' }}>
                    Out of Stock
                  </span>
                </div>
              )}
              <h1 className="product-page-title">{name}</h1>
              {!isContactForPrice && (
                <p className="product-page-price">
                  ₹{parseFloat(price.replace(/[^\d]/g, "")).toLocaleString("en-IN")}
                </p>
              )}

              {isOutOfStock && (
                <div className="special-request-box" style={{ marginBottom: "20px", padding: "20px", border: "1px solid var(--clr-border)", borderRadius: "var(--r-md)", background: "rgba(255, 255, 255, 0.02)", textAlign: "center" }}>
                  <p style={{ margin: "0 0 12px 0", fontSize: "0.92rem", color: "var(--clr-text-secondary)", lineHeight: "1.5" }}>
                    This product might be available. Want to get that product on special request? Do it right away
                  </p>
                  <Link
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in the ${name}. I want to get this product on special request.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      width: "100%",
                      backgroundColor: "#25D366",
                      borderColor: "#25D366",
                      color: "#fff",
                      fontWeight: 700
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    Special Request via WhatsApp
                  </Link>
                </div>
              )}
              <p className="product-page-desc">
                {description || (
                  (name.toLowerCase().includes("boot") || name.toLowerCase().includes("shoe") || category?.toLowerCase().includes("boot"))
                    ? "Take your game to the next level with our premium football boots. Engineered for maximum traction, superior ball control, and explosive speed on the pitch."
                    : "Experience ultimate comfort and style with our premium jersey. Crafted with high-grade breathable fabric, this jersey ensures you stay cool whether you're on the pitch or cheering from the stands."
                )}
              </p>

              {/* Sizes */}
              {!isContactForPrice && availableSizes.length > 0 && (
                <div className="product-options">
                  <div className="size-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 className="option-title" style={{ margin: 0 }}>Select Size</h4>
                    <button
                      type="button"
                      onClick={() => setShowSizeChart(true)}
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--clr-gold, #C5A059)',
                        fontWeight: 400,
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                        <line x1="4" y1="9" x2="20" y2="9"></line>
                        <line x1="4" y1="15" x2="20" y2="15"></line>
                        <line x1="10" y1="3" x2="10" y2="21"></line>
                        <line x1="14" y1="3" x2="14" y2="21"></line>
                      </svg>
                      Size Chart
                    </button>
                  </div>
                  <div className="size-selector">
                    {availableSizes.map((s) => (
                      <label key={s} className="size-option">
                        <input
                          type="radio"
                          name="size"
                          value={s}
                          checked={selectedSize === s}
                          onChange={() => setSelectedSize(s)}
                        />
                        <span>{s.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="product-actions">
                {isContactForPrice ? (
                  <Link
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in the ${name}. Please share the current price and availability.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary product-btn-contact"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      width: "100%",
                      backgroundColor: "#25D366",
                      borderColor: "#25D366",
                      color: "#fff",
                      fontWeight: 700,
                      padding: "12px 24px",
                      borderRadius: "var(--r-md)"
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    Contact for Price
                  </Link>
                ) : (
                  <>
                    <button
                      className={`btn btn-outline product-btn-cart ${isAdded ? "added" : ""}`}
                      onClick={handleAddToCart}
                      disabled={isAdded || isOutOfStock}
                      style={isOutOfStock ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                    >
                      {isAdded ? (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="18"
                            height="18"
                            style={{ marginRight: "8px" }}
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Added!
                        </>
                      ) : (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="18"
                            height="18"
                            style={{ marginRight: "8px" }}
                          >
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                          </svg>
                          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-primary product-btn-buy"
                      onClick={handleBuyNow}
                      disabled={isOutOfStock}
                      style={isOutOfStock ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                    >
                      Buy Now
                    </button>
                  </>
                )}
              </div>

              {/* Highlights Card with Animating Border */}
              <div className="highlights-card-wrapper">
                <div className="highlights-card-inner">
                  <div className="highlight-item">
                    <span className="highlight-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                    </span>
                    <span className="highlight-text">
                      FREE Shipping<br />Pan India
                    </span>
                  </div>

                  <div className="highlight-item">
                    <span className="highlight-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </span>
                    <span className="highlight-text">
                      Premium Quality<br />Products
                    </span>
                  </div>

                  <div className="highlight-item">
                    <span className="highlight-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </span>
                    <span className="highlight-text">
                      Secured<br />Payments
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery & Returns Info Blocks */}
              <div className="delivery-returns-container" style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Delivery Box */}
                <div className="delivery-info" style={{ marginBottom: 0 }}>
                  <div className="delivery-info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                  <div className="delivery-info-content">
                    <span className="delivery-info-title">Delivery</span>
                    <span className="delivery-info-text">Usually 3-5 business days.</span>
                  </div>
                </div>

                {/* Returns & Exchange Box */}
                <div className="delivery-info" style={{ marginBottom: 0 }}>
                  <div className="delivery-info-icon" style={{ backgroundColor: "rgba(245, 197, 24, 0.1)", color: "var(--clr-gold)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                  </div>
                  <div className="delivery-info-content">
                    <span className="delivery-info-title">Returns & Exchange Available</span>
                    <span className="delivery-info-text">For Return Policies, please refer to <Link href="/shipping-returns"><strong>Shipping and Returns page</strong></Link>. Free exchange only if product is damaged or different.</span>
                  </div>
                </div>

                {/* Returns size exchange note below the box */}
                <div style={{ padding: "0 4px", fontSize: "0.8rem", color: "var(--clr-text-secondary)", lineHeight: "1.4", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" style={{ flexShrink: 0, marginTop: "2px", color: "var(--clr-gold)" }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>Note: If you want to change the size, you must bear the shipping costs for both sides.
                    For return, refund amount will be processed after deducting outward and return shipping charges of product.
                  </span>
                </div>
              </div>



              {/* Support / Whatsapp */}
              <div className="product-support">
                <p className="support-text">Have any doubt regarding product?</p>
                <Link
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in the ${name}. I have a query regarding it.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-pill"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  Ping us on Whatsapp
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section >
      {showSizeChart && (
        <div
          onClick={() => setShowSizeChart(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
            cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              backgroundColor: '#131313',
              border: '1px solid var(--clr-border, #252525)',
              borderRadius: 'var(--r-lg, 16px)',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 24px 48px rgba(0,0,0,0.8)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowSizeChart(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                color: 'var(--clr-text-secondary, #9A9A9A)',
                cursor: 'pointer',
                transition: 'color var(--t-fast)',
                background: 'none',
                border: 'none',
                padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--clr-text-secondary, #9A9A9A)'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Title */}
            <h3 style={{ fontFamily: 'var(--ff-heading)', color: '#fff', fontSize: '1.25rem', marginBottom: '16px', alignSelf: 'flex-start' }}>Jersey Size Chart</h3>

            {/* Image */}
            <div style={{ width: '100%', borderRadius: 'var(--r-md, 10px)', overflow: 'hidden', backgroundColor: '#000' }}>
              <img
                src="/assets/Size Chart Jersey.jpg"
                alt="Size Chart"
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div >
  );
}

export default function Product() {
  return (
    <Suspense fallback={<div style={{ paddingTop: "80px", textAlign: "center" }}>Just a second...</div>}>
      <ProductContent />
    </Suspense>
  );
}
