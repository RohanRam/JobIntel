import React from "react";
import { SearchX } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<Props> = ({
  title = "No results found",
  description = "Try adjusting your filters or search keywords.",
  actionText,
  onAction,
}) => {
  return (
    <div style={{
      textAlign: "center",
      padding: "4rem 2rem",
      backgroundColor: "var(--bg-card-subtle)",
      borderRadius: "var(--radius-md)",
      border: "1px dashed var(--border-subtle)",
      margin: "1.5rem 0",
    }}>
      <SearchX size={44} style={{ color: "var(--text-subtle)", margin: "0 auto 1rem auto" }} />
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.4rem" }}>
        {title}
      </h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "450px", margin: "0 auto 1.25rem auto" }}>
        {description}
      </p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
          {actionText}
        </button>
      )}
    </div>
  );
};

