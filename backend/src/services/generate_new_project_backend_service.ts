import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { spawn } from 'child_process';

@Injectable()
export class GenerateNewProjectBackendService {
  constructor() { }
  async runShellCommand(
    command: string,
    args: string[] = [],
    options: { cwd?: string; stdio?: 'inherit' | 'pipe' | 'ignore' } = {}
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
    // Construct the full path to the new project directory
    const projectPath: string = projectName

    try {
      console.log('--- Starting NestJS Project Setup ---', projectName);

      // Step 2: Install NestJS CLI globally
      console.log('\nSTEP 2: Installing NestJS CLI globally...');
      await this.runShellCommand('npm', ['install', '-g', '@nestjs/cli']);
      console.log('NestJS CLI installed.');

      // Step 3: Create a new NestJS project
      console.log(`\nSTEP 3: Creating a new NestJS project named '${projectName}'...`);
      // The 'nest new' command needs to be run from the directory where you want the project created.
      // By default, it runs in the current working directory of this Node.js script.
      await this.runShellCommand('nest', ['new', projectName, '--package-manager', 'npm'], {
        // Inherit stdio so you see the interactive prompts and output from 'nest new'
        stdio: 'inherit',
      });
      console.log(`Project '${projectName}' created at: ${projectPath}`);

      // Step 4: Start the development server
      console.log(`\nSTEP 4: Starting the development server for '${projectName}'...`);
      console.log(`(This command will run indefinitely. To stop, press Ctrl+C in this terminal.)`);
      console.log(`Access your app at http://localhost:3000 once it's ready.`);

      // Use 'spawn' for long-running processes like dev servers.
      // Set 'cwd' to the project directory to ensure 'npm run start:dev' runs in the correct context.
      const devServerProcess = spawn('npm', ['run', 'start:dev'], {
        cwd: projectPath, // Crucially sets the working directory for this command
        stdio: 'inherit', // Continue to pipe output to the console
      });

      devServerProcess.on('error', (err: Error) => {
        console.error(`\nFailed to start the development server: ${err.message}`);
      });

      devServerProcess.on('close', (code: number | null) => {
        console.log(`\nDevelopment server process exited with code ${code}.`);
      });

      console.log('\n--- NestJS Setup Complete. Development server attempting to start. ---');
      return true;
    } catch (error: any) { // Using 'any' for the catch error type for broader compatibility
      console.error('\n!!! An error occurred during the NestJS project setup. Please review the output above. !!!');
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
      }
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
