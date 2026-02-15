import { Router, Request, Response } from 'express';

const router = Router();

interface ApiInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  endpoints: string[];
}

router.get('/info', (_req: Request, res: Response) => {
  const apiInfo: ApiInfo = {
    name: 'DevOps Practical Test API',
    version: '1.0.0',
    description: 'A production-ready microservice demonstrating DevOps best practices',
    author: 'Your Name',
    endpoints: [
      'GET /health - Public health check',
      'GET /ready - Public readiness check',
      'GET /api/v1/info - API information (requires API key)',
      'GET /api/v1/users - Get all users (requires API key)',
      'POST /api/v1/users - Create user (requires API key)',
    ],
  };

  res.status(200).json({
    ...apiInfo,
    authentication: {
      type: 'API Key',
      header: 'X-API-Key',
      required: true,
    },
  });
});

interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

router.get('/users', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

router.post('/users', (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required',
    });
  }

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
  };

  users.push(newUser);

  return res.status(201).json({
    success: true,
    data: newUser,
  });
});

export default router;