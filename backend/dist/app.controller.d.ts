import { AppService } from './app.service';
import { PromptDto } from './dto/prompt.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    setPrompt(dtoIn: PromptDto): Promise<any>;
}
