import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuTrash2, LuPlus, LuMinus, LuArrowLeft, LuShoppingBag, LuCreditCard } from "react-icons/lu";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cart,
    loading,
    updateItem,
    removeItem,
    cartSubtotal,
    clearCart,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = React.useState("");
  const [couponLoading, setCouponLoading] = React.useState(false);
  const [couponError, setCouponError] = React.useState("");
  const [couponSuccess, setCouponSuccess] = React.useState("");

  // shipping: Free over $50, otherwise $10
  const shippingFee = cartSubtotal > 50 || cartSubtotal === 0 ? 0 : 10.0;
  const grandTotal = Math.max(0, cartSubtotal - couponDiscount + shippingFee);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    if (!couponInput.trim()) return;

    try {
      setCouponLoading(true);
      const result = await applyCoupon(couponInput);
      setCouponSuccess(result.message || "Coupon applied successfully!");
      setCouponInput("");
    } catch (err) {
      setCouponError(err.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleQtyChange = async (variantId, newQty, stock) => {
    if (newQty < 1) return;
    if (newQty > stock) {
      showAlert({
        title: "Stock Limit Reached",
        message: `Only ${stock} items left in stock for this fashion item.`,
        type: "warning",
      });
      return;
    }
    await updateItem(variantId, newQty);
  };

  if (loading && !cart) {
    return (
      <div className="pt-24 sm:pt-28 pb-16 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="pt-24 sm:pt-28 pb-16 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="border-b border-neutral-200 pb-5 mb-8">
        <h1 className="text-3xl font-black text-neutral-900 uppercase tracking-tight">Your Shopping Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white border border-neutral-100 shadow-sm rounded-3xl max-w-xl mx-auto px-6">
          <div className="p-4 bg-neutral-50 rounded-full inline-flex text-neutral-400 mb-6">
            <LuShoppingBag className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800">Your cart is empty</h2>
          <p className="text-neutral-500 mt-2 text-sm leading-relaxed">
            Looks like you haven't added anything to your cart yet. Head over to our shop page to find your next look.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider shadow-md"
          >
            <LuArrowLeft className="h-4 w-4" /> <span>Start Shopping</span>
          </Link>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Cart Table / Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
              {items.map((item) => {
                const variant = item.productVariant || {};
                const product = variant.product || item.product || {};
                const variantId = item.productVariantId || variant.id || item.id;
                const itemPrice = Number(product.discountPrice || product.price || item.price || 45);
                const stock = variant.stock ?? 25;
                const imgUrl =
                  product.images?.[0]?.imageUrl ||
                  product.images?.[0]?.url ||
                  product.image ||
                  item.image ||
                  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500";

                const displayTitle = product.title || item.title || "Luxury Fashion Item";
                const displaySize = variant.size || item.size || "Standard";
                const displayColor = variant.color || item.color || "Default";

                return (
                  <div
                    key={item.id || variantId}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-neutral-100 last:border-b-0 last:pb-0 gap-4"
                  >
                    {/* Item Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                        <img
                          src={imgUrl}
                          alt={displayTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <Link
                          to={`/products/${product.slug || product.id || variantId}`}
                          className="font-bold text-neutral-800 hover:text-accent transition-colors text-sm sm:text-base line-clamp-1 uppercase"
                        >
                          {displayTitle}
                        </Link>
                        <p className="text-xs text-neutral-400 font-bold mt-1 uppercase">
                          Size: {displaySize} &middot; Color: {displayColor}
                        </p>
                        <p className="text-sm font-extrabold text-neutral-900 mt-2">
                          £{itemPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Selector & Trash */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                      <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => handleQtyChange(variantId, item.quantity - 1, stock)}
                          className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                        >
                          <LuMinus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-xs font-bold text-neutral-800">{item.quantity}</span>
                        <button
                          onClick={() => handleQtyChange(variantId, item.quantity + 1, stock)}
                          className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                        >
                          <LuPlus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px] hidden sm:block">
                        <span className="text-sm font-black text-neutral-900">
                          £{(itemPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(variantId)}
                        className="p-2 text-neutral-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                        title="Remove item"
                      >
                        <LuTrash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center px-4">
              <button
                onClick={clearCart}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Clear Entire Cart
              </button>
              <Link
                to="/products"
                className="text-xs font-bold text-neutral-600 hover:text-accent flex items-center gap-1.5"
              >
                <LuArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-black text-neutral-900 uppercase">Order Summary</h2>

              <div className="space-y-4 text-sm font-semibold text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-neutral-950 font-extrabold">£{cartSubtotal.toFixed(2)}</span>
                </div>

                {/* Coupon Code Input & Applied Info */}
                <div className="pt-2 pb-2 border-t border-b border-neutral-100">
                  <div className="text-xs font-bold text-neutral-800 uppercase mb-2 flex items-center justify-between">
                    <span>Promo Coupon</span>
                    {appliedCoupon && (
                      <span className="text-[10px] text-green-700 font-extrabold bg-green-100 px-2 py-0.5 rounded-md">
                        {appliedCoupon.code}
                      </span>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="bg-green-50/80 border border-green-200 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-green-900">
                          {appliedCoupon.discountType === "percentage"
                            ? `${appliedCoupon.discountAmount}% OFF`
                            : `£${appliedCoupon.discountAmount} OFF`}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            removeCoupon();
                            setCouponSuccess("");
                            setCouponError("");
                          }}
                          className="text-[11px] font-bold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-[10px] text-green-700 font-medium">
                        Coupon code applied successfully to your order!
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ENTER COUPON CODE"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold uppercase text-neutral-900 focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 bg-neutral-900 text-white font-bold text-xs rounded-xl uppercase hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </form>
                  )}

                  {couponError && (
                    <p className="mt-2 text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                      {couponError}
                    </p>
                  )}

                  {couponSuccess && !appliedCoupon && (
                    <p className="mt-2 text-[11px] font-bold text-green-700 bg-green-50 p-2 rounded-lg border border-green-100">
                      {couponSuccess}
                    </p>
                  )}
                </div>

                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between text-green-700 font-bold">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span className="font-extrabold">-£{couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-neutral-950 font-extrabold">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `£${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                {shippingFee > 0 && (
                  <p className="text-[10px] text-neutral-400 font-bold bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    💡 Add <span className="text-accent">£{(50.0 - cartSubtotal).toFixed(2)}</span> more to unlock FREE SHIPPING!
                  </p>
                )}

                <hr className="border-neutral-100" />

                <div className="flex justify-between text-base font-black text-neutral-900">
                  <span>Total</span>
                  <span>£{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <LuCreditCard className="h-4.5 w-4.5" />
                <span>Proceed to Checkout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
