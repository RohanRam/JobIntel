import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Compass,
  Cpu,
  Info,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { getSkillRecommendations } from "../api/skills";
import { getFilterOptions } from "../api/analytics";
import type { SkillRecommendationResponse } from "../types";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";

export const SkillGapPage: React.FC = () => {
  const navigate = useNavigate();
  const [targetRole, setTargetRole] = useState<string>("Data Science");
  const [city, setCity] = useState<string>("All");
  const [experienceBand, setExperienceBand] = useState<string>("All");
  const [skillInput, setSkillInput] = useState<string>("");
  const [currentSkills, setCurrentSkills] = useState<string[]>(["Python", "SQL", "Excel"]);

  const [filterOptions, setFilterOptions] = useState<{
    role_families: string[];
    cities: string[];
    experience_bands: string[];
  }>({ role_families: [], cities: [], experience_bands: [] });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SkillRecommendationResponse | null>(null);

  const sampleCommonSkills = [
    "Python", "SQL", "Excel", "Power BI", "Tableau", "Machine Learning", "React",
    "JavaScript", "AWS", "Git", "Docker", "Java", "Node.js", "FastAPI", "Pandas"
  ];

  const presets = [
    {
      label: "🎯 Data Science Aspirant",
      role: "Data Science",
      city: "Bengaluru",
      exp: "Mid-Level (3-5 yrs)",
      skills: ["Python", "SQL", "Excel", "Data Analysis"]
    },
    {
      label: "⚡ Junior SDE",
      role: "Software Engineering",
      city: "Bengaluru",
      exp: "Entry Level (0-2 yrs)",
      skills: ["Java", "JavaScript", "SQL", "Git"]
    },
    {
      label: "☁️ DevOps & Cloud",
      role: "DevOps & Cloud",
      city: "Hyderabad",
      exp: "Mid-Level (3-5 yrs)",
      skills: ["Linux", "Git", "Docker", "Python"]
    },
    {
      label: "📊 BI & Data Analytics",
      role: "Data Analytics",
      city: "Mumbai",
      exp: "Mid-Level (3-5 yrs)",
      skills: ["SQL", "Power BI", "Excel", "Tableau"]
    },
    {
      label: "💻 Full-Stack Aspirant",
      role: "Software Engineering",
      city: "Pune",
      exp: "Mid-Level (3-5 yrs)",
      skills: ["React", "JavaScript", "Node.js", "Git"]
    }
  ];

  useEffect(() => {
    getFilterOptions()
      .then((opts) => setFilterOptions(opts))
      .catch((err) => console.error(err));
  }, []);

  const handleApplyPreset = (p: typeof presets[0]) => {
    setTargetRole(p.role);
    setCity(p.city);
    setExperienceBand(p.exp);
    setCurrentSkills(p.skills);
  };

  const handleAddSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !currentSkills.includes(s)) {
      const updated = [...currentSkills, s];
      setCurrentSkills(updated);
      setSkillInput("");
      triggerAnalysis(targetRole, city, experienceBand, updated);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const updated = currentSkills.filter((s) => s !== skill);
    setCurrentSkills(updated);
    triggerAnalysis(targetRole, city, experienceBand, updated);
  };

  const handleClearAllSkills = () => {
    setCurrentSkills([]);
    triggerAnalysis(targetRole, city, experienceBand, []);
  };

  const triggerAnalysis = async (
    role: string,
    targetCity: string,
    targetExp: string,
    skillsList: string[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSkillRecommendations({
        target_role: role,
        current_skills: skillsList,
        city: targetCity !== "All" ? targetCity : undefined,
        experience_band: targetExp !== "All" ? targetExp : undefined,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to analyze skill gap.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await triggerAnalysis(targetRole, city, experienceBand, currentSkills);
  };

  useEffect(() => {
    triggerAnalysis(targetRole, city, experienceBand, currentSkills);
  }, [targetRole, city, experienceBand]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page Header */}
      <div>
        <h2 className="heading-1">Skill Gap Analyzer</h2>
        <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "2px" }}>
          Benchmark your current competencies against active Indian job requirements to pinpoint high-yield missing skills.
        </p>
      </div>

      {/* Preset Profiles Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
        padding: "10px 16px",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-sm)"
      }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "5px" }}>
          <Zap size={14} /> Career Transition Presets:
        </span>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", flex: 1 }}>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => handleApplyPreset(p)}
              style={{
                fontSize: "0.74rem",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                backgroundColor: targetRole === p.role ? "#111111" : "#FFFFFF",
                color: targetRole === p.role ? "#FFFFFF" : "var(--text-main)",
                border: "1px solid var(--border-subtle)",
                fontWeight: targetRole === p.role ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "20px", alignItems: "start" }}>
        {/* Left Column: Form */}
        <div className="glass-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#111111", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Target size={16} />
            </div>
            <div>
              <h3 className="heading-2">Target Role & Current Skills</h3>
              <p className="text-subtle" style={{ fontSize: "0.75rem" }}>Profile comparison against Indian hiring requirements</p>
            </div>
          </div>

          <form onSubmit={handleAnalyze} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Target Role */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Target Role Family
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{ width: "100%", borderRadius: "var(--radius-md)" }}
              >
                {filterOptions.role_families.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* City & Experience */}
            <div className="grid-2">
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                  Optional City Scope
                </label>
                <select value={city} onChange={(e) => setCity(e.target.value)} style={{ width: "100%" }}>
                  <option value="All">All Cities (Pan-India)</option>
                  {filterOptions.cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                  Target Seniority
                </label>
                <select value={experienceBand} onChange={(e) => setExperienceBand(e.target.value)} style={{ width: "100%" }}>
                  <option value="All">All Experience Levels</option>
                  {filterOptions.experience_bands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Skills Builder */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)" }}>
                  Your Current Skills
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>
                    {currentSkills.length} listed
                  </span>
                  {currentSkills.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllSkills}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-subtle)",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px"
                      }}
                      title="Clear all selected skills"
                    >
                      <RotateCcw size={11} /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Skills container */}
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                padding: "8px 10px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                minHeight: "44px",
                marginBottom: "10px"
              }}>
                {currentSkills.length === 0 ? (
                  <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)", padding: "2px" }}>
                    No skills added yet. Add your current skills below or select a preset profile.
                  </span>
                ) : (
                  currentSkills.map((sk) => (
                    <span
                      key={sk}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        backgroundColor: "#111111",
                        color: "#FFFFFF",
                        padding: "3px 10px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.76rem",
                        fontWeight: 600,
                      }}
                    >
                      {sk}
                      <X
                        size={13}
                        style={{ cursor: "pointer", opacity: 0.8 }}
                        onClick={() => handleRemoveSkill(sk)}
                      />
                    </span>
                  ))
                )}
              </div>

              {/* Add custom skill input */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <input
                  type="text"
                  placeholder="Type a skill (e.g. FastAPI, Power BI, Docker)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(skillInput);
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(skillInput)}
                  className="btn btn-secondary"
                  style={{ padding: "0 16px", fontSize: "0.82rem" }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Quick toggle chips */}
              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", display: "block", marginBottom: "6px" }}>
                  Quick add frequently cited tech competencies:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {sampleCommonSkills.map((ps) => {
                    const isSelected = currentSkills.includes(ps);
                    return (
                      <button
                        type="button"
                        key={ps}
                        onClick={() => isSelected ? handleRemoveSkill(ps) : handleAddSkill(ps)}
                        style={{
                          padding: "3px 10px",
                          fontSize: "0.72rem",
                          fontWeight: 500,
                          borderRadius: "var(--radius-full)",
                          backgroundColor: isSelected ? "#111111" : "#FFFFFF",
                          color: isSelected ? "#FFFFFF" : "var(--text-main)",
                          border: `1px solid ${isSelected ? "#111111" : "var(--border-subtle)"}`,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {isSelected ? `✓ ${ps}` : `+ ${ps}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: "12px", fontSize: "0.92rem", marginTop: "8px", width: "100%" }}
            >
              <Compass size={16} />
              <span>{loading ? "Analyzing Coverage..." : "Refresh Skill Benchmark"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Analysis Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {error && <ErrorMessage message={error} />}

          {loading && <LoadingSpinner message="Calculating market skill coverage and prioritizing gaps..." />}

          {result && !loading && (
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Coverage Score Metric */}
              <div style={{
                textAlign: "center",
                padding: "20px",
                backgroundColor: "var(--bg-card-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)"
              }}>
                <span style={{ fontSize: "0.76rem", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Weighted Market Skill Coverage
                </span>
                <div style={{ fontSize: "3.2rem", fontWeight: 800, color: "var(--text-main)", margin: "4px 0", letterSpacing: "-0.04em", lineHeight: 1 }}>
                  {result.coverage_pct}%
                </div>
                <div style={{ width: "100%", height: "6px", backgroundColor: "#E0E0E0", borderRadius: "3px", overflow: "hidden", margin: "10px 0 6px 0" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${result.coverage_pct}%`,
                      backgroundColor: "#111111",
                      borderRadius: "3px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)" }}>
                  Evaluated against {result.market_sample_size.toLocaleString()} postings in {result.target_role}
                </p>
              </div>

              {/* Matched Skills */}
              <div>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <CheckCircle2 size={15} color="#10B981" /> Matched Skills ({result.matched_skills.length})
                </h4>
                {result.matched_skills.length === 0 ? (
                  <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>No common market skills matched yet. Select relevant skills on the left.</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {result.matched_skills.map((sk) => (
                      <span key={sk} className="badge badge-success">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Prioritized Missing Skills with Interactive "+ Add" action */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertCircle size={15} color="#EF4444" /> High-Impact Recommended Skills
                  </h4>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>Click + to simulate coverage</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "280px", overflowY: "auto" }}>
                  {result.missing_skills.slice(0, 10).map((ms) => (
                    <div
                      key={ms.skill}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#FFFFFF",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, fontSize: "0.84rem", color: "var(--text-main)" }}>
                          {ms.skill}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginLeft: "8px" }}>
                          appears in {(ms.prevalence * 100).toFixed(1)}% of listings
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={`badge ${ms.priority === "high" ? "badge-danger" : ms.priority === "medium" ? "badge-warning" : "badge-secondary"}`}>
                          {ms.priority.toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddSkill(ms.skill)}
                          style={{
                            fontSize: "0.72rem",
                            padding: "3px 8px",
                            borderRadius: "var(--radius-full)",
                            backgroundColor: "#F4F4F4",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-main)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            fontWeight: 600,
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E5E5E5")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F4F4F4")}
                          title={`Add ${ms.skill} to your skills and simulate impact`}
                        >
                          <Plus size={11} /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Bridge to Salary Predictor */}
              <div style={{
                padding: "14px 16px",
                backgroundColor: "#111111",
                color: "#FFFFFF",
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={15} color="#FFFFFF" />
                  <span style={{ fontWeight: 700, fontSize: "0.84rem" }}>
                    Predict Your Market Compensation
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.75)", margin: 0, lineHeight: 1.4 }}>
                  Connect your benchmarked skill profile with our GBDT regression model to forecast expected ₹ LPA and 80% error intervals.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/salary-predictor")}
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#111111",
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    padding: "8px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    marginTop: "4px",
                    transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1.0")}
                >
                  <Calculator size={13} />
                  <span>Run Salary Predictor with My Skills</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Interpretation Note */}
              <div style={{
                padding: "12px 14px",
                backgroundColor: "var(--bg-card-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                fontSize: "0.76rem",
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}>
                <span style={{ fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                  <Info size={13} /> Market Insight
                </span>
                {result.interpretation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillGapPage;