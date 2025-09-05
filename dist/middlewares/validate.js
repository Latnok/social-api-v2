"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const error_1 = require("./error");
function validateBody(Dto) {
    return async (req, _res, next) => {
        const inst = (0, class_transformer_1.plainToInstance)(Dto, req.body, { enableImplicitConversion: true });
        const errors = await (0, class_validator_1.validate)(inst, {
            whitelist: true, // выбрасываем посторонние поля
            forbidNonWhitelisted: true, // ошибка, если пришло лишнее
        });
        if (errors.length) {
            const details = errors.map((e) => ({
                field: e.property,
                constraints: e.constraints ?? {},
            }));
            return next(new error_1.HttpError(400, 'Validation failed', 'VALIDATION_ERROR', details));
        }
        req.body = inst;
        next();
    };
}
//# sourceMappingURL=validate.js.map