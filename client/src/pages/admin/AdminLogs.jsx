import React from "react";
import { FileText, Shield, Key, AlertTriangle, CheckCircle } from "lucide-react";

export default function AdminLogs() {
  const logs = [
    { id: 1, action: "Product Price Updated", user: "Alex Vance", details: "Changed 'Silk Tailored Trench Coat' price to $480.00", time: "10m ago", status: "Success" },
    { id: 2, name: "Order #NB-9842 Status Changed", user: "Elena Rostova", details: "Updated order status from 'Processing' to 'Delivered'", time: "25m ago", status: "Success" },
    { id: 3, name: "Admin Login Success", user: "Alex Vance", details: "Logged in from IP 192.168.1.42 (macOS / Chrome)", time: "1h ago", status: "Security" },
    { id: 4, name: "Coupon 'WELCOME100' Created", user: "Marcus Chen", details: "Added 20% discount coupon code with 500 redemption limit", time: "3h ago", status: "Success" },
    { id: 5, name: "Failed Login Attempt", user: "Unknown", details: "Invalid credentials attempt for user root@admin.com", time: "5h ago", status: "Warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
          System & Audit Logs
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Real-time security events, administrator activity trail, and API log history
        </p>
      </div>

      <div className="card-premium space-y-4">
        <div className="divide-y divide-[#ECECEC]">
          {logs.map((l) => (
            <div key={l.id} className="py-3.5 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 ${
                  l.status === "Security" ? "bg-[#DBEAFE] text-[#3B82F6]" :
                  l.status === "Warning" ? "bg-[#FEF3C7] text-[#B45309]" : "bg-[#DCFCE7] text-[#15803D]"
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">{l.action || l.name}</h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">{l.details}</p>
                  <p className="text-[10px] text-[#6B7280] font-mono mt-1">Performed by <span className="font-semibold text-[#111827]">{l.user}</span> • {l.time}</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                l.status === "Warning" ? "bg-[#FEF3C7] text-[#B45309]" : "bg-[#F7F8FA] text-[#6B7280] border border-[#ECECEC]"
              }`}>
                {l.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
