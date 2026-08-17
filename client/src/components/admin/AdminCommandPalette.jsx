import {
  ArrowRight,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  TicketPercent,
  Users,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminCommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose ? onClose(!isOpen) : null;
      }
      if (e.key === "Escape" && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: "Dashboard Overview", subtitle: "Main analytics & stats", icon: Search, path: "/admin" },
    { title: "Manage Products", subtitle: "Catalog, stock & pricing", icon: Package, path: "/admin/products" },
    { title: "Customer Orders", subtitle: "Fulfillment & status updates", icon: ShoppingBag, path: "/admin/orders" },
    { title: "Customer Directory", subtitle: "Accounts & purchase history", icon: Users, path: "/admin/customers" },
    { title: "Categories & Collections", subtitle: "Product groupings", icon: Tag, path: "/admin/categories" },
    { title: "Discount Coupons", subtitle: "Promo codes & campaigns", icon: TicketPercent, path: "/admin/coupons" },
    { title: "Product Reviews", subtitle: "Customer ratings & feedback", icon: Star, path: "/admin/reviews" },
    { title: "Store Settings", subtitle: "Shipping, taxes & profile", icon: Settings, path: "/admin/settings" },
  ];

  const filteredLinks = quickLinks.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-[#ECECEC] shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-[#ECECEC] gap-3">
          <Search className="w-5 h-5 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search orders, products, customers, pages... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-sm font-medium text-[#111827] placeholder-[#6B7280] bg-transparent outline-none"
          />
          <button
            onClick={() => onClose(false)}
            className="p-1 text-[#6B7280] hover:text-[#111827] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredLinks.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#6B7280]">
              No results found for "<span className="font-semibold text-[#111827]">{query}</span>"
            </div>
          ) : (
            filteredLinks.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F7F8FA] text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F0F4F2] text-[#21453A] flex items-center justify-center group-hover:bg-[#21453A] group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#111827] group-hover:text-[#21453A]">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#6B7280]">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#F7F8FA] border-t border-[#ECECEC] flex justify-between items-center text-[11px] text-[#6B7280]">
          <span>Tip: Press Esc or click outside to dismiss</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#ECECEC]">ESC</span>
        </div>
      </div>
    </div>
  );
}
