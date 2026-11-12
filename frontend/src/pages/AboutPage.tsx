import React from "react";
import {
  Award,
  CheckCircle,
  Database,
  ShieldAlert,
} from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1200px" }}>
      {/* Title */}
      <div>
        <h2 className="heading-1">Methodology & Verification Report</h2>
        <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "2px" }}>
          Full documentation of dataset provenance, preprocessing pipeline, ML regression architecture, and responsible use policies.
        </p>
      </div>

      {/* Model Performance Comparison Card */}
      <div className="glass-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#111111", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award size={16} />
          </div>
          <div>
            <h3 className="heading-2">Supervised Model Verification & Benchmark</h3>
            <p className="text-subtle" style={{ fontSize: "0.75rem" }}>Evaluated on an untouched 20% held-out test split (6,380 salary-disclosed postings)</p>
          </div>
        </div>

        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.6 }}>
          The production model utilizes a <code className="mono" style={{ background: "#F5F5F5", padding: "2px 6px", borderRadius: "4px" }}>HistGradientBoostingRegressor</code> wrapped in a <code className="mono" style={{ background: "#F5F5F5", padding: "2px 6px", borderRadius: "4px" }}>log1p</code> target transformation to naturally respect the right-skewed salary distribution without predicting negative values.
        </p>

        {/* Comparison Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-subtle)" }}>
                <th style={{ padding: "10px 8px" }}>Model Architecture</th>
                <th style={{ padding: "10px 8px" }}>Test MAE (LPA)</th>
                <th style={{ padding: "10px 8px" }}>Median Abs Error (LPA)</th>
                <th style={{ padding: "10px 8px" }}>R² Score</th>
                <th style={{ padding: "10px 8px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-muted)" }}>
                <td style={{ padding: "12px 8px", fontWeight: 600 }}>Median Baseline (Dummy)</td>
                <td style={{ padding: "12px 8px", color: "var(--text-muted)" }}>₹4.82 LPA</td>
                <td style={{ padding: "12px 8px", color: "var(--text-muted)" }}>₹2.25 LPA</td>
                <td style={{ padding: "12px 8px", color: "var(--text-muted)" }}>0.0000</td>
                <td style={{ padding: "12px 8px" }}><span className="badge badge-secondary">Baseline</span></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-muted)" }}>
                <td style={{ padding: "12px 8px", fontWeight: 600 }}>Ridge Regression (Linear + L2)</td>
                <td style={{ padding: "12px 8px", color: "var(--text-muted)" }}>₹3.15 LPA</td>
                <td style={{ padding: "12px 8px", color: "var(--text-muted)" }}>₹1.32 LPA</td>
                <td style={{ padding: "12px 8px", color: "var(--text-muted)" }}>0.3120</td>
                <td style={{ padding: "12px 8px" }}><span className="badge badge-secondary">Linear</span></td>
              </tr>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)" }}>
                <td style={{ padding: "12px 8px", fontWeight: 700, color: "var(--text-main)" }}>
                  HistGradientBoostingRegressor (Selected)
                </td>
                <td style={{ padding: "12px 8px", fontWeight: 700, color: "var(--text-main)" }}>₹2.94 LPA</td>
                <td style={{ padding: "12px 8px", fontWeight: 700, color: "var(--text-main)" }}>₹1.05 LPA</td>
                <td style={{ padding: "12px 8px", fontWeight: 700, color: "var(--text-main)" }}>0.4071</td>
                <td style={{ padding: "12px 8px" }}><span className="badge badge-primary">Deployed (Active)</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Provenance */}
      <div className="glass-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Database size={16} />
          </div>
          <div>
            <h3 className="heading-2">Dataset Provenance & Quality Metrics</h3>
            <p className="text-subtle" style={{ fontSize: "0.75rem" }}>Ingestion, deduplication, and parsing summary</p>
          </div>
        </div>

        <div className="grid-3" style={{ marginBottom: "16px" }}>
          <div style={{ padding: "14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700 }}>Source Ingestion</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)", marginTop: "4px" }}>97,929 Postings</div>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>Indian Job Market Dataset 2025–2026</span>
          </div>

          <div style={{ padding: "14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700 }}>Cleaned & Retained</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)", marginTop: "4px" }}>84,842 Postings</div>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>13,087 duplicate/corrupt rows purged</span>
          </div>

          <div style={{ padding: "14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700 }}>Salary Transparency</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)", marginTop: "4px" }}>31,900 Records (37.6%)</div>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>Valid, non-zero annual INR bounds</span>
          </div>
        </div>

        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          The data cleaning pipeline normalizes Indian location aliases (e.g., Bangalore → Bengaluru, Gurgaon → Gurugram, Bombay → Mumbai),
          extracts canonical tech skills (mapping 43,465 variants to consistent entities), and converts experience text into validated continuous numerical features.
        </p>
      </div>

      {/* Target Leakage Prevention & Data Pipeline */}
      <div className="glass-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle size={16} color="#10B981" />
          </div>
          <div>
            <h3 className="heading-2">Target Leakage Prevention</h3>
            <p className="text-subtle" style={{ fontSize: "0.75rem" }}>Architectural safeguards enforced across the ML pipeline</p>
          </div>
        </div>
        <ul style={{ paddingLeft: "1.2rem", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          <li><strong>No salary fields in model inputs:</strong> Raw salary, minimum salary, maximum salary, and currency fields are strictly isolated from model features.</li>
          <li><strong>No post-split target transformations:</strong> Preprocessing pipelines, scalers, imputers, and CountVectorizers are fit exclusively on the training folds.</li>
          <li><strong>Missing Salary Policy:</strong> Non-disclosed salaries are excluded from the supervised regression target rather than imputed to zero, preventing severe artificial downward bias.</li>
        </ul>
      </div>

      {/* Responsible Use & Limitations */}
      <div className="glass-card" style={{ border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldAlert size={16} color="#EF4444" />
          </div>
          <div>
            <h3 className="heading-2">Responsible Use & Limitations</h3>
            <p className="text-subtle" style={{ fontSize: "0.75rem" }}>Statistical disclaimer & fair use policies</p>
          </div>
        </div>
        <ul style={{ paddingLeft: "1.2rem", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          <li><strong>Not a guaranteed offer or formal benchmark:</strong> Salary predictions represent estimated statistical expectations based on observed historical postings, not a legally binding compensation offer.</li>
          <li><strong>Disclosure Selection Bias:</strong> Employers that disclose salary publicly on Indian job boards may differ systematically in size, industry, or policy from those that keep compensation confidential.</li>
          <li><strong>Skill Gap Interpretation:</strong> The skill-gap score reflects alignment with skills frequently cited in this dataset's listings. It is not an assessment of personal competency or guarantee of interview selection.</li>
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;
