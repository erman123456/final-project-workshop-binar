export declare class GenerateNewProjectFrontendService {
    private readonly BASE_PORT;
    private static usedPorts;
    private static runningServers;
    constructor();
    private findAvailablePort;
    private isPortAvailable;
    private registerRunningServer;
    cleanupZombieProcesses(): void;
    getRunningServers(): Array<{
        port: number;
        projectName: string;
        processId?: number;
    }>;
    private analyzeProjectType;
    runShellCommand(command: string, args?: string[], options?: {
        cwd?: string;
        stdio?: 'inherit' | 'pipe' | 'ignore';
    }): Promise<void>;
    setupReactProject(projectName: string): Promise<boolean>;
    private enhanceReactProject;
    private generateReactAppContent;
    private generateReactCompanyProfile;
    private generateReactLandingPage;
    private generateReactEcommerce;
    private generateReactBasic;
    private generateReactComponents;
    setupVanillaProject(projectName: string): Promise<boolean>;
    private generateProjectFiles;
    private installDependencies;
    private startDevelopmentServer;
    private generateHtmlContent;
    private generateCompanyProfileHtml;
    private generateLandingPageHtml;
    private generateEcommerceHtml;
    private generateBasicHtml;
    private generateCssContent;
    private getCompanyProfileStyles;
    private getLandingPageStyles;
    private getEcommerceStyles;
    private getBasicStyles;
    private generateJsContent;
    private getCompanyProfileJs;
    private getLandingPageJs;
    private getEcommerceJs;
    private getBasicJs;
}
