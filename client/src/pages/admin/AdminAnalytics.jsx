import React from "react";
import { LineChart as LineIcon, TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AdminAnalytics() {
  const channelData = [
    { channel: "Direct Web", Sales: 42000 },
    { channel: "Instagram Shop", Sales: 28000 },
    { channel: "Organic Search", Sales: 34000 },
    { channel: "Email Campaigns", Sales: 19000 },
    { channel: "Referral VIP", Sales: 12000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
          Advanced Store Analytics
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Sales acquisition channels, repeat purchase rates, and average order value breakdown
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium space-y-2">
          <p className="text-xs text-[#6B7280]">Average Order Value (AOV)</p>
          <h3 className="text-2xl font-bold text-[#111827]">£384.50</h3>
          <span className="text-xs font-bold text-[#22C55E]">+6.4% vs last month</span>
        </div>
        <div className="card-premium space-y-2">
          <p className="text-xs text-[#6B7280]">Customer Repeat Rate</p>
          <h3 className="text-2xl font-bold text-[#111827]">42.8%</h3>
          <span className="text-xs font-bold text-[#22C55E]">+11.2% repeat buyers</span>
        </div>
        <div className="card-premium space-y-2">
          <p className="text-xs text-[#6B7280]">Cart Abandonment Rate</p>
          <h3 className="text-2xl font-bold text-[#111827]">18.4%</h3>
          <span className="text-xs font-bold text-[#22C55E]">-3.1% improved checkout</span>
        </div>
      </div>

      <div className="card-premium space-y-4">
        <h3 className="font-heading text-base font-bold text-[#111827]">Revenue by Acquisition Channel</h3>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECECEC" />
              <XAxis dataKey="channel" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} tickFormatter={(v) => `£${v/1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#ECECEC",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#111827",
                }}
              />
              <Bar dataKey="Sales" fill="#21453A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
