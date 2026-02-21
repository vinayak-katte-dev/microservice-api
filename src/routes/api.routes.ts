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
      'GET /api/v1/status - System status (requires API key)',
      'GET /api/v1/users - Get all users (requires API key)',
      'GET /api/v1/users/:id - Get user by ID (requires API key)',
      'GET /api/v1/users/search?name=xxx - Search users (requires API key)',
      'POST /api/v1/users - Create user (requires API key)',
      'PUT /api/v1/users/:id - Update user (requires API key)',
      'DELETE /api/v1/users/:id - Delete user (requires API key)',
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

// in-memory store for demo purposes
const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Mike Wilson', email: 'mike@example.com' },
];

let nextId = 4;

// get all users
router.get('/users', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// search users by name
router.get('/users/search', (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Query parameter "name" is required',
    });
  }

  const results = users.filter(
    (u) => u.name.toLowerCase().includes(name.toLowerCase())
  );

  return res.status(200).json({
    success: true,
    count: results.length,
    data: results,
  });
});

// get single user by id
router.get('/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID',
    });
  }

  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `User with id ${id} not found`,
    });
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
});

// create user
router.post('/users', (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required',
    });
  }

  // check if email already exists
  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'A user with this email already exists',
    });
  }

  const newUser: User = {
    id: nextId++,
    name,
    email,
  };

  users.push(newUser);

  return res.status(201).json({
    success: true,
    data: newUser,
  });
});

// update user
router.put('/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID',
    });
  }

  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `User with id ${id} not found`,
    });
  }

  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({
      success: false,
      message: 'At least one of name or email is required',
    });
  }

  // update only the fields that are provided
  if (name) users[index].name = name;
  if (email) users[index].email = email;

  return res.status(200).json({
    success: true,
    data: users[index],
  });
});

// delete user
router.delete('/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID',
    });
  }

  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `User with id ${id} not found`,
    });
  }

  const deleted = users.splice(index, 1)[0];

  return res.status(200).json({
    success: true,
    message: `User ${deleted.name} deleted successfully`,
    data: deleted,
  });
});

// system status
router.get('/status', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'operational',
    timestamp: new Date().toISOString(),
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: {
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        unit: 'MB',
      },
    },
  });
});

export default router;