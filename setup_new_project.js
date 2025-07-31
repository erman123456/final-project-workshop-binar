import { spawn } from 'child_process';
import path from 'path';

// --- Helper function to run shell commands with real-time output ---
/**
 * Runs a shell command and streams its output to the console.
 * @param {string} command The main command to execute (e.g., 'npm', 'nest').
 * @param {string[]} args An array of arguments for the command.
 * @param {object} options Options for the child process, like 'cwd' (current working directory).
 * @returns {Promise<void>} A promise that resolves when the command completes successfully, or rejects on error.
 */
function runShellCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        // Log the command being executed for clarity
        console.log(`\nExecuting command: ${command} ${args.join(' ')}`);

        // Spawn the child process
        const child = spawn(command, args, {
            stdio: 'inherit', // This pipes stdout/stderr of the child directly to the parent's console
            ...options        // Include any additional options (like cwd)
        });

        // Handle errors if the process fails to spawn
        child.on('error', (err) => {
            console.error(`Failed to start process '${command}': ${err.message}`);
            reject(err);
        });

        // Handle when the child process closes
        child.on('close', (code) => {
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
 async function setupNestJSProject(projectName) {
    // Construct the full path to the new project directory
    const projectPath = path.join(process.cwd(), projectName);

    try {
        console.log('--- Starting NestJS Project Setup ---');

        // Step 1: Install NestJS CLI globally
        console.log('\nSTEP 1: Installing NestJS CLI globally...');
        await runShellCommand('npm', ['install', '-g', '@nestjs/cli']);
        console.log('NestJS CLI installed.');

        // Step 2: Create a new NestJS project
        console.log(`\nSTEP 2: Creating a new NestJS project named '${projectName}'...`);
        // The 'nest new' command needs to be run from the directory where you want the project created.
        // By default, it runs in the current working directory of this Node.js script.
        await runShellCommand('nest', ['new', projectName, '--package-manager', 'npm'], {
            // Inherit stdio so you see the interactive prompts and output from 'nest new'
            stdio: 'inherit'
        });
        console.log(`Project '${projectName}' created at: ${projectPath}`);

        // Step 3 (Implicit in Step 4): Navigate into the new project directory
        // We'll handle this by setting the 'cwd' option for the next command.

        // Step 4: Start the development server
        console.log(`\nSTEP 3: Starting the development server for '${projectName}'...`);
        console.log(`(This command will run indefinitely. To stop, press Ctrl+C in this terminal.)`);
        console.log(`Access your app at http://localhost:3000 once it's ready.`);

        // Use 'spawn' for long-running processes like dev servers.
        // Set 'cwd' to the project directory to ensure 'npm run start:dev' runs in the correct context.
        const devServerProcess = spawn('npm', ['run', 'start:dev'], {
            cwd: projectPath, // Crucially sets the working directory for this command
            stdio: 'inherit'  // Continue to pipe output to the console
        });

        devServerProcess.on('error', (err) => {
            console.error(`\nFailed to start the development server: ${err.message}`);
        });

        devServerProcess.on('close', (code) => {
            console.log(`\nDevelopment server process exited with code ${code}.`);
        });

        console.log('\n--- NestJS Setup Complete. Development server attempting to start. ---');

    } catch (error) {
        console.error('\n!!! An error occurred during the NestJS project setup. Please review the output above. !!!');
    }
}

// // Get projectName from command line arguments
// const projectName = process.argv[2];

// if (!projectName) {
//     console.error('Please provide a project name as an argument: node setup_new_project.js <project-name>');
//     process.exit(1);
// }

// Execute the main setup function
// setupNestJSProject(projectName);

// how to run this script:
// node setup_new_project.js name-project