import app from './app';
import { config } from './config';
import logger from './config/logger';

const PORT = config.port;

const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`, {
        environment: config.nodeEnv,
        port: PORT,
    });
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
    logger.info(`${signal} signal received: closing HTTP server`);
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });

    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Rejection', { reason: reason.message, stack: reason.stack });
    throw reason;
});

process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', { message: error.message, stack: error.stack });
    process.exit(1);
});