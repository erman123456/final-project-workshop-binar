import React from "react";
// render: Renders the component into a virtual DOM
// screen: A utility to find elements on the "screen"
// fireEvent: A utility to dispatch DOM events
import { render, screen, fireEvent } from "@testing-library/react";
// user-event is a companion library that simulates user interactions more realistically
import userEvent from "@testing-library/user-event";
import { ProjectForm } from "./ProjectForm";

// 'describe' groups related tests together into a test suite.
describe("ProjectForm", () => {
  // Test Case 1: Checks that the component renders without crashing.
  test("renders the form with input and submit button", () => {
    // A mock function that does nothing, to satisfy the onSubmit prop requirement.
    const mockSubmit = jest.fn();
    render(<ProjectForm onSubmit={mockSubmit} />);

    // Check if the input field is on the screen, finding it by its label.
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();

    // Check if the button is on the screen, finding it by its role and name.
    expect(
      screen.getByRole("button", { name: /initiate project/i })
    ).toBeInTheDocument();
  });

  // Test Case 2: Simulates submitting the form with an empty input.
  test("shows an error message if the project name is empty on submit", async () => {
    const mockSubmit = jest.fn();
    render(<ProjectForm onSubmit={mockSubmit} />);

    const submitButton = screen.getByRole("button", {
      name: /initiate project/i,
    });

    // Simulate a user clicking the submit button.
    await userEvent.click(submitButton);

    // Assert that the specific error message is now visible.
    expect(
      screen.getByText("Project name cannot be empty.")
    ).toBeInTheDocument();

    // Assert that the onSubmit prop function was NOT called.
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  // Test Case 3: Simulates submitting the form with an invalid format.
  test("shows an error message if the project name is not in kebab-case", async () => {
    const mockSubmit = jest.fn();
    render(<ProjectForm onSubmit={mockSubmit} />);

    const input = screen.getByLabelText(/project name/i);
    const submitButton = screen.getByRole("button", {
      name: /initiate project/i,
    });

    // Simulate a user typing an invalid name into the input.
    await userEvent.type(input, "This Is Not Kebab Case");
    await userEvent.click(submitButton);

    // Assert that the correct error message is displayed.
    expect(
      screen.getByText(/Project name must be in kebab-case/i)
    ).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  // Test Case 4: A successful submission with valid input.
  test("calls the onSubmit prop with the project name when input is valid", async () => {
    const mockSubmit = jest.fn();
    render(<ProjectForm onSubmit={mockSubmit} />);

    const input = screen.getByLabelText(/project name/i);
    const submitButton = screen.getByRole("button", {
      name: /initiate project/i,
    });
    const validProjectName = "my-valid-project";

    // Simulate typing a valid name.
    await userEvent.type(input, validProjectName);
    await userEvent.click(submitButton);

    // Assert that the onSubmit prop function WAS called.
    expect(mockSubmit).toHaveBeenCalledTimes(1);

    // Assert that it was called with the correct argument.
    expect(mockSubmit).toHaveBeenCalledWith(validProjectName);

    // Assert that no error message is visible. queryByText returns null if not found.
    expect(
      screen.queryByText(/project name cannot be empty/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/project name must be in kebab-case/i)
    ).not.toBeInTheDocument();
  });
});
