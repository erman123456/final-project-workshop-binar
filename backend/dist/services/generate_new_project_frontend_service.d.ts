export declare class GenerateNewProjectFrontendService {
    private readonly PORT;
    constructor();
    runShellCommand(command: string, args?: string[], options?: {
        cwd?: string;
        stdio?: 'inherit' | 'pipe' | 'ignore';
    }): Promise<void>;
    setupReactProject(projectName: string): Promise<boolean>;
    setupVanillaProject(projectName: string): Promise<boolean>;
    private generateProjectFiles;
    private installDependencies;
}
