import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authClient } from "../lib/auth-client";
import { useModal } from "./ModalContext";
import AuthPromptModal from "../components/ui/AuthPromptModal";

const WishlistContext = createContext(null);

// Initial default luxury wishlist items for demo user experience if empty
const defaultMockWishlist = [
  {
    id: "w1",
    title: "Royal Emerald Silk Panjabi",
    category: "Panjabi Collections",
    price: 185.0,
    discountPrice: 155.0,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    inStock: true,
    discount: "16% OFF",
    variantId: 1,
  },
  {
    id: "w2",
    title: "Imperial Gold Zari Katan Saree",
    category: "Saree Collections",
    price: 260.0,
    discountPrice: 220.0,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    inStock: true,
    discount: "15% OFF",
    variantId: 2,
  },
];

export function WishlistProvider({ children }) {
  const { data: session } = authClient.useSession();
  const { showAlert } = useModal();

  const [wishlist, setWishlist] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTargetProduct, setAuthTargetProduct] = useState(null);

  // Storage key per user session
  const getStorageKey = () => {
    return session?.user?.id ? `nabis_wishlist_${session.user.id}` : "nabis_guest_wishlist";
  };

  // Load wishlist on session change
  useEffect(() => {
    if (session?.user?.id) {
      try {
        const key = `nabis_wishlist_${session.user.id}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          setWishlist(Array.isArray(parsed) ? parsed : []);
        } else {
          // New user starts with clean empty wishlist
          setWishlist([]);
          localStorage.setItem(key, JSON.stringify([]));
        }
      } catch (e) {
        console.warn("Could not read wishlist from localStorage:", e);
        setWishlist([]);
      }
    } else {
      setWishlist([]);
    }
  }, [session?.user?.id]);

  // Sync wishlist to localStorage whenever wishlist changes for logged in user
  const saveWishlistToStorage = (updatedItems) => {
    if (session?.user?.id) {
      try {
        const key = `nabis_wishlist_${session.user.id}`;
        localStorage.setItem(key, JSON.stringify(updatedItems));
      } catch (e) {
        console.warn("Could not write wishlist to localStorage:", e);
      }
    }
  };

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      const targetId = String(productId);
      return wishlist.some((item) => String(item.id) === targetId || String(item.productId) === targetId || String(item.variantId) === targetId);
    },
    [wishlist]
  );

  const addToWishlist = useCallback(
    (product) => {
      // AUTH PROTECTION: Require logged-in user session for Wishlist
      if (!session) {
        setAuthTargetProduct(product);
        setIsAuthModalOpen(true);
        return false;
      }

      if (!product) return false;

      const pId = String(product.id || product.variantId);
      if (isInWishlist(pId)) {
        showAlert({
          title: "Already in Wishlist",
          message: `"${product.title || "Item"}" is already saved in your Wishlist.`,
          type: "info",
        });
        return true;
      }

      const newItem = {
        id: product.id || `w-${Date.now()}`,
        productId: product.id,
        variantId: product.variantId || product.variants?.[0]?.id || 1,
        title: product.title || "Nabis Fashion Item",
        category: product.category?.name || product.category || "Luxury Collection",
        price: Number(product.price || 150),
        discountPrice: Number(product.discountPrice || product.price || 150),
        image: product.image || product.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500",
        inStock: product.inStock !== false,
        discount: product.discount || "",
      };

      const updated = [newItem, ...wishlist];
      setWishlist(updated);
      saveWishlistToStorage(updated);

      showAlert({
        title: "Added to Wishlist",
        message: `"${newItem.title}" has been saved to your personal Wishlist.`,
        type: "success",
      });

      return true;
    },
    [session, wishlist, isInWishlist, showAlert]
  );

  const removeFromWishlist = useCallback(
    (productId) => {
      if (!productId) return;
      const targetId = String(productId);
      const updated = wishlist.filter(
        (item) => String(item.id) !== targetId && String(item.productId) !== targetId && String(item.variantId) !== targetId
      );
      setWishlist(updated);
      saveWishlistToStorage(updated);

      showAlert({
        title: "Removed from Wishlist",
        message: "Item removed from your saved Wishlist.",
        type: "info",
      });
    },
    [wishlist, session, showAlert]
  );

  const toggleWishlist = useCallback(
    (product) => {
      if (!product) return;
      const pId = String(product.id || product.variantId);
      if (isInWishlist(pId)) {
        removeFromWishlist(pId);
      } else {
        addToWishlist(product);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        count: wishlist.length,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}

      {/* Auth Protection Modal */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthTargetProduct(null);
        }}
        productTitle={authTargetProduct?.title}
      />
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
