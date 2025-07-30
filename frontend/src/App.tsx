import React, { useState } from "react";
import "./App.css";
// ... other imports
import { ProjectForm } from "./ProjectForm";

function App() {
  const handleProjectSubmit = (projectName: string) => {
    console.log("Submitting project:", projectName);
    // Here you would call your API endpoint
    // await fetch('YOUR_API_ENDPOINT', { ... });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Project Initiator</h1>
        <ProjectForm onSubmit={handleProjectSubmit} />
      </header>
    </div>
  );
}

export default App;
