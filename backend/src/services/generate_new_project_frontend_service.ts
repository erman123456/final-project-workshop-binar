import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { spawn, exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class GenerateNewProjectFrontendService {
  private readonly PORT = 8080;

  constructor() {}

  async runShellCommand(
    command: string,
    args: string[] = [],
    options: { cwd?: string; stdio?: 'inherit' | 'pipe' | 'ignore' } = {},
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`\nExecuting command: ${command} ${args.join(' ')}`);

      const child = spawn(command, args, {
        stdio: 'inherit',
        ...options,
      });

      child.on('error', (err: Error) => {
        console.error(`Failed to start process '${command}': ${err.message}`);
        reject(err);
      });

      child.on('close', (code: number | null) => {
        if (code === 0) {
          console.log(`Command '${command}' completed successfully.`);
          resolve();
        } else {
          const errorMessage = `Command '${command}' exited with code ${code}`;
          console.error(errorMessage);
          reject(new Error(errorMessage));
        }
      });
    });
  }

  async setupReactProject(projectName: string): Promise<boolean> {
    try {
      console.log('--- Starting React Project Setup ---', projectName);

      // Set up paths
      const rootDir = path.resolve(__dirname, '../../../');
      const outputDir = path.join(rootDir, 'output');

      // Step 1: Ensure output directory exists
      console.log('\nSTEP 1: Creating output directory...');
      await fs.mkdir(outputDir, { recursive: true });
      console.log('Output directory ready.');

      // Create React app with TypeScript
      console.log(`\nCreating React TypeScript project: ${projectName}...`);
      await this.runShellCommand(
        'npx',
        ['create-react-app', projectName, '--template', 'typescript'],
        {
          cwd: outputDir, // Set working directory to output folder
          stdio: 'inherit',
        },
      );

      console.log(`React project '${projectName}' created successfully.`);
      return true;
    } catch (error: any) {
      console.error('!!! An error occurred during React project setup !!!');
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
      }
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async setupVanillaProject(projectName: string): Promise<boolean> {
    try {
      console.log(
        '--- Starting Vanilla Frontend Project Setup ---',
        projectName,
      );

      // Set up paths
      const rootDir = path.resolve(__dirname, '../../../');
      const outputDir = path.join(rootDir, 'output');
      const projectPath = path.join(outputDir, projectName);

      console.log(`Root directory: ${rootDir}`);
      console.log(`Output directory: ${outputDir}`);
      console.log(`Project path: ${projectPath}`);

      // Step 1: Ensure output directory exists
      console.log('\nSTEP 1: Creating output directory...');
      await fs.mkdir(outputDir, { recursive: true });
      console.log('Output directory ready.');

      // Step 2: Check if project directory already exists
      try {
        await fs.access(projectPath);
        const errorMsg = `Directory '${projectName}' already exists.`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error('Access check error:', error);
          throw error;
        }
        console.log('Project directory does not exist, proceeding...');
      }

      // Step 3: Create project directory
      console.log(`\nSTEP 3: Creating project directory: ${projectName}...`);
      await fs.mkdir(projectPath, { recursive: true });
      console.log('Project directory created successfully.');

      // Step 4: Generate project files
      console.log('\nSTEP 4: Generating project files...');
      await this.generateProjectFiles(projectPath, projectName);

      // Step 5: Install dependencies
      console.log('\nSTEP 5: Installing dependencies...');
      await this.installDependencies(projectPath);

      // Step 6: Start the development server
      console.log('\nSTEP 6: Starting the development server...');
      await this.startDevelopmentServer(projectPath);

      console.log(
        `✅ Vanilla frontend project '${projectName}' created successfully.`,
      );
      return true;
    } catch (error: any) {
      console.error('!!! An error occurred during vanilla project setup !!!');
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      throw new HttpException(error.message || error, HttpStatus.BAD_REQUEST);
    }
  }

  private async generateProjectFiles(
    projectPath: string,
    projectName: string,
  ): Promise<void> {
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
    <p>Your development server is running on port ${this.PORT}.</p>
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

const PORT = ${this.PORT};

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
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: `A base frontend project named ${projectName}`,
      main: 'server.js',
      scripts: {
        start: 'node server.js',
      },
      author: '',
      license: 'ISC',
      dependencies: {
        open: '^8.4.0',
      },
    };

    // Write files to the project directory
    await fs.writeFile(path.join(projectPath, 'index.html'), htmlContent);
    await fs.writeFile(path.join(projectPath, 'styles.css'), cssContent);
    await fs.writeFile(path.join(projectPath, 'app.js'), jsContent);
    await fs.writeFile(path.join(projectPath, 'server.js'), serverContent);
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJsonContent, null, 2),
    );

    console.log('✅ Project files generated successfully!');
  }

  private async installDependencies(projectPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📦 Installing dependencies... This may take a moment.');

      exec('npm install', { cwd: projectPath }, (error, stdout, stderr) => {
        if (error) {
          console.error(
            `Error during dependency installation: ${error.message}`,
          );
          reject(error);
          return;
        }

        if (stderr) {
          // npm warnings are often sent to stderr, so we don't always treat it as a fatal error
          console.log(`npm install details: ${stderr}`);
        }

        if (stdout) {
          console.log(`npm install output: ${stdout}`);
        }

        console.log('✅ Dependencies installed.');
        resolve();
      });
    });
  }

  private async startDevelopmentServer(projectPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting the development server...');

      // Use spawn to start the server as a background process
      const serverProcess = spawn('npm', ['start'], {
        cwd: projectPath,
        shell: true,
        stdio: 'pipe', // Use pipe to capture output
        detached: true, // Run as detached process
      });

      let serverStarted = false;
      const timeout = setTimeout(() => {
        if (!serverStarted) {
          console.log(
            '⏰ Server startup timeout reached, assuming server started successfully.',
          );
          serverStarted = true;
          resolve();
        }
      }, 5000); // 5 second timeout

      serverProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log(`Server output: ${output}`);

        // Look for indication that server has started
        if (
          output.includes('Server is running successfully') &&
          !serverStarted
        ) {
          serverStarted = true;
          clearTimeout(timeout);
          console.log('✅ Development server started successfully!');
          resolve();
        }
      });

      serverProcess.stderr?.on('data', (data: Buffer) => {
        const error = data.toString();
        console.error(`Server error: ${error}`);
      });

      serverProcess.on('error', (err: Error) => {
        console.error(`Failed to start server process: ${err.message}`);
        clearTimeout(timeout);
        if (!serverStarted) {
          reject(err);
        }
      });

      serverProcess.on('close', (code: number | null) => {
        clearTimeout(timeout);
        if (code !== 0 && !serverStarted) {
          const errorMessage = `Server process exited with code ${code}`;
          console.error(errorMessage);
          reject(new Error(errorMessage));
        }
      });

      // Detach the process so it continues running after this method completes
      serverProcess.unref();
    });
  }
}
