"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateNewProjectFrontendService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const fs = require("fs/promises");
const path = require("path");
let GenerateNewProjectFrontendService = class GenerateNewProjectFrontendService {
    PORT = 8080;
    constructor() { }
    async runShellCommand(command, args = [], options = {}) {
        return new Promise((resolve, reject) => {
            console.log(`\nExecuting command: ${command} ${args.join(' ')}`);
            const child = (0, child_process_1.spawn)(command, args, {
                stdio: 'inherit',
                ...options,
            });
            child.on('error', (err) => {
                console.error(`Failed to start process '${command}': ${err.message}`);
                reject(err);
            });
            child.on('close', (code) => {
                if (code === 0) {
                    console.log(`Command '${command}' completed successfully.`);
                    resolve();
                }
                else {
                    const errorMessage = `Command '${command}' exited with code ${code}`;
                    console.error(errorMessage);
                    reject(new Error(errorMessage));
                }
            });
        });
    }
    async setupReactProject(projectName) {
        try {
            console.log('--- Starting React Project Setup ---', projectName);
            const rootDir = path.resolve(__dirname, '../../../');
            const outputDir = path.join(rootDir, 'output');
            console.log('\nSTEP 1: Creating output directory...');
            await fs.mkdir(outputDir, { recursive: true });
            console.log('Output directory ready.');
            console.log(`\nCreating React TypeScript project: ${projectName}...`);
            await this.runShellCommand('npx', ['create-react-app', projectName, '--template', 'typescript'], {
                cwd: outputDir,
                stdio: 'inherit',
            });
            console.log(`React project '${projectName}' created successfully.`);
            return true;
        }
        catch (error) {
            console.error('!!! An error occurred during React project setup !!!');
            if (error instanceof Error) {
                console.error(`Error details: ${error.message}`);
            }
            throw new common_1.HttpException(error, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async setupVanillaProject(projectName) {
        try {
            console.log('--- Starting Vanilla Frontend Project Setup ---', projectName);
            const rootDir = path.resolve(__dirname, '../../../');
            const outputDir = path.join(rootDir, 'output');
            const projectPath = path.join(outputDir, projectName);
            console.log(`Root directory: ${rootDir}`);
            console.log(`Output directory: ${outputDir}`);
            console.log(`Project path: ${projectPath}`);
            console.log('\nSTEP 1: Creating output directory...');
            await fs.mkdir(outputDir, { recursive: true });
            console.log('Output directory ready.');
            try {
                await fs.access(projectPath);
                const errorMsg = `Directory '${projectName}' already exists.`;
                console.error(errorMsg);
                throw new Error(errorMsg);
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    console.error('Access check error:', error);
                    throw error;
                }
                console.log('Project directory does not exist, proceeding...');
            }
            console.log(`\nSTEP 3: Creating project directory: ${projectName}...`);
            await fs.mkdir(projectPath, { recursive: true });
            console.log('Project directory created successfully.');
            console.log('\nSTEP 4: Generating project files...');
            await this.generateProjectFiles(projectPath, projectName);
            console.log('\nSTEP 5: Installing dependencies...');
            await this.installDependencies(projectPath);
            console.log(`✅ Vanilla frontend project '${projectName}' created successfully.`);
            return true;
        }
        catch (error) {
            console.error('!!! An error occurred during vanilla project setup !!!');
            console.error('Error details:', error);
            if (error instanceof Error) {
                console.error(`Error message: ${error.message}`);
                console.error(`Error stack: ${error.stack}`);
            }
            throw new common_1.HttpException(error.message || error, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async generateProjectFiles(projectPath, projectName) {
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
        await fs.writeFile(path.join(projectPath, 'index.html'), htmlContent);
        await fs.writeFile(path.join(projectPath, 'styles.css'), cssContent);
        await fs.writeFile(path.join(projectPath, 'app.js'), jsContent);
        await fs.writeFile(path.join(projectPath, 'server.js'), serverContent);
        await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJsonContent, null, 2));
        console.log('✅ Project files generated successfully!');
    }
    async installDependencies(projectPath) {
        return new Promise((resolve, reject) => {
            console.log('📦 Installing dependencies... This may take a moment.');
            (0, child_process_1.exec)('npm install', { cwd: projectPath }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error during dependency installation: ${error.message}`);
                    reject(error);
                    return;
                }
                if (stderr) {
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
};
exports.GenerateNewProjectFrontendService = GenerateNewProjectFrontendService;
exports.GenerateNewProjectFrontendService = GenerateNewProjectFrontendService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GenerateNewProjectFrontendService);
//# sourceMappingURL=generate_new_project_frontend_service.js.map