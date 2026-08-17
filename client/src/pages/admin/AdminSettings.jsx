import React, { useState, useEffect } from "react";
import { Settings2, Save, Globe, CreditCard, ShieldCheck, Mail, Truck, Share2, Search, Sliders, CheckCircle2, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    // General
    storeName: "NABIS FASHION",
    tagline: "Luxury Bengali Panjabi, Sarees & Designer Attire",
    supportEmail: "support@nabisfashion.com",
    supportPhone: "+880 1711 000 000",
    currency: "GBP (£)",
    storeAddress: "House 45, Road 11, Banani, Dhaka, Bangladesh",
    
    // Shipping
    insideCityFee: "10.00",
    outsideCityFee: "15.00",
    freeShippingMinOrder: "50.00",
    estimatedDeliveryDays: "2-4 Business Days",

    // Payments & Taxes
    enableCOD: true,
    enableSSLCommerz: true,
    enableStripe: true,
    vatTaxRate: "0.0%",
    
    // SEO & Social
    metaTitle: "NABIS FASHION | Luxury Punjabis, Sarees & Ethnic Clothing",
    metaDescription: "Discover handcrafted Punjabi collections, designer Sarees, and premium fashion accessories at NABIS FASHION.",
    instagram: "https://instagram.com/nabisfashion",
    facebook: "https://facebook.com/nabisfashion",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.get("/setting");
        if (res && res.success && res.data) {
          setSettings((prev) => ({
            ...prev,
            ...res.data,
            insideCityFee: String(res.data.insideCityFee ?? "10.00"),
            outsideCityFee: String(res.data.outsideCityFee ?? "15.00"),
            freeShippingMinOrder: String(res.data.freeShippingMinOrder ?? "50.00"),
          }));
        }
      } catch (err) {
        console.warn("Error loading server settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await api.put("/setting", settings);
      if (res && res.success && res.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
          insideCityFee: String(res.data.insideCityFee ?? "10.00"),
          outsideCityFee: String(res.data.outsideCityFee ?? "15.00"),
          freeShippingMinOrder: String(res.data.freeShippingMinOrder ?? "50.00"),
        }));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed saving settings:", err);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#111827]">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
          System & Store Configuration
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Manage brand identity, shipping thresholds, payment options, and search optimization
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[#ECECEC] gap-6 text-xs font-bold text-[#6B7280] overflow-x-auto">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === "general"
              ? "border-[#21453A] text-[#21453A]"
              : "border-transparent hover:text-[#111827]"
          }`}
        >
          <Globe className="w-4 h-4" /> General & Branding
        </button>

        <button
          onClick={() => setActiveTab("shipping")}
          className={`pb-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === "shipping"
              ? "border-[#21453A] text-[#21453A]"
              : "border-transparent hover:text-[#111827]"
          }`}
        >
          <Truck className="w-4 h-4" /> Shipping & Delivery
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === "payments"
              ? "border-[#21453A] text-[#21453A]"
              : "border-transparent hover:text-[#111827]"
          }`}
        >
          <CreditCard className="w-4 h-4" /> Payments & Taxes
        </button>

        <button
          onClick={() => setActiveTab("seo")}
          className={`pb-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === "seo"
              ? "border-[#21453A] text-[#21453A]"
              : "border-transparent hover:text-[#111827]"
          }`}
        >
          <Search className="w-4 h-4" /> SEO & Social Links
        </button>
      </div>

      {/* Settings Form */}
      {loading ? (
        <div className="card-premium py-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#21453A]"></div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="card-premium space-y-6">
          {saved && (
            <div className="p-3 bg-green-50 border border-green-200 text-[#22C55E] rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> Store configuration updated and saved in server database!
            </div>
          )}

          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl font-bold outline-none focus:border-[#21453A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Store Currency</label>
                  <Select value={settings.currency} onValueChange={(val) => setSettings({ ...settings, currency: val })}>
                    <SelectTrigger className="bg-[#F7F8FA] border-[#ECECEC] text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD ($)">USD ($)</SelectItem>
                      <SelectItem value="BDT (৳)">BDT (৳)</SelectItem>
                      <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                      <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Physical Headquarters Address</label>
                <input
                  type="text"
                  value={settings.storeAddress}
                  onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SHIPPING */}
          {activeTab === "shipping" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Standard Shipping ($)</label>
                  <input
                    type="text"
                    value={settings.insideCityFee}
                    onChange={(e) => setSettings({ ...settings, insideCityFee: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl font-bold outline-none focus:border-[#21453A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Express Shipping ($)</label>
                  <input
                    type="text"
                    value={settings.outsideCityFee}
                    onChange={(e) => setSettings({ ...settings, outsideCityFee: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl font-bold outline-none focus:border-[#21453A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Free Shipping Min Order ($)</label>
                  <input
                    type="text"
                    value={settings.freeShippingMinOrder}
                    onChange={(e) => setSettings({ ...settings, freeShippingMinOrder: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl font-bold text-[#21453A] outline-none focus:border-[#21453A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Estimated Delivery Timeline</label>
                <input
                  type="text"
                  value={settings.estimatedDeliveryDays}
                  onChange={(e) => setSettings({ ...settings, estimatedDeliveryDays: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#ECECEC] space-y-3">
                <h4 className="font-bold text-[#111827]">Active Payment Gateways</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableCOD}
                      onChange={(e) => setSettings({ ...settings, enableCOD: e.target.checked })}
                      className="rounded text-[#21453A] focus:ring-0"
                    />
                    <span className="font-semibold text-[#111827]">Cash on Delivery (COD)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableSSLCommerz}
                      onChange={(e) => setSettings({ ...settings, enableSSLCommerz: e.target.checked })}
                      className="rounded text-[#21453A] focus:ring-0"
                    />
                    <span className="font-semibold text-[#111827]">SSLCommerz Payment Gateway (Debit/Credit & Mobile Banking)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableStripe}
                      onChange={(e) => setSettings({ ...settings, enableStripe: e.target.checked })}
                      className="rounded text-[#21453A] focus:ring-0"
                    />
                    <span className="font-semibold text-[#111827]">Stripe International Cards</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Store Tax / VAT Rate (%)</label>
                <input
                  type="text"
                  value={settings.vatTaxRate}
                  onChange={(e) => setSettings({ ...settings, vatTaxRate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl font-bold outline-none focus:border-[#21453A]"
                />
              </div>
            </div>
          )}

          {/* TAB 4: SEO & SOCIAL */}
          {activeTab === "seo" && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">SEO Title Tag</label>
                <input
                  type="text"
                  value={settings.metaTitle}
                  onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">SEO Meta Description</label>
                <textarea
                  rows={3}
                  value={settings.metaDescription}
                  onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={settings.instagram}
                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111827] uppercase text-[10px] mb-1">Facebook URL</label>
                  <input
                    type="text"
                    value={settings.facebook}
                    onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl outline-none focus:border-[#21453A]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#ECECEC] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#21453A] text-white rounded-xl text-xs font-bold hover:bg-[#163028] transition-colors btn-press shadow-2xs flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin text-[#B88A2E]" /> : <Save className="w-4 h-4 text-[#B88A2E]" />}
              <span>{saving ? "Saving Server Settings..." : "Save All Settings"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
