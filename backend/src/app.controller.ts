import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { PromptDto } from './dto/prompt.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('/prompt')
  setPrompt(@Body() dtoIn: PromptDto): Promise<any> {
    return this.appService.setPrompt(dtoIn.content);
  }
}