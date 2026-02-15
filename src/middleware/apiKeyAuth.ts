import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import logger from '../config/logger';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header('X-API-Key');

    if (!apiKey) {
        logger.warn('API request without API key', {
            path: req.path,
            method: req.method,
            ip: req.ip,
        });

        res.status(401).json({
            status: 'error',
            statusCode: 401,
            message: 'API key is required. Please provide X-API-Key header.',
        });
        return;
    }

    if (apiKey !== config.apiKey) {
        logger.warn('API request with invalid API key', {
            path: req.path,
            method: req.method,
            ip: req.ip,
            providedKey: apiKey.substring(0, 5) + '***', // Log only first 5 chars
        });

        res.status(403).json({
            status: 'error',
            statusCode: 403,
            message: 'Invalid API key.',
        });
        return;
    }

    logger.debug('API request authenticated successfully', {
        path: req.path,
        method: req.method,
    });

    next();
};
