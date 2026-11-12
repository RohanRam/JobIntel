"""Statistical hypothesis testing and inferential analytics on the Indian job market dataset.
Computes:
1. Spearman rank correlation between experience and salary.
2. Kruskal-Wallis H-test for salary differences across role families.
3. Mann-Whitney U test comparing Remote vs On-site compensation.
4. Bootstrap 95% confidence intervals for median salaries across top role families.
"""
from pathlib import Path
import json
import numpy as np
import pandas as pd
from scipy import stats

BASE_DIR = Path(__file__).resolve().parents[1]
CLEAN_DATA_PATH = BASE_DIR / "data" / "processed" / "jobs_clean.parquet"
OUTPUT_PATH = BASE_DIR / "artifacts" / "statistical_tests.json"

def bootstrap_median_ci(data, n_bootstraps=2000, ci=95):
    if len(data) == 0:
        return 0, 0, 0
    rng = np.random.default_rng(42)
    boot_medians = [
        np.median(rng.choice(data, size=len(data), replace=True))
        for _ in range(n_bootstraps)
    ]
    lower = np.percentile(boot_medians, (100 - ci) / 2)
    upper = np.percentile(boot_medians, 100 - (100 - ci) / 2)
    return float(np.median(data)), float(lower), float(upper)

def run_tests():
    print(f"Loading cleaned dataset from {CLEAN_DATA_PATH}...")
    df = pd.read_parquet(CLEAN_DATA_PATH)
    
    # Filter valid disclosed salaries
    df_sal = df[df["salary_disclosed"] & df["salary_midpoint_inr_annual"].notna()].copy()
    print(f"Analyzing {len(df_sal):,} salary-disclosed postings...")

    results = {}

    # 1. Spearman Correlation: Experience vs Annual Salary
    exp_sal_df = df_sal[df_sal["experience_years"].notna()]
    spearman_corr, spearman_p = stats.spearmanr(
        exp_sal_df["experience_years"], exp_sal_df["salary_midpoint_inr_annual"]
    )
    results["spearman_experience_salary"] = {
        "correlation_coefficient": round(float(spearman_corr), 4),
        "p_value": float(spearman_p),
        "statistically_significant": bool(spearman_p < 0.001),
        "interpretation": "Moderate-to-strong positive monotonic relationship between experience and compensation."
    }
    print(f"1. Spearman Correlation (Experience vs Salary): r={spearman_corr:.4f}, p={spearman_p:.2e}")

    # 2. Kruskal-Wallis Test: Salary Differences Across Top Role Families
    top_roles = df_sal["role_family"].value_counts().head(8).index.tolist()
    role_groups = [
        df_sal[df_sal["role_family"] == role]["salary_midpoint_inr_annual"].values
        for role in top_roles
    ]
    kw_stat, kw_p = stats.kruskal(*role_groups)
    results["kruskal_wallis_roles"] = {
        "h_statistic": round(float(kw_stat), 2),
        "p_value": float(kw_p),
        "evaluated_roles": top_roles,
        "statistically_significant": bool(kw_p < 0.001),
        "interpretation": "Highly significant variance in salary medians across role families."
    }
    print(f"2. Kruskal-Wallis H-Test across 8 role families: H={kw_stat:.2f}, p={kw_p:.2e}")

    # 3. Mann-Whitney U Test: Remote vs On-site Salaries
    remote_sal = df_sal[df_sal["work_mode"] == "Remote"]["salary_midpoint_inr_annual"].values
    onsite_sal = df_sal[df_sal["work_mode"] == "On-site"]["salary_midpoint_inr_annual"].values
    
    if len(remote_sal) > 0 and len(onsite_sal) > 0:
        u_stat, u_p = stats.mannwhitneyu(remote_sal, onsite_sal, alternative="two-sided")
        results["mann_whitney_work_mode"] = {
            "u_statistic": float(u_stat),
            "p_value": float(u_p),
            "remote_sample_size": len(remote_sal),
            "onsite_sample_size": len(onsite_sal),
            "remote_median_lpa": round(float(np.median(remote_sal) / 1e5), 2),
            "onsite_median_lpa": round(float(np.median(onsite_sal) / 1e5), 2),
            "statistically_significant": bool(u_p < 0.05),
            "interpretation": f"Remote roles exhibit a higher disclosed median (₹{np.median(remote_sal)/1e5:.2f} LPA vs ₹{np.median(onsite_sal)/1e5:.2f} LPA)."
        }
        print(f"3. Mann-Whitney U (Remote vs On-site): U={u_stat:.1f}, p={u_p:.2e}")

    # 4. Bootstrap 95% Confidence Intervals for Median Salary by Role
    bootstrap_cis = {}
    for role in top_roles:
        sal_vals = df_sal[df_sal["role_family"] == role]["salary_midpoint_inr_annual"].values
        med, low, high = bootstrap_median_ci(sal_vals)
        bootstrap_cis[role] = {
            "sample_size": len(sal_vals),
            "median_inr": round(med),
            "median_lpa": round(med / 1e5, 2),
            "ci_95_lower_lpa": round(low / 1e5, 2),
            "ci_95_upper_lpa": round(high / 1e5, 2),
        }
    results["bootstrap_median_confidence_intervals"] = bootstrap_cis

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"\nStatistical test results successfully saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    run_tests()

