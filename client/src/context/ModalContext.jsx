import React, { createContext, useContext, useState, useCallback } from "react";
import PdfDownloadModal from "../components/ui/PdfDownloadModal";
import { AlertModal, ConfirmModal } from "../components/ui/AlertConfirmModal";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  // PDF Download Modal State
  const [pdfModalState, setPdfModalState] = useState({
    isOpen: false,
    orderId: null,
    orderNumber: null,
    customUrl: null,
    filename: null,
    title: "Official Tax Invoice PDF",
  });

  // Alert Modal State
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Confirm Modal State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    cancelText: "Cancel",
    isDanger: false,
  });

  const downloadPdf = useCallback(({ orderId, orderNumber, customUrl, filename, title }) => {
    setPdfModalState({
      isOpen: true,
      orderId: orderId || null,
      orderNumber: orderNumber || (orderId ? `#${orderId}` : null),
      customUrl: customUrl || null,
      filename: filename || null,
      title: title || "Official Tax Invoice PDF",
    });
  }, []);

  const closePdfModal = useCallback(() => {
    setPdfModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showAlert = useCallback(({ title, message, type = "info" }) => {
    setAlertState({
      isOpen: true,
      title: title || "",
      message: message || "",
      type: type || "info",
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showConfirm = useCallback(({ title, message, onConfirm, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) => {
    setConfirmState({
      isOpen: true,
      title: title || "Are you sure?",
      message: message || "",
      onConfirm: onConfirm || (() => {}),
      confirmText,
      cancelText,
      isDanger,
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ModalContext.Provider
      value={{
        downloadPdf,
        showAlert,
        showConfirm,
        closePdfModal,
        closeAlert,
        closeConfirm,
      }}
    >
      {children}

      {/* PDF Download Modal */}
      <PdfDownloadModal
        isOpen={pdfModalState.isOpen}
        onClose={closePdfModal}
        orderId={pdfModalState.orderId}
        orderNumber={pdfModalState.orderNumber}
        customUrl={pdfModalState.customUrl}
        filename={pdfModalState.filename}
        title={pdfModalState.title}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        isDanger={confirmState.isDanger}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
