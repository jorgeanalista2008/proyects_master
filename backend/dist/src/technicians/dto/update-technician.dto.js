"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTechnicianDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_technician_dto_1 = require("./create-technician.dto");
class UpdateTechnicianDto extends (0, swagger_1.PartialType)(create_technician_dto_1.CreateTechnicianDto) {
}
exports.UpdateTechnicianDto = UpdateTechnicianDto;
//# sourceMappingURL=update-technician.dto.js.map