import React from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: "primary" | "success" | "warning" | "secondary";
  };
}

export const KpiCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
}) => {
  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "var(--bg-card-subtle)",
            color: "var(--text-main)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Icon size={15} />
          </div>
        )}
      </div>

      <div style={{ fontSize: "1.65rem", fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.03em" }}>
        {value}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "4px" }}>
        {subtitle && (
          <span style={{ fontSize: "0.76rem", color: "var(--text-subtle)" }}>
            {subtitle}
          </span>
        )}
        {badge && (
          <span className={`badge badge-${badge.variant || "primary"}`}>
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
