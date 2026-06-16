import React from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

export const Notification = () => {
  const { notification } = useApp();

  if (!notification) return null;

  const { message, type } = notification;

  const styles = {
    success: {
      borderLeft: "4px solid var(--success)",
      icon: <CheckCircle2 className="toast-icon" style={{ color: "var(--success)" }} />
    },
    error: {
      borderLeft: "4px solid var(--danger)",
      icon: <XCircle className="toast-icon" style={{ color: "var(--danger)" }} />
    },
    warning: {
      borderLeft: "4px solid var(--warning)",
      icon: <AlertTriangle className="toast-icon" style={{ color: "var(--warning)" }} />
    },
    info: {
      borderLeft: "4px solid var(--primary)",
      icon: <Info className="toast-icon" style={{ color: "var(--primary)" }} />
    }
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className="toast-container animate-fade-in" style={{ ...toastContainerStyle, borderLeft: currentStyle.borderLeft }}>
      {currentStyle.icon}
      <span style={toastTextStyle}>{message}</span>
    </div>
  );
};

// Inline premium styling for Toast
const toastContainerStyle = {
  position: "fixed",
  top: "24px",
  right: "24px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px 24px",
  borderRadius: "12px",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(16px)",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  zIndex: 9999,
  maxWidth: "360px",
  animation: "fadeIn 0.3s ease forwards"
};

const toastTextStyle = {
  fontWeight: "500",
  fontSize: "0.95rem",
  color: "var(--dark)"
};
