import React from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export function AlertModal({ isOpen, onClose, title, message, type = "info" }) {
  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-400" />,
      bgIcon: "bg-emerald-500/10 border-emerald-500/30",
      btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
      defaultTitle: "Success"
    },
    error: {
      icon: <XCircle className="w-8 h-8 text-rose-400" />,
      bgIcon: "bg-rose-500/10 border-rose-500/30",
      btnBg: "bg-rose-600 hover:bg-rose-700 text-white",
      defaultTitle: "Error"
    },
    warning: {
      icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
      bgIcon: "bg-amber-500/10 border-amber-500/30",
      btnBg: "bg-[#B88A2E] hover:bg-[#997022] text-white",
      defaultTitle: "Warning"
    },
    info: {
      icon: <Info className="w-8 h-8 text-sky-400" />,
      bgIcon: "bg-sky-500/10 border-sky-500/30",
      btnBg: "bg-sky-600 hover:bg-sky-700 text-white",
      defaultTitle: "Notice"
    }
  };

  const currentType = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111827] text-white rounded-2xl max-w-sm w-full border border-gray-800 shadow-2xl overflow-hidden relative p-6 text-center transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`w-14 h-14 rounded-full border ${currentType.bgIcon} flex items-center justify-center mx-auto mb-4`}>
          {currentType.icon}
        </div>

        <h3 className="text-base font-bold text-white font-heading mb-2">
          {title || currentType.defaultTitle}
        </h3>

        <p className="text-xs text-gray-300 mb-6 leading-relaxed">
          {message}
        </p>

        <button
          onClick={onClose}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md ${currentType.btnBg}`}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111827] text-white rounded-2xl max-w-sm w-full border border-gray-800 shadow-2xl overflow-hidden relative p-6 text-center transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`w-14 h-14 rounded-full border ${isDanger ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-[#B88A2E]/10 border-[#B88A2E]/30 text-[#B88A2E]"} flex items-center justify-center mx-auto mb-4`}>
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-white font-heading mb-2">
          {title || "Are you sure?"}
        </h3>

        <p className="text-xs text-gray-300 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-800 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-gradient-to-r from-[#B88A2E] to-[#997022] text-white"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
