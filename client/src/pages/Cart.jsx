import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LuShoppingBag,
  LuTrash2,
  LuMinus,
  LuPlus,
  LuArrowRight,
  LuTag,
  LuX,
  LuArrowLeft,
} from "react-icons/lu";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cart,
    cartCount,
    cartSubtotal,
    updateItem,
    removeItem,
    clearCart,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const items = cart?.items || [];

  const handleQuantityChange = async (productVariantId, newQty) => {
    if (newQty < 1) return;
    setUpdatingId(productVariantId);
    try {
      await updateItem(productVariantId, newQty);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productVariantId) => {
    setRemovingId(productVariantId);
    try {
      await removeItem(productVariantId);
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    if (!couponInput.trim()) return;
    try {
      setCouponLoading(true);
      const res = await applyCoupon(couponInput);
      setCouponSuccess(res.message || "Coupon applied successfully!");
      setCouponInput("");
    } catch (err) {
      setCouponError(err.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const grandTotal = Math.max(0, cartSubtotal - couponDiscount);

  // Empty cart state
  if (cartCount === 0) {
    return (
      <div className="pt-24 sm:pt-28 pb-16 min-h-screen max-w-2xl mx-auto px-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
          <LuShoppingBag className="w-10 h-10 text-neutral-400" />
        </div>
        <h1 className="text-3xl font-black text-neutral-900 uppercase tracking-tight">
          Your Bag is Empty
        </h1>
        <p className="text-neutral-500 mt-3 text-sm leading-relaxed max-w-sm">
          Looks like you haven't added anything to your bag yet. Explore our
          latest collections and find something you'll love.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 px-8 rounded-xl uppercase tracking-wider text-xs shadow-md transition-all"
        >
          <span>Start Shopping</span>
          <LuArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-28 pb-16 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 text-sm font-bold transition-colors focus:outline-none"
          >
            <LuArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="w-px h-5 bg-neutral-200" />
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase tracking-tight">
            Shopping Bag
          </h1>
          <span className="text-xs font-extrabold bg-neutral-900 text-white px-2.5 py-1 rounded-full">
            {cartCount}
          </span>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-wider"
        >
          Clear All
        </button>
      </div>

      {/* Main Grid */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-7 space-y-4">
          {items.map((item) => {
            const product = item.productVariant?.product;
            const variant = item.productVariant;
            const price = Number(product?.discountPrice || product?.price || 0);
            const originalPrice = Number(product?.price || 0);
            const hasDiscount =
              product?.discountPrice &&
              Number(product.discountPrice) < originalPrice;
            const imageUrl =
              product?.images?.[0]?.imageUrl ||
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300";
            const isRemoving = removingId === item.productVariantId;
            const isUpdating = updatingId === item.productVariantId;

            return (
              <div
                key={item.id}
                className={`bg-white border border-neutral-100 shadow-sm rounded-2xl p-4 sm:p-5 flex gap-4 transition-all duration-200 ${
                  isRemoving ? "opacity-40 scale-95" : "opacity-100"
                }`}
              >
                {/* Product Image */}
                <Link
                  to={`/products/${product?.slug || product?.id}`}
                  className="flex-shrink-0 w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden bg-neutral-100 block"
                >
                  <img
                    src={imageUrl}
                    alt={product?.title || "Product"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to={`/products/${product?.slug || product?.id}`}
                        className="font-black text-neutral-900 uppercase text-sm sm:text-base leading-tight line-clamp-2 hover:underline underline-offset-2"
                      >
                        {product?.title || "Fashion Item"}
                      </Link>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {variant?.size && (
                          <span className="text-[10px] font-extrabold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md uppercase">
                            Size: {variant.size}
                          </span>
                        )}
                        {variant?.color && (
                          <span className="text-[10px] font-extrabold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md uppercase">
                            {variant.color}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.productVariantId)}
                      disabled={isRemoving}
                      className="flex-shrink-0 text-neutral-300 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1 focus:outline-none"
                      aria-label="Remove item"
                    >
                      <LuX className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price & Qty controls */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productVariantId,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1 || isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition-colors focus:outline-none"
                      >
                        <LuMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm font-black text-neutral-900">
                        {isUpdating ? (
                          <span className="text-neutral-400">·</span>
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productVariantId,
                            item.quantity + 1
                          )
                        }
                        disabled={isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition-colors focus:outline-none"
                      >
                        <LuPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-neutral-900 text-base">
                        £{(price * item.quantity).toFixed(2)}
                      </p>
                      {hasDiscount && (
                        <p className="text-[11px] text-neutral-400 line-through font-semibold">
                          £{(originalPrice * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6 sticky top-24">
            <h2 className="text-lg font-black text-neutral-900 uppercase border-b border-neutral-100 pb-4">
              Order Summary
            </h2>

            {/* Coupon Code */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                <LuTag className="w-3.5 h-3.5" />
                <span>Promo Code</span>
              </div>

              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-green-800 uppercase">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-[10px] text-green-700 font-semibold mt-0.5">
                      {appliedCoupon.discountType === "percentage"
                        ? `${appliedCoupon.discountAmount}% off applied`
                        : `£${appliedCoupon.discountAmount} off applied`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      removeCoupon();
                      setCouponSuccess("");
                      setCouponError("");
                    }}
                    className="text-[10px] font-bold text-red-500 hover:underline uppercase"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER CODE"
                    value={couponInput}
                    onChange={(e) =>
                      setCouponInput(e.target.value.toUpperCase())
                    }
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold uppercase text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl uppercase hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[10px] font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                  {couponError}
                </p>
              )}
              {couponSuccess && !appliedCoupon && (
                <p className="text-[10px] font-bold text-green-700 bg-green-50 p-2 rounded-lg border border-green-100">
                  {couponSuccess}
                </p>
              )}
            </div>

            <hr className="border-neutral-100" />

            {/* Totals */}
            <div className="space-y-3 text-sm font-semibold text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} items)</span>
                <span className="text-neutral-900 font-extrabold">
                  £{cartSubtotal.toFixed(2)}
                </span>
              </div>

              {appliedCoupon && couponDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span className="font-extrabold">
                    -£{couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-neutral-400">
                <span>Shipping</span>
                <span className="font-bold">Calculated at checkout</span>
              </div>

              <hr className="border-neutral-100" />

              <div className="flex justify-between text-base font-black text-neutral-900 pt-1">
                <span>Estimated Total</span>
                <span>£{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              to="/checkout"
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>Proceed to Checkout</span>
              <LuArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/products"
              className="w-full text-center block text-xs font-bold text-neutral-400 hover:text-neutral-700 uppercase tracking-wider transition-colors pt-1"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
