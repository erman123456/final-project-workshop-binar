import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GenerateNewProjectBackendService } from './services/generate_new_project_backend_service';
import { GenerateNewProjectFrontendService } from './services/generate_new_project_frontend_service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let generateNewProjectBackendService: jest.Mocked<GenerateNewProjectBackendService>;
  let generateNewProjectFrontendService: jest.Mocked<GenerateNewProjectFrontendService>;
  let consoleSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Create mock services
    const mockBackendService = {
      setupNestJSProject: jest.fn(),
    };

    const mockFrontendService = {
      setupVanillaProject: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: GenerateNewProjectBackendService,
          useValue: mockBackendService,
        },
        {
          provide: GenerateNewProjectFrontendService,
          useValue: mockFrontendService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
    generateNewProjectBackendService = app.get(GenerateNewProjectBackendService);
    generateNewProjectFrontendService = app.get(GenerateNewProjectFrontendService);
  });

  afterEach(() => {
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('setPrompt', () => {
    it('should create both backend and frontend projects successfully', async () => {
      const mockContent = 'test-project';
      const mockBackendResult = true;
      const mockFrontendResult = true;

      // Suppress console.log for this test
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      generateNewProjectBackendService.setupNestJSProject.mockResolvedValue(mockBackendResult);
      generateNewProjectFrontendService.setupVanillaProject.mockResolvedValue(mockFrontendResult);

      const result = await appController.setPrompt({ content: mockContent });

      expect(generateNewProjectBackendService.setupNestJSProject).toHaveBeenCalledWith('test-project_backend');
      expect(generateNewProjectFrontendService.setupVanillaProject).toHaveBeenCalledWith('test-project_frontend');
      expect(result).toEqual({
        message: 'Success',
        output_dir: {
          backend: 'output/test-project_backend',
          frontend: 'output/test-project_frontend',
        },
        info: {
          backend: 'NestJS backend project created successfully',
          frontend: 'Vanilla frontend project created and server started on http://localhost:8080',
        },
      });
    });

    it('should handle errors when project creation fails', async () => {
      const mockContent = 'test-project';
      const mockError = new Error('Project creation failed');

      // Suppress console.log and console.error for this test
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});

      generateNewProjectBackendService.setupNestJSProject.mockRejectedValue(mockError);

      await expect(appController.setPrompt({ content: mockContent })).rejects.toThrow(HttpException);
    });

    it('should handle errors when frontend project creation fails', async () => {
      const mockContent = 'test-project';
      const mockBackendResult = true;
      const mockError = new Error('Frontend project creation failed');

      // Suppress console.log and console.error for this test
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});

      generateNewProjectBackendService.setupNestJSProject.mockResolvedValue(mockBackendResult);
      generateNewProjectFrontendService.setupVanillaProject.mockRejectedValue(mockError);

      await expect(appController.setPrompt({ content: mockContent })).rejects.toThrow(HttpException);
    });
  });
});
