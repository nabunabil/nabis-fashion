import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LuArrowRight, LuSparkles, LuChevronRight } from "react-icons/lu";
import { Heart } from "lucide-react";
import { api } from "../lib/api";
import { useWishlist } from "../context/WishlistContext";

function Home() {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [categorySections, setCategorySections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomepageData() {
      try {
        const res = await api.get("/products/homepage");
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCategorySections(res.data);
        } else {
          // Fallback: Fetch general products and group them if homepage API is empty
          const prodRes = await api.get("/products");
          if (prodRes && prodRes.success) {
            const allProducts = prodRes.data || [];
            // Group by category manually as fallback
            const groupedMap = {};
            allProducts.forEach((p) => {
              const catName = p.category?.name || "General";
              const catSlug = p.category?.slug || "all";
              if (!groupedMap[catSlug]) {
                groupedMap[catSlug] = {
                  id: p.categoryId || 0,
                  name: catName,
                  slug: catSlug,
                  products: [],
                };
              }
              if (groupedMap[catSlug].products.length < 4) {
                groupedMap[catSlug].products.push(p);
              }
            });
            setCategorySections(Object.values(groupedMap));
          }
        }
      } catch (err) {
        console.error("Failed to load homepage category products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomepageData();
  }, []);

  return (
    <div className="pt-16 sm:pt-20">
      {/* Premium Hero Section */}
      <section className="relative bg-neutral-900 text-white overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-accent/20 text-accent px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-6 animate-pulse">
              <LuSparkles className="h-3.5 w-3.5" />
              <span>New Collection 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              Elegance is <br />
              <span className="text-accent">an Attitude</span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 mb-8 leading-relaxed">
              Discover carefully curated, premium clothing designed to elevate your everyday style. Crafted with eco-friendly fabrics and tailor-made fits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products?category=men"
                className="bg-accent text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-accent-hover transform hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Shop Men</span>
                <LuArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products?category=women"
                className="bg-transparent border-2 border-white/60 hover:border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all text-center"
              >
                Shop Women
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category-Wise Posts Sections (4 products per category with View All button) */}
      {loading ? (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="space-y-6">
                <div className="h-8 bg-neutral-200 rounded w-1/4 animate-pulse"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse space-y-4">
                      <div className="bg-neutral-200 aspect-[3/4] rounded-2xl w-full"></div>
                      <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : categorySections.length > 0 ? (
        categorySections.map((cat, sectionIdx) => (
          <section
            key={cat.id || cat.slug || sectionIdx}
            className={`py-16 sm:py-20 ${
              sectionIdx % 2 === 1 ? "bg-neutral-50 border-y border-neutral-100" : "bg-white"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Category Header with View All Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 pb-4 border-b border-neutral-200/80">
                <div>
                  <span className="text-accent font-extrabold tracking-widest text-xs uppercase mb-1 block">
                    Curated Collection
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 capitalize">
                    {cat.name}
                  </h2>
                </div>

                <Link
                  to={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                  className="group inline-flex items-center gap-2 bg-neutral-900 hover:bg-accent text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm"
                >
                  <span>View All {cat.name}</span>
                  <LuArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* 4 Products Grid */}
              {cat.products && cat.products.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  {cat.products.slice(0, 4).map((product) => {
                    const discountPrice = Number(product.discountPrice);
                    const price = Number(product.price);
                    const isDiscounted = discountPrice > 0 && discountPrice < price;

                    return (
                      <Link
                        key={product.id}
                        to={`/products/${product.slug || product.id}`}
                        className="group flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-xl border border-neutral-100 p-3 transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 mb-4">
                          <img
                            src={
                              product.images?.[0]?.imageUrl ||
                              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"
                            }
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {isDiscounted && (
                            <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-extrabold tracking-wide uppercase px-2 py-1 rounded-md z-10">
                              Sale
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(product);
                            }}
                            className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
                              isInWishlist(product.id)
                                ? "bg-red-50/90 text-[#D14343] shadow-md"
                                : "bg-white/80 text-neutral-600 hover:text-neutral-900 hover:bg-white"
                            }`}
                            title="Save to Wishlist"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isInWishlist(product.id) ? "fill-[#D14343] text-[#D14343]" : ""
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex-1 flex flex-col">
                          <span className="text-neutral-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                            {product.category?.name || cat.name}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-neutral-800 group-hover:text-accent transition-colors mb-2 line-clamp-1">
                            {product.title}
                          </h3>
                          <div className="mt-auto flex items-center space-x-2">
                            {isDiscounted ? (
                              <>
                                <span className="text-base sm:text-lg font-black text-neutral-900">
                                  £{discountPrice.toFixed(2)}
                                </span>
                                <span className="text-xs sm:text-sm text-neutral-400 line-through">
                                  £{price.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-base sm:text-lg font-black text-neutral-900">
                                £{price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-400 text-sm">
                  No products available in this category yet.
                </div>
              )}
            </div>
          </section>
        ))
      ) : (
        <div className="text-center py-16 text-neutral-400">
          No category products found in the store database.
        </div>
      )}

      {/* Newsletter */}
      <section className="bg-neutral-900 text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10">
          <p className="text-accent font-bold tracking-widest text-xs uppercase mb-3">Newsletter</p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Unlock 10% Off Your First Order</h2>
          <p className="text-neutral-400 text-sm sm:text-base mb-8 max-w-lg mx-auto">
            Subscribe to our newsletter to receive styling guides, new arrivals alert, and exclusive coupon codes.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-neutral-900 border border-white/20 focus:border-white rounded-full px-6 py-3.5 text-sm focus:outline-none transition-all placeholder:text-neutral-400"
              required
            />
            <button
              type="submit"
              className="bg-white hover:bg-neutral-100 text-neutral-950 font-bold px-8 py-3.5 rounded-full text-sm transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Home;