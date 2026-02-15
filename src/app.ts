import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import healthRoutes from './routes/health.routes';
import apiRoutes from './routes/api.routes';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origins }));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Public routes (no authentication required)
app.use('/', healthRoutes);

// Protected API routes (authentication required)
app.use('/api/v1', apiKeyAuth, apiRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Welcome to DevOps Test API',
    version: '1.0.0',
    documentation: '/api/v1/info',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;