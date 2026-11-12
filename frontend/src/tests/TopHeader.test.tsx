import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { TopHeader } from "../components/layout/TopHeader";

// Mock API client
vi.mock("../api/client", () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: {
        status: "ok",
        model_loaded: true,
        dataset_loaded: true,
        total_records: 84842,
      },
    }),
  },
}));

describe("TopHeader Component", () => {
  it("renders header title and clean live status badge", async () => {
    render(
      <BrowserRouter>
        <TopHeader />
      </BrowserRouter>
    );

    // Page title
    expect(screen.getByText("Job Market Intelligence")).toBeDefined();
    // Clean status badge
    expect(screen.getByText("HistGB Model v1.0 Online")).toBeDefined();
    expect(screen.getByText("84,842 Postings")).toBeDefined();
  });
});