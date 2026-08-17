import React from "react";
import { BarChart3, Download, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { useModal } from "../../context/ModalContext";

export default function AdminReports() {
  const { downloadPdf } = useModal();
  const reports = [
    { id: 1, title: "July 2026 Monthly Sales & Revenue Audit", size: "2.4 MB", format: "PDF / CSV", date: "26 Jul 2026" },
    { id: 2, title: "Q2 Tax Breakdown & Regional VAT Export", size: "1.8 MB", format: "XLSX", date: "01 Jul 2026" },
    { id: 3, title: "Inventory Valuation & COGS Statement", size: "4.1 MB", format: "PDF", date: "15 Jun 2026" },
    { id: 4, title: "Customer Lifetime Value & Retention Report", size: "1.2 MB", format: "CSV", date: "01 Jun 2026" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
            Financial & Tax Reports
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Download certified financial statements, VAT/sales tax audits, and COGS reports
          </p>
        </div>
      </div>

      <div className="card-premium space-y-4">
        <div className="divide-y divide-[#ECECEC]">
          {reports.map((rep) => (
            <div key={rep.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#ECECEC] text-[#21453A]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">{rep.title}</h4>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">Generated on {rep.date} • {rep.size} • Format: {rep.format}</p>
                </div>
              </div>

              <button
                onClick={() =>
                  downloadPdf({
                    orderId: rep.id,
                    orderNumber: `REPORT-#${rep.id}`,
                    customUrl: `/api/invoice/${rep.id}/download`,
                    filename: `${rep.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf`,
                    title: rep.title,
                  })
                }
                className="px-3.5 py-2 bg-[#21453A] text-white rounded-xl text-xs font-semibold hover:bg-[#163028] transition-colors btn-press flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
