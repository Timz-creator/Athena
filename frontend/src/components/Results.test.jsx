import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Results from "./Results";

test("renders winner correctly", () => {
  const mockResults = {
    winner: "blue",
    blue_survived: 2,
    red_survived: 0,
    agents: [],
  };

  render(<Results results={mockResults} />);
  expect(screen.getByText(/BLUE \/\/ VICTORY/i)).toBeInTheDocument();
});

test("renders pending state when no results", () => {
  render(<Results results={null} />);
  expect(screen.getByText(/PENDING/i)).toBeInTheDocument();
});

test("renders red winner correctly", () => {
  const mockResults = {
    winner: "red",
    blue_survived: 0,
    red_survived: 2,
    agents: [],
  };
  render(<Results results={mockResults} />);
  expect(screen.getByText(/RED \/\/ VICTORY/i)).toBeInTheDocument();
});
