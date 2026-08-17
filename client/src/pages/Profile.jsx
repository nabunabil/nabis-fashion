import React, { useEffect, useState } from "react";
import {
  LuAward,
  LuBell,
  LuCamera,
  LuCheck,
  LuChevronRight,
  LuDownload,
  LuEye,
  LuEyeOff,
  LuHeart,
  LuHouse,
  LuBuilding,
  LuCircleHelp,
  LuLaptop,
  LuLayoutGrid,
  LuLock,
  LuLogOut,
  LuMapPin,
  LuPackage,
  LuPencil,
  LuPlus,
  LuShieldCheck,
  LuShoppingBag,
  LuSmartphone,
  LuTrash2,
  LuTruck,
  LuUpload,
  LuUser,
  LuX,
} from "react-icons/lu";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useModal } from "../context/ModalContext";
import { useWishlist } from "../context/WishlistContext";
import { api } from "../lib/api";
import { authClient } from "../lib/auth-client";

// Initial Mock Wishlist Items featuring Nabis Fashion product lines
const initialWishlist = [
  {
    id: "w1",
    title: "Royal Emerald Silk Panjabi",
    category: "Panjabi Collections",
    price: 185.0,
    discountPrice: 155.0,
    image:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    inStock: true,
    discount: "16% OFF",
    variantId: 1,
  },
  {
    id: "w2",
    title: "Handwoven Muslin Jamdani Saree",
    category: "Sarees",
    price: 340.0,
    discountPrice: 295.0,
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    inStock: true,
    discount: "13% OFF",
    variantId: 2,
  },
  {
    id: "w3",
    title: "Minimalist Ivory Cotton Punjabi",
    category: "Men's Punjabi",
    price: 120.0,
    discountPrice: null,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop",
    inStock: true,
    discount: null,
    variantId: 3,
  },
  {
    id: "w4",
    title: "Gold-Embroidered Velvet Evening Dress",
    category: "Women's Dresses",
    price: 260.0,
    discountPrice: 210.0,
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
    inStock: false,
    discount: "19% OFF",
    variantId: 4,
  },
];

// Initial Notifications
const initialNotifications = [];

