export declare class GenerateNewProjectBackendService {
    constructor();
    runShellCommand(command: string, args?: string[], options?: {
        cwd?: string;
        stdio?: 'inherit' | 'pipe' | 'ignore';
    }): Promise<void>;
    setupNestJSProject(projectName: string): Promise<boolean>;
    private updateMainTsFile;
}
