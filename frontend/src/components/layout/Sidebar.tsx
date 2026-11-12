import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Calculator,
  Compass,
  Cpu,
  Info,
  Layers,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const navItems = [
    { to: "/", label: "Dashboard", icon: BarChart3 },
    { to: "/salary-predictor", label: "Salary Predictor", icon: Calculator },
    { to: "/skills", label: "Best Skills to Have", icon: Cpu },
    { to: "/skill-gap", label: "Skill Gap Analyzer", icon: Compass },
    { to: "/about", label: "Methodology & Audit", icon: Info },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 998,
          }}
        />
      )}

      <aside className={`sidebar-container ${mobileOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand" style={{ padding: "18px 16px 14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
            <img
              src="/logo-full.png"
              alt="Job Intel"
              style={{
                height: "32px",
                maxWidth: "146px",
                objectFit: "contain",
                display: "block",
              }}
            />
            <span className="sidebar-brand-badge" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>AI</span>
          </div>
          {mobileOpen && (
            <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="sidebar-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={17} className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User / Analyst Profile */}
        <div className="sidebar-footer-profile">
          <div className="profile-avatar">
            <span>RS</span>
          </div>
          <div className="profile-info">
            <div className="profile-name">Rohan S.</div>
            <div className="profile-role">Lead Analyst</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

