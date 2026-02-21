import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import healthRoutes from './routes/health.routes';
import apiRoutes from './routes/api.routes';

const app: Application = express();

// Security middleware - disable CSP for Swagger UI route
app.use('/api-docs', helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
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

// Swagger UI - public, no auth needed
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Microservice API Documentation',
}));

// Swagger spec as JSON
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Public routes (no authentication required)
app.use('/', healthRoutes);

// Protected API routes (authentication required)
app.use('/api/v1', apiKeyAuth, apiRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Welcome to DevOps Test API',
    version: '1.0.0',
    documentation: '/api-docs',
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