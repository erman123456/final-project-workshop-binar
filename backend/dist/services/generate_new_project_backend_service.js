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
        const projectPath = projectName;
        try {
            console.log('--- Starting NestJS Project Setup ---', projectName);
            console.log('\nSTEP 2: Installing NestJS CLI globally...');
            await this.runShellCommand('npm', ['install', '-g', '@nestjs/cli']);
            console.log('NestJS CLI installed.');
            console.log(`\nSTEP 3: Creating a new NestJS project named '${projectName}'...`);
            await this.runShellCommand('nest', ['new', projectName, '--package-manager', 'npm'], {
                stdio: 'inherit',
            });
            console.log(`Project '${projectName}' created at: ${projectPath}`);
            console.log(`\nSTEP 4: Starting the development server for '${projectName}'...`);
            console.log(`(This command will run indefinitely. To stop, press Ctrl+C in this terminal.)`);
            console.log(`Access your app at http://localhost:3000 once it's ready.`);
            const devServerProcess = (0, child_process_1.spawn)('npm', ['run', 'start:dev'], {
                cwd: projectPath,
                stdio: 'inherit',
            });
            devServerProcess.on('error', (err) => {
                console.error(`\nFailed to start the development server: ${err.message}`);
            });
            devServerProcess.on('close', (code) => {
                console.log(`\nDevelopment server process exited with code ${code}.`);
            });
            console.log('\n--- NestJS Setup Complete. Development server attempting to start. ---');
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
};
exports.GenerateNewProjectBackendService = GenerateNewProjectBackendService;
exports.GenerateNewProjectBackendService = GenerateNewProjectBackendService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GenerateNewProjectBackendService);
//# sourceMappingURL=generate_new_project_backend_service.js.map