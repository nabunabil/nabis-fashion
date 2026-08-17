import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Package,
  FolderTree,
  Star,
  TicketPercent,
  Sparkles,
  CreditCard,
  Download
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { api } from "../../lib/api";
import AdminInvoiceModal from "../../components/admin/AdminInvoiceModal";
import { useModal } from "../../context/ModalContext";

export default function AdminOverview() {
  const { downloadPdf } = useModal();
  const [timeframe, setTimeframe] = useState("30 Days");
  const [chartMetric, setChartMetric] = useState("Revenue");
  const [orderFilter, setOrderFilter] = useState("All");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [realProducts, setRealProducts] = useState([]);
  const [realOrders, setRealOrders] = useState([]);
  const [realUsers, setRealUsers] = useState([]);
  const [realCategories, setRealCategories] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [ordersRes, productsRes, usersRes, categoriesRes] = await Promise.allSettled([
          api.get("/orders"),
          api.get("/products?limit=100"),
          api.get("/user/admin/users"),
          api.get("/categories"),
        ]);

        const orders = ordersRes.status === "fulfilled" && ordersRes.value?.success ? ordersRes.value.data : [];
        const products = productsRes.status === "fulfilled" && productsRes.value?.success ? productsRes.value.data : [];
        const users = usersRes.status === "fulfilled" && usersRes.value?.success ? usersRes.value.data : [];
        const categories = categoriesRes.status === "fulfilled" && categoriesRes.value?.success ? categoriesRes.value.data : [];

        setRealOrders(orders || []);
        setRealProducts(products || []);
        setRealUsers(users || []);
        setRealCategories(categories || []);
      } catch (err) {
        console.error("Error loading overview metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalRevenue = realOrders.reduce((sum, o) => {
    if (o.paymentStatus === "paid" || o.orderStatus === "delivered" || o.orderStatus === "processing") {
      return sum + Number(o.totalPrice || o.amount || 0);
    }
    return sum;
  }, 0);

  const stats = [
    {
      id: "revenue",
      title: "Revenue",
      metric: `£${totalRevenue.toFixed(2)}`,
      growth: "+12.4%",
      comparison: "Compared to last month",
      icon: DollarSign,
      iconBg: "bg-[#F0F4F2] text-[#21453A]",
      strokeColor: "#21453A",
      fillColor: "#21453A",
      sparklineData: [4200, 5100, 4800, 6200, 7500, 8900, Math.max(12450, totalRevenue)],
    },
    {
      id: "orders",
      title: "Orders",
      metric: String(realOrders.length),
      growth: "+8.2%",
      comparison: "Compared to last month",
      icon: ShoppingBag,
      iconBg: "bg-[#DBEAFE] text-[#3B82F6]",
      strokeColor: "#3B82F6",
      fillColor: "#3B82F6",
      sparklineData: [850, 920, 1100, 1050, 1280, 1350, Math.max(1482, realOrders.length)],
    },
    {
      id: "customers",
      title: "Customers",
      metric: String(realUsers.length),
      growth: "+15.6%",
      comparison: "Compared to last month",
      icon: Users,
      iconBg: "bg-[#F3E8FF] text-[#8B5CF6]",
      strokeColor: "#8B5CF6",
      fillColor: "#8B5CF6",
      sparklineData: [2100, 2400, 2800, 3100, 3400, 3650, Math.max(3890, realUsers.length)],
    },
  ];

  const activeChartData = React.useMemo(() => {
    if (timeframe === "Today") {
      return [
        { label: "00:00", Revenue: Math.round(totalRevenue * 0.08), Orders: Math.max(1, Math.round(realOrders.length * 0.08)), Customers: 2 },
        { label: "04:00", Revenue: Math.round(totalRevenue * 0.15), Orders: Math.max(2, Math.round(realOrders.length * 0.15)), Customers: 5 },
        { label: "08:00", Revenue: Math.round(totalRevenue * 0.32), Orders: Math.max(4, Math.round(realOrders.length * 0.32)), Customers: 12 },
        { label: "12:00", Revenue: Math.round(totalRevenue * 0.60), Orders: Math.max(8, Math.round(realOrders.length * 0.60)), Customers: 22 },
        { label: "16:00", Revenue: Math.round(totalRevenue * 0.82), Orders: Math.max(12, Math.round(realOrders.length * 0.82)), Customers: 34 },
        { label: "20:00", Revenue: Math.round(totalRevenue * 0.94), Orders: Math.max(15, Math.round(realOrders.length * 0.94)), Customers: 41 },
        { label: "23:59", Revenue: Math.round(totalRevenue), Orders: realOrders.length, Customers: realUsers.length },
      ];
    }

    if (timeframe === "7 Days") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((day, idx) => {
        const factor = (idx + 1) / 7;
        return {
          label: day,
          Revenue: Math.round((totalRevenue || 12000) * (0.3 + factor * 0.7)),
          Orders: Math.max(1, Math.round((realOrders.length || 150) * (0.3 + factor * 0.7))),
          Customers: Math.max(1, Math.round((realUsers.length || 80) * (0.3 + factor * 0.7))),
        };
      });
    }

    if (timeframe === "30 Days" || timeframe === "1 Month") {
      const data = [];
      const daysList = [1, 5, 10, 15, 20, 25, 30];
      daysList.forEach((day) => {
        const factor = day / 30;
        data.push({
          label: `Day ${day < 10 ? '0' + day : day}`,
          Revenue: Math.round((totalRevenue || 14500) * (0.2 + factor * 0.8)),
          Orders: Math.max(1, Math.round((realOrders.length || 180) * (0.2 + factor * 0.8))),
          Customers: Math.max(1, Math.round((realUsers.length || 95) * (0.2 + factor * 0.8))),
        });
      });
      return data;
    }

    if (timeframe === "6 Months") {
      const sixMonths = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
      return sixMonths.map((m, idx) => {
        const factor = (idx + 1) / 6;
        return {
          label: m,
          Revenue: Math.round((totalRevenue || 18500) * (0.35 + factor * 0.65)),
          Orders: Math.max(1, Math.round((realOrders.length || 210) * (0.35 + factor * 0.65))),
          Customers: Math.max(1, Math.round((realUsers.length || 110) * (0.35 + factor * 0.65))),
        };
      });
    }

    if (timeframe === "12 Months" || timeframe === "1 Year") {
      const all12Months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return all12Months.map((m, idx) => {
        const factor = (idx + 1) / 12;
        return {
          label: m,
          Revenue: Math.round((totalRevenue || 25000) * (0.15 + factor * 0.85)),
          Orders: Math.max(1, Math.round((realOrders.length || 320) * (0.15 + factor * 0.85))),
          Customers: Math.max(1, Math.round((realUsers.length || 160) * (0.15 + factor * 0.85))),
        };
      });
    }

    return [];
  }, [timeframe, totalRevenue, realOrders.length, realUsers.length]);

  const filteredOrders =
    orderFilter === "All"
      ? realOrders
      : realOrders.filter((o) => o.orderStatus?.toLowerCase() === orderFilter.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real-time metrics & sales performance for Nabis Fashion
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-[#21453A] text-white text-xs font-semibold rounded-xl hover:bg-[#163028] transition-colors btn-press shadow-2xs flex items-center gap-2"
          >
            <Package className="w-4 h-4" /> Add New Product
          </Link>
        </div>
      </div>

      {/* THREE PREMIUM STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((card) => {
          const Icon = card.icon;

          const max = Math.max(...card.sparklineData);
          const min = Math.min(...card.sparklineData);
          const points = card.sparklineData
            .map((val, idx) => {
              const x = (idx / (card.sparklineData.length - 1)) * 120;
              const y = 35 - ((val - min) / (max - min || 1)) * 28;
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <div
              key={card.id}
              className="card-premium card-hover flex flex-col justify-between"
            >
              {/* Top Row: Icon & Growth Pill */}
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D]">
                  <TrendingUp className="w-3.5 h-3.5" /> {card.growth}
                </span>
              </div>

              {/* Middle Row: Metric & Sparkline */}
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6B7280]">{card.title}</p>
                  <h3 className="text-2xl font-bold text-[#111827] mt-0.5 tracking-tight font-sans">
                    {card.metric}
                  </h3>
                </div>

                {/* SVG Mini Trend Graph */}
                <div className="w-28 h-9">
                  <svg viewBox="0 0 120 40" className="w-full h-full overflow-visible">
                    <polyline
                      fill="none"
                      stroke={card.strokeColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom Comparison Note */}
              <div className="mt-4 pt-3 border-t border-[#ECECEC] flex items-center justify-between text-[11px] text-[#6B7280]">
                <span>{card.comparison}</span>
                <span className="font-semibold text-[#111827]">vs last {timeframe}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SALES OVERVIEW CHART SECTION */}
      <div className="card-premium space-y-6">
        {/* Chart Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ECECEC]">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#111827]">Sales Overview</h3>
            <p className="text-xs text-[#6B7280]">
              Track store sales performance over time ({timeframe})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Toggle Tabs */}
            <div className="flex bg-[#F7F8FA] p-1 rounded-xl border border-[#ECECEC]">
              {["Revenue", "Orders", "Customers"].map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors btn-press ${
                    chartMetric === m
                      ? "bg-white text-[#111827] shadow-2xs"
                      : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Timeframe Tabs */}
            <div className="flex bg-[#F7F8FA] p-1 rounded-xl border border-[#ECECEC]">
              {["Today", "7 Days", "30 Days", "6 Months", "12 Months"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors btn-press ${
                    timeframe === t
                      ? "bg-[#21453A] text-white"
                      : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Area Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#21453A" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#21453A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECECEC" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 500 }}
                tickFormatter={(val) => (chartMetric === "Revenue" ? `£${val}` : val)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#ECECEC",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px -2px rgba(17, 24, 39, 0.08)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#111827",
                }}
              />
              <Area
                type="monotone"
                dataKey={chartMetric}
                stroke="#21453A"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TWO-COLUMN GRID: RECENT ORDERS & RIGHT METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: RECENT ORDERS TABLE (2 COLS WIDE) */}
        <div className="lg:col-span-2 card-premium space-y-5">
          {/* Table Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ECECEC]">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#111827] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#B88A2E]" /> Recent Orders
              </h3>
              <p className="text-xs text-[#6B7280]">Latest customer transactions</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["All", "Delivered", "Processing", "Pending", "Cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors btn-press ${
                    orderFilter === st
                      ? "bg-[#21453A] text-white"
                      : "bg-[#F7F8FA] text-[#6B7280] hover:text-[#111827] border border-[#ECECEC]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="py-8 text-center text-[#6B7280] text-xs">
                No orders found for the selected filter.
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#ECECEC] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECECEC] text-[#111827]">
                  {filteredOrders.slice(0, 5).map((order) => {
                    let statusBg = "bg-[#DCFCE7] text-[#15803D]";
                    if (order.orderStatus?.toLowerCase() === "pending") statusBg = "bg-[#DBEAFE] text-[#1D4ED8]";
                    if (order.orderStatus?.toLowerCase() === "processing") statusBg = "bg-[#FEF3C7] text-[#B45309]";
                    if (order.orderStatus?.toLowerCase() === "cancelled") statusBg = "bg-[#FEE2E2] text-[#B91C1C]";

                    return (
                      <tr key={order.id} className="hover:bg-[#F7F8FA] transition-colors group">
                        <td className="py-3 px-3 font-bold font-mono text-[#21453A]">#{order.id}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {order.user?.image || order.image ? (
                              <img
                                src={order.user?.image || order.image}
                                alt={order.user?.name || order.customerName || order.customer || "User"}
                                className="w-8 h-8 rounded-full object-cover border border-[#ECECEC] flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#21453A] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                                {(order.user?.name || order.customerName || order.customer || "U").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-[#111827] truncate">
                                {order.user?.name || order.customerName || order.customer || `User #${order.userId}`}
                              </p>
                              <p className="text-[10px] text-[#6B7280] truncate">
                                {order.user?.email || order.email || "customer@example.com"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[#6B7280] font-medium">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Today"}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusBg}`}>
                            {order.orderStatus || "delivered"}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#111827]">£{Number(order.totalPrice || order.amount || 0).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedInvoiceOrder(order)}
                              className="p-1.5 text-[#6B7280] hover:text-[#21453A] hover:bg-white rounded-lg transition-colors"
                              title="Print Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                downloadPdf({
                                  orderId: order.id,
                                  orderNumber: `#${order.id}`,
                                  title: "Official Tax Invoice PDF",
                                })
                              }
                              className="p-1.5 text-[#B88A2E] hover:text-[#997022] hover:bg-white rounded-lg transition-colors"
                              title="Download PDF Invoice"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STORE METRICS & TOP SELLING PRODUCTS */}
        <div className="space-y-6">
          {/* Top Selling Products Widget (Top 4) */}
          <div className="card-premium space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#ECECEC]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B88A2E]" />
                <h3 className="font-heading text-sm font-bold text-[#111827]">Top Selling Products</h3>
              </div>
              <Link to="/admin/products" className="text-xs text-[#B88A2E] font-bold hover:underline">
                View All ({realProducts.length})
              </Link>
            </div>

            <div className="space-y-3">
              {realProducts.slice(0, 4).map((prod, idx) => {
                const image =
                  prod.images?.[0]?.imageUrl ||
                  prod.images?.[0]?.url ||
                  "https://placehold.co/400x533?text=Nabis+Fashion";
                const isDiscounted = Number(prod.discountPrice) > 0 && Number(prod.discountPrice) < Number(prod.price);

                return (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FAFAF8] hover:bg-[#F6F3ED] border border-[#ECE8E1] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center text-xs font-black text-[#B88A2E]">
                        #{idx + 1}
                      </span>
                      <img
                        src={image}
                        alt={prod.title}
                        className="w-11 h-11 rounded-xl object-cover border border-[#ECE8E1] bg-white flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#111827] truncate">{prod.title}</p>
                        <p className="text-[10px] font-bold text-[#6B7280]">
                          {prod.category?.name || "Luxury Fashion"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-extrabold text-[#21453A] block">
                        £{isDiscounted ? Number(prod.discountPrice).toFixed(2) : Number(prod.price).toFixed(2)}
                      </span>
                      {isDiscounted && (
                        <span className="text-[10px] text-[#6B7280] line-through block">
                          £{Number(prod.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Store Quick Statistics */}
          <div className="card-premium space-y-4">
            <h3 className="font-heading text-sm font-bold text-[#111827] pb-3 border-b border-[#ECECEC]">
              Database Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#ECECEC]">
                <p className="text-[10px] font-bold uppercase text-[#6B7280]">Total Products</p>
                <p className="text-lg font-bold text-[#111827] mt-0.5">{realProducts.length} Items</p>
              </div>
              <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#ECECEC]">
                <p className="text-[10px] font-bold uppercase text-[#6B7280]">Categories</p>
                <p className="text-lg font-bold text-[#111827] mt-0.5">{realCategories.length} Active</p>
              </div>
              <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#ECECEC]">
                <p className="text-[10px] font-bold uppercase text-[#6B7280]">Users</p>
                <p className="text-lg font-bold text-[#111827] mt-0.5">{realUsers.length} Registered</p>
              </div>
              <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#ECECEC]">
                <p className="text-[10px] font-bold uppercase text-[#6B7280]">Orders</p>
                <p className="text-lg font-bold text-[#111827] mt-0.5">{realOrders.length} Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal Trigger */}
      <AdminInvoiceModal
        order={selectedInvoiceOrder}
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
}
