import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Calculator,
  Compass,
  Cpu,
  Info,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "../../api/client";
import type { HealthResponse } from "../../types";

export const Navbar: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    api.get<HealthResponse>("/health")
      .then((res) => setHealth(res.data))
      .catch(() => setHealth({ status: "error", service: "api", model_loaded: false, dataset_loaded: false }));
  }, []);

  const navItems = [
    { to: "/", label: "Dashboard", icon: BarChart3 },
    { to: "/salary-predictor", label: "Salary Predictor", icon: Calculator },
    { to: "/skills", label: "Skill Intelligence", icon: Cpu },
    { to: "/skill-gap", label: "Skill Gap Analyzer", icon: Compass },
    { to: "/jobs", label: "Job Explorer", icon: Layers },
    { to: "/about", label: "Methodology", icon: Info },
  ];

  return (
    <header style={{
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-subtle)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0.85rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        {/* Brand */}
        <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
          }}>
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
              JobIntel <span style={{ color: "var(--secondary)", fontSize: "0.85rem", fontWeight: 600 }}>India</span>
            </h1>
            <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontWeight: 500 }}>
              Labour Market & Compensation ML System
            </p>
          </div>
        </NavLink>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.5rem 0.85rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm)",
                  color: isActive ? "#ffffff" : "var(--text-muted)",
                  backgroundColor: isActive ? "rgba(99, 102, 241, 0.2)" : "transparent",
                  border: isActive ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent",
                  transition: "all 0.15s ease",
                })}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Live Status indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.35rem 0.75rem",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--bg-card-subtle)",
            border: "1px solid var(--border-subtle)",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}>
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: health?.model_loaded ? "#10b981" : "#ef4444",
              boxShadow: health?.model_loaded ? "0 0 8px #10b981" : "none",
            }} />
            <span style={{ color: "var(--text-muted)" }}>
              {health?.model_loaded ? "ML Model Active" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
