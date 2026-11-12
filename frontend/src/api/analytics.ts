import { api } from "./client";
import type {
  DashboardSummary,
  RoleDemandItem,
  LocationDemandItem,
  ExperienceDistributionItem,
  SalaryDistributionItem,
  SkillDemandItem,
} from "../types";

export interface AnalyticsFilterParams {
  role_family?: string;
  city?: string;
  experience_band?: string;
}

export async function getDashboardSummary(params?: AnalyticsFilterParams): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>("/analytics/summary", { params });
  return response.data;
}

export async function getRoleDemand(params?: { limit?: number; city?: string }): Promise<RoleDemandItem[]> {
  const response = await api.get<{ roles: RoleDemandItem[] }>("/analytics/roles", { params });
  return response.data.roles;
}

export async function getLocationDemand(params?: { limit?: number; level?: "city" | "state" }): Promise<LocationDemandItem[]> {
  const response = await api.get<{ locations: LocationDemandItem[] }>("/analytics/locations", { params });
  return response.data.locations;
}

export async function getExperienceDistribution(params?: AnalyticsFilterParams): Promise<ExperienceDistributionItem[]> {
  const response = await api.get<{ distribution: ExperienceDistributionItem[] }>("/analytics/experience", { params });
  return response.data.distribution;
}

export async function getSalaryDistribution(params?: AnalyticsFilterParams): Promise<SalaryDistributionItem[]> {
  const response = await api.get<{ distribution: SalaryDistributionItem[] }>("/analytics/salaries", { params });
  return response.data.distribution;
}

export async function getSkillDemand(params?: { role_family?: string; limit?: number }): Promise<SkillDemandItem[]> {
  const response = await api.get<{ skills: SkillDemandItem[] }>("/analytics/skills", { params });
  return response.data.skills;
}

export async function getFilterOptions(): Promise<{
  role_families: string[];
  cities: string[];
  experience_bands: string[];
  work_modes: string[];
}> {
  const response = await api.get("/analytics/filter-options");
  return response.data;
}
