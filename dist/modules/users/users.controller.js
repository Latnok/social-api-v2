"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.deleteUser = deleteUser;
const error_1 = require("../../middlewares/error");
const users_service_1 = require("./users.service");
async function getUsers(req, res) {
    const { limit, page, cursor, q, withDeleted } = req.query;
    const parsed = {
        limit: limit ? Number(limit) : undefined,
        page: page ? Number(page) : undefined,
        cursor: cursor ?? null,
        q: q ?? null,
        withDeleted: withDeleted === 'true',
    };
    const result = await (0, users_service_1.listUsers)(parsed);
    res.json(result);
}
async function getUser(req, res) {
    const user = await (0, users_service_1.getUserById)(req.params.id, req.query.withDeleted === 'true');
    if (!user)
        throw new error_1.HttpError(404, 'User not found');
    res.json(user);
}
async function deleteUser(req, res) {
    const hard = req.query.hard === 'true';
    const ok = hard ? await (0, users_service_1.hardDeleteUser)(req.params.id) : await (0, users_service_1.softDeleteUser)(req.params.id);
    if (!ok)
        throw new error_1.HttpError(404, 'User not found');
    res.status(204).send();
}
//# sourceMappingURL=users.controller.js.map