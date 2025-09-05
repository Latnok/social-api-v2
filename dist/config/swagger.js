"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openapiSpecification = void 0;
// src/config/swagger.ts
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const servers = process.env.NODE_ENV === 'production'
    ? [{ url: '/' }]
    : [{ url: `http://localhost:${process.env.PORT ?? 3000}` }];
exports.openapiSpecification = (0, swagger_jsdoc_1.default)({
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Social API',
            version: '1.0.0',
            description: 'REST API для социальной платформы: аутентификация, пользователи (админ), посты (публичное чтение, авторское редактирование/удаление).',
        },
        servers,
        tags: [
            { name: 'Auth', description: 'Регистрация и авторизация' },
            { name: 'Users', description: 'Пользователи (админ-доступ)' },
            { name: 'Posts', description: 'Посты' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Передавайте access-токен: `Authorization: Bearer <token>`',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Validation failed' },
                        code: { type: 'string', example: 'VALIDATION_ERROR' },
                        details: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: { type: 'string', example: 'email' },
                                    constraints: {
                                        type: 'object',
                                        additionalProperties: { type: 'string' },
                                        example: { isEmail: 'email must be an email' },
                                    },
                                },
                            },
                        },
                        stack: { type: 'string' },
                    },
                },
                UserPublic: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '1' },
                        email: { type: 'string', format: 'email', example: 'alice@example.com' },
                        displayName: { type: 'string', example: 'Alice' },
                        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        deletedAt: { type: 'string', format: 'date-time', nullable: true },
                    },
                    required: ['id', 'email', 'displayName', 'role', 'createdAt', 'updatedAt'],
                },
                UsersListResponse: {
                    type: 'object',
                    properties: {
                        items: { type: 'array', items: { $ref: '#/components/schemas/UserPublic' } },
                        nextCursor: { type: 'string', nullable: true },
                        hasNext: { type: 'boolean' },
                    },
                },
                PostListItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '10' },
                        title: { type: 'string', example: 'Hello' },
                        authorId: { type: 'string', example: '1' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                    required: ['id', 'title', 'authorId', 'createdAt', 'updatedAt'],
                },
                PostAuthorMini: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '1' },
                        displayName: { type: 'string', example: 'Alice' },
                    },
                    required: ['id', 'displayName'],
                },
                PostFull: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        authorId: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        deletedAt: { type: 'string', format: 'date-time', nullable: true },
                    },
                    required: ['id', 'title', 'content', 'authorId', 'createdAt', 'updatedAt'],
                },
                PostsListResponse: {
                    type: 'object',
                    properties: {
                        items: { type: 'array', items: { $ref: '#/components/schemas/PostListItem' } },
                        nextCursor: { type: 'string', nullable: true },
                        hasNext: { type: 'boolean' },
                    },
                },
                AuthRegisterBody: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', format: 'password', minLength: 8 },
                        displayName: { type: 'string' },
                    },
                    required: ['email', 'password', 'displayName'],
                },
                AuthLoginBody: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', format: 'password' },
                    },
                    required: ['email', 'password'],
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        user: { $ref: '#/components/schemas/UserPublic' },
                        accessToken: { type: 'string' },
                    },
                    required: ['user', 'accessToken'],
                },
                PostCreateBody: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', maxLength: 200 },
                        content: { type: 'string' },
                    },
                    required: ['title', 'content'],
                },
                PostPatchBody: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', maxLength: 200 },
                        content: { type: 'string' },
                    },
                    additionalProperties: false,
                },
            },
        },
        paths: {
            // --- AUTH ---
            '/api/auth/register': {
                post: {
                    tags: ['Auth'],
                    summary: 'Регистрация',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthRegisterBody' } } },
                    },
                    responses: {
                        '201': {
                            description: 'Ок',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
                        },
                        '409': {
                            description: 'Email занят',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                        '400': {
                            description: 'Валидация',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
            },
            '/api/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Логин',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthLoginBody' } } },
                    },
                    responses: {
                        '200': {
                            description: 'Ок',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
                        },
                        '401': {
                            description: 'Неверные данные',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
            },
            '/api/auth/refresh': {
                post: {
                    tags: ['Auth'],
                    summary: 'Обновить access токен по refresh cookie',
                    responses: {
                        '200': {
                            description: 'Новый access токен',
                            content: {
                                'application/json': {
                                    schema: { type: 'object', properties: { accessToken: { type: 'string' } }, required: ['accessToken'] },
                                },
                            },
                        },
                        '401': {
                            description: 'Нет/невалидный refresh',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
            },
            '/api/auth/logout': {
                post: {
                    tags: ['Auth'],
                    summary: 'Выход (очистка refresh cookie)',
                    responses: {
                        '204': { description: 'Ок' },
                    },
                },
            },
            // --- USERS (admin) ---
            '/api/users': {
                get: {
                    tags: ['Users'],
                    summary: 'Список пользователей (admin)',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
                        { name: 'cursor', in: 'query', schema: { type: 'string' } },
                        { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Поиск по email/displayName' },
                        { name: 'withDeleted', in: 'query', schema: { type: 'boolean' } },
                    ],
                    responses: {
                        '200': {
                            description: 'Ок',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/UsersListResponse' } } },
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                        '403': {
                            description: 'Forbidden',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
            },
            '/api/users/{id}': {
                get: {
                    tags: ['Users'],
                    summary: 'Пользователь по id (admin)',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                        { name: 'withDeleted', in: 'query', schema: { type: 'boolean' } },
                    ],
                    responses: {
                        '200': {
                            description: 'Ок',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserPublic' } } },
                        },
                        '404': {
                            description: 'Не найден',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
                delete: {
                    tags: ['Users'],
                    summary: 'Удаление пользователя (soft/hard) (admin)',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                        { name: 'hard', in: 'query', schema: { type: 'boolean' }, description: 'true = жёсткое удаление' },
                    ],
                    responses: {
                        '204': { description: 'Удалён' },
                        '404': {
                            description: 'Не найден',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
            },
            // --- POSTS ---
            '/api/posts': {
                get: {
                    tags: ['Posts'],
                    summary: 'Список постов (публично)',
                    parameters: [
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
                        { name: 'cursor', in: 'query', schema: { type: 'string' } },
                        { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Поиск по заголовку' },
                        { name: 'authorId', in: 'query', schema: { type: 'string' } },
                        { name: 'include', in: 'query', schema: { type: 'string', enum: ['author'] } },
                    ],
                    responses: {
                        '200': {
                            description: 'Ок',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/PostsListResponse' } } },
                        },
                    },
                },
                post: {
                    tags: ['Posts'],
                    summary: 'Создать пост (авторизован)',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/PostCreateBody' } } },
                    },
                    responses: {
                        '201': {
                            description: 'Создан',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/PostFull' } } },
                        },
                        '400': {
                            description: 'Валидация',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
            },
            '/api/posts/{id}': {
                get: {
                    tags: ['Posts'],
                    summary: 'Пост по id (публично)',
                    parameters: [
                        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                        { name: 'include', in: 'query', schema: { type: 'string', enum: ['author'] } },
                        { name: 'withDeleted', in: 'query', schema: { type: 'boolean' } },
                    ],
                    responses: {
                        '200': {
                            description: 'Ок',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/PostFull' } } },
                        },
                        '404': {
                            description: 'Не найден',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
                patch: {
                    tags: ['Posts'],
                    summary: 'Изменить пост (автор/админ)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/PostPatchBody' } } },
                    },
                    responses: {
                        '200': {
                            description: 'Ок',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/PostFull' } } },
                        },
                        '400': {
                            description: 'Валидация',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                        '403': {
                            description: 'Forbidden',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                        '404': {
                            description: 'Не найден',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
                delete: {
                    tags: ['Posts'],
                    summary: 'Удалить пост (soft, автор/админ)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        '204': { description: 'Удалён' },
                        '401': {
                            description: 'Unauthorized',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                        '403': {
                            description: 'Forbidden',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                        '404': {
                            description: 'Не найден',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
            },
        },
    },
    apis: [],
});
//# sourceMappingURL=swagger.js.map