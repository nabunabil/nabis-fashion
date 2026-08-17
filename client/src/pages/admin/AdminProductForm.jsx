import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Tag,
  Image as ImageIcon,
  Layers,
  DollarSign,
  Package,
  Truck,
  Globe,
  Eye,
  Upload,
  Check,
  X,
  Plus,
  Trash2,
  Monitor,
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { api } from "../../lib/api";
import { useModal } from "../../context/ModalContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showAlert, showConfirm } = useModal();
  const isEditing = Boolean(id);

  const [activeTab, setActiveTab] = useState("basic");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [validationErrors, setValidationErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  // Main Form Data
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    categoryId: "1",
    subCategory: "Panjabi",
    brand: "Nabis Fashion",
    shortDescription: "",
    description: "",
    tags: "silk, luxury, embroidered",
    collections: "Autumn Collection",
    gender: "Men",
    season: "All Season",
    status: "Published",

    // Pricing
    price: "",
    discountPrice: "0",
    costPrice: "",
    tax: "0",
    discountPercent: "0",
    isFlashSale: false,

    // Inventory
    sku: `PNJ-${Math.floor(10000 + Math.random() * 90000)}`,
    barcode: "",
    stock: "25",
    lowStockWarning: "5",
    trackInventory: true,
    allowBackorder: false,
    weight: "0.5 kg",
    dimensions: "30x20x5 cm",

    // Shipping
    freeShipping: true,
    shippingCharge: "0",
    estimatedDelivery: "2-3 Business Days",
    cashOnDelivery: true,
    availableRegions: "Worldwide",

    // SEO
    metaTitle: "",
    metaDescription: "",
    keywords: "luxury panjabi, silk fashion, nabis fashion",
    canonicalUrl: "",
  });

  // Size-based Stock Variants State
  const [sizeStock, setSizeStock] = useState([
    { size: "S", stock: 10, color: "Solid Cotton Jacquard" },
    { size: "M", stock: 25, color: "Solid Cotton Jacquard" },
    { size: "L", stock: 15, color: "Solid Cotton Jacquard" },
    { size: "XL", stock: 10, color: "Solid Cotton Jacquard" },
    { size: "XXL", stock: 5, color: "Solid Cotton Jacquard" },
  ]);

  // Color Swatches
  const [selectedColor, setSelectedColor] = useState({
    name: "Solid Cotton Jacquard",
    hex: "#21453A",
  });

  // MULTIPLE IMAGE UPLOAD STATE
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const allGalleryImages = [
    ...existingImages.map((img) => ({ type: "existing", id: img.id, url: img.url })),
    ...newPreviews.map((url, idx) => ({ type: "new", index: idx, url })),
  ];

  useEffect(() => {
    async function initPage() {
      try {
        const catRes = await api.get("/categories");
        if (catRes?.success) {
          setCategories(catRes.data || []);
        }

        if (isEditing) {
          const prodRes = await api.get(`/products/${id}`);
          if (prodRes?.success && prodRes.data) {
            const p = prodRes.data;
            setFormData({
              title: p.title || "",
              slug: p.slug || "",
              categoryId: String(p.categoryId || "1"),
              subCategory: "Panjabi",
              brand: "Nabis Fashion",
              shortDescription: p.description?.slice(0, 120) || "",
              description: p.description || "",
              tags: "silk, luxury",
              collections: "Autumn Collection",
              gender: "Men",
              season: "All Season",
              status: "Published",
              price: String(p.price || 0),
              discountPrice: String(p.discountPrice || 0),
              costPrice: String(Number(p.price || 0) * 0.5),
              tax: "0",
              discountPercent: "0",
              isFlashSale: false,
              sku: `PNJ-${p.id}`,
              barcode: "",
              stock: String(p.stock || "25"),
              lowStockWarning: "5",
              trackInventory: true,
              allowBackorder: false,
              weight: "0.5 kg",
              dimensions: "30x20x5 cm",
              freeShipping: true,
              shippingCharge: "0",
              estimatedDelivery: "2-3 Business Days",
              cashOnDelivery: true,
              availableRegions: "Worldwide",
              metaTitle: p.title || "",
              metaDescription: p.description?.slice(0, 150) || "",
              keywords: "luxury panjabi, silk fashion",
              canonicalUrl: "",
            });

            // Load existing product images
            if (p.images && p.images.length > 0) {
              const loaded = p.images
                .map((img) => ({ id: img.id, url: img.imageUrl || img.url }))
                .filter((img) => Boolean(img.url));
              setExistingImages(loaded);
            }

            // Load existing size-based variants
            if (p.variants && p.variants.length > 0) {
              const loadedVariants = p.variants.map((v) => ({
                size: v.size || "M",
                stock: v.stock || 0,
                color: v.color || "Default",
              }));
              setSizeStock(loadedVariants);
            }
          }
        }
      } catch (err) {
        console.error("Error loading product data:", err);
      } finally {
        setLoading(false);
      }
    }

    initPage();
  }, [id, isEditing]);

  const processImageFiles = (filesArray) => {
    if (!filesArray || filesArray.length === 0) return;

    // Filter file sizes up to 10MB
    const validFiles = filesArray.filter((f) => f.size <= 10 * 1024 * 1024);
    if (validFiles.length < filesArray.length) {
      showAlert({
        title: "File Limit Exceeded",
        message: "Some files were skipped because they exceed the 10MB limit.",
        type: "warning",
      });
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Generate previews for each file
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // HANDLE MULTIPLE IMAGE FILE SELECTION
  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    processImageFiles(files);
  };

  // HANDLE DRAG AND DROP (LOCAL FILES OR EXTERNAL SITE IMAGE DROPS)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files || []);

    // 1. If files were dropped (from computer file manager or direct browser drag)
    if (droppedFiles.length > 0) {
      const imageFiles = droppedFiles.filter(
        (f) => f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|avif|gif|bmp|heic|svg)$/i.test(f.name)
      );
      if (imageFiles.length > 0) {
        processImageFiles(imageFiles);
        return;
      }
    }

    // 2. If an image was dragged from another website/tab (URL or HTML drop)
    const uriList = e.dataTransfer.getData("text/uri-list");
    const htmlData = e.dataTransfer.getData("text/html");
    const plainText = e.dataTransfer.getData("text/plain");

    let imageUrl = uriList || null;

    if (!imageUrl && htmlData) {
      const match = htmlData.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) {
        imageUrl = match[1];
      }
    }

    if (!imageUrl && plainText && /^https?:\/\/.+/i.test(plainText.trim())) {
      imageUrl = plainText.trim();
    }

    if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const ext = blob.type.split("/")[1] || "webp";
        const file = new File([blob], `dragged_photo_${Date.now()}.${ext}`, {
          type: blob.type || "image/webp",
        });
        processImageFiles([file]);
      } catch (err) {
        console.warn("Direct fetch blocked, attempting canvas image fallback for dragged URL:", err);
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width || 800;
          canvas.height = img.height || 800;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `dragged_photo_${Date.now()}.webp`, { type: "image/webp" });
              processImageFiles([file]);
            }
          }, "image/webp");
        };
        img.src = imageUrl;
      }
    }
  };

  const handleRemoveImage = (item) => {
    showConfirm({
      title: "Delete Product Image?",
      message: "Are you sure you want to remove this photo from the product gallery? This will permanently delete it.",
      isDanger: true,
      confirmText: "Yes, Delete Photo",
      cancelText: "Cancel",
      onConfirm: async () => {
        if (item.type === "existing") {
          try {
            await api.delete(`/products/images/${item.id}`);
            setExistingImages((prev) => prev.filter((img) => img.id !== item.id));
            showAlert({
              title: "Photo Deleted",
              message: "The product photo was permanently deleted from the store database and Cloudinary.",
              type: "success",
            });
          } catch (err) {
            showAlert({
              title: "Deletion Error",
              message: err.message || "Failed to delete image from server.",
              type: "error",
            });
          }
        } else {
          // Unuploaded local preview
          setSelectedFiles((prev) => prev.filter((_, idx) => idx !== item.index));
          setNewPreviews((prev) => prev.filter((_, idx) => idx !== item.index));
        }
      },
    });
  };

  const handleStockChange = (index, newStock) => {
    const updated = [...sizeStock];
    updated[index].stock = Math.max(0, parseInt(newStock, 10) || 0);
    setSizeStock(updated);

    // Auto calculate total stock sum
    const total = updated.reduce((acc, curr) => acc + curr.stock, 0);
    setFormData((prev) => ({ ...prev, stock: String(total) }));
  };

  const handleAddSizeVariant = () => {
    const newSize = prompt("Enter Size Name (e.g. 3XL, Custom):", "3XL");
    if (newSize) {
      setSizeStock([...sizeStock, { size: newSize.toUpperCase(), stock: 10, color: selectedColor.name }]);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Product Name is required";
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = "Price must be a positive number";
    if (!formData.sku.trim()) errors.sku = "SKU is required";
    if (!formData.shortDescription.trim()) errors.shortDescription = "Short description is required";
    if (allGalleryImages.length === 0) errors.image = "At least one product image is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showAlert({
        title: "Validation Error",
        message: "Please fix mandatory highlighted fields before publishing.",
        type: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      const totalStock = sizeStock.reduce((acc, curr) => acc + curr.stock, 0);

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || formData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: formData.description.trim() || formData.shortDescription.trim(),
        price: parseFloat(formData.price) || 0,
        discountPrice: parseFloat(formData.discountPrice) || 0,
        categoryId: parseInt(formData.categoryId, 10) || 1,
        variants: sizeStock.map((v) => ({
          size: v.size,
          color: selectedColor.name,
          stock: v.stock,
          sku: `${formData.sku}-${v.size}`,
        })),
      };

      let targetProduct = null;
      if (isEditing) {
        const updateRes = await api.put(`/products/${id}`, payload);
        targetProduct = updateRes.data || { id };
      } else {
        const createRes = await api.post("/products", payload);
        targetProduct = createRes.data;
      }

      // UPLOAD MULTIPLE IMAGES IF SELECTED
      if (selectedFiles.length > 0 && targetProduct?.id) {
        const fileData = new FormData();
        selectedFiles.forEach((file) => {
          fileData.append("images", file);
        });
        await api.post(`/products/${targetProduct.id}/images`, fileData);
      }

      navigate("/admin/products");
    } catch (err) {
      showAlert({
        title: "Save Failed",
        message: err.message || "Failed to save product details.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#21453A]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#ECECEC] shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/products")}
            className="p-2 bg-[#F8F8F6] border border-[#ECECEC] rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B88A2E]" />
              {isEditing ? `Edit Product: ${formData.title}` : "Create New Fashion Product"}
            </h2>
            <p className="text-xs text-[#6B7280]">
              Configure details, multiple images, size-based inventory, pricing, and SEO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-4 py-2 border border-[#ECECEC] rounded-xl text-xs font-semibold text-[#6B7280] hover:bg-[#F8F8F6]"
          >
            Cancel
          </button>
          <button
            onClick={handleFormSubmit}
            disabled={saving}
            className="px-5 py-2 bg-[#21453A] text-white rounded-xl text-xs font-bold hover:bg-[#163028] btn-press shadow-2xs"
          >
            {saving ? "Publishing..." : isEditing ? "Save Changes" : "Publish Product"}
          </button>
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex border-b border-[#ECECEC] bg-white rounded-2xl p-2 border shadow-2xs overflow-x-auto gap-1">
        {[
          { id: "basic", label: "Basic Info", icon: Tag },
          { id: "images", label: "Multiple Images", icon: ImageIcon },
          { id: "variants", label: "Size & Stock", icon: Layers },
          { id: "pricing", label: "Pricing", icon: DollarSign },
          { id: "inventory", label: "Inventory SKU", icon: Package },
          { id: "shipping", label: "Shipping", icon: Truck },
          { id: "seo", label: "SEO", icon: Globe },
          { id: "preview", label: "Live Preview", icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 rounded-xl transition-all btn-press ${
                isActive
                  ? "bg-[#21453A] text-white font-bold shadow-2xs"
                  : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8F8F6]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content Body */}
      <div className="card-premium p-6 space-y-6">
        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === "basic" && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const auto = slugify(newTitle);
                    setFormData((prev) => ({
                      ...prev,
                      title: newTitle,
                      slug: prev.isSlugManuallyEdited ? prev.slug : auto,
                    }));
                  }}
                  placeholder="e.g. MEN'S CASUAL PANJABI"
                  className={`w-full px-3.5 py-2.5 bg-[#F8F8F6] border rounded-xl outline-none focus:border-[#21453A] ${
                    validationErrors.title ? "border-red-500" : "border-[#ECECEC]"
                  }`}
                />
                {validationErrors.title && <p className="text-[10px] text-red-500 mt-1">{validationErrors.title}</p>}
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1 flex justify-between items-center">
                  <span>Product URL Slug</span>
                  <span className="text-[10px] text-[#B88A2E] font-semibold">Auto-Generated</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value, isSlugManuallyEdited: true })
                    }
                    placeholder="e.g. mens-casual-panjabi"
                    className="flex-1 px-3.5 py-2.5 bg-[#F8F8F6] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A] font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const auto = slugify(formData.title);
                      setFormData({ ...formData, slug: auto, isSlugManuallyEdited: false });
                    }}
                    className="px-3 py-2 bg-[#F6F3ED] border border-[#ECECEC] rounded-xl text-xs font-bold text-[#21453A] hover:bg-[#21453A] hover:text-white transition-colors"
                  >
                    Auto
                  </button>
                </div>
                <p className="text-[10px] text-[#6B7280] mt-1 font-mono">
                  URL Preview: /products/{formData.slug || "slug-preview"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Category *</label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">Sub Category</label>
                <input
                  type="text"
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  placeholder="Panjabi"
                  className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">Gender</label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => setFormData({ ...formData, gender: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Men">Men</SelectItem>
                    <SelectItem value="Women">Women</SelectItem>
                    <SelectItem value="Unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#111827] mb-1">Short Description *</label>
              <input
                type="text"
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Brief summary for catalog view..."
                className={`w-full px-3.5 py-2.5 bg-[#F8F8F6] border rounded-xl outline-none focus:border-[#21453A] ${
                  validationErrors.shortDescription ? "border-red-500" : "border-[#ECECEC]"
                }`}
              />
            </div>

            <div>
              <label className="block font-bold text-[#111827] mb-1">Full Description</label>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed craftsmanship, fabric origins, and care notes..."
                className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
              />
            </div>
          </div>
        )}

        {/* TAB 2: MULTIPLE IMAGES UPLOAD */}
        {activeTab === "images" && (
          <div className="space-y-6 text-xs">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-3 transition-all duration-200 cursor-pointer ${
                isDragging
                  ? "border-[#21453A] bg-[#21453A]/10 scale-[1.01] ring-4 ring-[#21453A]/20 shadow-lg"
                  : "border-[#ECECEC] bg-[#F8F8F6] hover:border-[#21453A]/50 hover:bg-white"
              }`}
            >
              <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-transform duration-200 ${
                isDragging ? "bg-[#21453A] text-white scale-110" : "bg-white border-[#ECECEC] text-[#21453A]"
              }`}>
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-[#111827] text-sm">
                  {isDragging ? "Drop Photos Right Here to Upload!" : "Drag & Drop Product Photos Here"}
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Drag photos from your computer OR directly from another website tab (AVIF, WEBP, PNG, JPG supported)
                </p>
              </div>
              <label className="px-5 py-2.5 bg-[#21453A] text-white rounded-xl font-bold cursor-pointer hover:bg-[#163028] transition-colors btn-press shadow-2xs">
                Browse & Select Multiple Photos
                <input
                  type="file"
                  multiple
                  accept="image/*,.avif,.webp,.heic"
                  className="hidden"
                  onChange={handleMultipleFilesChange}
                />
              </label>
            </div>
            {validationErrors.image && <p className="text-xs text-red-500 font-bold">{validationErrors.image}</p>}

            {/* PREVIEW GALLERY FOR ALL UPLOADED IMAGES */}
            {allGalleryImages.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-[#111827] text-xs flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#21453A]" /> Uploaded Photo Gallery ({allGalleryImages.length} Images)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {allGalleryImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden border border-[#ECECEC] bg-white h-36">
                      <img src={img.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveImage(img);
                        }}
                        className="absolute top-2 right-2 z-30 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-md cursor-pointer pointer-events-auto active:scale-95"
                        title="Remove Image"
                      >
                        <X className="w-4 h-4 pointer-events-none" />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                        #{idx + 1} {idx === 0 ? "(Featured)" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SIZE & STOCK MANAGEMENT */}
        {activeTab === "variants" && (
          <div className="space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-[#ECECEC]">
              <div>
                <h4 className="font-heading text-sm font-bold text-[#111827]">Manage Stock by Size</h4>
                <p className="text-xs text-[#6B7280]">
                  Set exact available inventory counts for each size (S, M, L, XL, XXL)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSizeVariant}
                className="px-3.5 py-1.5 bg-[#21453A] text-white rounded-xl text-xs font-semibold hover:bg-[#163028] transition-colors btn-press flex items-center gap-1.5 self-start"
              >
                <Plus className="w-4 h-4" /> Add Custom Size
              </button>
            </div>

            {/* Size Stock Inventory List */}
            <div className="space-y-3">
              {sizeStock.map((v, idx) => (
                <div key={idx} className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#ECECEC] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#21453A] text-white flex items-center justify-center font-bold text-xs">
                      {v.size}
                    </span>
                    <div>
                      <p className="font-bold text-[#111827]">Size {v.size}</p>
                      <p className="text-[10px] text-[#6B7280]">SKU Variant: {formData.sku}-{v.size}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-[#111827]">Available Stock:</label>
                    <input
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) => handleStockChange(idx, e.target.value)}
                      className="w-24 px-3 py-2 bg-white border border-[#ECECEC] rounded-xl text-xs font-bold outline-none focus:border-[#21453A]"
                    />
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      v.stock > 0 ? "bg-[#DCFCE7] text-[#15803D]" : "bg-red-50 text-red-600"
                    }`}>
                      {v.stock > 0 ? `${v.stock} in stock` : "Out of Stock"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Color Swatch Definition */}
            <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-[#B88A2E]/20 space-y-2">
              <h5 className="font-bold text-[#111827]">Product Fabric & Color</h5>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={selectedColor.hex}
                  onChange={(e) => setSelectedColor({ ...selectedColor, hex: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={selectedColor.name}
                  onChange={(e) => setSelectedColor({ ...selectedColor, name: e.target.value })}
                  className="px-3 py-1.5 bg-white border border-[#ECECEC] rounded-xl text-xs font-bold text-[#111827]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRICING */}
        {activeTab === "pricing" && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Regular Price (£) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="65.00"
                  className={`w-full px-3.5 py-2.5 bg-[#F8F8F6] border rounded-xl outline-none focus:border-[#21453A] ${
                    validationErrors.price ? "border-red-500" : "border-[#ECECEC]"
                  }`}
                />
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Sale Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  placeholder="45.00"
                  className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: INVENTORY */}
        {activeTab === "inventory" && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#111827] mb-1">SKU *</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-[#F8F8F6] border rounded-xl outline-none focus:border-[#21453A] ${
                    validationErrors.sku ? "border-red-500" : "border-[#ECECEC]"
                  }`}
                />
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Total Calculated Stock</label>
                <input
                  type="number"
                  readOnly
                  value={formData.stock}
                  className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#ECECEC] rounded-xl font-bold text-[#21453A] outline-none"
                />
                <p className="text-[10px] text-[#6B7280] mt-1">Automatically calculated from size breakdown</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SHIPPING */}
        {activeTab === "shipping" && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#F8F8F6] rounded-xl border border-[#ECECEC] flex items-center justify-between">
              <span className="font-bold text-[#111827]">Free Delivery Eligible</span>
              <input
                type="checkbox"
                checked={formData.freeShipping}
                onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                className="w-4 h-4 accent-[#21453A]"
              />
            </div>
          </div>
        )}

        {/* TAB 7: SEO */}
        {activeTab === "seo" && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#111827] mb-1">Meta Title</label>
              <input
                type="text"
                value={formData.metaTitle || formData.title}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#ECECEC] rounded-xl outline-none"
              />
            </div>

            <div className="p-4 bg-white border border-[#ECECEC] rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#6B7280]">Google Search Snippet Preview</span>
              <p className="text-sm font-bold text-blue-700 hover:underline">{formData.metaTitle || formData.title || "Nabis Fashion Item"} | Nabis Fashion</p>
              <p className="text-[11px] text-green-700 font-mono">https://nabisfashion.com/products/{formData.slug || "item"}</p>
              <p className="text-xs text-[#6B7280]">{formData.shortDescription || "Discover handcrafted luxury fashion..."}</p>
            </div>
          </div>
        )}

        {/* TAB 8: LIVE PREVIEW */}
        {activeTab === "preview" && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center bg-[#F8F8F6] p-3 rounded-xl border border-[#ECECEC]">
              <span className="font-bold text-[#111827]">Device Live Storefront Preview</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#ECECEC]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded ${previewDevice === "desktop" ? "bg-[#21453A] text-white" : "text-[#6B7280]"}`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded ${previewDevice === "mobile" ? "bg-[#21453A] text-[#21453A]" : "text-[#6B7280]"}`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={`mx-auto border border-[#ECECEC] rounded-2xl overflow-hidden shadow-lg bg-[#F8F8F6] p-4 transition-all ${
              previewDevice === "mobile" ? "max-w-sm" : "w-full"
            }`}>
              <div className="bg-white p-4 rounded-xl space-y-3">
                <img src={allGalleryImages[0]?.url || "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&auto=format&fit=crop&q=80"} alt="Preview" className="w-full h-56 object-cover rounded-xl" />
                <h4 className="font-heading font-bold text-sm text-[#111827]">{formData.title || "Product Title"}</h4>
                <p className="text-xs font-bold text-[#21453A]">£{formData.discountPrice || formData.price || "45.00"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Save Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#ECECEC]">
        <span className="text-xs text-[#6B7280]">
          {Object.keys(validationErrors).length > 0 ? (
            <span className="text-red-500 font-bold">⚠ Fix mandatory highlighted fields before publishing</span>
          ) : (
            "✔ Ready to Publish"
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-4 py-2 border border-[#ECECEC] rounded-xl text-xs font-semibold text-[#6B7280] hover:bg-[#F8F8F6]"
          >
            Cancel
          </button>
          <button
            onClick={handleFormSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-[#21453A] text-white rounded-xl text-xs font-bold hover:bg-[#163028] btn-press shadow-2xs"
          >
            {saving ? "Publishing..." : isEditing ? "Save Changes" : "Publish Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
