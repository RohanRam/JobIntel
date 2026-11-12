import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ErrorMessage } from "../components/common/ErrorMessage";

describe("ErrorMessage Component", () => {
  it("renders message and calls retry callback on click", () => {
    const handleRetry = vi.fn();
    render(
      <ErrorMessage
        title="Failed to fetch"
        message="Network request timed out"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText("Failed to fetch")).toBeDefined();
    expect(screen.getByText("Network request timed out")).toBeDefined();

    const button = screen.getByText("Retry");
    fireEvent.click(button);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});

