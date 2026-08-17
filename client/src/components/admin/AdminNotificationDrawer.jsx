import React, { useState, useEffect } from "react";
import { Bell, ShoppingBag, Check, X, Info } from "lucide-react";
import { api } from "../../lib/api";

export default function AdminNotificationDrawer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAdminNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      if (res && res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      console.warn("Error fetching admin notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminNotifications();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      await fetchAdminNotifications();
    } catch (e) {
      console.error("Error marking all notifications read:", e);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      await fetchAdminNotifications();
    } catch (e) {
      console.error("Error marking notification read:", e);
    }
  };

  if (!isOpen) return null;

  const filtered = activeTab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#ECECEC] flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#ECECEC] flex justify-between items-center bg-[#FFFFFF]">
          <div>
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#21453A]" /> Real-Time Notifications
            </h2>
            <p className="text-xs text-[#6B7280]">System alerts, order updates & admin activity</p>
          </div>
          <button
            onClick={() => onClose(false)}
            className="p-2 text-[#6B7280] hover:text-[#111827] rounded-xl hover:bg-[#F7F8FA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 bg-[#F7F8FA] border-b border-[#ECECEC] flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "all" ? "bg-[#21453A] text-white shadow-2xs" : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              All Activity ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "unread" ? "bg-[#21453A] text-white shadow-2xs" : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-[#21453A] hover:underline flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Read All
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-[#21453A]"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280] space-y-2">
              <Bell className="w-10 h-10 mx-auto text-[#ECECEC]" />
              <p className="text-xs font-bold text-[#111827]">No notifications available</p>
              <p className="text-[11px] text-[#6B7280]">Store & customer activities will populate here.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.isRead && handleMarkRead(item.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                  !item.isRead ? "bg-[#FAFAF8] border-[#21453A] shadow-2xs" : "bg-white border-[#ECECEC] opacity-85"
                }`}
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${!item.isRead ? "bg-[#21453A] text-white" : "bg-[#F6F3ED] text-[#21453A]"}`}>
                  {item.type === "ORDER_STATUS" ? (
                    <ShoppingBag className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#111827]">{item.title}</h4>
                    <span className="text-[10px] text-[#6B7280] font-medium">
                      {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{item.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#ECECEC] bg-[#FFFFFF] flex justify-between items-center text-xs">
          <span className="text-[11px] text-[#6B7280]">NABIS Real-Time System Bus</span>
          <button onClick={() => onClose(false)} className="text-[#6B7280] font-bold hover:underline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
