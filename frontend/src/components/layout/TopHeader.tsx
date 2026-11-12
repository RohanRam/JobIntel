import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Menu,
  Sparkles,
} from "lucide-react";
import { api } from "../../api/client";
import type { HealthResponse } from "../../types";

interface TopHeaderProps {
  onToggleMobileNav?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleMobileNav }) => {
  const location = useLocation();
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    api.get<HealthResponse>("/health")
      .then((res) => setHealth(res.data))
      .catch(() => setHealth({ status: "error", service: "api", model_loaded: false, dataset_loaded: false }));
  }, []);

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/":
        return "Job Market Intelligence";
      case "/salary-predictor":
        return "Salary Prediction Engine";
      case "/skills":
        return "Best Skills to Have";
      case "/skill-gap":
        return "Skill Gap Analyzer";
      case "/about":
        return "Methodology & Audit";
      default:
        return "Job Market Analytics";
    }
  };

  return (
    <header className="top-header-bar">
      {/* Left side: Hamburger (mobile) + Page Title */}
      <div className="header-left">
        {onToggleMobileNav && (
          <button
            onClick={onToggleMobileNav}
            className="circle-icon-btn"
            style={{ display: "none" }}
            id="mobile-nav-toggle"
            title="Toggle Menu"
          >
            <Menu size={18} />
          </button>
        )}
        <h2 className="header-page-title">{getPageTitle(location.pathname)}</h2>
      </div>

      {/* Right side: Clean System Status Badge (Non-button informative badge) */}
      <div className="header-right">
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-subtle)",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-main)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: health?.model_loaded !== false ? "#10B981" : "#EF4444",
              boxShadow: health?.model_loaded !== false ? "0 0 6px rgba(16, 185, 129, 0.6)" : "none",
            }}
          />
          <span>{health?.model_loaded !== false ? "HistGB Model v1.0 Online" : "Model Offline"}</span>
          <span style={{ color: "var(--border-subtle)", margin: "0 2px" }}>|</span>
          <span style={{ color: "var(--text-subtle)", fontWeight: 500 }}>84,842 Postings</span>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;