import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GenerateNewProjectBackendService } from './services/generate_new_project_backend_service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, GenerateNewProjectBackendService],
})
export class AppModule {}
