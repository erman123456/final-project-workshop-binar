import { GenerateNewProjectBackendService } from './services/generate_new_project_backend_service';
import { GenerateNewProjectFrontendService } from './services/generate_new_project_frontend_service';
export declare class AppService {
    private readonly generateNewProjectBackend;
    private readonly generateNewProjectFrontend;
    constructor(generateNewProjectBackend: GenerateNewProjectBackendService, generateNewProjectFrontend: GenerateNewProjectFrontendService);
    getHello(): string;
    setPrompt(content: string): Promise<any>;
}
