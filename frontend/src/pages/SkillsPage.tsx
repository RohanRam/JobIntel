import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Cpu, Share2, TrendingUp, Sparkles, Code2, ChevronRight, Calculator, Compass } from "lucide-react";
import { getSkillDemand, getFilterOptions } from "../api/analytics";
import { getSkillRecommendations } from "../api/skills";
import type { SkillDemandItem } from "../types";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";

export const SkillsPage: React.FC = () => {
  const navigate = useNavigate();
  const [roleFamily, setRoleFamily] = useState<string>("Software Engineering");
  const [filterOptions, setFilterOptions] = useState<{ role_families: string[]; cities: string[] }>({
    role_families: [],
    cities: [],
  });
  const [skills, setSkills] = useState<SkillDemandItem[]>([]);
  const [coOccurring, setCoOccurring] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "core" | "multipliers">("all");

  useEffect(() => {
    getFilterOptions()
      .then((opts) => setFilterOptions(opts))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      setError(null);
      try {
        const [skillRes, recRes] = await Promise.all([
          getSkillDemand({ role_family: roleFamily, limit: 30 }),
          getSkillRecommendations({ target_role: roleFamily, current_skills: [] }),
        ]);
        setSkills(skillRes);
        setCoOccurring(recRes.co_occurring_skills || []);
      } catch (err: any) {
        setError(err.message || "Failed to load skill intelligence data");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [roleFamily]);

  const displayedSkills = skills.filter((s) => {
    if (activeTab === "core") return s.prevalence >= 0.25;
    if (activeTab === "multipliers") return s.prevalence < 0.25;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Title */}
      <div>
        <h2 className="heading-1">Best Skills to Have</h2>
        <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "2px" }}>
          Data-backed ranking of core tech competencies and high-yield salary multiplier skills across India.
        </p>
      </div>

      {/* Role Selector Header */}
      <div className="glass-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#111111", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu size={17} />
          </div>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
              Target Role Domain
            </span>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              {roleFamily}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>Switch Role:</label>
          <select
            value={roleFamily}
            onChange={(e) => setRoleFamily(e.target.value)}
            className="filter-pill-select"
            style={{ minWidth: "220px" }}
          >
            {filterOptions.role_families.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner message={`Extracting highest-value skills for ${roleFamily}...`} />
      ) : (
        <>
          {/* Main Content Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px", alignItems: "start" }}>
            {/* Left: Ranked Skills Table with Category Filter Tabs */}
            <div className="glass-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 className="heading-2">In-Demand Technical Portfolio</h3>
                  <p className="text-subtle" style={{ fontSize: "0.76rem" }}>Ranked by observed mention frequency across 84.8k listings</p>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: "flex", background: "#F5F5F7", borderRadius: "var(--radius-full)", padding: "3px" }}>
                  <button
                    onClick={() => setActiveTab("all")}
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      borderRadius: "var(--radius-full)",
                      background: activeTab === "all" ? "#FFFFFF" : "transparent",
                      color: activeTab === "all" ? "var(--text-main)" : "var(--text-muted)",
                      boxShadow: activeTab === "all" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    All Skills ({skills.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("core")}
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      borderRadius: "var(--radius-full)",
                      background: activeTab === "core" ? "#FFFFFF" : "transparent",
                      color: activeTab === "core" ? "var(--text-main)" : "var(--text-muted)",
                      boxShadow: activeTab === "core" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    Core Foundation (&gt;25%)
                  </button>
                  <button
                    onClick={() => setActiveTab("multipliers")}
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      borderRadius: "var(--radius-full)",
                      background: activeTab === "multipliers" ? "#FFFFFF" : "transparent",
                      color: activeTab === "multipliers" ? "var(--text-main)" : "var(--text-muted)",
                      boxShadow: activeTab === "multipliers" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    Specialist Multipliers
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {displayedSkills.map((s, idx) => {
                  const pct = (s.prevalence * 100).toFixed(1);
                  const isCore = s.prevalence >= 0.25;
                  return (
                    <div
                      key={s.skill}
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "var(--bg-card-subtle)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontFamily: "var(--font-mono)", width: "22px" }}>
                            #{idx + 1}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}>
                            {s.skill}
                          </span>
                          {isCore && (
                            <span className="badge badge-primary" style={{ fontSize: "0.64rem", padding: "1px 6px" }}>
                              Core
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "0.76rem", color: "var(--text-subtle)" }}>
                            {s.count.toLocaleString()} postings
                          </span>
                          <span className="badge badge-secondary" style={{ width: "52px", justifyContent: "center" }}>
                            {pct}%
                          </span>
                        </div>
                      </div>

                      {/* Prevalence Visual Bar */}
                      <div style={{ width: "100%", height: "4px", backgroundColor: "#E5E5E5", borderRadius: "2px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: isCore ? "#111111" : "#555555",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Frequent Co-Occurrence Matrix & Action Card */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Co-Occurrence Matrix */}
              <div className="glass-card">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Share2 size={15} color="var(--accent-black)" />
                  </div>
                  <div>
                    <h3 className="heading-2">High-Yield Skill Bundles</h3>
                    <p className="text-subtle" style={{ fontSize: "0.76rem" }}>Technologies that consistently pair together</p>
                  </div>
                </div>

                {coOccurring.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>No frequent co-occurrences found.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {coOccurring.map((pair, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "10px 14px",
                          backgroundColor: "#FFFFFF",
                          borderRadius: "var(--radius-full)",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.02)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "0.82rem" }}>{pair.skill_a}</span>
                          <span style={{ color: "var(--text-subtle)", fontSize: "0.75rem" }}>+</span>
                          <span style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "0.82rem" }}>{pair.skill_b}</span>
                        </div>
                        <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>
                          {pair.count} joint listings
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Call to Action for Skill Gap Analyzer */}
              <div className="dark-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <Sparkles size={16} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>Gap Analysis & Roadmap</span>
                </div>
                <p style={{ fontSize: "0.76rem", color: "#A0A0A5", lineHeight: 1.5, marginBottom: "14px" }}>
                  Benchmark your current profile against {roleFamily} requirements to see which core skills you are missing and calculate your match score.
                </p>
                <button
                  onClick={() => navigate("/skill-gap")}
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    fontSize: "0.82rem",
                    background: "#FFFFFF",
                    color: "#111111",
                  }}
                >
                  <span>Launch Skill Gap Analyzer</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Market Context Note */}
              <div className="glass-card" style={{ padding: "16px", backgroundColor: "#F9F9FB" }}>
                <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <TrendingUp size={14} /> Career Strategy Guidance
                </h4>
                <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Job seekers targeting {roleFamily} should first master the Core Foundation skills (&gt;25% prevalence), then add 1 or 2 Specialist Multipliers (e.g., Docker, AWS, PyTorch) to command upper-quartile compensation.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SkillsPage;
