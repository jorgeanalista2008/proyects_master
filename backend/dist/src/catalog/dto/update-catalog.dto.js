"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCatalogDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_catalog_dto_1 = require("./create-catalog.dto");
class UpdateCatalogDto extends (0, swagger_1.PartialType)(create_catalog_dto_1.CreateCatalogDto) {
}
exports.UpdateCatalogDto = UpdateCatalogDto;
//# sourceMappingURL=update-catalog.dto.js.map