import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CircleX,
  RotateCcw,
  ShoppingBag,
  Headset,
  ArrowLeft,
  Mail,
  ShieldAlert
} from "lucide-react";

export default function CheckoutError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorCode = searchParams.get("code") || "PAY_001";
  const reasonParam = searchParams.get("reason") || searchParams.get("message") || "Payment was cancelled or transaction expired";

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#111827] pt-24 sm:pt-28 pb-20 font-sans flex items-center justify-center p-4">
      {/* CENTERED 720PX LUXURY CONTAINER */}
      <div className="w-full max-w-[720px] bg-white rounded-[24px] border border-[#ECECEC] p-8 sm:p-12 shadow-lg space-y-8 animate-in fade-in duration-300">
        
        {/* ERROR ICON & HEADINGS WITH SHAKE ANIMATION */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 rounded-full bg-red-50 border border-red-100 text-[#EF4444] shadow-sm animate-shake">
            <CircleX className="w-14 h-14" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#111827] tracking-tight">
            Payment Failed
          </h1>

          <p className="text-xs sm:text-sm text-[#6B7280] font-medium max-w-lg mx-auto leading-relaxed">
            Unfortunately, we couldn't complete your payment. No money has been charged if your payment was not successful.
            If money was deducted from your account, please contact our support team immediately.
          </p>
        </div>

        {/* ERROR INFORMATION CARD */}
        <div className="bg-[#F8F8F6] border border-[#ECECEC] rounded-2xl p-6 space-y-4 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-[#ECECEC]">
            <span className="font-bold text-[#6B7280] uppercase tracking-wider text-[10px]">Transaction Status</span>
            <span className="inline-flex items-center gap-1 font-bold text-[#EF4444] bg-red-100 px-3 py-0.5 rounded-full text-[11px]">
              ✕ Failed
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-[10px] font-bold text-[#6B7280] uppercase">Error Code</span>
              <span className="font-mono font-bold text-[#111827] text-xs mt-1 block">{errorCode}</span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-[#6B7280] uppercase">Failure Reason</span>
              <span className="font-bold text-[#EF4444] text-xs mt-1 block capitalize">{reasonParam}</span>
            </div>
          </div>
        </div>

        {/* RETRY NOTICE BOX */}
        <div className="p-4 bg-[#FAF6EE] border border-[#B88A2E]/30 rounded-2xl flex items-center gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-[#B88A2E] flex-shrink-0" />
          <div>
            <p className="font-bold text-[#21453A] font-heading">Your Cart Has Been Saved</p>
            <p className="text-[#6B7280] mt-0.5">
              All items remain in your shopping bag. You can retry payment immediately without adding products again.
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/checkout")}
              className="flex-1 py-4 bg-[#21453A] hover:bg-[#17322A] text-white text-xs font-bold uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 tracking-wider btn-press"
            >
              <RotateCcw className="w-4 h-4 text-[#B88A2E]" />
              <span>Try Again</span>
            </button>

            <button
              onClick={() => navigate("/checkout")}
              className="flex-1 py-4 bg-[#F6F3ED] hover:bg-[#21453A] text-[#21453A] hover:text-white border border-[#ECECEC] text-xs font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Checkout</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
            <Link
              to="/products"
              className="w-full sm:w-auto py-3 px-5 border border-[#ECECEC] bg-white hover:bg-[#F8F8F6] text-xs font-bold text-[#111827] rounded-xl text-center flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#6B7280]" />
              <span>Continue Shopping</span>
            </Link>

            <a
              href="mailto:support@nabisfashion.com"
              className="text-xs font-bold text-[#21453A] hover:underline flex items-center gap-1.5"
            >
              <Headset className="w-3.5 h-3.5" /> Contact Support Team
            </a>
          </div>
        </div>

        {/* FOOTER SUPPORT */}
        <div className="pt-6 border-t border-[#ECECEC] text-center text-xs text-[#6B7280] flex items-center justify-center gap-2">
          <Mail className="w-3.5 h-3.5 text-[#21453A]" />
          <span>Priority Support: <strong className="text-[#111827]">support@nabisfashion.com</strong></span>
        </div>

      </div>
    </div>
  );
}
