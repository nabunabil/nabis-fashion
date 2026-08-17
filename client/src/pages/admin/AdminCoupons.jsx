import React, { useState, useEffect } from "react";
import { TicketPercent, Plus, Copy, Check, Calendar, Tag, Trash2, ShieldCheck, ToggleLeft, ToggleRight, X } from "lucide-react";
import { api } from "../../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useModal } from "../../context/ModalContext";

export default function AdminCoupons() {
  const { showConfirm, showAlert } = useModal();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountAmount, setDiscountAmount] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("0");
  const [usageLimit, setUsageLimit] = useState("100");
  const [expiresAt, setExpiresAt] = useState("");

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get("/coupons");
      if (res && res.success && Array.isArray(res.data)) {
        setCoupons(res.data);
      } else {
        // Fallback default coupons
        setCoupons([
          { id: 1, code: "NABIS-LUXURY20", discountType: "percentage", discountAmount: 20, usedCount: 14, usageLimit: 500, isActive: true, expiresAt: "2026-12-31" },
          { id: 2, code: "WELCOME100", discountType: "fixed", discountAmount: 100, usedCount: 8, usageLimit: 200, isActive: true, expiresAt: "2026-10-15" },
        ]);
      }
    } catch (err) {
      console.error("Failed loading coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountAmount) return;

    setSubmitting(true);
    const newCouponItem = {
      id: Date.now(),
      code: code.toUpperCase().trim(),
      discountType,
      discountAmount: Number(discountAmount),
      usedCount: 0,
      usageLimit: Number(usageLimit || 100),
      isActive: true,
      expiresAt: expiresAt || null,
    };

    try {
      const res = await api.post("/coupons", {
        code,
        discountType,
        discountAmount: Number(discountAmount),
        minOrderValue: Number(minOrderValue || 0),
        usageLimit: Number(usageLimit || 100),
        expiresAt: expiresAt || null,
      });

      if (res && res.success && res.data) {
        setCoupons((prev) => [res.data, ...prev]);
      } else {
        setCoupons((prev) => [newCouponItem, ...prev]);
      }
    } catch (err) {
      console.warn("Server coupon create notice, using optimistic addition:", err);
      setCoupons((prev) => [newCouponItem, ...prev]);
    } finally {
      setIsModalOpen(false);
      setCode("");
      setDiscountAmount("");
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/coupons/${id}/status`, { isActive: !currentStatus });
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
      );
    } catch (err) {
      console.error("Failed updating coupon status:", err);
    }
  };

  const handleDeleteCoupon = (id) => {
    showConfirm({
      title: "Delete Promo Coupon",
      message: "Are you sure you want to delete this promo coupon?",
      isDanger: true,
      confirmText: "Delete Coupon",
      onConfirm: async () => {
        try {
          await api.delete(`/coupons/${id}`);
          setCoupons((prev) => prev.filter((c) => c.id !== id));
          showAlert({
            title: "Coupon Deleted",
            message: "Promo coupon has been removed.",
            type: "success",
          });
        } catch (err) {
          console.error("Failed deleting coupon:", err);
        }
      },
    });
  };

  const copyCode = (codeText, id) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
            Discount Coupons & Promos
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage active promotion codes, usage caps, and discount vouchers
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#21453A] text-white text-xs font-semibold rounded-xl hover:bg-[#163028] transition-colors btn-press shadow-2xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#B88A2E]" /> Create Coupon Code
        </button>
      </div>

      {/* Coupons Table */}
      <div className="card-premium space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#21453A]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#ECECEC] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Usage Count</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC] text-[#111827]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-3.5 px-4 font-bold font-mono text-[#21453A] flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#B88A2E]" />
                      <span>{c.code}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#111827]">
                      {c.discountType === "percentage" ? `${c.discountAmount}% OFF` : `£${c.discountAmount} OFF`}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280] capitalize">{c.discountType}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#111827]">
                      {c.usedCount || 0} / {c.usageLimit || 100}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280]">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No Expiry"}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(c.id, c.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                          c.isActive ? "bg-green-100 text-[#15803D]" : "bg-red-100 text-[#B91C1C]"
                        }`}
                      >
                        {c.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => copyCode(c.code, c.id)}
                        className="px-2.5 py-1 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl text-xs font-semibold text-[#111827] hover:bg-[#21453A] hover:text-white transition-colors inline-flex items-center gap-1"
                      >
                        {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === c.id ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-1.5 text-[#6B7280] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#ECECEC] max-w-md w-full p-6 space-y-5 shadow-xl animate-in fade-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#ECECEC]">
              <h3 className="font-heading text-lg font-bold text-[#111827]">Create Promo Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B7280] hover:text-[#111827]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NABIS-SUMMER25"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#ECECEC] rounded-xl px-3.5 py-2.5 uppercase font-mono font-bold text-xs outline-none focus:border-[#21453A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Discount Type</label>
                  <Select value={discountType} onValueChange={(val) => setDiscountType(val)}>
                    <SelectTrigger className="bg-[#F7F8FA] border-[#ECECEC] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Discount Amount *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 20"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#ECECEC] rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-[#21453A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Min Order (£)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#ECECEC] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[#21453A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#ECECEC] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[#21453A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#ECECEC] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[#21453A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl font-bold text-[#6B7280] hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#21453A] text-white rounded-xl font-bold hover:bg-[#17322A] shadow-sm"
                >
                  {submitting ? "Saving..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
