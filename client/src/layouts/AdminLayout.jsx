import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  TicketPercent,
  Star,
  Megaphone,
  BarChart3,
  LineChart,
  UserCog,
  Settings2,
  FileText,
  LogOut,
  Search,
  Bell,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { authClient } from "../lib/auth-client";
import AdminCommandPalette from "../components/admin/AdminCommandPalette";
import AdminNotificationDrawer from "../components/admin/AdminNotificationDrawer";

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await authClient.signOut();
    if (!error) navigate("/login", { replace: true });
  };

  const navItems = [
    { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
    { label: "Products", to: "/admin/products", icon: Package },
    { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
    { label: "Customers", to: "/admin/customers", icon: Users },
    { label: "Categories", to: "/admin/categories", icon: FolderTree },
    { label: "Coupons", to: "/admin/coupons", icon: TicketPercent },
    { label: "Reviews", to: "/admin/reviews", icon: Star },
    { label: "Staff", to: "/admin/staff", icon: UserCog },
    { label: "Settings", to: "/admin/settings", icon: Settings2 },
  ];

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const adminName = session?.user?.name || "Alex Vance";

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#ECECEC] sticky top-0 z-30 h-16 px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile Menu Toggle & Greetings */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 text-[#6B7280] hover:text-[#111827] rounded-xl hover:bg-[#F7F8FA] transition-colors"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div>
            <h1 className="text-sm font-bold text-[#111827] flex items-center gap-2">
              Welcome back, <span className="font-extrabold text-[#21453A]">{adminName}</span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF6EE] text-[#B88A2E] border border-[#B88A2E]/20">
                PRO ADMIN
              </span>
            </h1>
            <p className="text-[11px] text-[#6B7280] font-medium hidden sm:block">
              {currentDateFormatted}
            </p>
          </div>
        </div>

        {/* Center: Quick Command Palette Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl text-xs text-[#6B7280] hover:border-[#21453A]/30 transition-all btn-press"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#6B7280]" />
              <span>Search orders, products, customers...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white rounded border border-[#ECECEC] text-[#6B7280] shadow-2xs">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & Profile Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="md:hidden p-2 text-[#6B7280] hover:text-[#111827] rounded-xl hover:bg-[#F7F8FA]"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2.5 text-[#6B7280] hover:text-[#111827] rounded-xl hover:bg-[#F7F8FA] transition-colors btn-press"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#22C55E] rounded-full ring-2 ring-white"></span>
          </button>

          {/* Messages Button */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2.5 text-[#6B7280] hover:text-[#111827] rounded-xl hover:bg-[#F7F8FA] transition-colors btn-press hidden sm:flex"
            title="Messages"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#3B82F6] rounded-full ring-2 ring-white"></span>
          </button>

          {/* Storefront Link */}
          <Link
            to="/"
            target="_blank"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ECECEC] text-xs font-semibold text-[#111827] hover:bg-[#F7F8FA] transition-colors btn-press shadow-2xs"
          >
            <span>Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F7F8FA] transition-colors btn-press"
            >
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={adminName}
                  className="w-8 h-8 rounded-xl object-cover border border-[#ECECEC] shadow-2xs"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-[#21453A] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {adminName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <ChevronDown className="w-4 h-4 text-[#6B7280] hidden sm:block" />
            </button>

            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white border border-[#ECECEC] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in duration-150"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="p-3 border-b border-[#ECECEC] mb-1">
                  <p className="text-xs font-bold text-[#111827]">{adminName}</p>
                  <p className="text-[11px] text-[#6B7280] truncate">{session?.user?.email || "admin@nabisfashion.com"}</p>
                </div>
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#111827] hover:bg-[#F7F8FA] rounded-xl transition-colors"
                >
                  <Settings2 className="w-4 h-4 text-[#6B7280]" /> Store Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#EF4444] hover:bg-red-50 rounded-xl transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar - Desktop (Width: 280px, White bg, Border right #ECECEC) */}
        <aside className="hidden lg:flex flex-col w-[280px] bg-white border-r border-[#ECECEC] flex-shrink-0 min-h-[calc(100vh-4rem)] p-6 space-y-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Brand Logo & Header */}
          <div className="px-2 pt-1 pb-3 border-b border-[#ECECEC] flex items-center justify-between">
            <div>
              <span className="font-heading text-lg font-black text-[#21453A] tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-[#B88A2E]" /> NABIS FASHION
              </span>
              <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase tracking-widest text-[#6B7280] bg-[#F7F8FA] px-2 py-0.5 rounded border border-[#ECECEC]">
                ADMIN PANEL
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] px-3 mb-2">
              Management Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 btn-press ${
                      isActive
                        ? "bg-[#21453A] text-white shadow-sm"
                        : "text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]"
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Profile Card */}
          <div className="pt-4 border-t border-[#ECECEC] bg-white">
            <div className="p-3 bg-[#F7F8FA] rounded-2xl border border-[#ECECEC] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={adminName}
                      className="w-9 h-9 rounded-xl object-cover border border-[#ECECEC]"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-[#21453A] text-white flex items-center justify-center font-bold text-xs">
                      {adminName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {/* Online Status Indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full ring-2 ring-white"></span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#111827] truncate">{adminName}</p>
                  <p className="text-[10px] text-[#6B7280] font-medium truncate">Head of Operations</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-white rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Over Sidebar */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
            <div className="w-[280px] bg-white h-full p-6 flex flex-col justify-between shadow-2xl border-r border-[#ECECEC] overflow-y-auto">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[#ECECEC]">
                  <div>
                    <span className="font-heading text-base font-black text-[#21453A]">NABIS FASHION</span>
                    <span className="block text-[9px] font-bold text-[#6B7280] uppercase">ADMIN PANEL</span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 text-[#6B7280] hover:text-[#111827]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-[#21453A] text-white shadow-sm"
                              : "text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]"
                          }`
                        }
                      >
                        <Icon className="w-4.5 h-4.5" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Profile Card */}
              <div className="pt-4 border-t border-[#ECECEC]">
                <div className="p-3 bg-[#F7F8FA] rounded-2xl border border-[#ECECEC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#21453A] text-white flex items-center justify-center font-bold text-xs">
                      {adminName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111827]">{adminName}</p>
                      <p className="text-[10px] text-[#6B7280]">Head of Operations</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="text-[#EF4444]">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Container (Max width: 1440px, Padding: 32px, Gap: 24px) */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1440px] mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <AdminCommandPalette isOpen={commandPaletteOpen} onClose={setCommandPaletteOpen} />

      {/* Global Notification Drawer */}
      <AdminNotificationDrawer isOpen={notificationsOpen} onClose={setNotificationsOpen} />
    </div>
  );
}
