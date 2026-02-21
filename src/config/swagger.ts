import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Microservice API',
            version: '1.0.0',
            description:
                'A production-ready REST API built with Node.js, TypeScript, and Express. ' +
                'Features API key authentication, Docker containerization, and CI/CD deployment to AWS ECS.',
            contact: {
                name: 'Vinayak Katte',
            }
        },
        servers: [
            {
                url: '/',
                description: 'Current server',
            },
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                    description: 'API key required for all /api/v1/* endpoints',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', example: 'john@example.com' },
                    },
                },
                UserInput: {
                    type: 'object',
                    required: ['name', 'email'],
                    properties: {
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', example: 'john@example.com' },
                    },
                },
                UserUpdate: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'John Updated' },
                        email: { type: 'string', example: 'john.updated@example.com' },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/User' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' },
                    },
                },
                HealthResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'healthy' },
                        timestamp: { type: 'string', example: '2026-02-21T18:00:00.000Z' },
                        uptime: { type: 'number', example: 1234.56 },
                    },
                },
            },
        },
        paths: {
            '/health': {
                get: {
                    tags: ['Health'],
                    summary: 'Health check',
                    description: 'Public endpoint. Returns the health status of the API. Used by Docker and Kubernetes for health probes.',
                    responses: {
                        200: {
                            description: 'API is healthy',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/HealthResponse' },
                                },
                            },
                        },
                    },
                },
            },
            '/ready': {
                get: {
                    tags: ['Health'],
                    summary: 'Readiness check',
                    description: 'Public endpoint. Returns whether the API is ready to accept traffic.',
                    responses: {
                        200: {
                            description: 'API is ready',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'ready' },
                                            timestamp: { type: 'string' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/api/v1/info': {
                get: {
                    tags: ['API Info'],
                    summary: 'Get API information',
                    description: 'Returns metadata about the API including version, available endpoints, and authentication details.',
                    security: [{ ApiKeyAuth: [] }],
                    responses: {
                        200: {
                            description: 'API information',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string', example: 'DevOps Practical Test API' },
                                            version: { type: 'string', example: '1.0.0' },
                                            description: { type: 'string' },
                                            endpoints: {
                                                type: 'array',
                                                items: { type: 'string' },
                                            },
                                            authentication: {
                                                type: 'object',
                                                properties: {
                                                    type: { type: 'string', example: 'API Key' },
                                                    header: { type: 'string', example: 'X-API-Key' },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        401: { description: 'Missing API key' },
                        403: { description: 'Invalid API key' },
                    },
                },
            },
            '/api/v1/status': {
                get: {
                    tags: ['API Info'],
                    summary: 'Get system status',
                    description: 'Returns system information including Node.js version, platform, uptime, and memory usage.',
                    security: [{ ApiKeyAuth: [] }],
                    responses: {
                        200: {
                            description: 'System status',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            status: { type: 'string', example: 'operational' },
                                            timestamp: { type: 'string' },
                                            system: {
                                                type: 'object',
                                                properties: {
                                                    nodeVersion: { type: 'string' },
                                                    platform: { type: 'string' },
                                                    uptime: { type: 'number' },
                                                    memory: {
                                                        type: 'object',
                                                        properties: {
                                                            total: { type: 'number' },
                                                            used: { type: 'number' },
                                                            unit: { type: 'string', example: 'MB' },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        401: { description: 'Missing API key' },
                        403: { description: 'Invalid API key' },
                    },
                },
            },
            '/api/v1/users': {
                get: {
                    tags: ['Users'],
                    summary: 'Get all users',
                    description: 'Returns a list of all users in the system.',
                    security: [{ ApiKeyAuth: [] }],
                    responses: {
                        200: {
                            description: 'List of users',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            count: { type: 'integer', example: 3 },
                                            data: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/User' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        401: { description: 'Missing API key' },
                        403: { description: 'Invalid API key' },
                    },
                },
                post: {
                    tags: ['Users'],
                    summary: 'Create a new user',
                    description: 'Creates a new user with the provided name and email. Email must be unique.',
                    security: [{ ApiKeyAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UserInput' },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: 'User created successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                                },
                            },
                        },
                        400: { description: 'Missing required fields (name or email)' },
                        401: { description: 'Missing API key' },
                        403: { description: 'Invalid API key' },
                        409: { description: 'Email already exists' },
                    },
                },
            },
            '/api/v1/users/search': {
                get: {
                    tags: ['Users'],
                    summary: 'Search users by name',
                    description: 'Search for users whose name contains the search query (case-insensitive).',
                    security: [{ ApiKeyAuth: [] }],
                    parameters: [
                        {
                            name: 'name',
                            in: 'query',
                            required: true,
                            description: 'Name to search for',
                            schema: { type: 'string', example: 'John' },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Search results',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            count: { type: 'integer' },
                                            data: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/User' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        400: { description: 'Missing name query parameter' },
                        401: { description: 'Missing API key' },
                        403: { description: 'Invalid API key' },
                    },
                },
            },
            '/api/v1/users/{id}': {
                get: {
                    tags: ['Users'],
                    summary: 'Get user by ID',
                    description: 'Returns a single user by their ID.',
                    security: [{ ApiKeyAuth: [] }],
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'User ID',
                            schema: { type: 'integer', example: 1 },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'User found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                                },
                            },
                        },
                        400: { description: 'Invalid user ID' },
                        401: { description: 'Missing API key' },
                        403: { description: 'Invalid API key' },
                        404: { description: 'User not found' },
                    },
                },
                put: {
                    tags: ['Users'],
                    summary: 'Update a user',
                    description: 'Updates a user\'s name, email, or both. At least one field must be provided.',
                    security: [{ ApiKeyAuth: [] }],
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'User ID',
                            schema: { type: 'integer', example: 1 },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UserUpdate' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'User updated successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                                },
                            },
                        },
                        400: { description: 'Invalid ID or no fields provided' },
                        401: { description: 'Missing API key' },
                        403: { description: 'Invalid API key' },
                        404: { description: 'User not found' },
                    },
                },
                delete: {
                    tags: ['Users'],
                    summary: 'Delete a user',
                    description: 'Permanently deletes a user by their ID.',
                    security: [{ ApiKeyAuth: [] }],
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'User ID',
                            schema: { type: 'integer', example: 1 },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'User deleted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            message: { type: 'string', example: 'User John Doe deleted successfully' },
                                            data: { $ref: '#/components/schemas/User' },
                                        },
                                    },
                                },
                            },
                        },
                        400: { description: 'Invalid user ID' },
                        401: { description: 'Missing API key' },
                        403: { description: 'Invalid API key' },
                        404: { description: 'User not found' },
                    },
                },
            },
        },
    },
    apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
