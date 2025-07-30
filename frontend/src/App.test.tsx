import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

// We're changing the test description to be more accurate.
test("renders the main project initiator heading", () => {
  // 1. Render the App component
  render(<App />);

  // 2. Look for a heading element with the name "Project Initiator"
  // Using getByRole is more semantic and resilient than searching for text.
  const headingElement = screen.getByRole("heading", {
    name: /project initiator/i,
  });

  // 3. Assert that this heading element is actually in the document.
  expect(headingElement).toBeInTheDocument();
});

// You can also add a test to ensure the form is being rendered inside the App
test("renders the project form component", () => {
  render(<App />);

  // A simple way to check if our form is there is to look for its button.
  const buttonElement = screen.getByRole("button", {
    name: /initiate project/i,
  });
  expect(buttonElement).toBeInTheDocument();
});
