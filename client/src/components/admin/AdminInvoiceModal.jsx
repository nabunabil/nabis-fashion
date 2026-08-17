import React from "react";
import { X, Printer, Download, CheckCircle2 } from "lucide-react";
import { useModal } from "../../context/ModalContext";

export default function AdminInvoiceModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const { downloadPdf } = useModal();
  const invoiceNum = `INV-#${order.id}`;
  const currentDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleDownloadPdf = () => {
    downloadPdf({
      orderId: order.id,
      orderNumber: invoiceNum,
      title: "Official Tax Invoice PDF",
    });
  };

  const items = order.items && order.items.length > 0 ? order.items : [
    { id: 1, productTitle: "Bengali Designer Garment", size: "M", color: "Standard", quantity: 1, price: Number(order.totalPrice || 150) }
  ];

  const subtotal = Number(order.subtotal || items.reduce((s, i) => s + Number(i.price) * i.quantity, 0));
  const discount = Number(order.discountTotal || 0);
  const deliveryFee = Number(order.deliveryFee || 0);
  const totalAmount = Number(order.totalPrice || (subtotal - discount + deliveryFee));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-[#ECECEC] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Bar */}
        <div className="px-6 py-4 border-b border-[#ECECEC] flex justify-between items-center bg-[#F7F8FA]">
          <div>
            <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
              Official Tax Invoice & Order Details
            </h3>
            <p className="text-xs text-[#6B7280]">Order #{order.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 rounded-xl bg-[#21453A] text-white text-xs font-semibold hover:bg-[#17322A] flex items-center gap-1.5 btn-press shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#B88A2E]" /> Download PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-[#ECECEC] text-xs font-semibold text-[#111827] hover:bg-white flex items-center gap-1.5 btn-press shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={() => onClose()}
              className="p-1.5 text-[#6B7280] hover:text-[#111827] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div className="p-8 overflow-y-auto space-y-6 text-[#111827]">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-[#ECECEC] pb-6">
            <div>
              <h1 className="font-heading text-2xl font-black text-[#21453A] tracking-tight">
                NABIS FASHION
              </h1>
              <p className="text-xs text-[#6B7280] mt-0.5">Luxury Bengali Panjabi, Sarees & Designer Attire</p>
              <p className="text-xs text-[#6B7280]">support@nabisfashion.com • Banani, Dhaka</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-[#F0F4F2] text-[#21453A] text-xs font-bold rounded-lg mb-2 uppercase">
                {order.paymentStatus || "PAID VERIFIED"}
              </span>
              <p className="text-xs font-bold text-[#111827]">{invoiceNum}</p>
              <p className="text-xs text-[#6B7280]">Date: {currentDate}</p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#F7F8FA] p-4 rounded-xl border border-[#ECECEC] text-xs">
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                Billed Customer
              </p>
              <p className="font-bold text-[#111827]">{order.customerName || order.customer || order.user?.name || `Customer #${order.userId}`}</p>
              <p className="text-[#6B7280]">{order.email || order.user?.email || "customer@nabisfashion.com"}</p>
              <p className="text-[#6B7280] mt-1">Phone: <span className="font-semibold text-[#111827]">{order.phone || "N/A"}</span></p>
              <p className="text-[#6B7280]">Payment: <span className="font-bold text-[#21453A]">{order.paymentMethod || "STRIPE"}</span></p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                Shipping Address
              </p>
              <p className="font-semibold text-[#111827]">{order.address || "Main Street Address"}</p>
              <p className="text-[#6B7280]">{order.city || "Dhaka"} {order.postalCode || ""}, {order.country || "Bangladesh"}</p>
              {order.deliveryInstructions && (
                <p className="text-[11px] text-[#B88A2E] font-semibold mt-1">
                  Note: {order.deliveryInstructions}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#ECECEC] text-[10px] font-bold uppercase text-[#6B7280]">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5">Size / Color</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Price</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECEC]">
              {items.map((item, idx) => {
                const price = Number(item.price);
                const itemTotal = price * (item.quantity || 1);
                return (
                  <tr key={item.id || idx}>
                    <td className="py-3 font-semibold text-[#111827]">
                      {item.productTitle || item.productVariant?.product?.title || "Garment Item"}
                    </td>
                    <td className="py-3 text-[#6B7280]">
                      {item.size || item.productVariant?.size || "M"} &middot; {item.color || item.productVariant?.color || "Standard"}
                    </td>
                    <td className="py-3 text-center font-semibold">{item.quantity}</td>
                    <td className="py-3 text-right">£{price.toFixed(2)}</td>
                    <td className="py-3 text-right font-bold">£{itemTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Invoice Summary */}
          <div className="flex justify-end pt-4 border-t border-[#ECECEC]">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-[#6B7280]">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#111827]">£{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Promo Discount</span>
                  <span className="font-bold">-£{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6B7280]">
                <span>Delivery Fee</span>
                <span className="font-semibold text-[#111827]">
                  {deliveryFee === 0 ? "FREE" : `£${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#111827] pt-2 border-t border-[#ECECEC]">
                <span>Total Amount</span>
                <span className="text-[#21453A] font-black">£{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F7F8FA] border-t border-[#ECECEC] flex justify-between items-center text-xs">
          <span className="text-[#6B7280] flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> Verified by Nabis Fashion Billing
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-[#21453A] text-white font-semibold rounded-xl btn-press flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#B88A2E]" /> Download PDF Invoice
            </button>
            <button
              onClick={() => onClose()}
              className="px-4 py-2 bg-[#F7F8FA] border border-[#ECECEC] text-[#6B7280] font-semibold rounded-xl hover:bg-neutral-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
