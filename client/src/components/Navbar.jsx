import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LuShoppingBag, LuUser, LuSearch, LuMenu, LuX, LuLogOut, LuPackage, LuShieldCheck, LuHeart, LuBell } from "react-icons/lu";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { authClient } from "../lib/auth-client";
import { api } from "../lib/api";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { cartCount } = useCart();
  const { count: wishlistCount, addToWishlist } = useWishlist();
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    async function checkNotifications() {
      if (session?.user?.id) {
        try {
          const res = await api.get("/notifications");
          if (res && res.success) {
            setUnreadNotificationsCount(res.unreadCount || 0);
          }
        } catch (e) {
          // ignore
        }
      }
    }
    checkNotifications();
  }, [session?.user?.id, location]);

  const isAdmin = session?.user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  // 300ms Debounced search navigation
  useEffect(() => {
    if (!searchOpen) return;
    const query = searchQuery.trim();
    if (!query) return;

    const timer = setTimeout(() => {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchOpen, navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await authClient.signOut();
    if (!error) navigate("/login", { replace: true });
  };

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop All", to: "/products" },
    { label: "Men", to: "/products?category=men" },
    { label: "Women", to: "/products?category=women" },
    { label: "Accessories", to: "/products?category=accessories" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-neutral-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-xl sm:text-2xl font-black tracking-widest text-primary flex items-center gap-1 hover:text-accent transition-colors"
            >
              <span>NABIS</span>
              <span className="text-accent font-light">FASHION</span>
            </Link>
          </div>

          {/* Desktop Navigation Links (Visible on lg screens 1024px+) */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-semibold tracking-wide text-neutral-700 hover:text-accent transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons (Visible on lg screens 1024px+) */}
          <div className="hidden lg:flex items-center space-x-5 xl:space-x-6">
            {/* Search Icon / Input */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <div className="relative flex items-center w-48 xl:w-64 bg-neutral-100 border border-neutral-200 rounded-full px-3 py-1.5 focus-within:border-[#21453A] focus-within:ring-1 focus-within:ring-[#21453A] transition-all shadow-2xs">
                    <button type="submit" className="text-neutral-400 hover:text-[#21453A] mr-2 flex-shrink-0">
                      <LuSearch className="h-4 w-4" />
                    </button>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full bg-transparent text-neutral-800 text-xs focus:outline-none pr-1"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-neutral-400 hover:text-neutral-600 p-0.5 flex-shrink-0"
                        title="Clear"
                      >
                        <LuX className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="ml-2 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors flex-shrink-0"
                    title="Close"
                  >
                    <LuX className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-neutral-700 hover:text-accent transition-colors"
                >
                  <LuSearch className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Wishlist Icon */}
            {session ? (
              <Link to="/profile?tab=wishlist" className="relative text-neutral-700 hover:text-accent transition-colors" title="My Wishlist">
                <LuHeart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#B88A2E] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            ) : (
              <button
                onClick={() => addToWishlist(null)}
                className="relative text-neutral-700 hover:text-accent transition-colors focus:outline-none"
                title="Wishlist (Login Required)"
              >
                <LuHeart className="h-5 w-5" />
              </button>
            )}

            {/* Notifications Bell Icon */}
            {session && (
              <Link
                to={isAdmin ? "/admin" : "/profile?tab=notifications"}
                className="relative text-neutral-700 hover:text-accent transition-colors"
                title="Notification Center"
              >
                <LuBell className="h-5 w-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#D14343] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Icon */}
            <Link to="/cart" className="relative text-neutral-700 hover:text-accent transition-colors" title="Shopping Bag">
              <LuShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              {session ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 text-neutral-700 hover:text-accent transition-colors focus:outline-none"
                  >
                    <LuUser className="h-5 w-5" />
                    <span className="text-sm font-semibold max-w-[100px] truncate">
                      {session.user.name.split(" ")[0]}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white border border-neutral-100 rounded-lg shadow-xl py-1 z-50">
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-xs text-neutral-400">Signed in as</p>
                        <p className="text-sm font-bold text-neutral-800 truncate">{session.user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-accent transition-colors"
                      >
                        <LuPackage className="mr-2 h-4 w-4" /> My Profile & Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-purple-700 font-bold hover:bg-purple-50 transition-colors"
                        >
                          <LuShieldCheck className="mr-2 h-4 w-4 text-purple-600" /> Admin Control
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LuLogOut className="mr-2 h-4 w-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center text-sm font-bold text-neutral-700 hover:text-accent transition-colors"
                >
                  <LuUser className="h-5 w-5 mr-1" /> Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile & Tablet Controls (Visible on screens < 1024px) */}
          <div className="lg:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative text-neutral-700 hover:text-accent">
              <LuShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-700 hover:text-accent focus:outline-none p-1"
            >
              {isOpen ? <LuX className="h-6 w-6" /> : <LuMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-100 shadow-lg px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-neutral-100 text-neutral-800 text-sm px-4 py-2.5 rounded-full border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button type="submit" className="absolute right-3 top-3 text-neutral-400">
              <LuSearch className="h-4 w-4" />
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block px-3 py-2 rounded-md text-sm font-bold text-neutral-700 hover:bg-neutral-50 hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <hr className="border-neutral-100 my-2" />

          {/* Quick Help links in drawer */}
          <div className="grid grid-cols-2 gap-1 text-xs text-neutral-600">
            <Link to="/contact-support" className="px-3 py-1.5 hover:text-accent font-medium">
              Contact Support
            </Link>
            <Link to="/shipping-info" className="px-3 py-1.5 hover:text-accent font-medium">
              Shipping Info
            </Link>
            <Link to="/returns-refunds" className="px-3 py-1.5 hover:text-accent font-medium">
              Returns & Refunds
            </Link>
            <Link to="/privacy-policy" className="px-3 py-1.5 hover:text-accent font-medium">
              Privacy Policy
            </Link>
          </div>

          <hr className="border-neutral-100 my-2" />

          {session ? (
            <>
              <div className="px-3 py-2">
                <p className="text-xs text-neutral-400">Account</p>
                <p className="text-sm font-bold text-neutral-800">{session.user.name}</p>
              </div>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-sm font-bold text-neutral-700 hover:bg-neutral-50 hover:text-accent"
              >
                My Profile & Orders
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-md text-sm font-bold text-purple-700 hover:bg-purple-50"
                >
                  Admin Control Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-bold text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-sm font-bold text-neutral-700 hover:bg-neutral-50 hover:text-accent"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
