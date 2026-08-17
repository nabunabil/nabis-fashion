import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuSlidersHorizontal,
  LuX,
} from "react-icons/lu";
import {
  Link,
  useSearchParams as useSearchParamsRouter,
} from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useWishlist } from "../context/WishlistContext";
import { api } from "../lib/api";

function Products() {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParamsRouter();

  const categoryParam = searchParams.get("category") || "all";
  const searchParam = searchParams.get("search") || searchParams.get("q") || "";
  const pageParam = Math.max(1, Number(searchParams.get("page")) || 1);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Pagination metadata from server
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(pageParam);

  // Sync currentPage from URL
  useEffect(() => {
    setCurrentPage(pageParam);
  }, [pageParam]);

  // Load products with server-side pagination (12 items per page)
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        query.set("page", String(currentPage));
        query.set("limit", "12"); // 12 products per page
        if (categoryParam && categoryParam !== "all")
          query.set("category", categoryParam);
        if (searchParam.trim()) query.set("search", searchParam.trim());
        if (sortOption) query.set("sortBy", sortOption);

        const res = await api.get(`/products?${query.toString()}`);

        if (res && res.success) {
          setProducts(res.data || []);
          setTotalProducts(res.totalProducts || 0);
          setTotalPages(res.totalPages || 1);
        } else {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Failed to load products from server:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [currentPage, categoryParam, searchParam, sortOption]);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get("/categories");
        if (res && res.success) {
          setCategories(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  const handleCategorySelect = (slug) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const allCategoryOptions = [
    { name: "All Products", slug: "all" },
    ...categories.map((c) => ({ name: c.name, slug: c.slug })),
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#FAF9F6]">
      {/* Header Banner */}
      <div className="bg-[#21453A] text-white py-12 mb-8 border-b border-[#17322A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-wide">
            {searchParam
              ? `Search Results for "${searchParam}"`
              : categoryParam === "all"
                ? "All Collections"
                : categories.find((c) => c.slug === categoryParam)?.name ||
                  "Shop Collection"}
          </h1>
          <p className="text-xs sm:text-sm text-[#ECE8E1] font-light max-w-xl mx-auto">
            Discover handcrafted Bengali Punjabi, designer Sarees, and premium
            ethnic fashion items.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter & Toolbar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ECE8E1] mb-8">
          {/* Active Category pill & Total Count */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-white border border-[#ECE8E1] px-4 py-2.5 rounded-xl text-xs font-bold text-[#1D1D1F] hover:bg-[#FAFAF8]"
            >
              <LuSlidersHorizontal className="h-4 w-4 text-[#B88A2E]" />
              <span>Categories</span>
            </button>
            <span className="text-xs text-[#6B7280]">
              Showing{" "}
              <strong className="text-[#1D1D1F]">{products.length}</strong> of{" "}
              <strong className="text-[#1D1D1F]">{totalProducts}</strong>{" "}
              products (Page {currentPage} of {totalPages})
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-bold text-[#6B7280] hidden sm:inline">
              Sort By:
            </span>
            <Select
              value={sortOption}
              onValueChange={(val) => {
                setSortOption(val);
                handlePageChange(1);
              }}
            >
              <SelectTrigger className="w-[180px] bg-white border-[#ECE8E1] text-xs font-bold rounded-xl h-10">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#ECE8E1] rounded-xl text-xs font-bold">
                <SelectItem value="newest">Newest Arrivals</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="oldest">Oldest Items</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Categories Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold font-heading text-[#1D1D1F] pb-3 border-b border-[#ECE8E1]">
                Categories
              </h3>
              <ul className="space-y-1.5">
                {allCategoryOptions.map((cat) => {
                  const isActive = categoryParam === cat.slug;
                  return (
                    <li key={cat.slug}>
                      <button
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          isActive
                            ? "bg-[#21453A] text-white shadow-2xs"
                            : "text-[#1D1D1F] hover:bg-[#FAFAF8] hover:text-[#21453A]"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B88A2E]"></span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Product Grid & Pagination */}
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-[#ECE8E1] p-4 space-y-3 animate-pulse"
                  >
                    <div className="aspect-[3/4] bg-[#F6F3ED] rounded-xl"></div>
                    <div className="h-4 bg-[#F6F3ED] rounded w-3/4"></div>
                    <div className="h-4 bg-[#F6F3ED] rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-dashed border-[#ECE8E1] rounded-[24px] p-12 text-center space-y-3">
                <p className="text-base font-extrabold font-heading text-[#1D1D1F]">
                  No products match your selection
                </p>
                <p className="text-xs text-[#6B7280]">
                  Try clearing search keywords or selecting a different product
                  category.
                </p>
                <button
                  onClick={() => {
                    setSearchParams({});
                  }}
                  className="px-5 py-2.5 bg-[#21453A] text-white text-xs font-bold rounded-xl hover:bg-[#17322A] transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {products.map((p) => {
                    const mainImg =
                      p.images?.[0]?.imageUrl ||
                      "https://placehold.co/400x533?text=Nabis+Fashion";
                    const isDiscounted =
                      Number(p.discountPrice) > 0 &&
                      Number(p.discountPrice) < Number(p.price);

                    return (
                      <Link
                        key={p.id}
                        to={`/products/${p.slug || p.id}`}
                        className="group bg-white rounded-2xl border border-[#ECE8E1] overflow-hidden hover:border-forest/40 hover:shadow-md transition-all duration-300 flex flex-col
                         p-3 transform hover:-translate-y-1"
                      >
                        <div className="relative aspect-3/4 bg-[#FAFAF8] overflow-hidden rounded-xl mb-4">
                          <img
                            src={mainImg}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {isDiscounted && (
                            <span className="absolute top-3 left-3 bg-forest text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full z-10 shadow-2xs">
                              Sale
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(p);
                            }}
                            className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
                              isInWishlist(p.id)
                                ? "bg-red-50/90 text-[#D14343] shadow-md"
                                : "bg-white/80 text-[#6B7280] hover:text-[#1D1D1F] hover:bg-white"
                            }`}
                            title="Save to Wishlist"
                          >
                            <Heart
                              className={`w-4 h-4 ${isInWishlist(p.id) ? "fill-[#D14343] text-[#D14343]" : ""}`}
                            />
                          </button>
                        </div>
                        <div className="flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                              {p.category?.name || "Nabis Collection"}
                            </p>
                            <h3 className="font-extrabold text-[#1D1D1F] text-xs sm:text-sm truncate group-hover:text-[#21453A] transition-colors">
                              {p.title}
                            </h3>
                          </div>
                          <div className="flex items-baseline space-x-2">
                            <span className="font-extrabold text-[#1D1D1F] text-sm">
                              £
                              {isDiscounted
                                ? Number(p.discountPrice).toFixed(2)
                                : Number(p.price).toFixed(2)}
                            </span>
                            {isDiscounted && (
                              <span className="text-xs text-[#6B7280] line-through">
                                £{Number(p.price).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Server-Side Pagination Bar (12 per page) */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-8 pb-4 border-t border-[#ECE8E1]">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-3.5 py-2 border border-[#ECE8E1] rounded-xl text-xs font-bold text-[#1D1D1F] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all flex items-center gap-1"
                    >
                      <LuChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pg) => (
                        <button
                          key={pg}
                          onClick={() => handlePageChange(pg)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                            currentPage === pg
                              ? "bg-[#21453A] text-white shadow-sm font-black"
                              : "bg-white border border-[#ECE8E1] text-[#1D1D1F] hover:border-[#21453A]"
                          }`}
                        >
                          {pg}
                        </button>
                      ),
                    )}

                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-3.5 py-2 border border-[#ECE8E1] rounded-xl text-xs font-bold text-[#1D1D1F] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all flex items-center gap-1"
                    >
                      <span>Next</span>
                      <LuChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Category Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-4">
              <h2 className="font-extrabold text-base font-heading text-[#1D1D1F]">
                Categories
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-[#6B7280] hover:text-[#1D1D1F]"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-2">
              {allCategoryOptions.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => {
                      handleCategorySelect(cat.slug);
                      setMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                      categoryParam === cat.slug
                        ? "bg-[#21453A] text-white"
                        : "text-[#1D1D1F] hover:bg-[#FAFAF8]"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
