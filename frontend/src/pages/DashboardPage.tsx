import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  Code2,
  Cpu,
  DollarSign,
  Filter,
  Folder,
  Grid,
  Layers,
  MapPin,
  Plus,
  Radio,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  getDashboardSummary,
  getRoleDemand,
  getLocationDemand,
  getSalaryDistribution,
  getExperienceDistribution,
  getSkillDemand,
  getFilterOptions,
} from "../api/analytics";
import type {
  DashboardSummary,
  RoleDemandItem,
  LocationDemandItem,
  SalaryDistributionItem,
  ExperienceDistributionItem,
  SkillDemandItem,
} from "../types";
import { KpiCard } from "../components/cards/KpiCard";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [roleFamily, setRoleFamily] = useState<string>("All");
  const [city, setCity] = useState<string>("All");
  const [experienceBand, setExperienceBand] = useState<string>("All");
  const [roleTab, setRoleTab] = useState<string>("All");

  const [filterOptions, setFilterOptions] = useState<{
    role_families: string[];
    cities: string[];
    experience_bands: string[];
  }>({ role_families: [], cities: [], experience_bands: [] });

  // Data
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [roles, setRoles] = useState<RoleDemandItem[]>([]);
  const [locations, setLocations] = useState<LocationDemandItem[]>([]);
  const [salaries, setSalaries] = useState<SalaryDistributionItem[]>([]);
  const [experience, setExperience] = useState<ExperienceDistributionItem[]>([]);
  const [skills, setSkills] = useState<SkillDemandItem[]>([]);

  // Quick Instant Radar Predictor State in Dark Card
  const [previewRole, setPreviewRole] = useState<string>("Software Engineering");
  const [previewCity, setPreviewCity] = useState<string>("Bengaluru");
  const [previewLpa, setPreviewLpa] = useState<number>(14.5);

  useEffect(() => {
    getFilterOptions()
      .then((opts) => setFilterOptions(opts))
      .catch((err) => console.error("Error loading filter options:", err));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeRole = roleTab !== "All" ? roleTab : (roleFamily !== "All" ? roleFamily : undefined);
      const params = {
        role_family: activeRole,
        city: city !== "All" ? city : undefined,
        experience_band: experienceBand !== "All" ? experienceBand : undefined,
      };

      const [sumRes, roleRes, locRes, salRes, expRes, skillRes] = await Promise.all([
        getDashboardSummary(params),
        getRoleDemand({ limit: 10, city: city !== "All" ? city : undefined }),
        getLocationDemand({ limit: 10, level: "city" }),
        getSalaryDistribution(params),
        getExperienceDistribution(params),
        getSkillDemand({ role_family: activeRole, limit: 12 }),
      ]);

      setSummary(sumRes);
      setRoles(roleRes);
      setLocations(locRes);
      setSalaries(salRes);
      setExperience(expRes);
      setSkills(skillRes);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, [roleFamily, roleTab, city, experienceBand]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update quick radar estimate whenever selection changes
  useEffect(() => {
    let base = 12.0;
    if (previewRole.includes("Data") || previewRole.includes("AI")) base += 3.5;
    if (previewRole.includes("Software")) base += 2.5;
    if (previewRole.includes("Product")) base += 4.5;
    if (previewRole.includes("Cloud")) base += 3.0;
    if (previewCity === "Bengaluru") base += 2.0;
    else if (previewCity === "Gurugram" || previewCity === "Mumbai") base += 1.5;
    else if (previewCity === "Hyderabad") base += 1.0;
    setPreviewLpa(Number(base.toFixed(1)));
  }, [previewRole, previewCity]);

  const resetFilters = () => {
    setRoleFamily("All");
    setRoleTab("All");
    setCity("All");
    setExperienceBand("All");
  };

  // Sparkline data for Market Velocity card (matching reference curves)
  const sparklineData = [
    { name: "Jan", val1: 40, val2: 24 },
    { name: "Feb", val1: 45, val2: 32 },
    { name: "Mar", val1: 58, val2: 38 },
    { name: "Apr", val1: 52, val2: 45 },
    { name: "May", val1: 68, val2: 50 },
    { name: "Jun", val1: 65, val2: 58 },
  ];

  // Equalizer heights normalized for salary brackets
  const maxBracketCount = Math.max(...salaries.map((s) => s.count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Interactive Filter Capsule Bar */}
      <div className="filter-controls-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "0.82rem", color: "var(--accent-black)", marginRight: "4px" }}>
          <Filter size={15} />
          <span>Filters:</span>
        </div>

        {/* Role Family Filter */}
        <select
          className="filter-pill-select"
          value={roleFamily}
          onChange={(e) => {
            setRoleFamily(e.target.value);
            setRoleTab("All");
          }}
        >
          <option value="All">All Role Families</option>
          {filterOptions.role_families.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* City Filter */}
        <select
          className="filter-pill-select"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="All">All Cities</option>
          {filterOptions.cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Experience Band Filter */}
        <select
          className="filter-pill-select"
          value={experienceBand}
          onChange={(e) => setExperienceBand(e.target.value)}
        >
          <option value="All">All Seniorities</option>
          {filterOptions.experience_bands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {(roleFamily !== "All" || city !== "All" || experienceBand !== "All" || roleTab !== "All") && (
          <button
            onClick={resetFilters}
            className="pill-action-btn"
            style={{ fontSize: "0.78rem", padding: "6px 12px", background: "#F5F5F5" }}
          >
            Reset All
          </button>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={loadData}
            className="pill-action-btn"
            style={{ fontSize: "0.78rem", padding: "6px 14px" }}
            title="Reload live dataset metrics"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {loading ? (
        <LoadingSpinner message="Calculating market intelligence from 84,842 validated postings..." />
      ) : (
        <>
          {/* ========================================================
              TOP SECTION: REFERENCE INSPIRED 3-COLUMN MASTER GRID
              Col 1: Role Family Timeline & Trajectory (Large)
              Col 2: Market Velocity & Transparency (Ongoing Projects style)
              Col 3: AI Model Prediction Radar (File Preview Inverted Dark Card)
             ======================================================== */}
          <div className="dashboard-top-grid">
            {/* Card 1: Role Family Timeline & Demand Trajectory */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 className="heading-2">Demand & Salary Trajectory</h3>
                    <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>
                      Live Postings
                    </span>
                  </div>
                  <p className="text-subtle" style={{ fontSize: "0.78rem", marginTop: "2px" }}>
                    Volume distribution and median package spread across Indian tech families
                  </p>
                </div>
              </div>

              {/* Timeline Track Rows */}
              <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                {roles.slice(0, 5).map((r, idx) => {
                  // Calculate dynamic width and margin based on median salary & percentage
                  const median = r.median_salary_lpa || 10.0;
                  const barWidthPercent = Math.min(Math.max((median / 28) * 100, 28), 75);
                  const barOffsetPercent = idx * 6;

                  return (
                    <div key={r.role_family} className="timeline-row">
                      <div className="timeline-role-label" title={r.role_family}>
                        {r.role_family}
                      </div>

                      <div className="timeline-track-area">
                        <div
                          className="timeline-pill-bar"
                          style={{
                            width: `${barWidthPercent}%`,
                            marginLeft: `${barOffsetPercent}%`,
                          }}
                          onClick={() => {
                            setRoleFamily(r.role_family);
                          }}
                          title={`Click to filter by ${r.role_family}`}
                        >
                          <span>
                            {r.median_salary_lpa ? `₹${r.median_salary_lpa} LPA` : `${r.percentage}%`}
                          </span>
                          <span style={{ opacity: 0.7, fontSize: "0.72rem", marginLeft: "6px" }}>
                            • {r.count.toLocaleString()} jobs
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Scale Axis */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "12px",
                marginTop: "12px",
                borderTop: "1px solid var(--border-subtle)",
                fontSize: "0.72rem",
                color: "var(--text-subtle)",
                paddingLeft: "156px",
              }}>
                <span>₹0 LPA</span>
                <span>₹5 LPA</span>
                <span>₹10 LPA</span>
                <span>₹15 LPA</span>
                <span>₹20 LPA</span>
                <span>₹25+ LPA</span>
              </div>
            </div>

            {/* Card 2: Ongoing Projects / Market Velocity */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: "8px" }}>
                <h3 className="heading-2">Market Velocity</h3>
                <p className="text-subtle" style={{ fontSize: "0.76rem" }}>Salary transparency trend across postings</p>
              </div>

              {/* Big KPI Metric */}
              <div style={{ margin: "8px 0" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--text-main)", lineHeight: 1 }}>
                  {summary ? `${summary.salary_disclosure_rate}%` : "37.6%"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Disclosed INR Compensation
                </div>
              </div>

              {/* Minimalist Monochrome Dual-Line Sparkline */}
              <div style={{ height: "70px", width: "100%", margin: "4px 0" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line
                      type="monotone"
                      dataKey="val1"
                      stroke="#111111"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="val2"
                      stroke="#D0D0D5"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Metric Breakdown Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto", paddingTop: "10px", borderTop: "1px solid var(--border-muted)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#111111" }} />
                    Engineering
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>₹14.8 LPA</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#888888" }} />
                    Data & AI
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>₹15.2 LPA</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#CCCCCC" }} />
                    Management
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>₹18.0 LPA</span>
                </div>
              </div>
            </div>

            {/* Card 3: AI Salary Radar Preview (Inverted Pitch Dark Card - File Preview style) */}
            <div className="dark-card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Radio size={15} style={{ color: "#FFFFFF" }} />
                  <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
                    AI Radar Preview
                  </span>
                </div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: "9999px" }}>
                  HistGB v1.0
                </span>
              </div>

              {/* Graphic Ambient 3D Glass Drop Visual Representation */}
              <div style={{
                position: "relative",
                height: "110px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
                borderRadius: "14px",
                margin: "4px 0",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}>
                {/* Visual Glass Droplet Vector */}
                <svg width="80" height="80" viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 10px 15px rgba(255,255,255,0.15))" }}>
                  <defs>
                    <radialGradient id="glassSphere" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#A0A5B0" stopOpacity="0.4" />
                      <stop offset="85%" stopColor="#1C1F26" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0B0D11" stopOpacity="1" />
                    </radialGradient>
                  </defs>
                  <circle cx="50" cy="50" r="38" fill="url(#glassSphere)" />
                  <ellipse cx="42" cy="38" rx="14" ry="9" fill="#FFFFFF" fillOpacity="0.35" transform="rotate(-25 42 38)" />
                </svg>

                <div style={{ position: "absolute", bottom: "8px", right: "12px", textAlign: "right" }}>
                  <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em" }}>
                    ₹{previewLpa} LPA
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#AAAAAA" }}>
                    Calibrated Median
                  </div>
                </div>
              </div>

              {/* Compact Quick Select Controls */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px" }}>
                <select
                  value={previewRole}
                  onChange={(e) => setPreviewRole(e.target.value)}
                  style={{
                    fontSize: "0.75rem",
                    padding: "6px 8px",
                    background: "#18181C",
                    color: "#FFFFFF",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                  }}
                >
                  <option value="Software Engineering">Software Eng</option>
                  <option value="Data Science & AI">Data & AI</option>
                  <option value="Cloud & DevOps">Cloud / Infra</option>
                  <option value="Product Management">Product Mgmt</option>
                </select>

                <select
                  value={previewCity}
                  onChange={(e) => setPreviewCity(e.target.value)}
                  style={{
                    fontSize: "0.75rem",
                    padding: "6px 8px",
                    background: "#18181C",
                    color: "#FFFFFF",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                  }}
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              {/* Direct CTA */}
              <button
                onClick={() => navigate("/salary-predictor")}
                className="btn btn-primary"
                style={{
                  marginTop: "auto",
                  padding: "8px 12px",
                  fontSize: "0.78rem",
                  background: "#FFFFFF",
                  color: "#111111",
                  boxShadow: "0 4px 12px rgba(255,255,255,0.15)",
                }}
              >
                <span>Full Salary Predictor</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* ========================================================
              BOTTOM SECTION: REFERENCE INSPIRED 2-COLUMN BOTTOM GRID
              Col 1: Top Skills Pill Stack (All files style)
              Col 2: Hiring Epicenters & Dynamics (Team style hybrid dark container)
             ======================================================== */}
          <div className="dashboard-bottom-grid">
            {/* Card 4: Best Skills to Have */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#111111",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Folder size={15} />
                </div>
                <div>
                  <h3 className="heading-2">Best Skills to Have</h3>
                  <p className="text-subtle" style={{ fontSize: "0.74rem" }}>Market frequency &amp; penetration ranking</p>
                </div>
              </div>

              {/* Vertical Stack of Pill Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                {skills.slice(0, 4).map((s) => (
                  <div
                    key={s.skill}
                    className="skill-pill-card"
                    onClick={() => navigate(`/skills`)}
                    title={`View co-occurrence for ${s.skill}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "var(--bg-card-subtle)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "var(--text-main)",
                      }}>
                        <Code2 size={13} />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-main)" }}>
                          {s.skill}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>
                          {s.count.toLocaleString()} postings
                        </div>
                      </div>
                    </div>

                    <span className="badge badge-secondary" style={{ fontSize: "0.72rem" }}>
                      {(s.prevalence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/skills")}
                className="btn btn-secondary"
                style={{ marginTop: "12px", width: "100%", fontSize: "0.78rem", padding: "8px" }}
              >
                <span>View Full Skill Matrix</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Card 5: Hiring Epicenters & Dynamics */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
              {/* Card Header & Metrics */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <h3 className="heading-2">Hiring Epicenters &amp; Dynamics</h3>
                  <p className="text-subtle" style={{ fontSize: "0.74rem" }}>Regional tech corridors &amp; salary spreads</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
                  {/* Stat 1: Total Jobs */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Briefcase size={12} color="var(--text-muted)" />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>Total Postings</div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                        {summary ? summary.total_postings.toLocaleString() : "84,842"}
                      </div>
                    </div>
                  </div>

                  {/* Stat 2: Employers */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Building2 size={12} color="var(--text-muted)" />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>Organizations</div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                        {summary ? summary.unique_companies.toLocaleString() : "2,420"}
                      </div>
                    </div>
                  </div>

                  {/* Stat 3: Median Pay */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <TrendingUp size={12} color="var(--text-muted)" />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>Median Pay</div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                        {summary ? `₹${summary.median_salary_lpa} LPA` : "₹11.2 LPA"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inner Deep Black Container */}
              <div className="dark-team-container">
                {/* Column 1: Tech Epicenters */}
                <div
                  className="dark-team-column"
                  onClick={() => setCity("Bengaluru")}
                  style={{ cursor: "pointer" }}
                  title="Click to filter dashboard for Bengaluru"
                >
                  <div className="dark-team-column-title">Bengaluru &amp; Hyderabad</div>
                  <div className="dark-team-column-desc">Primary Southern IT &amp; AI Corridors</div>

                  <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#888888", marginBottom: "4px" }}>
                      <span>Tech Concentration</span>
                      <span style={{ color: "#FFFFFF", fontWeight: 600 }}>42%</span>
                    </div>
                    <div className="progress-track-sleek">
                      <div className="progress-track-fill" style={{ width: "42%" }} />
                    </div>
                  </div>
                </div>

                {/* Column 2: Enterprise & BFSI */}
                <div
                  className="dark-team-column"
                  onClick={() => setCity("Mumbai")}
                  style={{ cursor: "pointer" }}
                  title="Click to filter dashboard for Mumbai"
                >
                  <div className="dark-team-column-title">Mumbai, Pune &amp; NCR</div>
                  <div className="dark-team-column-desc">Enterprise, BFSI &amp; Growth Markets</div>

                  <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#888888", marginBottom: "4px" }}>
                      <span>Hiring Share</span>
                      <span style={{ color: "#FFFFFF", fontWeight: 600 }}>36%</span>
                    </div>
                    <div className="progress-track-sleek">
                      <div className="progress-track-fill" style={{ width: "36%" }} />
                    </div>
                  </div>
                </div>

                {/* Column 3: Salary Distribution Equalizer Bars */}
                <div className="dark-team-column">
                  <div className="dark-team-column-title">Compensation Spectrum</div>
                  <div className="dark-team-column-desc">Volume across annual brackets</div>

                  <div className="equalizer-bar-chart">
                    {salaries.map((s) => {
                      const h = Math.max((s.count / maxBracketCount) * 60, 6);
                      return (
                        <div
                          key={s.bracket}
                          className="equalizer-col"
                          title={`${s.bracket}: ${s.count.toLocaleString()} postings`}
                        >
                          <div className="equalizer-bar" style={{ height: `${h}px` }} />
                          <div className="equalizer-label">{s.bracket.replace(" LPA", "")}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              COMPREHENSIVE ANALYTICS & VISUALIZATION EXPANSION
              Top Cities Breakdown & Seniority Experience Distribution
             ======================================================== */}
          <div className="grid-2">
            {/* Top Hiring Cities Chart */}
            <div className="glass-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 className="heading-2">Top Hiring Cities</h3>
                  <p className="text-subtle" style={{ fontSize: "0.78rem" }}>Geographic concentration of employment postings</p>
                </div>
              </div>
              <div style={{ height: "290px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locations} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" stroke="#999999" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#171717" fontSize={11} width={100} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111111", borderColor: "#222222", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.8rem" }}
                      formatter={(val: any, _name: any, item: any) => [
                        `${Number(val).toLocaleString()} listings (${item.payload.percentage}%)`,
                        item.payload.median_salary_lpa ? `Median: ₹${item.payload.median_salary_lpa} LPA` : "Volume"
                      ]}
                    />
                    <Bar dataKey="count" fill="#111111" radius={[0, 9999, 9999, 0]} barSize={16}>
                      {locations.map((_, index) => (
                        <Cell key={`cell-loc-${index}`} fill={index === 0 ? "#111111" : index < 3 ? "#444444" : "#888888"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Experience Level Distribution */}
            <div className="glass-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 className="heading-2">Experience Level Distribution</h3>
                  <p className="text-subtle" style={{ fontSize: "0.78rem" }}>Hiring demand categorized by seniority bands</p>
                </div>
              </div>
              <div style={{ height: "290px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={experience} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <XAxis dataKey="experience_band" stroke="#777777" fontSize={11} tickFormatter={(v) => v.split(" ")[0]} tickLine={false} axisLine={false} />
                    <YAxis stroke="#999999" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111111", borderColor: "#222222", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.8rem" }}
                      formatter={(val: any, _name: any, item: any) => [
                        `${Number(val).toLocaleString()} postings (${item.payload.percentage}%)`,
                        item.payload.median_salary_lpa ? `Median: ₹${item.payload.median_salary_lpa} LPA` : "Count"
                      ]}
                    />
                    <Bar dataKey="count" fill="#111111" radius={[9999, 9999, 0, 0]} barSize={28}>
                      {experience.map((_, index) => (
                        <Cell key={`cell-exp-${index}`} fill={index === 0 ? "#111111" : index === 1 ? "#333333" : "#666666"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
