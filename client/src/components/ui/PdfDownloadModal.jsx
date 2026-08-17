import { AlertCircle, CheckCircle2, Download, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function PdfDownloadModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  customUrl,
  filename,
  title = "Official Tax Invoice PDF",
}) {
  const [status, setStatus] = useState("idle"); // 'idle' | 'connecting' | 'generating' | 'success' | 'error'
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    "Initializing PDF request...",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadedFilename, setDownloadedFilename] = useState("");

  const displayOrderNum = orderNumber || (orderId ? `#${orderId}` : "DOCUMENT");

  // Helper to generate filename with date & unique random suffix
  const getDynamicFilename = (orderRef, fallbackName) => {
    if (fallbackName && fallbackName.includes("_")) return fallbackName;
    const dateStr = new Date().toISOString().split("T")[0]; // e.g. 2026-07-26
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit unique id
    const cleanId = orderRef ? String(orderRef).replace(/^#/, "") : "document";
    return `invoice-#${cleanId}_${dateStr}_${randomSuffix}.pdf`;
  };

  const startDownload = async () => {
    setStatus("connecting");
    setProgress(20);
    setStatusMessage("Connecting to Nabis Fashton Tax Gateway...");
    setErrorMessage("");

    try {
      await new Promise((r) => setTimeout(r, 400));
      setProgress(50);
      setStatusMessage("Generating & signing official PDF document...");

      // Determine backend API origin
      const API_ORIGIN =
        import.meta.env.VITE_API_URL || "https://nabisfashion.vercel.app";
      const cleanOrigin = API_ORIGIN.replace(/\/$/, "");

      let fetchUrl = customUrl || `/api/invoice/${orderId || 1}/download`;
      if (!fetchUrl.startsWith("http")) {
        // If relative URL without origin, prepend backend origin to guarantee API routing
        if (!fetchUrl.startsWith("/api")) {
          fetchUrl = `/api${fetchUrl.startsWith("/") ? "" : "/"}${fetchUrl}`;
        }
        fetchUrl = `${cleanOrigin}${fetchUrl}`;
      }

      const response = await fetch(fetchUrl, {
        headers: {
          Accept: "application/pdf, application/json",
        },
      });

      if (!response.ok) {
        let errText = `Server error ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson?.message) errText = errJson.message;
        } catch (_) {}
        throw new Error(errText);
      }

      const contentType = response.headers.get("content-type") || "";
      if (
        contentType.includes("application/json") ||
        contentType.includes("text/html")
      ) {
        if (contentType.includes("text/html")) {
          throw new Error(
            "Server returned HTML page instead of PDF stream. Please verify backend API.",
          );
        }
        const errJson = await response.json();
        throw new Error(errJson.message || "Failed to generate PDF document.");
      }

      setProgress(80);
      setStatusMessage("Finalizing PDF & triggering auto-download...");

      const blob = await response.blob();

      // Determine final download filename (prefer Content-Disposition header if available)
      let finalFilename =
        filename || getDynamicFilename(orderId || displayOrderNum, filename);
      const disposition = response.headers.get("content-disposition");
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename=["']?([^"';]+)["']?/);
        if (match && match[1]) {
          finalFilename = match[1];
        }
      }
      setDownloadedFilename(finalFilename);

      await new Promise((r) => setTimeout(r, 300));

      // Trigger direct automated browser file download
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Revoke blob URL after short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);

      // Success State
      setProgress(100);
      setStatus("success");
      setStatusMessage("Download complete! Your tax invoice has been saved.");
    } catch (err) {
      console.error("PDF Download error:", err);
      setStatus("error");
      setErrorMessage(
        err.message || "Failed to download PDF. Please try again.",
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      startDownload();
    } else {
      setStatus("idle");
      setProgress(0);
      setStatusMessage("");
      setErrorMessage("");
      setDownloadedFilename("");
    }
  }, [isOpen, orderId, customUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111827] text-white rounded-2xl max-w-md w-full border border-[#B88A2E]/30 shadow-2xl overflow-hidden relative transform transition-all scale-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#161F33]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B88A2E]/10 border border-[#B88A2E]/40 flex items-center justify-center text-[#B88A2E]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading tracking-wide">
                {title}
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Ref: {displayOrderNum}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Loading Display */}
          {(status === "connecting" || status === "generating") && (
            <div className="text-center py-4 space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-[#B88A2E]/20 border-t-[#B88A2E] animate-spin flex items-center justify-center">
                  <Download className="w-6 h-6 text-[#B88A2E] animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {statusMessage}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Please wait while document is compiled
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-700">
                <div
                  className="bg-gradient-to-r from-[#B88A2E] to-[#D4AF37] h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h4 className="text-base font-bold text-emerald-400 font-heading">
                  Download Complete
                </h4>
                <p className="text-xs text-gray-300 mt-1">{statusMessage}</p>
                <p className="text-[11px] text-gray-400 font-mono mt-1 bg-gray-800/80 px-2.5 py-1 rounded-md border border-gray-700 inline-block max-w-full truncate">
                  📄{" "}
                  {downloadedFilename ||
                    filename ||
                    getDynamicFilename(orderId, "")}
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={startDownload}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-800 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#B88A2E] to-[#997022] text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-[#B88A2E]/20 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-rose-400 font-heading">
                  Download Failed
                </h4>
                <p className="text-xs text-gray-300 mt-1">{errorMessage}</p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={startDownload}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#B88A2E] text-white text-xs font-bold hover:bg-[#997022] transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
