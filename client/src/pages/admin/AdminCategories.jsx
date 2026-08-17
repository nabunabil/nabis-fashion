import React, { useState, useEffect } from "react";
import { FolderTree, Plus, Package, Pencil, Trash2, ArrowUpRight, X, AlertTriangle, Sparkles, Folder } from "lucide-react";
import { api } from "../../lib/api";
import { useModal } from "../../context/ModalContext";

export default function AdminCategories() {
  const { showAlert } = useModal();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // DELETE CONFIRMATION MODAL STATE
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      if (res?.success) {
        setCategories(res.data || []);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setErrorMsg("");
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setSlug(cat.slug || "");
    setErrorMsg("");
    setIsFormModalOpen(true);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Category name is required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, payload);
      } else {
        await api.post("/categories", payload);
      }

      setIsFormModalOpen(false);
      loadCategories();
    } catch (err) {
      setErrorMsg(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  // EXECUTE DELETION AFTER USER CONFIRMATION IN MODAL
  const handleConfirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    setDeleting(true);

    try {
      await api.delete(`/categories/${deletingCategory.id}`);
      setDeletingCategory(null);
      loadCategories();
    } catch (err) {
      showAlert({
        title: "Category Deletion Failed",
        message: err.message || "Unknown error occurred while deleting category.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
            Categories & Collections
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Organize catalog groupings, sub-collections, and storefront navigation
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-[#21453A] text-white text-xs font-semibold rounded-xl hover:bg-[#163028] transition-colors btn-press shadow-2xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Category
        </button>
      </div>

      {/* Category Cards Grid */}
      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#21453A]"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="card-premium py-12 text-center text-[#6B7280]">
          <FolderTree className="w-10 h-10 mx-auto text-[#ECECEC] mb-2" />
          <p className="text-xs font-semibold">No product categories found.</p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#21453A] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const productCount = cat._count?.products || cat.productsCount || 0;
            const imageUrl =
              cat.image ||
              "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&auto=format&fit=crop&q=80";

            return (
              <div key={cat.id} className="card-premium card-hover space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="relative h-36 rounded-xl overflow-hidden border border-[#ECECEC] bg-neutral-100">
                    <img src={imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[#21453A] rounded-full text-[10px] font-bold shadow-xs">
                      {productCount} Items
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-base font-bold text-[#111827]">{cat.name}</h3>
                    <p className="text-xs text-[#6B7280] font-mono mt-0.5">/{cat.slug}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ECECEC] flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 bg-[#DCFCE7] text-[#15803D] rounded-full font-bold text-[10px]">
                    Active Status
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="p-1.5 text-[#6B7280] hover:text-[#21453A] hover:bg-[#F8F8F6] rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {/* TRASH BUTTON TRIGGERS CONFIRMATION MODAL */}
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#ECECEC] flex justify-between items-center bg-[#F8F8F6]">
              <h3 className="font-heading text-sm font-bold text-[#111827]">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-[#6B7280] hover:text-[#111827]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl font-medium">{errorMsg}</div>
              )}

              <div>
                <label className="block font-bold text-[#111827] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Punjabi Collection"
                  className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="punjabi-collection"
                  className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                />
              </div>

              <div className="pt-4 border-t border-[#ECECEC] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#ECECEC] text-[#6B7280] font-semibold hover:bg-[#F8F8F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#21453A] text-white rounded-xl font-bold hover:bg-[#163028] btn-press"
                >
                  {submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-[#EF4444] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-heading text-base font-bold text-[#111827]">
                  Confirm Category Deletion
                </h3>
                <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                  Are you sure you want to delete the category <span className="font-bold text-[#111827]">"{deletingCategory.name}"</span>? Products linked to this category may lose their category classification.
                </p>
              </div>

              <div className="pt-3 border-t border-[#ECECEC] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                  className="px-4 py-2 rounded-xl border border-[#ECECEC] text-xs font-semibold text-[#6B7280] hover:bg-[#F8F8F6]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteCategory}
                  disabled={deleting}
                  className="px-5 py-2 bg-[#EF4444] text-white rounded-xl text-xs font-bold hover:bg-red-700 btn-press"
                >
                  {deleting ? "Deleting..." : "Confirm Delete Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
