import React from "react";
import { Loader2 } from "lucide-react";

interface Props {
  message?: string;
  size?: number;
}

export const LoadingSpinner: React.FC<Props> = ({ message = "Loading analytics...", size = 28 }) => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem 1rem",
      gap: "0.85rem",
      color: "var(--text-muted)",
    }}>
      <Loader2 size={size} style={{ animation: "spin 1s linear infinite", color: "var(--accent-black)" }} />
      <p style={{ fontSize: "0.84rem", fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
