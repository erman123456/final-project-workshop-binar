import React, { useState } from "react";
import { ProjectForm } from "./ProjectForm";
import "./App.css";

// Define an interface for the expected project data structure
// This is a guess; you should adjust it to match your actual API response
interface ProjectStructure {
  projectName: string;
  structure: object;
}

function App() {
  // State to manage the API call lifecycle
  const [projectData, setProjectData] = useState<ProjectStructure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProjectSubmit = async (projectName: string) => {
    // 1. Reset state and start loading
    setIsLoading(true);
    setError(null);
    setProjectData(null);

    try {
      // NOTE: Replace this with your friend's actual backend API endpoint
      const response = await fetch(
        "http://localhost:8000/api/initiate-project",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectName }),
        }
      );

      // Handle bad responses from the server (e.g., 400 or 500 errors)
      if (!response.ok) {
        // Try to get a specific error message from the backend, or use a default one
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Something went wrong with the API."
        );
      }

      const data: ProjectStructure = await response.json();
      setProjectData(data); // 2. On success, set the project data
    } catch (err: any) {
      // Handle network errors or errors thrown from the block above
      setError(err.message); // 3. On failure, set the error message
    } finally {
      // 4. Always stop loading, regardless of success or failure
      setIsLoading(false);
    }
  };

  // Helper function to render the response
  const renderResponse = () => {
    if (isLoading) {
      return <p>Initiating project, please wait...</p>;
    }

    if (error) {
      return <p style={{ color: "red" }}>Error: {error}</p>;
    }

    if (projectData) {
      return (
        <div className="response-container">
          <h2>Project '{projectData.projectName}' Initiated!</h2>
          <h3>Generated Project Structure:</h3>
          {/* The <pre> tag is great for displaying formatted JSON */}
          <pre>{JSON.stringify(projectData.structure, null, 2)}</pre>
        </div>
      );
    }

    // By default, render nothing
    return null;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Project Initiator</h1>
        {/* <p>Enter a project name in kebab-case to generate a new project.</p> */}
        <ProjectForm onSubmit={handleProjectSubmit} />
        <div className="response-area">{renderResponse()}</div>
      </header>
    </div>
  );
}

export default App;
