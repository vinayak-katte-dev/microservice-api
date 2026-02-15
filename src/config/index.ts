import { Options } from 'express-rate-limit';

interface Config {
    port: number;
    nodeEnv: string;
    logLevel: string;
    apiKey: string;
    cors: {
        origins: string[];
    };
    rateLimit: Partial<Options>;
}

export const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    apiKey: process.env.API_KEY || 'dev-api-key-12345',
    cors: {
        origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
    },
};
