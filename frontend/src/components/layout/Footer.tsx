import React from "react";
import { Database, ShieldAlert, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: "1px solid var(--border-subtle)",
      padding: "1.25rem 0.5rem 0.5rem 0.5rem",
      marginTop: "1.5rem",
      color: "var(--text-subtle)",
      fontSize: "0.78rem",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img src="/logo-icon.png" alt="Job Intel" style={{ width: "16px", height: "16px", objectFit: "contain" }} />
            <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
              Job Intel AI — Indian Job Market Intelligence &amp; Salary ML Engine
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Database size={13} />
              84,842 Deduplicated Records
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <ShieldAlert size={13} />
              Supervised GBDT & Parquet Architecture
            </span>
          </div>
        </div>

        <p style={{ lineHeight: 1.5, color: "var(--text-muted)" }}>
          Salary predictions are calibrated using supervised gradient-boosted regression on salary-disclosed Indian postings (2025–2026).
          Predictions provide empirical percentiles and should be used as guidance alongside personal experience and total compensation factors.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
