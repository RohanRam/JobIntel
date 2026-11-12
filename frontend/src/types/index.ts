export interface DashboardSummary {
  total_postings: number;
  unique_companies: number;
  unique_locations: number;
  salary_disclosed_postings: number;
  salary_disclosure_rate: number;
  median_salary_inr: number;
  median_salary_lpa: number;
  mean_salary_inr: number;
  mean_salary_lpa: number;
  iqr_salary_lpa?: [number, number];
  dataset_name: string;
  snapshot_date?: string;
}

export interface RoleDemandItem {
  role_family: string;
  count: number;
  percentage: number;
  median_salary_lpa?: number;
  salary_sample_count?: number;
}

export interface LocationDemandItem {
  name: string;
  count: number;
  percentage: number;
  median_salary_lpa?: number;
}

export interface ExperienceDistributionItem {
  experience_band: string;
  count: number;
  percentage: number;
  median_salary_lpa?: number;
}

export interface SalaryDistributionItem {
  bracket: string;
  count: number;
  percentage: number;
}

export interface SkillDemandItem {
  skill: string;
  count: number;
  prevalence: number;
  role_family?: string;
  median_salary_lpa?: number;
}

export interface JobItem {
  job_id: string;
  job_title_raw: string;
  job_title_normalized: string;
  role_family: string;
  company_name: string;
  location_raw: string;
  city: string;
  state: string;
  min_experience_years: number | null;
  max_experience_years: number | null;
  salary_raw: string | null;
  salary_min_inr_annual: number | null;
  salary_max_inr_annual: number | null;
  salary_midpoint_inr_annual: number | null;
  salary_midpoint_lpa: number | null;
  salary_disclosed: boolean;
  work_mode: string;
  posted_age_raw: string;
  skills: string[];
  company_rating: number | null;
  company_reviews_count: number | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface SalaryPredictionRequest {
  job_title?: string;
  role_family: string;
  experience_years: number;
  city: string;
  state?: string;
  skills: string[];
  work_mode?: string;
}

export interface SalaryPredictionResponse {
  predicted_salary_inr_annual: number;
  predicted_salary_lpa: number;
  prediction_interval: {
    lower_inr: number;
    upper_inr: number;
    lower_lpa: number;
    upper_lpa: number;
    method: string;
    confidence_level: string;
  };
  currency: string;
  period: string;
  model_version: string;
  input_summary: {
    role_family: string;
    experience_years: number;
    city: string;
    skills_count: number;
    work_mode: string;
  };
  market_context?: {
    role_median_lpa: number;
    city_median_lpa: number;
    sample_size: number;
  };
  limitations: string[];
}

export interface SkillRecommendationRequest {
  target_role: string;
  current_skills: string[];
  city?: string;
  experience_band?: string;
}

export interface RecommendedSkill {
  skill: string;
  prevalence: number;
  priority: "high" | "medium" | "low";
  postings_count: number;
}

export interface SkillRecommendationResponse {
  target_role: string;
  market_sample_size: number;
  user_skills: string[];
  matched_skills: string[];
  missing_skills: RecommendedSkill[];
  coverage_score: number;
  coverage_pct: number;
  co_occurring_skills?: { skill_a: string; skill_b: string; count: number }[];
  interpretation: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  model_loaded: boolean;
  dataset_loaded: boolean;
  total_records?: number;
}

