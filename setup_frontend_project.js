const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Define a port that is not 3000 or 3001
const PORT = 8080;

// 1. Get the project name from the command-line argument
const projectName = process.argv[2];

// 2. Validate the input
if (!projectName || projectName.trim() === "") {
  console.error("Error: Please provide a project name.");
  console.log("Usage: node setup_frontend_projects.js <project-name>");
  process.exit(1); // Exit with an error code
}

console.log(`Creating project: ${projectName}...`);

const projectPath = path.join(process.cwd(), projectName);

// Prevent overwriting an existing directory
if (fs.existsSync(projectPath)) {
  console.error(`Error: Directory '${projectName}' already exists.`);
  process.exit(1);
}

// 3. Create the project directory
fs.mkdirSync(projectPath);

// 4. Define content for the project files
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Welcome to ${projectName}!</h1>
    <p>Your development server is running on port ${PORT}.</p>
    <p>You can start editing the files in the '${projectName}' directory.</p>
    <script src="app.js"></script>
</body>
</html>`;

const cssContent = `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #282c34;
  color: white;
  text-align: center;
}

h1 {
  color: #61dafb;
  font-size: 2.5rem;
}`;

const jsContent = `console.log('Hello from ${projectName}! The app is running.');`;

const serverContent = `const http = require('http');
const fs = require('fs');
const path = require('path');
const open = require('open');

const PORT = ${PORT};

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    const url = \`http://localhost:\${PORT}\`;
    console.log(\`✅ Server is running successfully at \${url}\`);
    open(url); // Automatically open the browser
});
`;

const packageJsonContent = {
  name: projectName.toLowerCase().replace(/\s+/g, "-"),
  version: "1.0.0",
  description: `A base frontend project named ${projectName}`,
  main: "server.js",
  scripts: {
    start: "node server.js",
  },
  author: "",
  license: "ISC",
  dependencies: {
    open: "^8.4.0",
  },
};

// 5. Write files to the new directory
try {
  fs.writeFileSync(path.join(projectPath, "index.html"), htmlContent);
  fs.writeFileSync(path.join(projectPath, "styles.css"), cssContent);
  fs.writeFileSync(path.join(projectPath, "app.js"), jsContent);
  fs.writeFileSync(path.join(projectPath, "server.js"), serverContent);
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJsonContent, null, 2)
  );
  console.log("✅ Project files generated successfully!");
} catch (error) {
  console.error("Error writing project files:", error);
  process.exit(1);
}

// 6. Install dependencies and run the project
console.log("📦 Installing dependencies... This may take a moment.");

// Use 'npm install' which is cross-platform
exec(`cd "${projectPath}" && npm install`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error during dependency installation: ${error.message}`);
    return;
  }
  if (stderr) {
    // npm warnings are often sent to stderr, so we don't always treat it as a fatal error
    console.log(`npm install details: ${stderr}`);
  }
  console.log("✅ Dependencies installed.");
  console.log("🚀 Starting the development server...");

  // Run the start script defined in package.json
  // We use `spawn` here to get live output from the server
  const { spawn } = require("child_process");
  const serverProcess = spawn("npm", ["start"], {
    cwd: projectPath, // Set the working directory
    shell: true, // Important for running npm on Windows
    stdio: "inherit", // Pipe the child process's stdio to the parent
  });

  serverProcess.on("error", (err) => {
    console.error("Failed to start server process.", err);
  });
});
