import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { spawn } from 'child_process';

@Injectable()
export class GenerateNewProjectBackendService {
  constructor() {}
  async runShellCommand(
    command: string,
    args: string[] = [],
    options: { cwd?: string; stdio?: 'inherit' | 'pipe' | 'ignore' } = {},
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Log the command being executed for clarity
      console.log(`\nExecuting command: ${command} ${args.join(' ')}`);

      // Spawn the child process
      const child = spawn(command, args, {
        stdio: 'inherit', // This pipes stdout/stderr of the child directly to the parent's console
        ...options, // Include any additional options (like cwd)
      });

      // Handle errors if the process fails to spawn
      child.on('error', (err: Error) => {
        console.error(`Failed to start process '${command}': ${err.message}`);
        reject(err);
      });

      // Handle when the child process closes
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

  // --- Main function to set up the NestJS project ---
  async setupNestJSProject(projectName: string): Promise<boolean> {
    // Construct the full path to the new project directory in the output folder
    const path = require('path');
    const fs = require('fs').promises;

    // Get the root directory (go up from backend/src to the root)
    const rootDir = path.resolve(__dirname, '../../../');
    const outputDir = path.join(rootDir, 'output');
    const projectPath = path.join(outputDir, projectName);

    try {
      console.log('--- Starting NestJS Project Setup ---', projectName);

      // Step 1: Ensure output directory exists
      console.log('\nSTEP 1: Creating output directory...');
      await fs.mkdir(outputDir, { recursive: true });
      console.log('Output directory ready.');

      // Step 2: Install NestJS CLI globally
      console.log('\nSTEP 2: Installing NestJS CLI globally...');
      await this.runShellCommand('npm', ['install', '-g', '@nestjs/cli']);
      console.log('NestJS CLI installed.');

      // Step 3: Create a new NestJS project
      console.log(
        `\nSTEP 3: Creating a new NestJS project named '${projectName}'...`,
      );
      // Run the nest new command from the output directory
      await this.runShellCommand(
        'nest',
        ['new', projectName, '--package-manager', 'npm'],
        {
          cwd: outputDir, // Set working directory to output folder
          stdio: 'inherit',
        },
      );
      console.log(`Project '${projectName}' created at: ${projectPath}`);

      // Step 4: Update main.ts with proper CORS and unique port
      await this.updateMainTsFile(projectPath);

      console.log(
        '\n--- NestJS Setup Complete. Project created successfully. ---',
      );
      console.log(
        `To start the server, run: cd ${projectPath} && npm run start:dev`,
      );
      return true;
    } catch (error: any) {
      // Using 'any' for the catch error type for broader compatibility
      console.error(
        '\n!!! An error occurred during the NestJS project setup. Please review the output above. !!!',
      );
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
      }
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  private async updateMainTsFile(projectPath: string): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');

    const mainTsPath = path.join(projectPath, 'src', 'main.ts');

    // Generate a random port between 3004-3010 to avoid conflicts
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
}
