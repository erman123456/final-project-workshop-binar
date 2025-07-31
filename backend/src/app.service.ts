import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GenerateNewProjectBackendService } from './services/generate_new_project_backend_service';

@Injectable()
export class AppService {

  constructor(
    private readonly generateNewProjectBackend: GenerateNewProjectBackendService
  ) {

  }

  getHello(): string {
    return 'Hello World!';
  }
  async setPrompt(content: string): Promise<any> {
    try {
      const projectNameBackend = `${content}_backend`;
      const projectNameFrontend = `${content}_frontend`;
      const generateNewProjectBackend = await this.generateNewProjectBackend.setupNestJSProject(projectNameBackend)
      if (generateNewProjectBackend) {
        return {
          message: "Success",
          output_dir: {
            backend: `backend/${projectNameBackend}`,
            frontend: `backend/${projectNameFrontend}`
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
