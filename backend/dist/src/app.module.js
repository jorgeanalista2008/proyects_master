"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./database/database.module");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const catalog_module_1 = require("./catalog/catalog.module");
const images_module_1 = require("./images/images.module");
const clients_module_1 = require("./clients/clients.module");
const projects_module_1 = require("./projects/projects.module");
const quotes_module_1 = require("./quotes/quotes.module");
const analytics_module_1 = require("./analytics/analytics.module");
const technicians_module_1 = require("./technicians/technicians.module");
const settings_module_1 = require("./settings/settings.module");
const roles_module_1 = require("./roles/roles.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            database_module_1.DatabaseModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            catalog_module_1.CatalogModule,
            images_module_1.ImagesModule,
            clients_module_1.ClientsModule,
            projects_module_1.ProjectsModule,
            quotes_module_1.QuotesModule,
            analytics_module_1.AnalyticsModule,
            technicians_module_1.TechniciansModule,
            settings_module_1.SettingsModule,
            roles_module_1.RolesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map