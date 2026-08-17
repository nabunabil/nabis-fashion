import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api";
import { authClient } from "../lib/auth-client";
import { useModal } from "./ModalContext";

const CartContext = createContext(null);

// Production Expiration Constant: 30 days in milliseconds
const GUEST_CART_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const { showAlert } = useModal();
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  // Load and clean expired guest cart items from localStorage
  const [guestCartItems, setGuestCartItems] = useState(() => {
    try {
      const local = localStorage.getItem("nabis_guest_cart");
      if (!local) return [];
      const parsed = JSON.parse(local);
      if (!Array.isArray(parsed)) return [];
      
      const now = Date.now();
      // Filter out stale items past 30 days expiry
      const validItems = parsed.filter((item) => !item.expiresAt || now < item.expiresAt);
      return validItems;
    } catch {
      return [];
    }
  });

  // Save guest cart with 30-day expiration to localStorage
  useEffect(() => {
    try {
      if (guestCartItems.length > 0) {
        const now = Date.now();
        const itemsWithExpiry = guestCartItems.map((item) => ({
          ...item,
          expiresAt: item.expiresAt || now + GUEST_CART_EXPIRY_MS,
        }));
        localStorage.setItem("nabis_guest_cart", JSON.stringify(itemsWithExpiry));
      } else {
        localStorage.removeItem("nabis_guest_cart");
      }
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  }, [guestCartItems]);

  const fetchCart = async () => {
    if (!session) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/cart");
      if (res && res.success && res.data) {
        const cartObj = res.data.cart || res.data;
        setCart(cartObj);
      } else {
        setCart(null);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  // AUTO-MERGE: Sync & merge guest cart items into account cart upon login/registration
  useEffect(() => {
    async function syncAndMergeGuestCart() {
      if (session && guestCartItems.length > 0) {
        try {
          let mergedCount = 0;
          for (const item of guestCartItems) {
            await api.post("/cart/items", {
              productVariantId: item.productVariantId,
              quantity: item.quantity,
            });
            mergedCount += item.quantity;
          }

          // Clear guest cart
          setGuestCartItems([]);
          localStorage.removeItem("nabis_guest_cart");

          // Fetch updated server cart
          await fetchCart();

          // Notify user of successful cart merge
          showAlert({
            title: "Shopping Bag Merged",
            message: `Welcome back, ${session.user.name || "Customer"}! Your guest shopping bag items have been connected to your account.`,
            type: "success",
          });
        } catch (e) {
          console.warn("Failed to sync guest cart to server:", e);
          fetchCart();
        }
      } else if (session) {
        fetchCart();
      }
    }
    syncAndMergeGuestCart();
  }, [session]);

  const addItem = async (productVariantId, quantity = 1, productDetails = null) => {
    const vId = Number(productVariantId);
    if (isNaN(vId) || vId <= 0) {
      throw new Error("Product variant ID must be a valid number");
    }

    if (session) {
      try {
        const res = await api.post("/cart/items", { productVariantId: vId, quantity });
        if (res && res.success && res.data) {
          const cartObj = res.data.cart || res.data;
          setCart(cartObj);
        } else {
          await fetchCart();
        }
        return res;
      } catch (err) {
        console.error("Error adding to server cart:", err);
        throw err;
      }
    } else {
      // Guest local cart with 30-day expiration
      const now = Date.now();
      const expiresAt = now + GUEST_CART_EXPIRY_MS;

      setGuestCartItems((prev) => {
        const idx = prev.findIndex((item) => Number(item.productVariantId) === vId);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx].quantity += quantity;
          updated[idx].expiresAt = expiresAt;
          return updated;
        } else {
          const images = productDetails?.images?.map((img) =>
            typeof img === "string" ? { imageUrl: img } : { imageUrl: img.imageUrl || img.url }
          ) || [
            { imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500" },
          ];

          return [
            ...prev,
            {
              id: `guest-${vId}-${now}`,
              productVariantId: vId,
              quantity,
              expiresAt,
              productVariant: {
                id: vId,
                size: productDetails?.selectedSize || "M",
                color: productDetails?.selectedColor || "Standard",
                stock: 25,
                product: {
                  id: productDetails?.id || vId,
                  title: productDetails?.title || "Nabis Fashion Garment",
                  slug: productDetails?.slug || "nabis-garment",
                  price: Number(productDetails?.price || 65),
                  discountPrice: Number(productDetails?.discountPrice || 45),
                  images,
                },
              },
            },
          ];
        }
      });
      return { success: true };
    }
  };

  const updateItem = async (productVariantId, quantity) => {
    const vId = Number(productVariantId);
    if (session) {
      try {
        const res = await api.patch(`/cart/items/${vId}`, { quantity });
        if (res && res.success && res.data) {
          setCart(res.data.cart || res.data);
        } else {
          await fetchCart();
        }
        return res;
      } catch (err) {
        console.error("Error updating cart quantity:", err);
        throw err;
      }
    } else {
      setGuestCartItems((prev) =>
        prev
          .map((item) => (item.productVariantId === vId ? { ...item, quantity } : item))
          .filter((item) => item.quantity > 0)
      );
      return { success: true };
    }
  };

  const removeItem = async (productVariantId) => {
    const vId = Number(productVariantId);
    if (session) {
      try {
        const res = await api.delete(`/cart/items/${vId}`);
        if (res && res.success && res.data) {
          setCart(res.data.cart || res.data);
        } else {
          await fetchCart();
        }
        return res;
      } catch (err) {
        console.error("Error removing cart item:", err);
        throw err;
      }
    } else {
      setGuestCartItems((prev) => prev.filter((item) => item.productVariantId !== vId));
      return { success: true };
    }
  };

  const clearCart = async () => {
    if (session) {
      try {
        const res = await api.delete("/cart/clear");
        if (res && res.success && res.data) {
          setCart(res.data.cart || res.data);
        } else {
          setCart(null);
        }
        return res;
      } catch (err) {
        console.error("Error clearing cart:", err);
        throw err;
      }
    } else {
      setGuestCartItems([]);
      localStorage.removeItem("nabis_guest_cart");
      return { success: true };
    }
  };

  // Active items list (Server items if logged in, Guest items if not)
  const activeItems = session ? (cart?.items || []) : guestCartItems;

  // Compute total items count in the cart
  const cartCount = activeItems.reduce((total, item) => total + (item.quantity || 1), 0);

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const stored = localStorage.getItem("nabis_applied_coupon");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem("nabis_applied_coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("nabis_applied_coupon");
      }
    } catch (e) {
      console.warn("Could not sync applied coupon to localStorage:", e);
    }
  }, [appliedCoupon]);

  const applyCoupon = async (codeText) => {
    if (!codeText || !codeText.trim()) {
      throw new Error("Please enter a valid coupon code");
    }
    const cleanCode = codeText.trim().toUpperCase();

    try {
      const res = await api.get(`/coupons/validate/${cleanCode}?cartSubtotal=${cartSubtotal}`);
      if (res && res.success && res.data) {
        setAppliedCoupon(res.data);
        return { success: true, message: `Coupon '${res.data.code}' applied!`, data: res.data };
      } else {
        throw new Error(res?.message || "Invalid coupon code");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to validate coupon code";
      throw new Error(msg);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("nabis_applied_coupon");
  };

  const cartSubtotal = activeItems.reduce((total, item) => {
    const p = item.productVariant?.product;
    const price = Number(p?.discountPrice || p?.price || 45);
    return total + price * (item.quantity || 1);
  }, 0);

  let couponDiscount = 0;
  if (appliedCoupon && cartSubtotal > 0) {
    const minVal = Number(appliedCoupon.minOrderValue || 0);
    if (cartSubtotal >= minVal) {
      if (appliedCoupon.discountType === "percentage") {
        couponDiscount = (cartSubtotal * Number(appliedCoupon.discountAmount)) / 100;
      } else {
        couponDiscount = Number(appliedCoupon.discountAmount || 0);
      }
      if (couponDiscount > cartSubtotal) {
        couponDiscount = cartSubtotal;
      }
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart: { items: activeItems },
        loading,
        cartCount,
        cartSubtotal,
        appliedCoupon,
        couponDiscount: Number(couponDiscount.toFixed(2)),
        applyCoupon,
        removeCoupon,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
