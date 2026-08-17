import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Lock, LogIn, UserPlus, X, Sparkles } from "lucide-react";

export default function AuthPromptModal({
  isOpen,
  onClose,
  title = "Save to Your Wishlist",
  message = "Please sign in or create a Nabis Fashion account to save your favorite luxury items across device sessions.",
  productTitle,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    const currentPath = window.location.pathname + window.location.search;
    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleRegister = () => {
    onClose();
    const currentPath = window.location.pathname + window.location.search;
    navigate(`/register?redirect=${encodeURIComponent(currentPath)}`);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111827] text-white rounded-2xl max-w-md w-full border border-[#B88A2E]/40 shadow-2xl overflow-hidden relative p-6 transform transition-all scale-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative Brand Badge */}
        <div className="flex items-center space-x-2 text-[#B88A2E] text-xs font-bold font-heading uppercase tracking-widest mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Member Exclusive Feature</span>
        </div>

        {/* Main Icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#21453A] to-[#17322A] border border-[#B88A2E]/40 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#21453A]/30">
          <Heart className="w-8 h-8 text-[#B88A2E] animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#B88A2E] text-[#111827] flex items-center justify-center border-2 border-[#111827]">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Text Area */}
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-lg font-bold text-white font-heading">
            {title}
          </h3>
          {productTitle && (
            <p className="text-xs font-bold text-[#B88A2E] font-heading uppercase tracking-wide">
              "{productTitle}"
            </p>
          )}
          <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#21453A] to-[#17322A] border border-[#B88A2E]/40 text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#21453A]/20 transition-all flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4 text-[#B88A2E]" />
            <span>Sign In to Account</span>
          </button>

          <button
            onClick={handleRegister}
            className="w-full py-3 px-4 rounded-xl bg-[#B88A2E] hover:bg-[#997022] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#B88A2E]/20 transition-all flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-xs font-semibold text-gray-400 hover:text-gray-200 transition-colors text-center"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
