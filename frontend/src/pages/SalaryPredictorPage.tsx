import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  ChevronRight,
  Cpu,
  Info,
  Sparkles,
  X,
  Compass,
  Zap,
} from "lucide-react";
import { predictSalary, getModelMetadata } from "../api/predictions";
import { getFilterOptions } from "../api/analytics";
import type { SalaryPredictionResponse } from "../types";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";

export const SalaryPredictorPage: React.FC = () => {
  const navigate = useNavigate();
  const [roleFamily, setRoleFamily] = useState<string>("Software Engineering");
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [city, setCity] = useState<string>("Bengaluru");
  const [workMode, setWorkMode] = useState<string>("Hybrid");
  const [skillInput, setSkillInput] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Python",
    "React",
    "SQL",
    "AWS",
  ]);

  const [filterOptions, setFilterOptions] = useState<{
    role_families: string[];
    cities: string[];
    work_modes: string[];
  }>({ role_families: [], cities: [], work_modes: [] });

  const [modelMeta, setModelMeta] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SalaryPredictionResponse | null>(null);

  const popularSkills = [
    "Python", "React", "JavaScript", "SQL", "AWS", "Docker", "Machine Learning",
    "Java", "Node.js", "TypeScript", "Excel", "Power BI", "Tableau", "Git",
    "Kubernetes", "Spring Boot", "FastAPI", "PostgreSQL", "MongoDB", "DevOps"
  ];

  const presets = [
    {
      label: "Junior SDE (2 Yrs)",
      role: "Software Engineering",
      exp: 2,
      city: "Bengaluru",
      skills: ["Java", "JavaScript", "SQL", "Git"]
    },
    {
      label: "Mid Data Scientist (4 Yrs)",
      role: "Data Science",
      exp: 4,
      city: "Bengaluru",
      skills: ["Python", "Machine Learning", "SQL", "Pandas"]
    },
    {
      label: "Senior Cloud & DevOps (6 Yrs)",
      role: "DevOps & Cloud",
      exp: 6,
      city: "Hyderabad",
      skills: ["AWS", "Docker", "Kubernetes", "Python", "Linux"]
    },
    {
      label: "Analytics Lead (8 Yrs)",
      role: "Data Analytics",
      exp: 8,
      city: "Mumbai",
      skills: ["SQL", "Power BI", "Tableau", "Excel", "Python"]
    }
  ];

  useEffect(() => {
    getFilterOptions()
      .then((opts) => setFilterOptions(opts))
      .catch((err) => console.error(err));

    getModelMetadata()
      .then((meta) => setModelMeta(meta))
      .catch((err) => console.error(err));
  }, []);

  const handleApplyPreset = (p: typeof presets[0]) => {
    setRoleFamily(p.role);
    setExperienceYears(p.exp);
    setCity(p.city);
    setSelectedSkills(p.skills);
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predictSalary({
        role_family: roleFamily,
        experience_years: Number(experienceYears),
        city,
        work_mode: workMode,
        skills: selectedSkills,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate salary prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page Header */}
      <div>
        <h2 className="heading-1">Salary Prediction Engine</h2>
        <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "2px" }}>
          Supervised GBDT regression trained on {modelMeta ? modelMeta.train_sample_size.toLocaleString() : "25,000+"} salary-disclosed Indian postings.
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
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
      }}>
        <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--accent-black)", marginRight: "4px" }}>
          Quick Scenario Presets:
        </span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => handleApplyPreset(p)}
            className="pill-action-btn"
            style={{ padding: "4px 12px", fontSize: "0.75rem", background: "#FFFFFF" }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "20px", alignItems: "start" }}>
        {/* Form Column */}
        <div className="glass-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#111111", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calculator size={16} />
            </div>
            <div>
              <h3 className="heading-2">Job Profile Parameters</h3>
              <p className="text-subtle" style={{ fontSize: "0.75rem" }}>Calibrated feature inputs for supervised inference</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Role Family */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Target Role Family
              </label>
              <select
                value={roleFamily}
                onChange={(e) => setRoleFamily(e.target.value)}
                style={{ width: "100%", borderRadius: "var(--radius-md)" }}
              >
                {filterOptions.role_families.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Experience Slider & Input */}
            <div style={{ background: "var(--bg-card-subtle)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)" }}>
                  Total Experience
                </label>
                <span className="badge badge-primary">{experienceYears} Years</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: "#111111" }}
                />
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseFloat(e.target.value) || 0)}
                  style={{ width: "70px", padding: "4px 8px", textAlign: "center" }}
                />
              </div>
            </div>

            {/* City & Work Mode */}
            <div className="grid-2">
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                  Location (City)
                </label>
                <select value={city} onChange={(e) => setCity(e.target.value)} style={{ width: "100%" }}>
                  {filterOptions.cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                  Work Arrangement
                </label>
                <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} style={{ width: "100%" }}>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            {/* Skills Multi-Selector */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)" }}>
                  Skills Portfolio
                </label>
                <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>
                  {selectedSkills.length} selected
                </span>
              </div>

              {/* Selected Skill Badges */}
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
                {selectedSkills.length === 0 && (
                  <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>
                    No skills selected. Add skills below to improve prediction accuracy.
                  </span>
                )}
                {selectedSkills.map((sk) => (
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
                ))}
              </div>

              {/* Add custom skill input */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <input
                  type="text"
                  placeholder="Type a skill and press Enter (e.g. PyTorch, Go)..."
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
                  Add
                </button>
              </div>

              {/* Quick toggle chips */}
              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", display: "block", marginBottom: "6px" }}>
                  Quick add canonical skills:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {popularSkills.map((ps) => {
                    const isSelected = selectedSkills.includes(ps);
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
              <Sparkles size={16} />
              <span>{loading ? "Calculating Estimate..." : "Predict Market Salary"}</span>
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {error && <ErrorMessage message={error} />}

          {loading && <LoadingSpinner message="Evaluating ML regression model with log1p transformation..." />}

          {result && !loading && (
            <div className="glass-card" style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="badge badge-success">Prediction Calibrated</span>
                <span style={{ fontSize: "0.74rem", color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                  v{result.model_version}
                </span>
              </div>

              {/* Main Predicted Number */}
              <div style={{ textAlign: "center", padding: "16px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Estimated Market Compensation
                </span>
                <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.04em", margin: "6px 0", lineHeight: 1 }}>
                  ₹{result.predicted_salary_lpa} <span style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--text-muted)" }}>LPA</span>
                </div>
                <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  ₹{result.predicted_salary_inr_annual.toLocaleString()} / year annual base
                </div>
              </div>

              {/* Prediction Interval */}
              <div style={{ padding: "16px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-main)" }}>
                    Empirical 80% Prediction Interval
                  </span>
                  <span className="badge badge-secondary">
                    {result.prediction_interval.confidence_level} Coverage
                  </span>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "var(--bg-card-subtle)",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)"
                }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", display: "block" }}>Lower Bound</span>
                    <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem" }}>₹{result.prediction_interval.lower_lpa} LPA</span>
                  </div>
                  <ChevronRight size={16} color="var(--text-subtle)" />
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", display: "block" }}>Point Estimate</span>
                    <span style={{ fontWeight: 800, color: "#111111", fontSize: "1.05rem" }}>₹{result.predicted_salary_lpa} LPA</span>
                  </div>
                  <ChevronRight size={16} color="var(--text-subtle)" />
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", display: "block" }}>Upper Bound</span>
                    <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem" }}>₹{result.prediction_interval.upper_lpa} LPA</span>
                  </div>
                </div>
              </div>

              {/* Market Context Comparison */}
              {result.market_context && (
                <div style={{ padding: "14px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
                    Market Baseline Context
                  </span>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1, padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", display: "block" }}>Role Median</span>
                      <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem" }}>
                        {result.market_context.role_median_lpa ? `₹${result.market_context.role_median_lpa} LPA` : "N/A"}
                      </span>
                    </div>
                    <div style={{ flex: 1, padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", display: "block" }}>City Median</span>
                      <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem" }}>
                        {result.market_context.city_median_lpa ? `₹${result.market_context.city_median_lpa} LPA` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Next Step to Skill Gap Analyzer */}
              <div style={{ marginTop: "14px", padding: "12px", background: "var(--bg-card-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-main)", display: "block" }}>
                    Want to increase your compensation?
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>
                    Find the highest-paying missing skills for {roleFamily}
                  </span>
                </div>
                <button
                  onClick={() => navigate("/skill-gap")}
                  className="pill-action-btn dark"
                  style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                >
                  <span>Check Skill Gap</span>
                  <ChevronRight size={12} />
                </button>
              </div>

              {/* Methodological limitations */}
              <div style={{ marginTop: "12px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                  <Info size={13} /> Model Limitations & Notes
                </span>
                <ul style={{ paddingLeft: "1.2rem", fontSize: "0.74rem", color: "var(--text-subtle)", lineHeight: 1.5 }}>
                  {result.limitations.map((lim, idx) => (
                    <li key={idx} style={{ marginBottom: "3px" }}>{lim}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Model Quality Specs Card */}
          {modelMeta && (
            <div className="glass-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Cpu size={16} />
                <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>
                  Production Architecture Specs
                </h4>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.78rem" }}>
                <div>
                  <span style={{ color: "var(--text-subtle)", display: "block" }}>Algorithm</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>HistGradientBoostingRegressor</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-subtle)", display: "block" }}>Target Transform</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>log1p(salary_inr)</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-subtle)", display: "block" }}>Test MAE (Held-out)</span>
                  <span style={{ fontWeight: 700, color: "#111111" }}>₹{modelMeta.metrics.mae_lpa} LPA</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-subtle)", display: "block" }}>R² Determination</span>
                  <span style={{ fontWeight: 700, color: "#111111" }}>{modelMeta.metrics.r2}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryPredictorPage;
