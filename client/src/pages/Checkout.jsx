import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LuArrowLeft, LuCreditCard, LuTruck, LuCircleCheck, LuHouse, LuBuilding, LuMapPin } from "react-icons/lu";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { authClient } from "../lib/auth-client";

function Checkout() {
  const {
    cart,
    cartSubtotal,
    cartCount,
    clearCart,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const navigate = useNavigate();

  const { data: session } = authClient.useSession();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressPillId, setSelectedAddressPillId] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Bangladesh");
  const [isInsideCity, setIsInsideCity] = useState(true);
  const [county, setCounty] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const applyAddressToForm = (addr) => {
    if (!addr) return;
    if (addr.name) setName(addr.name);
    if (addr.phone) setPhone(addr.phone);
    if (addr.street) setAddress(addr.street);
    if (addr.city) setCity(addr.city);
    if (addr.zip) setPostalCode(addr.zip);
    if (addr.country) setCountry(addr.country);
  };

  React.useEffect(() => {
    async function fetchSavedAddresses() {
      if (session?.user?.id) {
        try {
          const res = await api.get("/addresses");
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            setSavedAddresses(res.data);
            const def = res.data.find((a) => a.isDefault) || res.data[0];
            if (def) {
              applyAddressToForm(def);
              setSelectedAddressPillId(def.id);
            }
          }
        } catch (e) {
          console.warn("Could not fetch saved addresses at checkout:", e);
        }
      }
    }
    fetchSavedAddresses();
  }, [session?.user?.id]);

  const [shippingTier, setShippingTier] = useState("STANDARD"); // STANDARD or EXPRESS
  const [storeSettings, setStoreSettings] = useState({
    insideCityFee: 10.0,
    outsideCityFee: 15.0,
    freeShippingMinOrder: 300.0,
    estimatedDeliveryDays: "2-4 Business Days",
    vatTaxRate: "7.0%",
  });

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("STRIPE"); // STRIPE or COD
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  React.useEffect(() => {
    async function loadStoreSettings() {
      try {
        const res = await api.get("/setting");
        if (res && res.success && res.data) {
          setStoreSettings({
            insideCityFee: Number(res.data.insideCityFee ?? 10.0),
            outsideCityFee: Number(res.data.outsideCityFee ?? 15.0),
            freeShippingMinOrder: Number(res.data.freeShippingMinOrder ?? 300.0),
            estimatedDeliveryDays: res.data.estimatedDeliveryDays || "2-4 Business Days",
            vatTaxRate: res.data.vatTaxRate || "7.0%",
          });
        }
      } catch (err) {
        console.warn("Using default store settings:", err);
      }
    }
    loadStoreSettings();
  }, []);

  const taxPercentage = parseFloat(String(storeSettings.vatTaxRate).replace("%", "")) || 0;
  
  // Calculate dynamic shipping fee
  const isFreeShipping = cartSubtotal >= storeSettings.freeShippingMinOrder && shippingTier !== "EXPRESS";
  const shippingFee = cartCount === 0
    ? 0
    : isFreeShipping
      ? 0
      : shippingTier === "EXPRESS"
        ? storeSettings.outsideCityFee
        : storeSettings.insideCityFee;

  const taxableAmount = Math.max(0, cartSubtotal - couponDiscount);
  const taxAmount = (taxableAmount * taxPercentage) / 100;
  const grandTotal = taxableAmount + taxAmount + shippingFee;

  const handleApplyCouponCheckout = async (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (cartCount === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    if (!name || !phone || !address || !city) {
      setErrorMsg("Please fill in all required shipping fields.");
      return;
    }

    setLoading(true);

    const shippingInfo = {
      name: name.trim(),
      number: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      county: county.trim() || undefined,
      country: country.trim(),
      postalCode: postalCode.trim(),
      isInsideCity,
      shippingTier,
      deliveryInstructions: deliveryInstructions.trim() || undefined,
      couponCode: appliedCoupon?.code,
      discountTotal: couponDiscount,
    };

    try {
      if (paymentMethod === "STRIPE") {
        // Stripe Checkout Session redirection
        const res = await api.post("/payments/stripe/checkout", shippingInfo);
        if (res && res.success && res.data.checkoutUrl) {
          // Clear cart on success redirection
          clearCart();
          removeCoupon();
          window.location.href = res.data.checkoutUrl;
        } else {
          throw new Error("Failed to create Stripe payment session.");
        }
      } else {
        // Cash on Delivery or Payment Completion
        const res = await api.post("/payments/cod", shippingInfo);
        if (res && res.success) {
          clearCart();
          removeCoupon();
          const orderId = res.data?.id || "100254";
          navigate(`/checkout/success?order_id=${orderId}&payment_method=COD`);
        } else {
          throw new Error("Failed to process order payment.");
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "An error occurred while placing your order.");
      setLoading(false);
      navigate(`/checkout/error?code=PAY_001&reason=${encodeURIComponent(err.message || "Payment request failed")}`);
    }
  };

  if (orderSuccess) {
    return (
      <div className="pt-24 sm:pt-28 pb-16 min-h-screen max-w-xl mx-auto px-4 text-center flex flex-col items-center justify-center">
        <div className="p-4 bg-green-50 rounded-full text-green-600 mb-6">
          <LuCircleCheck className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-black text-neutral-900 uppercase">Order Placed!</h1>
        <p className="text-neutral-500 mt-2 text-sm leading-relaxed max-w-md">
          Thank you for shopping with us! Your order <span className="font-extrabold text-neutral-800">#{orderSuccess.id}</span> has been created.
          We will contact you shortly to confirm delivery details.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
          <Link
            to="/profile"
            className="flex-1 bg-neutral-900 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-md"
          >
            View Order History
          </Link>
          <Link
            to="/products"
            className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs border border-neutral-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-28 pb-16 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 mb-8 text-sm font-bold focus:outline-none"
      >
        <LuArrowLeft className="h-4 w-4" /> <span>Back to Cart</span>
      </button>

      {/* Main Grid */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        {/* Shipping Form */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-black text-neutral-900 uppercase mb-6">Shipping Information</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Saved Address Selector Pills */}
              {savedAddresses.length > 0 && (
                <div className="p-4 bg-[#FAFAF8] border border-[#ECE8E1] rounded-2xl space-y-2.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#21453A] block">
                    Fast Express Delivery Address
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressPillId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddressPillId(addr.id);
                            applyAddressToForm(addr);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                            isSelected
                              ? "bg-[#21453A] text-white border-[#21453A] shadow-sm"
                              : "bg-white text-[#1D1D1F] border-[#ECE8E1] hover:border-[#21453A]/50"
                          }`}
                        >
                          {addr.label === "Home" ? (
                            <LuHouse className={`w-3.5 h-3.5 ${isSelected ? "text-[#B88A2E]" : "text-[#6B7280]"}`} />
                          ) : addr.label === "Office" ? (
                            <LuBuilding className={`w-3.5 h-3.5 ${isSelected ? "text-[#B88A2E]" : "text-[#6B7280]"}`} />
                          ) : (
                            <LuMapPin className={`w-3.5 h-3.5 ${isSelected ? "text-[#B88A2E]" : "text-[#6B7280]"}`} />
                          )}
                          <span>{addr.label} Address</span>
                          {addr.isDefault && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase ${
                                isSelected ? "bg-[#B88A2E] text-white" : "bg-green-100 text-[#21453A]"
                              }`}
                            >
                              Default
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Row: Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all"
                />
              </div>

              {/* Row: Phone */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +880 17XXXXXXXX"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all"
                />
              </div>

              {/* Row: Address */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, Street name, Apartment"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all"
                />
              </div>

              {/* Row: City & Postal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dhaka"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Country Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                    State / County
                  </label>
                  <input
                    type="text"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    placeholder="Optional state/county"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Location delivery checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="insideCity"
                  checked={isInsideCity}
                  onChange={(e) => setIsInsideCity(e.target.checked)}
                  className="rounded text-accent focus:ring-accent h-4 w-4"
                />
                <label htmlFor="insideCity" className="text-xs font-bold text-neutral-600 cursor-pointer">
                  Delivery is inside the Main Metropolitan City Area
                </label>
              </div>

              {/* Row: Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                  Special Delivery Instructions
                </label>
                <textarea
                  rows={3}
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="Gate codes, delivery drops, or timing preferences..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white resize-none transition-all"
                ></textarea>
              </div>

              <hr className="border-neutral-100 my-6" />

              {/* Payment Methods */}
              {/* Shipping Method Selector */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Select Shipping Method
                  </h3>
                  <span className="text-[11px] font-semibold text-[#21453A] bg-[#F6F3ED] px-2.5 py-0.5 rounded-full border border-[#ECE8E1]">
                    Delivery: {storeSettings.estimatedDeliveryDays}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Standard Shipping Option */}
                  <label
                    className={`p-4 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${
                      shippingTier === "STANDARD"
                        ? "border-[#21453A] bg-[#FAFAF8] text-[#1D1D1F] shadow-sm"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1D1D1F]">Standard Shipping</span>
                          {cartSubtotal >= storeSettings.freeShippingMinOrder && (
                            <span className="text-[9px] font-extrabold bg-[#21453A] text-white px-2 py-0.2 rounded-full uppercase">
                              FREE (MIN ${storeSettings.freeShippingMinOrder})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B7280] mt-1 font-medium">
                          {storeSettings.estimatedDeliveryDays} Delivery
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="shippingTier"
                        checked={shippingTier === "STANDARD"}
                        onChange={() => setShippingTier("STANDARD")}
                        className="mt-0.5 text-[#21453A] focus:ring-[#21453A]"
                      />
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#ECE8E1]/60 text-xs font-extrabold text-[#21453A]">
                      {cartSubtotal >= storeSettings.freeShippingMinOrder ? "FREE" : `£${storeSettings.insideCityFee.toFixed(2)}`}
                    </div>
                  </label>

                  {/* Express Shipping Option */}
                  <label
                    className={`p-4 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${
                      shippingTier === "EXPRESS"
                        ? "border-[#21453A] bg-[#FAFAF8] text-[#1D1D1F] shadow-sm"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1D1D1F]">Express Shipping</span>
                          <span className="text-[9px] font-extrabold bg-[#B88A2E] text-white px-2 py-0.2 rounded-full uppercase">
                            FASTEST
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B7280] mt-1 font-medium">
                          Priority Courier Express
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="shippingTier"
                        checked={shippingTier === "EXPRESS"}
                        onChange={() => setShippingTier("EXPRESS")}
                        className="mt-0.5 text-[#21453A] focus:ring-[#21453A]"
                      />
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#ECE8E1]/60 text-xs font-extrabold text-[#21453A]">
                      £{storeSettings.outsideCityFee.toFixed(2)}
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Payment Method</h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Stripe Payment Option */}
                  <label
                    className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                      paymentMethod === "STRIPE"
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <LuCreditCard className="h-5 w-5" />
                      <span className="text-sm font-bold">Pay with Card</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "STRIPE"}
                      onChange={() => setPaymentMethod("STRIPE")}
                      className="sr-only"
                    />
                  </label>

                  {/* COD Payment Option */}
                  <label
                    className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                      paymentMethod === "COD"
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <LuTruck className="h-5 w-5" />
                      <span className="text-sm font-bold">Cash on Delivery</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold border border-red-100">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>{loading ? "Processing..." : `Place Order (£${grandTotal.toFixed(2)})`}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Order review details sidebar */}
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6 sticky top-24">
            <h2 className="text-lg font-black text-neutral-900 uppercase border-b border-neutral-100 pb-4">
              Review Items ({cartCount})
            </h2>

            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1">
              {cart?.items?.map((item) => {
                const product = item.productVariant.product;
                const variant = item.productVariant;
                const price = Number(product.discountPrice || product.price);

                return (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="h-14 w-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img
                          src={product.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300"}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-800 line-clamp-1 uppercase max-w-[150px]">{product.title}</h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">
                          {variant.size} &middot; {variant.color} &middot; Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-neutral-900">£{(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <hr className="border-neutral-100" />

            {/* Coupon Code Section */}
            <div className="py-2 border-b border-neutral-100 space-y-2">
              <div className="text-xs font-bold text-neutral-800 uppercase flex justify-between items-center">
                <span>Promo Coupon</span>
                {appliedCoupon && (
                  <span className="text-[10px] text-green-700 font-extrabold bg-green-100 px-2 py-0.5 rounded-md">
                    {appliedCoupon.code}
                  </span>
                )}
              </div>

              {appliedCoupon ? (
                <div className="bg-green-50/80 border border-green-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-green-900">
                      {appliedCoupon.discountType === "percentage"
                        ? `${appliedCoupon.discountAmount}% Discount`
                        : `£${appliedCoupon.discountAmount} Discount`}
                    </p>
                    <p className="text-[10px] text-green-700 font-medium">Applied to your total</p>
                  </div>
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
              ) : (
                <form onSubmit={handleApplyCouponCheckout} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER COUPON CODE"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold uppercase text-neutral-900 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-3.5 py-2 bg-neutral-900 text-white font-bold text-xs rounded-xl uppercase hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[10px] font-bold text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-100">
                  {couponError}
                </p>
              )}
              {couponSuccess && !appliedCoupon && (
                <p className="text-[10px] font-bold text-green-700 bg-green-50 p-1.5 rounded-lg border border-green-100">
                  {couponSuccess}
                </p>
              )}
            </div>

            <div className="space-y-3 text-sm font-semibold text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-neutral-950 font-extrabold">£{cartSubtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && couponDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span className="font-extrabold">-£{couponDiscount.toFixed(2)}</span>
                </div>
              )}

              {taxPercentage > 0 && (
                <div className="flex justify-between">
                  <span>VAT / Tax ({taxPercentage.toFixed(1)}%)</span>
                  <span className="text-neutral-950 font-extrabold">+£{taxAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-neutral-950 font-extrabold">
                  {shippingFee === 0 ? "FREE" : `£${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <hr className="border-neutral-100" />
              <div className="flex justify-between text-base font-black text-neutral-900">
                <span>Grand Total</span>
                <span>£{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
