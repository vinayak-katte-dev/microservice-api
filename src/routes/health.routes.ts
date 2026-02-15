import { Router, Request, Response } from 'express';

const router = Router();

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

router.get('/health', (_req: Request, res: Response) => {
  const healthResponse: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  res.status(200).json(healthResponse);
});

router.get('/ready', (_req: Request, res: Response) => {
  const isReady = true;

  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;