function Profile() {
  const {
    data: session,
    isPending: sessionLoading,
    refetch,
  } = authClient.useSession();
  const { addItem } = useCart();
  const { downloadPdf, showAlert, showConfirm } = useModal();
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab State (overview | profile | address | orders | wishlist | notifications | security)
  const currentTab = searchParams.get("tab") || "overview";

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // State Management
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "male",
    birthday: "1994-06-18",
    country: "United Kingdom",
    city: "London",
    zipCode: "SW1A 1AA",
    avatar: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState({ type: "", msg: "" });

  // Address Book State
  const [addresses, setAddresses] = useState([]);
  const [activeAddressId, setActiveAddressId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    street: "",
    city: "London",
    state: "Greater London",
    zip: "SW1A 1AA",
    country: "United Kingdom",
    isDefault: false,
  });

  // Fetch addresses from Prisma database via API
  const fetchAddresses = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await api.get("/addresses");
      if (res && res.success && Array.isArray(res.data)) {
        setAddresses(res.data);
        const def = res.data.find((a) => a.isDefault) || res.data[0];
        setActiveAddressId(def ? def.id : null);
      }
    } catch (e) {
      console.warn("Could not fetch user addresses from API:", e);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setActiveAddressId(null);
    }
  }, [session?.user?.id]);

  // Wishlist State
  const [cartAddingId, setCartAddingId] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await api.get("/notifications");
      if (res && res.success) {
        setNotifications(res.data || []);
        setUnreadNotificationsCount(res.unreadCount || 0);
      }
    } catch (e) {
      console.warn("Could not fetch notifications from API:", e);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id]);

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      await fetchNotifications();
    } catch (e) {
      console.error("Failed to mark all notifications as read:", e);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      await fetchNotifications();
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };

  // Security State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securityMsg, setSecurityMsg] = useState({ type: "", text: "" });

  // Fetch real order history from API
  const loadOrders = async () => {
    try {
      const res = await api.get("/orders/me");
      if (res && res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      navigate("/login");
      return;
    }

    setProfileForm({
      fullName: session.user.name || "",
      email: session.user.email || "",
      phone: session.user.phone || "",
      gender: "male",
      birthday: "1994-06-18",
      country: "Bangladesh",
      city: "Dhaka",
      zipCode: "1213",
      avatar: session.user.image || "",
    });

    loadOrders();
  }, [session, sessionLoading]);

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileFeedback({ type: "", msg: "" });

    try {
      const res = await api.put("/user/me", {
        name: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        ...(profileForm.avatar.trim()
          ? { image: profileForm.avatar.trim() }
          : {}),
      });

      if (res && res.success) {
        setProfileFeedback({
          type: "success",
          msg: "Profile information updated successfully.",
        });
        if (typeof refetch === "function") refetch();
      } else {
        setProfileFeedback({
          type: "error",
          msg: res?.message || "Failed to update profile.",
        });
      }
    } catch (err) {
      setProfileFeedback({
        type: "error",
        msg: err.message || "An error occurred while saving.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Address Save
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await api.put(`/addresses/${editingAddressId}`, addressForm);
      } else {
        await api.post("/addresses", addressForm);
      }
      await fetchAddresses();
      setShowAddressModal(false);
      setEditingAddressId(null);
      showAlert({
        title: "Address Saved",
        message: `"${addressForm.label}" address has been saved to your database account.`,
        type: "success",
      });
    } catch (err) {
      showAlert({
        title: "Error Saving Address",
        message: err.message || "Failed to save address to database.",
        type: "error",
      });
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await api.patch(`/addresses/${id}/default`);
      await fetchAddresses();
      setActiveAddressId(id);
      showAlert({
        title: "Default Address Updated",
        message: "This address has been set as your primary delivery location.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to update default address:", err);
    }
  };

  const handleDeleteAddress = (id) => {
    showConfirm({
      title: "Delete Address",
      message: "Are you sure you want to delete this delivery address?",
      isDanger: true,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await api.delete(`/addresses/${id}`);
          await fetchAddresses();
        } catch (err) {
          console.error("Failed to delete address:", err);
        }
      },
    });
  };

  // Move to Cart handler
  const handleMoveToCart = async (item) => {
    setCartAddingId(item.id);
    try {
      const vId = Number(item.variantId || item.id);
      if (!isNaN(vId) && vId > 0) {
        await addItem(vId, 1, item);
      }
      removeFromWishlist(item.id);
      showAlert({
        title: "Added to Shopping Bag",
        message: `"${item.title}" has been moved to your shopping bag.`,
        type: "success",
      });
    } catch (err) {
      showAlert({
        title: "Error",
        message: err.message || "Failed to add item to bag.",
        type: "error",
      });
    } finally {
      setCartAddingId(null);
    }
  };

  const handleRemoveWishlist = (id) => {
    removeFromWishlist(id);
  };

  // Handle Security Password Update
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setSecurityMsg({ type: "", text: "" });

    if (securityForm.newPassword.length < 8) {
      setSecurityMsg({
        type: "error",
        text: "New password must be at least 8 characters long.",
      });
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityMsg({
        type: "error",
        text: "New password and confirmation do not match.",
      });
      return;
    }

    setSecurityMsg({
      type: "success",
      text: "Security settings and password updated successfully!",
    });
    setSecurityForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Logout handler
  const handleLogout = async () => {
    await authClient.signOut();
    navigate("/login", { replace: true });
  };

  if (sessionLoading || ordersLoading) {
    return (
      <div className="pt-32 pb-20 flex items-center justify-center min-h-[60vh] bg-[#FAFAF8]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ECE8E1] border-t-[#21453A]" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
            Loading Nabis Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const userInitials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "NF";

  return (
    <div className="pt-24 sm:pt-28 pb-20 bg-[#FAFAF8] min-h-screen font-sans text-[#1D1D1F]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Main Dashboard Container Grid */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 items-start">
          {/* ================= SIDEBAR (280px) ================= */}
          <aside className="w-full space-y-6 mb-8 lg:mb-0">
            {/* Profile Cover Card */}
            <div className="bg-white rounded-[20px] border border-[#ECE8E1] shadow-soft overflow-hidden">
              {/* Cover Header */}
              <div className="h-24 bg-[#21453A] relative p-4 flex justify-between items-start">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                  <LuShieldCheck className="h-3.5 w-3.5 text-[#B88A2E]" />
                  <span>VIP Member</span>
                </span>
                <span className="text-[10px] font-medium text-white/70">
                  Est. 2024
                </span>
              </div>

              {/* Avatar & User Details */}
              <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">
                <div className="relative -mt-12 mb-3">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-neutral-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#21453A] text-white flex items-center justify-center text-2xl font-bold font-heading border-4 border-white shadow-md">
                      {userInitials}
                    </div>
                  )}
                  {/* Avatar Upload Camera Button */}
                  <label
                    htmlFor="sidebar-avatar-input"
                    className="absolute bottom-0 right-0 p-2 bg-[#B88A2E] hover:bg-[#9E7425] text-white rounded-full cursor-pointer shadow-md transition-transform hover:scale-105"
                    title="Change Profile Photo"
                  >
                    <LuCamera className="h-3.5 w-3.5" />
                    <input
                      id="sidebar-avatar-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileForm((prev) => ({
                              ...prev,
                              avatar: reader.result,
                            }));
                            setActiveTab("profile");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <h3 className="text-lg font-bold font-heading text-[#1D1D1F] tracking-tight">
                  {session.user.name}
                </h3>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                  {session.user.email}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#21453A] bg-[#F6F3ED] px-3 py-1 rounded-full border border-[#ECE8E1]">
                  <span>Member Since:</span>
                  <span>
                    {new Date(
                      session.user.createdAt || Date.now(),
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Sidebar Menu */}
              <div className="border-t border-[#ECE8E1] p-3 space-y-1">
                {[
                  { id: "overview", label: "Overview", icon: LuLayoutGrid },
                  { id: "profile", label: "Profile Information", icon: LuUser },
                  { id: "address", label: "Address Book", icon: LuMapPin },
                  {
                    id: "orders",
                    label: "Order History",
                    icon: LuPackage,
                    count: orders.length,
                  },
                  {
                    id: "wishlist",
                    label: "Wishlist",
                    icon: LuHeart,
                    count: wishlist.length,
                  },
                  {
                    id: "notifications",
                    label: "Notifications",
                    icon: LuBell,
                    count: unreadCount,
                  },
                  { id: "security", label: "Change Password", icon: LuLock },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-[#21453A] text-white shadow-sm font-bold"
                          : "text-[#1D1D1F] hover:bg-[#F6F3ED] hover:text-[#21453A]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 ${isActive ? "text-[#B88A2E]" : "text-[#6B7280]"}`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {typeof item.count === "number" && item.count > 0 && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? "bg-[#B88A2E] text-white"
                              : item.id === "notifications" && unreadCount > 0
                                ? "bg-[#D14343] text-white"
                                : "bg-[#F6F3ED] text-[#21453A]"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-[#D14343] hover:bg-red-50 transition-colors"
                >
                  <LuLogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Bottom Support Card */}
            <div className="bg-[#F6F3ED] border border-[#ECE8E1] rounded-[20px] p-5 space-y-3 shadow-soft">
              <div className="flex items-center gap-2 text-[#21453A]">
                <LuCircleHelp className="h-5 w-5 text-[#B88A2E]" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-heading">
                  Need Help?
                </h4>
              </div>
              <p className="text-xs text-[#6B7280] font-normal leading-relaxed">
                Our fashion concierges are available 24/7 for size
                recommendations and order assistance.
              </p>
              <button
                onClick={() =>
                  showAlert({
                    title: "Nabis Concierge Live Chat",
                    message: "Connecting to Nabis Concierge 24/7 Live Assistance...",
                    type: "info",
                  })
                }
                className="w-full bg-[#21453A] hover:bg-[#17322A] text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm"
              >
                Contact Support
              </button>
            </div>
          </aside>

          {/* ================= MAIN CONTENT AREA ================= */}
          <main className="space-y-8">
            {/* Top Welcome Section */}
            <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#B88A2E]">
                  Customer Portal
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#1D1D1F] tracking-tight mt-1">
                  Welcome back, {session.user.name.split(" ")[0]}
                </h1>
                <p className="text-xs text-[#6B7280] font-medium mt-1">
                  Last login: Today at 10:45 AM • Member ID #NBS-8821
                </p>
              </div>

              {/* Action shortcuts */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/products")}
                  className="bg-[#21453A] hover:bg-[#17322A] text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 uppercase tracking-wider"
                >
                  <LuShoppingBag className="h-4 w-4 text-[#B88A2E]" />
                  <span>Explore Catalog</span>
                </button>
              </div>
            </div>

            {/* Quick Statistics Cards Grid (4 Cards) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stats Card 1: Orders */}
              <div
                onClick={() => setActiveTab("orders")}
                className="bg-white border border-[#ECE8E1] rounded-[20px] p-5 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-[#6B7280]">
                    Total Orders
                  </span>
                  <div className="p-2.5 bg-[#F6F3ED] text-[#21453A] rounded-xl group-hover:bg-[#21453A] group-hover:text-white transition-colors">
                    <LuPackage className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold font-heading text-[#1D1D1F]">
                  {orders.length}
                </div>
                <p className="text-[11px] text-[#2E7D32] font-medium mt-1 flex items-center gap-1">
                  <LuCheck className="h-3.5 w-3.5" />
                  <span>2 items in transit</span>
                </p>
              </div>

              {/* Stats Card 2: Wishlist */}
              <div
                onClick={() => setActiveTab("wishlist")}
                className="bg-white border border-[#ECE8E1] rounded-[20px] p-5 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-[#6B7280]">
                    Saved Items
                  </span>
                  <div className="p-2.5 bg-[#F6F3ED] text-[#21453A] rounded-xl group-hover:bg-[#21453A] group-hover:text-white transition-colors">
                    <LuHeart className="h-5 w-5 text-[#D14343]" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold font-heading text-[#1D1D1F]">
                  {wishlist.length}
                </div>
                <p className="text-[11px] text-[#6B7280] font-medium mt-1">
                  In your saved list
                </p>
              </div>

              {/* Stats Card 3: Saved Address */}
              <div
                onClick={() => setActiveTab("address")}
                className="bg-white border border-[#ECE8E1] rounded-[20px] p-5 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-[#6B7280]">
                    Saved Address
                  </span>
                  <div className="p-2.5 bg-[#F6F3ED] text-[#21453A] rounded-xl group-hover:bg-[#21453A] group-hover:text-white transition-colors">
                    <LuMapPin className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold font-heading text-[#1D1D1F]">
                  {addresses.length}
                </div>
                <p className="text-[11px] text-[#6B7280] font-medium mt-1 truncate">
                  Default:{" "}
                  {addresses.find((a) => a.isDefault)?.city || "London, United Kingdom"}
                </p>
              </div>

              {/* Stats Card 4: Reward Points */}
              <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-5 shadow-soft opacity-80 relative">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-[#6B7280]">
                    Reward Points
                  </span>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-[#B88A2E] border border-amber-200">
                    Coming Soon
                  </span>
                </div>
                <div className="text-2xl font-extrabold font-heading text-[#6B7280]">
                  0 pts
                </div>
                <p className="text-[11px] text-[#6B7280] font-medium mt-1">
                  Loyalty Program (Coming Soon)
                </p>
              </div>
            </div>

            {/* Main Tabs Navigation Header */}
            <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-2 shadow-soft overflow-x-auto">
              <div className="flex items-center gap-1 min-w-max">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "profile", label: "Profile Information" },
                  { id: "orders", label: `Order History (${orders.length})` },
                  { id: "address", label: "Address Book" },
                  { id: "wishlist", label: `Wishlist (${wishlist.length})` },
                  {
                    id: "notifications",
                    label: `Notifications (${unreadCount})`,
                  },
                  { id: "security", label: "Security & 2FA" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      currentTab === tab.id
                        ? "bg-[#21453A] text-white shadow-sm font-bold"
                        : "text-[#6B7280] hover:text-[#1D1D1F] hover:bg-[#F6F3ED]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ================= TAB 1: OVERVIEW ================= */}
            {currentTab === "overview" && (
              <div className="space-y-6">
                {/* Recent Orders Preview */}
                <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 sm:p-8 shadow-soft space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-[#ECE8E1]">
                    <div>
                      <h3 className="text-lg font-bold font-heading text-[#1D1D1F]">
                        Recent Orders
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        Track your ongoing shipments and luxury purchases
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-bold text-[#21453A] hover:text-[#B88A2E] transition-colors flex items-center gap-1"
                    >
                      <span>View All Orders</span>
                      <LuChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-10 text-[#6B7280]">
                      <LuPackage className="h-10 w-10 mx-auto text-[#ECE8E1] mb-2" />
                      <p className="text-xs font-semibold">
                        No recent order history found.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="border border-[#ECE8E1] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-[#21453A]/30 transition-all bg-[#FAFAF8]/50"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-[#1D1D1F] font-heading">
                                Order #{order.id}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  order.orderStatus === "delivered"
                                    ? "bg-green-100 text-[#2E7D32]"
                                    : order.orderStatus === "cancelled"
                                      ? "bg-red-100 text-[#D14343]"
                                      : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {order.orderStatus}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B7280]">
                              Placed on{" "}
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}{" "}
                              • {order.items?.length || 1} Item(s)
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6">
                            <span className="text-sm font-extrabold font-heading text-[#1D1D1F]">
                              ${Number(order.totalPrice).toFixed(2)}
                            </span>
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="px-4 py-2 bg-[#F6F3ED] hover:bg-[#21453A] hover:text-white text-[#21453A] text-xs font-semibold rounded-xl transition-all"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Default Address & Profile Snippet Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Default Address Snippet */}
                  <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 shadow-soft space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-[#ECE8E1]">
                      <div className="flex items-center gap-2 text-[#21453A]">
                        <LuMapPin className="h-4 w-4 text-[#B88A2E]" />
                        <h4 className="text-sm font-bold font-heading">
                          Primary Delivery Address
                        </h4>
                      </div>
                      <button
                        onClick={() => setActiveTab("address")}
                        className="text-xs font-bold text-[#21453A] hover:underline"
                      >
                        Manage
                      </button>
                    </div>
                    {addresses.find((a) => a.isDefault) && (
                      <div className="space-y-1 text-xs text-[#6B7280]">
                        <p className="font-bold text-[#1D1D1F] text-sm">
                          {addresses.find((a) => a.isDefault).name}
                        </p>
                        <p>{addresses.find((a) => a.isDefault).street}</p>
                        <p>
                          {addresses.find((a) => a.isDefault).city},{" "}
                          {addresses.find((a) => a.isDefault).country}
                        </p>
                        <p className="text-[#1D1D1F] font-medium pt-1">
                          Phone: {addresses.find((a) => a.isDefault).phone}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Wishlist Quick Preview */}
                  <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 shadow-soft space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-[#ECE8E1]">
                      <div className="flex items-center gap-2 text-[#21453A]">
                        <LuHeart className="h-4 w-4 text-[#D14343]" />
                        <h4 className="text-sm font-bold font-heading">
                          Wishlist Highlights
                        </h4>
                      </div>
                      <button
                        onClick={() => setActiveTab("wishlist")}
                        className="text-xs font-bold text-[#21453A] hover:underline"
                      >
                        View All ({wishlist.length})
                      </button>
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                      {wishlist.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="w-20 flex-shrink-0 text-center space-y-1"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-20 rounded-xl object-cover border border-[#ECE8E1]"
                          />
                          <p className="text-[10px] font-bold truncate text-[#1D1D1F]">
                            {item.title}
                          </p>
                          <p className="text-[10px] font-extrabold text-[#21453A]">
                            ${item.discountPrice || item.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: PROFILE INFORMATION ================= */}
            {currentTab === "profile" && (
              <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 sm:p-10 shadow-soft space-y-8">
                <div>
                  <h3 className="text-xl font-extrabold font-heading text-[#1D1D1F]">
                    Personal Information
                  </h3>
                  <p className="text-xs text-[#6B7280] font-medium mt-1">
                    Manage your personal account details, contact information,
                    and avatar preferences.
                  </p>
                </div>

                {profileFeedback.msg && (
                  <div
                    className={`p-4 rounded-xl text-xs font-bold border ${
                      profileFeedback.type === "success"
                        ? "bg-green-50 text-[#2E7D32] border-green-200"
                        : "bg-red-50 text-[#D14343] border-red-200"
                    }`}
                  >
                    {profileFeedback.msg}
                  </div>
                )}

                {/* Avatar Drag & Drop Section */}
                <div className="space-y-3 border-b border-[#ECE8E1] pb-8">
                  <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider font-heading">
                    Avatar & Profile Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {profileForm.avatar ? (
                      <img
                        src={profileForm.avatar}
                        alt="Avatar Preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-[#21453A] shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-[#21453A] text-white flex items-center justify-center text-2xl font-bold font-heading border-2 border-[#ECE8E1]">
                        {userInitials}
                      </div>
                    )}

                    <div className="flex-1 w-full border-2 border-dashed border-[#ECE8E1] hover:border-[#21453A] rounded-[20px] p-6 text-center bg-[#FAFAF8] transition-colors cursor-pointer relative group">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              showAlert({
                                title: "File Size Exceeded",
                                message: "Maximum image file size allowed is 2MB.",
                                type: "warning",
                              });
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileForm((prev) => ({
                                ...prev,
                                avatar: reader.result,
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <LuUpload className="h-8 w-8 mx-auto text-[#21453A] group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-[#1D1D1F] mt-2">
                        Click or Drag & Drop photo here to upload
                      </p>
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        Supports PNG, JPG, WEBP • Maximum size 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information Form */}
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 font-heading">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            fullName: e.target.value,
                          })
                        }
                        className="w-full bg-[#FAFAF8] border border-[#ECE8E1] rounded-xl px-4 py-3 text-xs font-semibold text-[#1D1D1F] focus:outline-none focus:border-[#21453A] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 font-heading">
                        Email Address (Read-only)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={profileForm.email}
                        className="w-full bg-neutral-100 border border-[#ECE8E1] rounded-xl px-4 py-3 text-xs font-semibold text-[#6B7280] cursor-not-allowed"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 font-heading">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full bg-[#FAFAF8] border border-[#ECE8E1] rounded-xl px-4 py-3 text-xs font-semibold text-[#1D1D1F] focus:outline-none focus:border-[#21453A] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 font-heading">
                        Gender
                      </label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            gender: e.target.value,
                          })
                        }
                        className="w-full bg-[#FAFAF8] border border-[#ECE8E1] rounded-xl px-4 py-3 text-xs font-semibold text-[#1D1D1F] focus:outline-none focus:border-[#21453A] focus:bg-white transition-all"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Prefer not to say</option>
                      </select>
                    </div>

                    {/* Birthday */}
                    <div>
                      <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 font-heading">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={profileForm.birthday}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            birthday: e.target.value,
                          })
                        }
                        className="w-full bg-[#FAFAF8] border border-[#ECE8E1] rounded-xl px-4 py-3 text-xs font-semibold text-[#1D1D1F] focus:outline-none focus:border-[#21453A] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Address Book Navigation Notice */}
                    <div className="sm:col-span-2 bg-[#FAFAF8] border border-[#ECE8E1] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#21453A]/10 text-[#21453A] rounded-xl">
                          <LuMapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1D1D1F]">
                            Delivery & Shipping Address Book
                          </p>
                          <p className="text-[11px] text-[#6B7280]">
                            Manage your Home, Office, or saved delivery locations in your dedicated Address Book.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("address")}
                        className="px-4 py-2 bg-[#21453A] hover:bg-[#17322A] text-white text-xs font-bold rounded-xl transition-all flex-shrink-0"
                      >
                        Manage Addresses
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ECE8E1]">
                    <button
                      type="button"
                      onClick={() => setActiveTab("overview")}
                      className="px-6 py-3 border border-[#ECE8E1] hover:bg-[#F6F3ED] text-[#1D1D1F] text-xs font-semibold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-8 py-3 bg-[#21453A] hover:bg-[#17322A] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                    >
                      {savingProfile ? "Saving Changes..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= TAB 3: ORDER HISTORY ================= */}
            {currentTab === "orders" && (
              <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 sm:p-8 shadow-soft space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[#ECE8E1]">
                  <div>
                    <h3 className="text-xl font-extrabold font-heading text-[#1D1D1F]">
                      Order History
                    </h3>
                    <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                      Review all past purchases, invoices, and shipment tracking
                      information.
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#21453A] bg-[#F6F3ED] px-3.5 py-1.5 rounded-full border border-[#ECE8E1] self-start sm:self-auto">
                    Total Purchases: {orders.length}
                  </span>
                </div>

                {/* Orders Modern Table */}
                {orders.length === 0 ? (
                  <div className="text-center py-16 text-[#6B7280] space-y-3">
                    <LuShoppingBag className="h-12 w-12 mx-auto text-[#ECE8E1]" />
                    <p className="text-sm font-bold text-[#1D1D1F]">
                      No orders recorded yet.
                    </p>
                    <p className="text-xs">
                      Explore our latest Punjabi and Saree collections to make
                      your first purchase.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead>
                        <tr className="border-b border-[#ECE8E1] bg-[#FAFAF8] text-[#6B7280] uppercase tracking-wider">
                          <th className="py-3.5 px-4 font-bold">Order ID</th>
                          <th className="py-3.5 px-4 font-bold">Date</th>
                          <th className="py-3.5 px-4 font-bold">Items</th>
                          <th className="py-3.5 px-4 font-bold">Payment</th>
                          <th className="py-3.5 px-4 font-bold">Status</th>
                          <th className="py-3.5 px-4 font-bold">Total</th>
                          <th className="py-3.5 px-4 font-bold text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ECE8E1]">
                        {orders.map((order) => {
                          const dateStr = new Date(
                            order.createdAt,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });
                          const isDelivered =
                            order.orderStatus?.toLowerCase() === "delivered";
                          const isCancelled =
                            order.orderStatus?.toLowerCase() === "cancelled";
                          const isPending =
                            order.orderStatus?.toLowerCase() === "pending";

                          return (
                            <tr
                              key={order.id}
                              className="hover:bg-[#FAFAF8] transition-colors"
                            >
                              <td className="py-4 px-4 font-bold font-heading text-[#1D1D1F]">
                                #{order.id}
                              </td>
                              <td className="py-4 px-4 text-[#6B7280]">
                                {dateStr}
                              </td>
                              <td className="py-4 px-4 font-medium">
                                {order.items?.length || 1} Item(s)
                              </td>
                              <td className="py-4 px-4">
                                {order.paymentStatus?.toLowerCase() === "due" || (order.paymentMethod?.toUpperCase() === "COD" && order.paymentStatus?.toLowerCase() !== "paid") ? (
                                  <span className="uppercase text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-[#B88A2E] border border-amber-200">
                                    PAYMENT DUE
                                  </span>
                                ) : (
                                  <span className="uppercase text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-[#2E7D32] border border-green-200">
                                    PAYMENT CONFIRMED
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isDelivered
                                      ? "bg-green-100 text-[#2E7D32]"
                                      : isCancelled
                                        ? "bg-red-100 text-[#D14343]"
                                        : "bg-green-100 text-[#2E7D32]"
                                  }`}
                                >
                                  {isCancelled ? "CANCELLED" : isDelivered ? "DELIVERED" : "ORDER CONFIRMED"}
                                </span>
                              </td>
                              <td className="py-4 px-4 font-extrabold font-heading text-[#1D1D1F]">
                                £{Number(order.totalPrice).toFixed(2)}
                              </td>
                              <td className="py-4 px-4 text-right space-x-2">
                                <button
                                  onClick={() => setSelectedOrderDetails(order)}
                                  className="p-2 text-[#21453A] hover:bg-[#F6F3ED] rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <LuEye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    downloadPdf({
                                      orderId: order.id,
                                      orderNumber: `#${order.id}`,
                                      title: "Official Tax Invoice PDF",
                                    })
                                  }
                                  className="p-2 text-[#B88A2E] hover:bg-[#F6F3ED] rounded-lg transition-colors"
                                  title="Download Invoice"
                                >
                                  <LuDownload className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    showAlert({
                                      title: `Shipment Tracking #${order.id}`,
                                      message: "Package status: In Transit. Estimated delivery by Nabis Express Courier.",
                                      type: "info",
                                    })
                                  }
                                  className="p-2 text-[#21453A] hover:bg-[#F6F3ED] rounded-lg transition-colors"
                                  title="Track Shipment"
                                >
                                  <LuTruck className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 4: ADDRESS BOOK ================= */}
            {currentTab === "address" && (
              <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 sm:p-8 shadow-soft space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[#ECE8E1]">
                  <div>
                    <h3 className="text-xl font-extrabold font-heading text-[#1D1D1F]">
                      Address Book
                    </h3>
                    <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                      Select your primary delivery location or manage saved addresses for fast express checkout.
                    </p>
                  </div>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-[#ECE8E1] rounded-[20px] bg-[#FAFAF8] space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#F6F3ED] text-[#21453A] flex items-center justify-center">
                      <LuMapPin className="w-7 h-7 text-[#B88A2E]" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h4 className="text-base font-extrabold font-heading text-[#1D1D1F]">
                        No Saved Delivery Addresses
                      </h4>
                      <p className="text-xs text-[#6B7280]">
                        You haven't saved any delivery locations yet. Add your Home or Office address to speed up express checkout.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingAddressId(null);
                        setAddressForm({
                          label: "Home",
                          name: session?.user?.name || "",
                          phone: session?.user?.phone || "",
                          street: "",
                          city: "London",
                          state: "Greater London",
                          zip: "SW1A 1AA",
                          country: "United Kingdom",
                          isDefault: true,
                        });
                        setShowAddressModal(true);
                      }}
                      className="px-5 py-2.5 bg-[#21453A] hover:bg-[#17322A] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 shadow-sm"
                    >
                      <LuPlus className="w-4 h-4 text-[#B88A2E]" />
                      <span>Add Your First Address</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* SMALL ADDRESS TAB PILLS */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      {addresses.map((addr) => {
                        const isActive = (activeAddressId || addresses[0]?.id) === addr.id;
                        return (
                          <button
                            key={addr.id}
                            onClick={() => setActiveAddressId(addr.id)}
                            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${
                              isActive
                                ? "bg-[#21453A] text-white border-[#21453A] shadow-sm"
                                : "bg-[#FAFAF8] text-[#1D1D1F] border-[#ECE8E1] hover:border-[#21453A]/50 hover:bg-white"
                            }`}
                          >
                            {addr.label === "Home" ? (
                              <LuHouse className={`w-3.5 h-3.5 ${isActive ? "text-[#B88A2E]" : "text-[#6B7280]"}`} />
                            ) : addr.label === "Office" ? (
                              <LuBuilding className={`w-3.5 h-3.5 ${isActive ? "text-[#B88A2E]" : "text-[#6B7280]"}`} />
                            ) : (
                              <LuMapPin className={`w-3.5 h-3.5 ${isActive ? "text-[#B88A2E]" : "text-[#6B7280]"}`} />
                            )}
                            <span>{addr.label} Address</span>
                            {addr.isDefault && (
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  isActive ? "bg-[#B88A2E] text-white" : "bg-green-100 text-[#21453A]"
                                }`}
                              >
                                Default
                              </span>
                            )}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => {
                          setEditingAddressId(null);
                          setAddressForm({
                            label: "Home",
                            name: session?.user?.name || "",
                            phone: session?.user?.phone || "",
                            street: "",
                            city: "London",
                            state: "Greater London",
                            zip: "SW1A 1AA",
                            country: "United Kingdom",
                            isDefault: addresses.length === 0,
                          });
                          setShowAddressModal(true);
                        }}
                        className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#F6F3ED] text-[#21453A] border border-[#ECE8E1] hover:bg-[#21453A] hover:text-white transition-all flex items-center gap-2 shadow-2xs"
                      >
                        <LuPlus className="w-3.5 h-3.5 text-[#B88A2E]" />
                        <span>Add New Address</span>
                      </button>
                    </div>

                    {/* ACTIVE ADDRESS DETAILS CARD */}
                    {(() => {
                      const activeAddr = addresses.find((a) => a.id === (activeAddressId || addresses[0]?.id)) || addresses[0];
                      if (!activeAddr) return null;

                      return (
                        <div className="border border-[#21453A]/30 bg-[#FAFAF8] rounded-[20px] p-6 sm:p-8 space-y-6 relative shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5">
                                {activeAddr.label === "Home" ? (
                                  <LuHouse className="w-5 h-5 text-[#21453A]" />
                                ) : activeAddr.label === "Office" ? (
                                  <LuBuilding className="w-5 h-5 text-[#21453A]" />
                                ) : (
                                  <LuMapPin className="w-5 h-5 text-[#21453A]" />
                                )}
                                <h4 className="text-base font-extrabold font-heading text-[#1D1D1F]">
                                  {activeAddr.label} Delivery Address
                                </h4>
                                {activeAddr.isDefault && (
                                  <span className="text-[10px] font-extrabold bg-[#21453A] text-white px-3 py-0.5 rounded-full uppercase tracking-wider">
                                    Primary Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#6B7280]">
                                Active location selected for express shipping & courier delivery.
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingAddressId(activeAddr.id);
                                  setAddressForm(activeAddr);
                                  setShowAddressModal(true);
                                }}
                                className="px-3.5 py-2 bg-white border border-[#ECE8E1] hover:border-[#21453A] text-[#21453A] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                                title="Edit Address"
                              >
                                <LuPencil className="h-3.5 w-3.5 text-[#B88A2E]" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(activeAddr.id)}
                                className="px-3.5 py-2 bg-white border border-[#ECE8E1] hover:border-red-300 text-[#D14343] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                                title="Delete Address"
                              >
                                <LuTrash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          {/* Address Grid Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-[#ECE8E1] rounded-xl p-5 text-xs text-[#1D1D1F] font-semibold">
                            <div>
                              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                                Recipient Name
                              </span>
                              <p className="font-extrabold text-sm text-[#1D1D1F]">{activeAddr.name}</p>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                                Contact Phone
                              </span>
                              <p className="font-extrabold text-sm text-[#21453A]">{activeAddr.phone}</p>
                            </div>

                            <div className="sm:col-span-2 pt-2 border-t border-[#ECE8E1]">
                              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                                Street & Building Address
                              </span>
                              <p className="font-semibold text-xs leading-relaxed text-[#1D1D1F]">
                                {activeAddr.street}
                              </p>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                                City & Postal Code
                              </span>
                              <p className="font-semibold text-xs text-[#1D1D1F]">
                                {activeAddr.city}, {activeAddr.state} {activeAddr.zip}
                              </p>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                                Country / Region
                              </span>
                              <p className="font-semibold text-xs text-[#1D1D1F]">{activeAddr.country}</p>
                            </div>
                          </div>

                          {!activeAddr.isDefault && (
                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => handleSetDefaultAddress(activeAddr.id)}
                                className="px-4 py-2 bg-[#21453A] hover:bg-[#17322A] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                              >
                                Set as Default Primary Address
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {/* ================= TAB 5: WISHLIST ================= */}
            {currentTab === "wishlist" && (
              <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 sm:p-8 shadow-soft space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[#ECE8E1]">
                  <div>
                    <h3 className="text-xl font-extrabold font-heading text-[#1D1D1F]">
                      Saved Wishlist
                    </h3>
                    <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                      Your curated collection of preferred garments and luxury
                      items.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#21453A] bg-[#F6F3ED] px-3.5 py-1.5 rounded-full border border-[#ECE8E1]">
                    {wishlist.length} Items
                  </span>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-16 text-[#6B7280] space-y-3">
                    <LuHeart className="h-12 w-12 mx-auto text-[#ECE8E1]" />
                    <p className="text-sm font-bold text-[#1D1D1F]">
                      Your wishlist is currently empty.
                    </p>
                    <button
                      onClick={() => navigate("/products")}
                      className="px-6 py-2.5 bg-[#21453A] text-white text-xs font-bold uppercase rounded-xl"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <div
                        key={item.id}
                        className="border border-[#ECE8E1] rounded-[20px] overflow-hidden bg-white hover:shadow-soft-lg transition-all flex flex-col justify-between group"
                      >
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.discount && (
                            <span className="absolute top-3 left-3 bg-[#B88A2E] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                              {item.discount}
                            </span>
                          )}
                          <button
                            onClick={() => handleRemoveWishlist(item.id)}
                            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-[#D14343] rounded-full shadow-sm transition-colors"
                            title="Remove from wishlist"
                          >
                            <LuTrash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                              {item.category}
                            </span>
                            <h4 className="text-sm font-bold font-heading text-[#1D1D1F] line-clamp-1 mt-0.5">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-base font-extrabold font-heading text-[#21453A]">
                                ${item.discountPrice || item.price}
                              </span>
                              {item.discountPrice && (
                                <span className="text-xs font-semibold text-[#6B7280] line-through">
                                  ${item.price}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#ECE8E1]">
                            <button
                              onClick={() => handleMoveToCart(item)}
                              disabled={
                                !item.inStock || cartAddingId === item.id
                              }
                              className="w-full bg-[#21453A] hover:bg-[#17322A] disabled:bg-neutral-200 text-white text-xs font-bold uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                              <LuShoppingBag className="h-4 w-4 text-[#B88A2E]" />
                              <span>
                                {cartAddingId === item.id
                                  ? "Adding..."
                                  : "Move to Shopping Bag"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 6: NOTIFICATIONS ================= */}
            {currentTab === "notifications" && (
              <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 sm:p-8 shadow-soft space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[#ECE8E1]">
                  <div>
                    <h3 className="text-xl font-extrabold font-heading text-[#1D1D1F]">
                      Notification Center
                    </h3>
                    <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                      Stay updated with order shipments, payment updates, and account alerts.
                    </p>
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-xs font-bold text-[#21453A] hover:underline"
                    >
                      Mark all as read ({unreadNotificationsCount})
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-[#6B7280] space-y-2">
                    <LuBell className="h-10 w-10 mx-auto text-[#ECE8E1]" />
                    <p className="text-xs font-bold text-[#1D1D1F]">No notifications yet</p>
                    <p className="text-[11px] text-[#6B7280]">
                      Notifications regarding your orders and payments will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.isRead && handleMarkNotificationRead(n.id)}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                          !n.isRead
                            ? "border-[#21453A] bg-[#FAFAF8] shadow-2xs"
                            : "border-[#ECE8E1] bg-white opacity-85"
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl mt-0.5 ${!n.isRead ? "bg-[#21453A] text-white" : "bg-[#F6F3ED] text-[#21453A]"}`}>
                          <LuBell className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-[#1D1D1F] font-heading">
                              {n.title}
                            </h4>
                            <span className="text-[10px] text-[#6B7280]">
                              {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B7280] leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 7: SECURITY & 2FA ================= */}
            {/* ================= TAB 7: SECURITY & 2FA ================= */}
            {currentTab === "security" && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 sm:p-8 shadow-soft space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-extrabold font-heading text-[#1D1D1F]">
                        Password & Security
                      </h3>
                      <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                        Password management is currently undergoing maintenance.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-amber-100 text-[#B88A2E] border border-amber-200">
                      Coming Soon
                    </span>
                  </div>

                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="space-y-5 max-w-xl opacity-75"
                  >
                    <div>
                      <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 font-heading">
                        Current Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPw ? "text" : "password"}
                          disabled
                          readOnly
                          value=""
                          placeholder="•••••••• (Coming Soon)"
                          className="w-full bg-[#F6F3ED] border border-[#ECE8E1] rounded-xl pl-4 pr-12 py-3 text-xs font-semibold cursor-not-allowed opacity-60 text-[#6B7280]"
                        />
                        <button
                          type="button"
                          disabled
                          className="absolute right-4 top-3.5 text-[#6B7280] opacity-50 cursor-not-allowed"
                        >
                          <LuEye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 font-heading">
                        New Password (Min 8 characters) *
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPw ? "text" : "password"}
                          disabled
                          readOnly
                          value=""
                          placeholder="•••••••• (Coming Soon)"
                          className="w-full bg-[#F6F3ED] border border-[#ECE8E1] rounded-xl pl-4 pr-12 py-3 text-xs font-semibold cursor-not-allowed opacity-60 text-[#6B7280]"
                        />
                        <button
                          type="button"
                          disabled
                          className="absolute right-4 top-3.5 text-[#6B7280] opacity-50 cursor-not-allowed"
                        >
                          <LuEye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 font-heading">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPw ? "text" : "password"}
                          disabled
                          readOnly
                          value=""
                          placeholder="•••••••• (Coming Soon)"
                          className="w-full bg-[#F6F3ED] border border-[#ECE8E1] rounded-xl pl-4 pr-12 py-3 text-xs font-semibold cursor-not-allowed opacity-60 text-[#6B7280]"
                        />
                        <button
                          type="button"
                          disabled
                          className="absolute right-4 top-3.5 text-[#6B7280] opacity-50 cursor-not-allowed"
                        >
                          <LuEye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled
                      className="px-6 py-3 bg-neutral-400 text-white text-xs font-bold uppercase rounded-xl cursor-not-allowed opacity-60 shadow-none"
                    >
                      Update Password (Coming Soon)
                    </button>
                  </form>
                </div>

                {/* 2FA Toggle & Devices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Two Factor Auth */}
                  <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 shadow-soft space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold font-heading text-[#1D1D1F]">
                          Two-Factor Authentication (2FA)
                        </h4>
                        <p className="text-xs text-[#6B7280] mt-1">
                          Add an extra layer of security using Google Authenticator.
                        </p>
                      </div>
                      <span className="text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-[#B88A2E] border border-amber-200">
                        Coming Soon
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-[#6B7280] font-medium">Authenticator App</span>
                      <button
                        type="button"
                        disabled
                        className="w-12 h-6 rounded-full p-1 relative bg-[#ECE8E1] cursor-not-allowed opacity-50"
                      >
                        <div className="w-4 h-4 rounded-full bg-white translate-x-0" />
                      </button>
                    </div>

                    <span className="inline-block text-[10px] font-extrabold px-3 py-1 rounded-full uppercase bg-[#F6F3ED] text-[#6B7280]">
                      Status: Coming Soon
                    </span>
                  </div>

                  {/* Active Login Devices */}
                  <div className="bg-white border border-[#ECE8E1] rounded-[20px] p-6 shadow-soft space-y-4">
                    <h4 className="text-sm font-bold font-heading text-[#1D1D1F]">
                      Active Login Devices
                    </h4>
                    <div className="space-y-3 text-xs font-medium">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#1D1D1F]">
                          <LuLaptop className="h-4 w-4 text-[#21453A]" />
                          <span>Current Browser Session</span>
                        </div>
                        <span className="text-[10px] text-[#2E7D32] font-bold">
                          Active Now
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ================= ADDRESS MODAL ================= */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#ECE8E1] rounded-[20px] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-soft-lg">
            <div className="flex justify-between items-center pb-3 border-b border-[#ECE8E1]">
              <h3 className="text-lg font-bold font-heading text-[#1D1D1F]">
                {editingAddressId ? "Edit Address" : "Add New Delivery Address"}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-[#6B7280] hover:text-[#1D1D1F]"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveAddress}
              className="space-y-4 text-xs font-semibold"
            >
              <div>
                <label className="block text-[#6B7280] uppercase tracking-wider mb-1 font-heading">
                  Address Label
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.label}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, label: e.target.value })
                  }
                  placeholder="e.g. Home, Office, Vacation"
                  className="w-full bg-[#FAFAF8] border border-[#ECE8E1] rounded-xl px-3 py-2 text-[#1D1D1F] focus:outline-none focus:border-[#21453A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6B7280] uppercase tracking-wider mb-1 font-heading">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, name: e.target.value })
                    }
                    className="w-full bg-[#FAFAF8] border border-[#ECE8E1] rounded-xl px-3 py-2 text-[#1D1D1F] focus:outline-none focus:border-[#21453A]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B7280] uppercase tracking-wider mb-1 font-heading">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, phone: e.target.value })
                    }
                    className="w-full bg-[#FAFAF8] border border-[#ECE8E1] rounded-xl px-3 py-2 text-[#1D1D1F] focus:outline-none focus:border-[#21453A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B7280] uppercase tracking-wider mb-1 font-heading">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, street: e.target.value })
                  }
                  placeholder="House, Road, Apartment details"
                  className="w-full bg-[#FAFAF8] border border-[#ECE8E1] rounded-xl px-3 py-2 text-[#1D1D1F] focus:outline-none focus:border-[#21453A]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#6B7280] uppercase tracking-wider mb-1 font-heading">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    className="w-full bg-[#FAFAF8] border border-[#ECE8E1] rounded-xl px-3 py-2 text-[#1D1D1F] focus:outline-none focus:border-[#21453A]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B7280] uppercase tracking-wider mb-1 font-heading">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    className="w-full bg-[#FAFAF8] border border-[#ECE8E1] rounded-xl px-3 py-2 text-[#1D1D1F] focus:outline-none focus:border-[#21453A]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B7280] uppercase tracking-wider mb-1 font-heading">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.zip}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, zip: e.target.value })
                    }
                    className="w-full bg-[#FAFAF8] border border-[#ECE8E1] rounded-xl px-3 py-2 text-[#1D1D1F] focus:outline-none focus:border-[#21453A]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modal-default-check"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      isDefault: e.target.checked,
                    })
                  }
                  className="rounded text-[#21453A] focus:ring-[#21453A]"
                />
                <label
                  htmlFor="modal-default-check"
                  className="text-xs text-[#1D1D1F] cursor-pointer"
                >
                  Set as default shipping address
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#ECE8E1]">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-[#ECE8E1] text-[#1D1D1F] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#21453A] text-white rounded-xl font-bold uppercase text-[11px]"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#ECE8E1] rounded-[20px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-soft-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#ECE8E1]">
              <div>
                <h3 className="text-lg font-bold font-heading text-[#1D1D1F]">
                  Order Details #{selectedOrderDetails.id}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Placed on{" "}
                  {new Date(selectedOrderDetails.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" },
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-[#6B7280] hover:text-[#1D1D1F]"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            {/* Line items list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-[#6B7280] tracking-wider font-heading">
                Purchased Items
              </h4>
              {selectedOrderDetails.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs font-semibold p-3 border border-[#ECE8E1] rounded-xl"
                >
                  <div>
                    <p className="text-[#1D1D1F] font-bold uppercase">
                      {item.productTitle}
                    </p>
                    <p className="text-[10px] text-[#6B7280]">
                      Qty: {item.quantity} • Size: {item.size} • Color:{" "}
                      {item.color}
                    </p>
                  </div>
                  <span className="font-extrabold text-[#21453A]">
                    £{(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment & Summary Breakdown */}
            <div className="p-4 bg-[#FAFAF8] border border-[#ECE8E1] rounded-xl space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between text-[#6B7280]">
                <span>Payment Method</span>
                <span className="uppercase text-[#1D1D1F] font-bold">
                  {selectedOrderDetails.paymentMethod === "COD" ? "Cash on Delivery (COD)" : "Online Payment (Stripe)"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#6B7280]">
                <span>Payment Status</span>
                {selectedOrderDetails.paymentStatus?.toLowerCase() === "due" || (selectedOrderDetails.paymentMethod?.toUpperCase() === "COD" && selectedOrderDetails.paymentStatus?.toLowerCase() !== "paid") ? (
                  <span className="uppercase text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-[#B88A2E] border border-amber-200">
                    PAYMENT DUE
                  </span>
                ) : (
                  <span className="uppercase text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-green-100 text-[#2E7D32] border border-green-200">
                    PAYMENT CONFIRMED
                  </span>
                )}
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Order Status</span>
                <span className="uppercase font-bold text-[#21453A]">
                  {selectedOrderDetails.orderStatus}
                </span>
              </div>

              <div className="pt-2 border-t border-[#ECE8E1] space-y-1.5 text-[#6B7280]">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="text-[#1D1D1F] font-bold">
                    £{Number(selectedOrderDetails.subtotal || selectedOrderDetails.totalPrice).toFixed(2)}
                  </span>
                </div>
                {Number(selectedOrderDetails.discountTotal) > 0 && (
                  <div className="flex justify-between text-green-700 font-bold">
                    <span>Promo Discount</span>
                    <span>-£{Number(selectedOrderDetails.discountTotal).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery & Shipping</span>
                  <span className="text-[#1D1D1F] font-bold">
                    {Number(selectedOrderDetails.deliveryFee) === 0 ? "FREE" : `£${Number(selectedOrderDetails.deliveryFee || 10).toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-[#1D1D1F] font-black text-sm pt-2 border-t border-[#ECE8E1]">
                <span>Grand Total</span>
                <span className="text-[#21453A]">
                  £{Number(selectedOrderDetails.totalPrice).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() =>
                  downloadPdf({
                    orderId: selectedOrderDetails.id,
                    orderNumber: `#${selectedOrderDetails.id}`,
                    title: "Official Tax Invoice PDF",
                  })
                }
                className="px-4 py-2.5 bg-[#B88A2E] hover:bg-[#997022] text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <LuDownload className="h-4 w-4" />
                <span>Download Invoice (PDF)</span>
              </button>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-6 py-2.5 bg-[#21453A] hover:bg-[#17322A] text-white text-xs font-bold uppercase rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
