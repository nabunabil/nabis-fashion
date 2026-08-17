import React from "react";
import { Megaphone, Plus, TrendingUp, Sparkles, Eye, Target, MousePointer } from "lucide-react";

export default function AdminMarketing() {
  const campaigns = [
    { id: 1, name: "Autumn Silk Elegance Campaign", type: "Hero Banner", ctr: "4.8%", conversions: "342 sales", budget: "£2,500.00", status: "Active" },
    { id: 2, name: "VIP Early Access Discount", type: "Email Newsletter", ctr: "12.4%", conversions: "612 sales", budget: "£800.00", status: "Active" },
    { id: 3, name: "Summer Runway Clearance", type: "Promo Popup", ctr: "3.2%", conversions: "189 sales", budget: "£500.00", status: "Completed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
            Marketing & Campaigns
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage promotional banners, email blasts, and conversion performance
          </p>
        </div>
        <button className="px-4 py-2 bg-[#21453A] text-white text-xs font-semibold rounded-xl hover:bg-[#163028] transition-colors btn-press shadow-2xs flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Marketing Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-[#F0F4F2] text-[#21453A]">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#6B7280]">Total CTR Rate</p>
          <h3 className="text-2xl font-bold text-[#111827]">6.8% Avg</h3>
        </div>
        <div className="card-premium space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-[#DBEAFE] text-[#3B82F6]">
            <MousePointer className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#6B7280]">Campaign Conversions</p>
          <h3 className="text-2xl font-bold text-[#111827]">1,143 Orders</h3>
        </div>
        <div className="card-premium space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-[#FAF6EE] text-[#B88A2E]">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#6B7280]">Marketing ROAS</p>
          <h3 className="text-2xl font-bold text-[#111827]">4.2x ROI</h3>
        </div>
      </div>

      <div className="card-premium space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#ECECEC] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">CTR</th>
                <th className="py-3 px-4">Conversions</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECEC] text-[#111827]">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-[#F7F8FA]">
                  <td className="py-3.5 px-4 font-bold text-[#111827]">{c.name}</td>
                  <td className="py-3.5 px-4 text-[#6B7280]">{c.type}</td>
                  <td className="py-3.5 px-4 font-bold text-[#21453A]">{c.ctr}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#111827]">{c.conversions}</td>
                  <td className="py-3.5 px-4 text-[#6B7280]">{c.budget}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c.status === "Active" ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#F7F8FA] text-[#6B7280]"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
