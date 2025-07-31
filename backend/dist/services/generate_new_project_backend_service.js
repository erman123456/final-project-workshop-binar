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
exports.GenerateNewProjectBackendService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
let GenerateNewProjectBackendService = class GenerateNewProjectBackendService {
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
    async setupNestJSProject(projectName) {
        const path = require('path');
        const fs = require('fs').promises;
        const rootDir = path.resolve(__dirname, '../../../');
        const outputDir = path.join(rootDir, 'output');
        const projectPath = path.join(outputDir, projectName);
        try {
            console.log('--- Starting NestJS Project Setup ---', projectName);
            console.log('\nSTEP 1: Creating output directory...');
            await fs.mkdir(outputDir, { recursive: true });
            console.log('Output directory ready.');
            console.log('\nSTEP 2: Installing NestJS CLI globally...');
            await this.runShellCommand('npm', ['install', '-g', '@nestjs/cli']);
            console.log('NestJS CLI installed.');
            console.log(`\nSTEP 3: Creating a new NestJS project named '${projectName}'...`);
            await this.runShellCommand('nest', ['new', projectName, '--package-manager', 'npm'], {
                cwd: outputDir,
                stdio: 'inherit',
            });
            console.log(`Project '${projectName}' created at: ${projectPath}`);
            await this.updateMainTsFile(projectPath);
            console.log('\n--- NestJS Setup Complete. Project created successfully. ---');
            console.log(`To start the server, run: cd ${projectPath} && npm run start:dev`);
            return true;
        }
        catch (error) {
            console.error('\n!!! An error occurred during the NestJS project setup. Please review the output above. !!!');
            if (error instanceof Error) {
                console.error(`Error details: ${error.message}`);
            }
            throw new common_1.HttpException(error, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateMainTsFile(projectPath) {
        const fs = require('fs').promises;
        const path = require('path');
        const mainTsPath = path.join(projectPath, 'src', 'main.ts');
        const port = Math.floor(Math.random() * 7) + 3004;
        const newMainTsContent = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for cross-origin requests
  app.enableCors({
    origin: 'http://localhost:3001', // Your React app URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? ${port});
  console.log(\`Application is running on: http://localhost:${port}\`);
}
bootstrap();
`;
        await fs.writeFile(mainTsPath, newMainTsContent, 'utf8');
        console.log(`Updated main.ts with CORS support and port ${port}`);
    }
};
exports.GenerateNewProjectBackendService = GenerateNewProjectBackendService;
exports.GenerateNewProjectBackendService = GenerateNewProjectBackendService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GenerateNewProjectBackendService);
//# sourceMappingURL=generate_new_project_backend_service.js.map