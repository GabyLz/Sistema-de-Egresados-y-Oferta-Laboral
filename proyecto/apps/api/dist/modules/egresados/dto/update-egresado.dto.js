"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEgresadoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_egresado_dto_1 = require("./create-egresado.dto");
class UpdateEgresadoDto extends (0, mapped_types_1.PartialType)(create_egresado_dto_1.CreateEgresadoDto) {
}
exports.UpdateEgresadoDto = UpdateEgresadoDto;
