import { api } from "./client";
import type { SalaryPredictionRequest, SalaryPredictionResponse } from "../types";

export async function predictSalary(payload: SalaryPredictionRequest): Promise<SalaryPredictionResponse> {
  const response = await api.post<SalaryPredictionResponse>("/predictions/salary", payload);
  return response.data;
}

export async function getModelMetadata(): Promise<{
  model_name: string;
  model_version: string;
  target: string;
  metrics: {
    mae_inr: number;
    mae_lpa: number;
    median_absolute_error_inr: number;
    median_absolute_error_lpa: number;
    rmse_inr: number;
    rmse_lpa: number;
    r2: number;
  };
  features: string[];
  training_date: string;
  train_sample_size: number;
  test_sample_size: number;
}> {
  const response = await api.get("/predictions/metadata");
  return response.data;
}
