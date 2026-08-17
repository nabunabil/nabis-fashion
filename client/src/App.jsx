import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ModalProvider } from "./context/ModalContext";
import { WishlistProvider } from "./context/WishlistContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutError from "./pages/CheckoutError";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCheck from "./components/AuthCheck";

// Admin Imports
import AdminGuard from "./components/AdminGuard";
import AdminLayout from "./layouts/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminSettings from "./pages/admin/AdminSettings";

import InfoPage from "./pages/InfoPage";

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ModalProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Main Website Layout (Includes Navbar & Footer) */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slugOrId" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />

                {/* Customer Care & Policy Pages */}
                <Route path="/contact-support" element={<InfoPage pageSlug="contact-support" />} />
                <Route path="/shipping-info" element={<InfoPage pageSlug="shipping-info" />} />
                <Route path="/returns-refunds" element={<InfoPage pageSlug="returns-refunds" />} />
                <Route path="/privacy-policy" element={<InfoPage pageSlug="privacy-policy" />} />
                <Route path="/terms-of-service" element={<InfoPage pageSlug="terms-of-service" />} />

                {/* Protected User Routes */}
                <Route path="/checkout" element={<AuthCheck><Checkout /></AuthCheck>} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/checkout/error" element={<CheckoutError />} />
                <Route path="/profile" element={<AuthCheck><Profile /></AuthCheck>} />
                <Route path="/login" element={<AuthCheck guestOnly><Login /></AuthCheck>} />
                <Route path="/register" element={<AuthCheck guestOnly><Register /></AuthCheck>} />
              </Route>

              {/* Protected Admin Routes (NO Navbar and NO Footer) */}
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/create" element={<AdminProductForm />} />
                <Route path="products/edit/:id" element={<AdminProductForm />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminUsers />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </ModalProvider>
    </Router>
  );
}

export default App;
