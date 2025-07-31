import React, { useEffect, useState } from "react";

// A simple regex to check for kebab-case.
// It allows lowercase letters, numbers, and hyphens.
// It ensures the string doesn't start or end with a hyphen.
const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// We define the props the component will accept.
// onSubmit is a function that will be called with the valid project name.
interface ProjectFormProps {
  onSubmit: (projectName: string) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit }) => {
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateInput = (name: string): boolean => {
    if (!name) {
      setError("Project name cannot be empty.");
      return false;
    }
    if (!KEBAB_CASE_REGEX.test(name)) {
      setError(
        "Project name must be in kebab-case. (e.g., my-awesome-project)"
      );
      return false;
    }
    setError(null); // Clear error if validation passes
    return true;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateInput(projectName)) {
      // If valid, call the function passed in via props
      onSubmit(projectName);
    }
  };

  useEffect(() => {
    if (projectName === "") {
      setError("");
    }
  }, [projectName]);

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="project-form"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <label htmlFor="projectName" style={{ textAlign: "center" }}>
          Input your project name in kebab-case:
        </label>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g., my-new-project"
        />
        <button type="submit">Initiate Project</button>
      </div>
      {/* Conditionally render the error message */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};
