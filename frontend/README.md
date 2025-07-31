# Project Initiator Frontend

A React TypeScript application that allows users to create new projects by submitting project names and receiving generated project structures from a backend API.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Features

- 📝 Project name input with kebab-case validation
- 🔄 Real-time API communication with backend
- ✅ Input validation and error handling
- 📊 Project structure visualization
- ⚡ Loading states and user feedback

## Tech Stack

- **React 19.1.1** with TypeScript
- **React Scripts 5.0.1** for build tooling
- **Testing Library** for component testing
- **CSS3** for styling

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API running on `http://localhost:8000`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

## Usage

1. Start the backend API server (should be running on `http://localhost:8000`)
2. Start the frontend development server:
   ```bash
   npm start
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser
4. Enter a project name in kebab-case format (e.g., `my-awesome-project`)
5. Click "Initiate Project" to submit the request
6. View the generated project structure in the response area

## API Integration

The application communicates with a backend API endpoint:

- **Endpoint**: `POST http://localhost:8000/api/initiate-project`
- **Request Body**: `{ "projectName": "your-project-name" }`
- **Response**: Project structure and metadata

## Project Structure

```
src/
├── App.tsx              # Main application component
├── App.css              # Application styles
├── ProjectForm.tsx      # Form component with validation
├── index.tsx           # React app entry point
├── index.css           # Global styles
└── __tests__/          # Test files
    ├── App.test.tsx
    └── ProjectForm.test.tsx
```

## Input Validation

The application enforces kebab-case naming convention:

- ✅ Valid: `my-project`, `awesome-app`, `web-service`
- ❌ Invalid: `MyProject`, `awesome_app`, `web service`

## Error Handling

The application handles various error scenarios:

- Network connectivity issues
- Backend API errors
- Invalid input validation
- Loading states with user feedback

## Development

To contribute to this project:

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Make your changes
5. Run tests: `npm test`
6. Build for production: `npm run build`

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
