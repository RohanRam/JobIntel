import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<Props> = ({
  title = "Error loading data",
  message,
  onRetry,
}) => {
  return (
    <div style={{
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      borderRadius: "var(--radius-md)",
      padding: "16px 20px",
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      margin: "12px 0",
    }}>
      <AlertTriangle size={20} style={{ color: "#EF4444", flexShrink: 0, marginTop: "2px" }} />
      <div style={{ flex: 1 }}>
        <h4 style={{ color: "#991B1B", fontSize: "0.92rem", fontWeight: 700, marginBottom: "4px" }}>
          {title}
        </h4>
        <p style={{ color: "#B91C1C", fontSize: "0.82rem", marginBottom: onRetry ? "10px" : 0 }}>
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="pill-action-btn"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#991B1B",
              border: "1px solid #FECACA",
              padding: "4px 12px",
              fontSize: "0.78rem",
            }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
