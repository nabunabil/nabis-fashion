import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "../../lib/api";
import { useModal } from "../../context/ModalContext";

export default function AdminProducts() {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Server-Side Pagination state (15 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("page", String(currentPage));
      query.set("limit", "15"); // 15 products per page
      if (categoryFilter !== "All") query.set("category", categoryFilter);
      if (search.trim()) query.set("search", search.trim());

      const [pRes, cRes] = await Promise.all([
        api.get(`/products?${query.toString()}`),
        api.get("/categories"),
      ]);

      if (pRes && pRes.success) {
        setProducts(pRes.data || []);
        setTotalProducts(pRes.totalProducts || (pRes.data ? pRes.data.length : 0));
        setTotalPages(pRes.totalPages || 1);
      } else {
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }

      if (cRes && cRes.success && Array.isArray(cRes.data)) {
        setCategories(cRes.data);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, categoryFilter, search]);

  const handleDelete = (id) => {
    showConfirm({
      title: "Delete Fashion Item",
      message: "Are you sure you want to delete this fashion item from inventory?",
      isDanger: true,
      confirmText: "Delete Item",
      onConfirm: async () => {
        try {
          await api.delete(`/products/${id}`);
          loadData();
        } catch (err) {
          showAlert({
            title: "Product Deletion Failed",
            message: err.message || "Failed to delete product.",
            type: "error",
          });
        }
      },
    });
  };

  return (
    <div className="space-y-6 font-sans text-[#111827]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
            Product Catalog Management
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage your store inventory, multi-color variants, pricing, and live storefront items
          </p>
        </div>

        {/* Dedicated Page Navigation for Create Product */}
        <Link
          to="/admin/products/create"
          className="px-4 py-2.5 bg-[#21453A] text-white text-xs font-bold rounded-xl hover:bg-[#163028] transition-colors btn-press shadow-2xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#B88A2E]" />
          <span>Create Product</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product title or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#F8F8F6] border border-[#ECECEC] rounded-xl text-xs text-[#111827] placeholder-[#6B7280] outline-none focus:border-[#21453A]/40 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => {
              setCategoryFilter("All");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors btn-press ${
              categoryFilter === "All"
                ? "bg-[#21453A] text-white shadow-2xs"
                : "bg-[#F8F8F6] text-[#6B7280] hover:text-[#111827] border border-[#ECECEC]"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryFilter(cat.slug || cat.name);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors btn-press ${
                categoryFilter === cat.slug || categoryFilter === cat.name
                  ? "bg-[#21453A] text-white shadow-2xs"
                  : "bg-[#F8F8F6] text-[#6B7280] hover:text-[#111827] border border-[#ECECEC]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="card-premium space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#21453A]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-[#6B7280]">
            <Package className="w-12 h-12 mx-auto text-[#ECECEC] mb-3" />
            <h3 className="text-sm font-bold text-[#111827]">No Products Found</h3>
            <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
              Click "Create Product" above to open the full-page product configuration wizard.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#ECECEC] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Base Price</th>
                    <th className="py-3 px-4">Discount Price</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECECEC] text-[#111827]">
                  {products.map((p) => {
                    const image =
                      p.images?.[0]?.imageUrl ||
                      p.images?.[0]?.url ||
                      "https://placehold.co/400x533?text=Nabis+Fashion";

                    return (
                      <tr key={p.id} className="hover:bg-[#F8F8F6] transition-colors group">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={image}
                              alt={p.title}
                              className="w-10 h-10 rounded-xl object-cover border border-[#ECECEC] flex-shrink-0 bg-neutral-100"
                            />
                            <div>
                              <p className="font-extrabold text-[#111827]">{p.title}</p>
                              <p className="text-[10px] text-[#6B7280] truncate max-w-xs">{p.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#6B7280]">
                          {p.category?.name || `Category #${p.categoryId}`}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-[#21453A]">
                          £{Number(p.price).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#6B7280]">
                          {Number(p.discountPrice) > 0 ? (
                            <span className="font-extrabold text-[#B88A2E]">
                              £{Number(p.discountPrice).toFixed(2)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => window.open(`/products/${p.slug || p.id}`, "_blank")}
                              className="p-1.5 text-[#6B7280] hover:text-[#21453A] hover:bg-white rounded-lg transition-colors"
                              title="Live Storefront Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                              className="p-1.5 text-[#6B7280] hover:text-[#21453A] hover:bg-white rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-white rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Server-Side Pagination Bar (15 products per page) */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#ECECEC] bg-[#FAFAF8] rounded-b-2xl">
                <span className="text-xs text-[#6B7280]">
                  Showing Page <strong className="text-[#111827]">{currentPage}</strong> of{" "}
                  <strong className="text-[#111827]">{totalPages}</strong> ({totalProducts} Total Catalog Items)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-[#ECECEC] bg-white rounded-xl text-xs font-bold text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F8FA] flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pg
                          ? "bg-[#21453A] text-white shadow-sm font-black"
                          : "bg-white border border-[#ECECEC] text-[#111827] hover:border-[#21453A]"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 border border-[#ECECEC] bg-white rounded-xl text-xs font-bold text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F8FA] flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
