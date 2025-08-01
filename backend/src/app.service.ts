import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GenerateNewProjectBackendService } from './services/generate_new_project_backend_service';
import { GenerateNewProjectFrontendService } from './services/generate_new_project_frontend_service';

@Injectable()
export class AppService {
  constructor(
    private readonly generateNewProjectBackend: GenerateNewProjectBackendService,
    private readonly generateNewProjectFrontend: GenerateNewProjectFrontendService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async setPrompt(content: string): Promise<any> {
    try {
      const projectNameBackend = `${content}_backend`;
      const projectNameFrontend = `${content}_frontend`;

      console.log(`Starting project creation for: ${content}`);
      console.log(`Backend project: ${projectNameBackend}`);
      console.log(`Frontend project: ${projectNameFrontend}`);

      // Create backend project first
      console.log('Creating backend project...');
      const backendResult =
        await this.generateNewProjectBackend.setupNestJSProject(
          projectNameBackend,
        );
      console.log(`Backend project created: ${backendResult}`);

      // Create frontend project second
      console.log('Creating frontend project...');
      const frontendResult =
        await this.generateNewProjectFrontend.setupVanillaProject(
          projectNameFrontend,
        );
      console.log(`Frontend project created: ${frontendResult}`);

      if (backendResult && frontendResult) {
        return {
          message: 'Success',
          output_dir: {
            backend: `output/${projectNameBackend}`,
            frontend: `output/${projectNameFrontend}`,
          },
          info: {
            backend: 'NestJS backend project created successfully',
            frontend: `Vanilla frontend project created and server started on http://localhost:8080`,
          },
        };
      } else {
        throw new Error('One or both projects failed to create');
      }
    } catch (error) {
      console.error('Error in setPrompt:', error);
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
