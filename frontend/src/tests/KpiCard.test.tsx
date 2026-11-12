import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { KpiCard } from "../components/cards/KpiCard";

describe("KpiCard Component", () => {
  it("renders title, value, and subtitle correctly", () => {
    render(
      <KpiCard
        title="Total Postings"
        value="84,842"
        subtitle="Retained clean records"
        badge={{ text: "Active", variant: "primary" }}
      />
    );

    expect(screen.getByText("Total Postings")).toBeDefined();
    expect(screen.getByText("84,842")).toBeDefined();
    expect(screen.getByText("Retained clean records")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
  });
});

