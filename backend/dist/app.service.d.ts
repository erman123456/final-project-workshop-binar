import { GenerateNewProjectBackendService } from './services/generate_new_project_backend_service';
export declare class AppService {
    private readonly generateNewProjectBackend;
    constructor(generateNewProjectBackend: GenerateNewProjectBackendService);
    getHello(): string;
    setPrompt(content: string): Promise<any>;
}
