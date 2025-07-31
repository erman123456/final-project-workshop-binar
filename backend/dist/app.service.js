"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const generate_new_project_backend_service_1 = require("./services/generate_new_project_backend_service");
let AppService = class AppService {
    generateNewProjectBackend;
    constructor(generateNewProjectBackend) {
        this.generateNewProjectBackend = generateNewProjectBackend;
    }
    getHello() {
        return 'Hello World!';
    }
    async setPrompt(content) {
        try {
            const projectNameBackend = `${content}_backend`;
            const projectNameFrontend = `${content}_frontend`;
            const generateNewProjectBackend = await this.generateNewProjectBackend.setupNestJSProject(projectNameBackend);
            if (generateNewProjectBackend) {
                return {
                    message: "Success",
                    output_dir: {
                        backend: `backend/${projectNameBackend}`,
                        frontend: `backend/${projectNameFrontend}`
                    }
                };
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException(error, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [generate_new_project_backend_service_1.GenerateNewProjectBackendService])
], AppService);
//# sourceMappingURL=app.service.js.map