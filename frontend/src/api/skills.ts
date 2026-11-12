import { api } from "./client";
import type { SkillRecommendationRequest, SkillRecommendationResponse } from "../types";

export async function getSkillRecommendations(
  payload: SkillRecommendationRequest
): Promise<SkillRecommendationResponse> {
  const response = await api.post<SkillRecommendationResponse>("/skills/recommend", payload);
  return response.data;
}

export async function getCommonSkills(params?: {
  role_family?: string;
  limit?: number;
}): Promise<{ skills: { skill: string; count: number; prevalence: number }[] }> {
  const response = await api.get("/skills/common", { params });
  return response.data;
}
