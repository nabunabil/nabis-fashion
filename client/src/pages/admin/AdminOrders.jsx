import { Download, FileText, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import AdminInvoiceModal from "../../components/admin/AdminInvoiceModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useModal } from "../../context/ModalContext";
import { api } from "../../lib/api";

export default function AdminOrders() {
  const { downloadPdf, showAlert } = useModal();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Pagination state (12 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("page", String(currentPage));
      query.set("limit", "12"); // 12 orders per page
      if (statusFilter !== "All") query.set("status", statusFilter);
      if (search.trim()) query.set("search", search.trim());

      const res = await api.get(`/orders?${query.toString()}`);
      if (res?.success && Array.isArray(res.data)) {
        setOrders(res.data);
        setTotalOrders(res.totalOrders || res.data.length);
        setTotalPages(res.totalPages || 1);
      } else {
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error loading orders from server:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter, search]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      let res;
      try {
        res = await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      } catch (err1) {
        res = await api.patch(`/orders/${orderId}/status`, { orderStatus: newStatus });
      }

      await loadOrders();

      showAlert({
        title: "Status Updated",
        message: `Order #${orderId} fulfillment status updated to '${newStatus.toUpperCase()}'.`,
        type: "success",
      });
    } catch (err) {
      console.error("Error updating order status:", err);
      showAlert({
        title: "Update Failed",
        message: err.message || "Failed to update order status.",
        type: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const custName = o.user?.name || o.customerName || o.customer || "";
    const custEmail = o.user?.email || o.email || "";
    const matchesSearch =
      String(o.id).toLowerCase().includes(search.toLowerCase()) ||
      custName.toLowerCase().includes(search.toLowerCase()) ||
      custEmail.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (o.orderStatus && o.orderStatus.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
            Order Fulfillment & Verification
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage order statuses, verify online payments, and issue official invoices
          </p>
        </div>
      </div>

      {/* Filter & Search Bar with Shadcn UI Select */}
      <div className="card-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl text-xs text-[#111827] placeholder-[#6B7280] outline-none focus:border-[#21453A]/40 transition-colors"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="w-52">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
            <SelectTrigger className="bg-[#F7F8FA] border-[#ECECEC] text-xs font-semibold text-[#111827] rounded-xl px-3 h-9">
              <SelectValue placeholder="Filter Status">
                <span className="font-semibold text-[#111827]">
                  {statusFilter === "All" ? "All Order Statuses" : statusFilter.toUpperCase()}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border-[#ECECEC] shadow-lg rounded-xl">
              <SelectItem value="All">All Order Statuses</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-premium space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#21453A]"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-[#6B7280]">
            <p className="text-sm font-semibold">No orders found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#ECECEC] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment Verification</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC] text-[#111827]">
                {filteredOrders.map((o) => {
                  const custName = o.user?.name || o.customerName || o.customer || `User #${o.userId || o.id}`;
                  const custEmail = o.user?.email || o.email || "client@nabisfashion.com";
                  const avatarUrl =
                    o.user?.image ||
                    o.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";

                  const currentStatus = (o.orderStatus || "confirmed").toLowerCase();

                  return (
                    <tr key={o.id} className="hover:bg-[#F7F8FA] transition-colors group">
                      {/* Order Ref */}
                      <td className="py-3.5 px-4 font-bold font-mono text-[#21453A]">
                        #{o.id}
                      </td>

                      {/* Customer Info with Photo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={avatarUrl}
                            alt={custName}
                            className="w-8 h-8 rounded-full object-cover border border-[#ECECEC] shadow-2xs"
                          />
                          <div>
                            <p className="font-semibold text-[#111827] leading-tight">
                              {custName}
                            </p>
                            <p className="text-[10px] text-[#6B7280]">
                              {custEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#6B7280]">
                        {new Date(o.createdAt || Date.now()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Payment Status Column */}
                      <td className="py-3.5 px-4">
                        {o.paymentStatus?.toLowerCase() === "due" || (o.paymentMethod?.toUpperCase() === "COD" && o.paymentStatus?.toLowerCase() !== "paid") ? (
                          <span className="inline-flex items-center gap-1 font-extrabold text-[#B88A2E] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#B88A2E]" />{" "}
                            PAYMENT DUE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-extrabold text-[#22C55E] bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full text-[10px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />{" "}
                            PAYMENT CONFIRMED
                          </span>
                        )}
                      </td>

                      {/* Fulfillment Status Column with Visible Select Text */}
                      <td className="py-3.5 px-4 w-40">
                        <Select
                          value={currentStatus}
                          onValueChange={(val) => handleUpdateStatus(o.id, val)}
                          disabled={updatingId === o.id}
                        >
                          <SelectTrigger className="h-8 w-36 text-xs font-bold border-[#ECECEC] bg-[#F7F8FA] hover:bg-white text-[#111827] rounded-xl px-3 flex items-center justify-between shadow-2xs">
                            <SelectValue placeholder="Status">
                              <span className="capitalize font-bold text-[#111827]">
                                {currentStatus}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white border-[#ECECEC] shadow-lg rounded-xl">
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-bold text-[#111827]">
                        £{Number(o.totalPrice || o.amount || 150).toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInvoice(o)}
                            className="px-2.5 py-1 bg-[#F7F8FA] border border-[#ECECEC] rounded-lg text-xs font-bold text-[#111827] hover:bg-[#21453A] hover:text-white transition-colors flex items-center gap-1"
                            title="View Order Details & Invoice"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#B88A2E]" />{" "}
                            Details
                          </button>

                          <button
                            onClick={() =>
                              downloadPdf({
                                orderId: o.id,
                                orderNumber: `#${o.id}`,
                                title: "Official Tax Invoice PDF",
                              })
                            }
                            className="p-1.5 bg-[#F7F8FA] border border-[#ECECEC] text-[#21453A] hover:bg-[#21453A] hover:text-white rounded-lg transition-colors inline-flex items-center justify-center"
                            title="Download PDF Invoice"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Bar (12 orders per page) */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#ECECEC] bg-[#FAFAF8] rounded-b-2xl">
            <span className="text-xs text-[#6B7280]">
              Showing Page <strong className="text-[#111827]">{currentPage}</strong> of{" "}
              <strong className="text-[#111827]">{totalPages}</strong> ({totalOrders} Total Orders)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-[#ECECEC] bg-white rounded-xl text-xs font-bold text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F8FA]"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    currentPage === pg
                      ? "bg-[#21453A] text-white shadow-sm font-black"
                      : "bg-white border border-[#ECECEC] text-[#111827] hover:border-[#21453A]"
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-[#ECECEC] bg-white rounded-xl text-xs font-bold text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F8FA]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      <AdminInvoiceModal
        order={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
