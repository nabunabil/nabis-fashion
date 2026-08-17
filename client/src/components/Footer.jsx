import {
  LuFacebook,
  LuInstagram,
  LuRefreshCw,
  LuShieldCheck,
  LuTruck,
  LuTwitter,
} from "react-icons/lu";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-neutral-950 text-white pt-16 pb-8 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badges/Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-neutral-800 mb-12">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-neutral-900 rounded-full text-accent">
              <LuTruck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase">
                Free Shipping
              </h4>
              <p className="text-xs text-neutral-400">
                On all orders above £50
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-neutral-900 rounded-full text-accent">
              <LuRefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase">
                Easy 30-Day Returns
              </h4>
              <p className="text-xs text-neutral-400">
                Hassle-free sizing exchanges
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-neutral-900 rounded-full text-accent">
              <LuShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase">
                Secure Payment
              </h4>
              <p className="text-xs text-neutral-400">
                SSL encrypted Stripe checkout
              </p>
            </div>
          </div>
        </div>

        {/* Footer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-widest">
              NABIS <span className="text-accent font-light">FASHION</span>
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Curated premium apparel designed for comfort, style, and everyday
              confidence. Find your unique look with us.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="#"
                className="text-neutral-400 hover:text-accent transition-colors"
              >
                <LuFacebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-accent transition-colors"
              >
                <LuInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-accent transition-colors"
              >
                <LuTwitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-sm tracking-widest uppercase mb-4 text-accent">
              Shop Catalog
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link
                  to="/products"
                  className="hover:text-white transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=men"
                  className="hover:text-white transition-colors"
                >
                  Men's Apparel
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=women"
                  className="hover:text-white transition-colors"
                >
                  Women's Outfits
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=accessories"
                  className="hover:text-white transition-colors"
                >
                  Fashion Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer services */}
          <div>
            <h4 className="font-bold text-sm tracking-widest uppercase mb-4 text-accent">
              Help & Support
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link
                  to="/shipping-info"
                  className="hover:text-white transition-colors"
                >
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link
                  to="/returns-refunds"
                  className="hover:text-white transition-colors"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to="/contact-support"
                  className="hover:text-white transition-colors"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-bold text-sm tracking-widest uppercase mb-4 text-accent">
              Contact Details
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>42 Baker Street Marylebone,</li>
              <li>London, United Kingdom</li>
              <li className="pt-2">Email: info@nabisfashion.com</li>
              <li>Phone: +44 123 456789</li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-400">
          <p>© 2026 NABIS FASHION. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link
              to="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
