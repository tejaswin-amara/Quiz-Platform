import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders glass ui header", () => {
  render(<App />);
  expect(screen.getByText(/glass ui/i)).toBeInTheDocument();
});
