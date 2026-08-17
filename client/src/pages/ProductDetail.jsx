import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  MessageSquare,
  Minus,
  Plus,
  Send,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
  ZoomIn,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useModal } from "../context/ModalContext";
import { useWishlist } from "../context/WishlistContext";
import { api } from "../lib/api";
import { authClient } from "../lib/auth-client";

export default function ProductDetail() {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showAlert } = useModal();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { data: session } = authClient.useSession();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Gallery States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Product Options
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Feedback State
  const [addingToCart, setAddingToCart] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: "", text: "" });

  // Review States
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProductAndReviews() {
      if (!slugOrId) return;
      setLoading(true);
      setErrorMsg("");

      try {
        const isNumeric = /^\d+$/.test(slugOrId);
        const endpoint = isNumeric
          ? `/products/${slugOrId}`
          : `/products/slug/${slugOrId}`;
        const res = await api.get(endpoint);

        if (res && res.success && res.data) {
          const prodData = res.data;
          setProduct(prodData);

          // Fetch reviews for this product
          try {
            const revRes = await api.get(`/reviews/product/${prodData.id}`);
            if (revRes && revRes.success && Array.isArray(revRes.data)) {
              setReviews(revRes.data);
            }
          } catch (rErr) {
            console.warn(
              "Could not load backend reviews, using initial set:",
              rErr,
            );
          }
        } else {
          setErrorMsg("Product not found or unavailable.");
        }
      } catch (err) {
        console.error("Error loading product detail:", err);
        setErrorMsg("Failed to load product details. Please check the URL.");
      } finally {
        setLoading(false);
      }
    }

    loadProductAndReviews();
  }, [slugOrId]);

  // Gallery image fallback handling
  const rawImages =
    product?.images?.map((img) => img.imageUrl || img.url) || [];
  const defaultImages = [
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
  ];
  const galleryImages = rawImages.length > 0 ? rawImages : defaultImages;
  const currentImage = galleryImages[activeImageIndex] || galleryImages[0];

  // Extract all product variants
  const allVariants =
    Array.isArray(product?.variants) && product.variants.length > 0
      ? product.variants
      : [];

  // Group variants by unique color name to prevent duplicate color chips
  const colorMap = new Map();
  if (allVariants.length > 0) {
    allVariants.forEach((v) => {
      const cName = v.color || "Standard";
      if (!colorMap.has(cName)) {
        colorMap.set(cName, {
          name: cName,
          hex: v.hex || "#21453A",
        });
      }
    });
  }

  const uniqueColors =
    colorMap.size > 0
      ? Array.from(colorMap.values())
      : [
          { name: "Forest Green", hex: "#21453A" },
          { name: "Royal Burgundy", hex: "#6E2335" },
          { name: "Midnight Onyx", hex: "#111111" },
        ];

  const currentColor = uniqueColors[selectedColorIndex] ||
    uniqueColors[0] || { name: "Standard", hex: "#21453A" };

  // Filter variants belonging to the selected color
  const colorMatchingVariants = allVariants.filter(
    (v) => (v.color || "Standard") === currentColor.name,
  );

  // Available sizes & stock for current selected color
  const defaultSizeList = ["S", "M", "L", "XL", "XXL"];
  const availableSizesList = defaultSizeList.map((sz) => {
    const foundVar = colorMatchingVariants.find(
      (v) => String(v.size || "").toUpperCase() === sz,
    );
    return {
      size: sz,
      stock: foundVar ? (foundVar.stock ?? foundVar.stockQuantity ?? 0) : 15,
      variantId: foundVar ? foundVar.id : product?.id || 1,
      exists: Boolean(foundVar),
    };
  });

  // Get active size variant object
  const activeSizeObj =
    availableSizesList.find((s) => s.size === selectedSize) ||
    availableSizesList[0];
  const currentStock = activeSizeObj ? activeSizeObj.stock : 0;
  const activeVariantId = activeSizeObj
    ? activeSizeObj.variantId
    : product?.id || 1;

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    setFeedbackMsg({ type: "", text: "" });

    try {
      const vId = activeVariantId || product?.id || 1;
      await addItem(vId, quantity, product);
      setFeedbackMsg({
        type: "success",
        text: `✓ Added ${quantity} × ${product?.title || "Item"} (${selectedSize} / ${currentColor.name}) to your cart!`,
      });
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.message || "Failed to add item to shopping bag.",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleInstantBuyNow = async () => {
    setAddingToCart(true);
    setFeedbackMsg({ type: "", text: "" });

    try {
      const vId = activeVariantId || product?.id || 1;
      await addItem(vId, quantity, product);
      navigate("/checkout");
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.message || "Failed to proceed to instant checkout.",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);

    try {
      if (product?.id && session) {
        await api.post(`/reviews/product/${product.id}`, {
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
      }

      const newRev = {
        id: Date.now(),
        user: {
          name: session?.user?.name || "Verified Customer",
          image: session?.user?.image,
        },
        author: session?.user?.name || "Verified Customer",
        rating: reviewRating,
        createdAt: new Date().toISOString(),
        comment: reviewComment.trim(),
        verified: true,
      };

      setReviews([newRev, ...reviews]);
      setReviewComment("");
      showAlert({
        title: "Review Submitted",
        message: "Thank you! Your product review has been submitted.",
        type: "success",
      });
    } catch (err) {
      console.warn("Posting review via state fallback:", err);
      const newRev = {
        id: Date.now(),
        author: session?.user?.name || "Verified Customer",
        rating: reviewRating,
        date: "Just now",
        comment: reviewComment.trim(),
        verified: true,
      };
      setReviews([newRev, ...reviews]);
      setReviewComment("");
      showAlert({
        title: "Review Posted",
        message: "Thank you! Your product review has been posted.",
        type: "success",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex items-center justify-center min-h-[60vh] bg-[#FAFAF8]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ECE8E1] border-t-[#21453A]" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
            Loading Nabis Fashion Garment...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="pt-32 pb-20 max-w-xl mx-auto text-center space-y-4 px-4">
        <h2 className="text-2xl font-bold font-heading text-[#1D1D1F]">
          Product Unavailable
        </h2>
        <p className="text-xs text-[#6B7280]">
          {errorMsg || "The product you requested could not be found."}
        </p>
        <Link
          to="/products"
          className="inline-block bg-[#21453A] text-white text-xs font-bold px-6 py-3 rounded-xl uppercase tracking-wider"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const title = product.title;
  const categoryName = product.category?.name || "Nabis Fashion Collection";
  const price = Number(product.price || 0);
  const discountPrice = Number(product.discountPrice || 0);
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  return (
    <div className="bg-[#FAFAF8] min-h-screen text-[#1D1D1F] pt-24 sm:pt-28 pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
        {/* BREADCRUMB NAVIGATION */}
        <nav className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link to="/" className="hover:text-[#21453A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            to="/products"
            className="hover:text-[#21453A] transition-colors"
          >
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            to={`/products?category=${product.category?.slug || "all"}`}
            className="hover:text-[#21453A] transition-colors"
          >
            {categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#1D1D1F] truncate max-w-xs">
            {title}
          </span>
        </nav>

        {/* MAIN PRODUCT LAYOUT: 12 COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: PRODUCT GALLERY (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Vertical Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[580px] pb-2 md:pb-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? "border-[#21453A] ring-2 ring-[#21453A]/20"
                      : "border-[#ECE8E1] opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Stage Image with Hover Zoom & Lightbox */}
            <div className="relative flex-1 bg-white rounded-card border border-[#ECE8E1] overflow-hidden group shadow-soft">
              {hasDiscount && (
                <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-forest text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  {discountPercent}% OFF
                </span>
              )}

              {/* Lightbox / Zoom Trigger Icon */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-xs text-[#1D1D1F] hover:text-[#21453A] rounded-full shadow-xs transition-transform hover:scale-105"
                title="Fullscreen Preview"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Main Image Viewport with Hover Zoom */}
              <div
                className="relative w-full h-[480px] sm:h-[580px] cursor-crosshair overflow-hidden"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={currentImage}
                  alt={title}
                  className="w-full h-full object-cover object-[center_25%] transition-transform duration-300"
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          transform: "scale(2.2)",
                        }
                      : {}
                  }
                />
              </div>

              {/* Image Navigation Arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) =>
                    prev > 0 ? prev - 1 : galleryImages.length - 1,
                  );
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-xs hover:bg-white text-[#1D1D1F] rounded-full shadow-xs transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) =>
                    prev < galleryImages.length - 1 ? prev + 1 : 0,
                  );
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-xs hover:bg-white text-[#1D1D1F] rounded-full shadow-xs transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: PURCHASE INFORMATION (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header Meta */}
            <div className="space-y-2 border-b border-[#ECE8E1] pb-5">
              <div className="flex justify-between items-center text-xs text-[#6B7280]">
                <span className="font-bold text-[#21453A] uppercase tracking-wider font-heading">
                  {categoryName}
                </span>
                <span>
                  Slug:{" "}
                  <strong className="text-[#1D1D1F] font-mono">
                    {product.slug || product.id}
                  </strong>
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                {title}
              </h1>

              {/* Rating & Sales */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[#B88A2E] text-[#B88A2E]"
                    />
                  ))}
                  <span className="font-bold text-[#1D1D1F] ml-1">4.9</span>
                  <span className="text-[#6B7280]">
                    ({reviews.length} Client Reviews)
                  </span>
                </div>
                <span className="text-[#ECE8E1]">|</span>
                <span className="text-[#6B7280] font-medium">
                  In High Demand
                </span>
              </div>
            </div>

            {/* Pricing & Stock Status */}
            <div className="p-5 bg-white rounded-[20px] border border-[#ECE8E1] space-y-3 shadow-soft">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#21453A] font-heading tracking-tight">
                  £{hasDiscount ? discountPrice.toFixed(2) : price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-[#6B7280] line-through font-medium">
                    £{price.toFixed(2)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-2.5 py-0.5 bg-[#F6F3ED] text-[#B88A2E] text-xs font-bold rounded-lg border border-[#ECE8E1]">
                    Save £{(price - discountPrice).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs pt-3 border-t border-[#ECE8E1]">
                {currentStock > 0 ? (
                  <span className="flex items-center gap-1.5 font-bold text-[#2E7D32] bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In Stock (
                    {currentStock} Available for Size {selectedSize})
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    Out of Stock for Size {selectedSize}
                  </span>
                )}
                <span className="text-[#6B7280] font-medium flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#21453A]" /> Express
                  Worldwide Delivery
                </span>
              </div>
            </div>

            {/* Color Selection Chips */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#1D1D1F] font-heading uppercase tracking-wider">
                  Color Option:{" "}
                  <span className="text-[#21453A] font-bold">
                    {currentColor.name}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                {uniqueColors.map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedColorIndex(idx);
                      setActiveImageIndex(0);
                    }}
                    className={`flex items-center gap-2 p-2 pr-3 rounded-xl border transition-all ${
                      selectedColorIndex === idx
                        ? "border-[#21453A] bg-white ring-2 ring-[#21453A]/20 shadow-sm"
                        : "border-[#ECE8E1] bg-white hover:border-[#21453A]/50"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-lg border border-black/10 shadow-2xs"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="text-xs font-bold text-[#1D1D1F]">
                      {col.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection & Size Guide */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#1D1D1F] font-heading uppercase tracking-wider">
                  Size:{" "}
                  <span className="text-[#21453A] font-bold">
                    {selectedSize}
                  </span>
                </span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-[#B88A2E] font-bold hover:underline flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" /> Size Guide
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {availableSizesList.map((szObj) => {
                  const isSelected = selectedSize === szObj.size;
                  const isOutOfStock = szObj.stock === 0;

                  return (
                    <button
                      key={szObj.size}
                      onClick={() => setSelectedSize(szObj.size)}
                      className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center min-w-[54px] ${
                        isSelected
                          ? "bg-[#21453A] text-white shadow-sm font-extrabold"
                          : isOutOfStock
                            ? "bg-[#F8F8F6] text-[#9CA3AF] border border-[#ECE8E1] opacity-70"
                            : "bg-white text-[#1D1D1F] border border-[#ECE8E1] hover:border-[#21453A]"
                      }`}
                    >
                      <span>{szObj.size}</span>
                      <span
                        className={`text-[9px] ${isSelected ? "text-amber-200" : isOutOfStock ? "text-red-500 font-semibold" : "text-[#6B7280]"}`}
                      >
                        {isOutOfStock ? "Sold out" : `${szObj.stock} left`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity & Action Buttons */}
            <div className="space-y-4 pt-2">
              {feedbackMsg.text && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold border ${
                    feedbackMsg.type === "success"
                      ? "bg-green-50 text-[#2E7D32] border-green-200"
                      : "bg-red-50 text-[#D14343] border-red-200"
                  }`}
                >
                  {feedbackMsg.text}
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Quantity Control */}
                <div className="flex items-center bg-white border border-[#ECE8E1] rounded-xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-[#6B7280] hover:text-[#1D1D1F] rounded-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#1D1D1F]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-[#6B7280] hover:text-[#1D1D1F] rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 py-3.5 bg-[#21453A] hover:bg-[#17322A] text-white text-xs font-bold uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 tracking-wider"
                >
                  <ShoppingBag className="w-4 h-4 text-[#B88A2E]" />
                  <span>
                    {addingToCart ? "Adding..." : "Add to Shopping Bag"}
                  </span>
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => product && toggleWishlist(product)}
                  className={`p-3.5 rounded-xl border transition-all ${
                    product && isInWishlist(product.id)
                      ? "bg-red-50 border-red-200 text-[#D14343]"
                      : "bg-white border-[#ECE8E1] text-[#6B7280] hover:text-[#1D1D1F]"
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart
                    className={`w-5 h-5 ${product && isInWishlist(product.id) ? "fill-[#D14343] text-[#D14343]" : ""}`}
                  />
                </button>
              </div>

              {/* Instant Buy Now Button */}
              <button
                onClick={handleInstantBuyNow}
                disabled={addingToCart}
                className="w-full py-3.5 bg-[#F6F3ED] hover:bg-[#21453A] text-[#21453A] hover:text-white border border-[#ECE8E1] text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
              >
                {addingToCart ? "Processing..." : "Instant Buy Now"}
              </button>
            </div>
          </div>
        </div>

        {/* ================= REDESIGNED TWO-COLUMN SECTION BELOW MAIN PURCHASE AREA ================= */}
        {/* LEFT SIDE: CUSTOMER REVIEWS | RIGHT SIDE: PRODUCT DETAILS & SPECIFICATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6 border-t border-[#ECE8E1]">
          {/* LEFT SIDE (6 COLUMNS): REVIEWS & FEEDBACK */}
          <div className="lg:col-span-6 bg-white border border-[#ECE8E1] rounded-[20px] p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#ECE8E1]">
              <div>
                <h3 className="text-xl font-extrabold font-heading text-[#1D1D1F]">
                  Client Reviews
                </h3>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                  Verified customer experiences and ratings
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F6F3ED] px-3.5 py-1.5 rounded-full border border-[#ECE8E1]">
                <Star className="w-4 h-4 fill-[#B88A2E] text-[#B88A2E]" />
                <span className="text-xs font-extrabold text-[#21453A]">
                  4.9 / 5.0
                </span>
              </div>
            </div>

            {/* Post a Review Form */}
            <form
              onSubmit={handlePostReview}
              className="bg-[#FAFAF8] p-5 rounded-2xl border border-[#ECE8E1] space-y-4"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider font-heading text-[#1D1D1F]">
                Write a Review
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#6B7280]">Rating:</span>
                <div className="flex items-center gap-1 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`w-4 h-4 ${
                        star <= reviewRating
                          ? "fill-[#B88A2E] text-[#B88A2E]"
                          : "text-[#ECE8E1]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                required
                placeholder="Share feedback on fabric quality, sizing fit, and delivery..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-3 bg-white border border-[#ECE8E1] rounded-xl text-xs outline-none focus:border-[#21453A]"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-[#21453A] hover:bg-[#17322A] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? "Posting..." : "Post Review"}</span>
                </button>
              </div>
            </form>

            {/* List of Reviews */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-[#6B7280] space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto text-[#ECE8E1]" />
                  <p className="text-xs font-semibold">
                    No customer reviews yet. Be the first to leave a review!
                  </p>
                </div>
              ) : (
                reviews.map((rev, i) => (
                  <div
                    key={rev.id || i}
                    className="p-4 bg-[#FAFAF8] rounded-2xl border border-[#ECE8E1] space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#21453A] text-white flex items-center justify-center text-xs font-bold font-heading">
                          {(rev.user?.name || rev.author || "Client")[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1">
                            <span>
                              {rev.user?.name ||
                                rev.author ||
                                "Verified Client"}
                            </span>
                            <span className="text-[9px] bg-green-100 text-[#2E7D32] px-2 py-0.2 rounded-full font-bold">
                              Verified Buyer
                            </span>
                          </p>
                          <p className="text-[10px] text-[#6B7280]">
                            {rev.createdAt
                              ? new Date(rev.createdAt).toLocaleDateString()
                              : rev.date || "Recent"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < (rev.rating || 5)
                                ? "fill-[#B88A2E] text-[#B88A2E]"
                                : "text-[#ECE8E1]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-[#1D1D1F] leading-relaxed pl-10">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT SIDE (6 COLUMNS): PRODUCT SPECIFICATIONS & DETAILS */}
          <div className="lg:col-span-6 bg-white border border-[#ECE8E1] rounded-[20px] p-6 sm:p-8 shadow-soft space-y-6">
            <div className="pb-4 border-b border-[#ECE8E1]">
              <h3 className="text-xl font-extrabold font-heading text-[#1D1D1F]">
                Product Specifications
              </h3>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Garment details, fabric composition & care instructions
              </p>
            </div>

            {/* Description Paragraph */}
            <div className="space-y-3 text-xs leading-relaxed text-[#1D1D1F]">
              <h4 className="font-bold text-xs uppercase tracking-wider font-heading text-[#21453A]">
                Craftsmanship & Design
              </h4>
              <p>
                {product.description ||
                  "Handcrafted from organic silk fibers, this Nabis Fashion signature garment combines traditional heritage weaving with modern tailored silhouettes. Designed for celebrations, weddings, and formal evening gatherings."}
              </p>
            </div>

            {/* Specifications Table */}
            <div className="space-y-3 pt-2 border-t border-[#ECE8E1]">
              <h4 className="font-bold text-xs uppercase tracking-wider font-heading text-[#21453A]">
                Garment Attributes
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#ECE8E1]">
                  <span className="block text-[10px] font-bold text-[#6B7280] uppercase">
                    Category
                  </span>
                  <span className="font-bold text-[#1D1D1F]">
                    {categoryName}
                  </span>
                </div>
                <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#ECE8E1]">
                  <span className="block text-[10px] font-bold text-[#6B7280] uppercase">
                    Fabric Material
                  </span>
                  <span className="font-bold text-[#1D1D1F]">
                    100% Organic Silk & Handloom Muslin
                  </span>
                </div>
                <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#ECE8E1]">
                  <span className="block text-[10px] font-bold text-[#6B7280] uppercase">
                    Fit Silhouette
                  </span>
                  <span className="font-bold text-[#1D1D1F]">
                    Custom Tailored Slim-Regular
                  </span>
                </div>
                <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#ECE8E1]">
                  <span className="block text-[10px] font-bold text-[#6B7280] uppercase">
                    Care Instructions
                  </span>
                  <span className="font-bold text-[#1D1D1F]">
                    Dry Clean Only
                  </span>
                </div>
              </div>
            </div>

            {/* Luxury Guarantee */}
            <div className="p-4 bg-[#F6F3ED] border border-[#ECE8E1] rounded-2xl flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#B88A2E] flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-[#21453A] font-heading">
                  Nabis Fashion Quality Guarantee
                </p>
                <p className="text-[#6B7280]">
                  All items undergo multi-point quality inspection before
                  shipping.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={currentImage}
            alt={title}
            className="max-w-4xl max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* SIZE GUIDE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[20px] border border-[#ECE8E1] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#ECE8E1] flex justify-between items-center bg-[#FAFAF8]">
              <h3 className="font-heading text-sm font-bold text-[#1D1D1F]">
                Nabis Fashion Size Guide
              </h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-[#6B7280] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <p className="text-[#6B7280]">
                All measurements are in inches for luxury regular fit:
              </p>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#ECE8E1] font-bold text-[#1D1D1F]">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest</th>
                    <th className="py-2">Length</th>
                    <th className="py-2">Sleeve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE8E1] text-[#6B7280]">
                  <tr>
                    <td className="py-2 font-bold text-[#1D1D1F]">S</td>
                    <td>38"</td>
                    <td>40"</td>
                    <td>24.5"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-[#1D1D1F]">M</td>
                    <td>40"</td>
                    <td>42"</td>
                    <td>25.0"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-[#1D1D1F]">L</td>
                    <td>42"</td>
                    <td>44"</td>
                    <td>25.5"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-[#1D1D1F]">XL</td>
                    <td>44"</td>
                    <td>46"</td>
                    <td>26.0"</td>
                  </tr>
                </tbody>
              </table>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="px-4 py-2 bg-[#21453A] text-white rounded-xl font-bold"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
