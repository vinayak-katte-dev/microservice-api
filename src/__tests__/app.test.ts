import request from 'supertest';
import app from '../app';

describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Welcome to DevOps Test API');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app).get('/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ready');
    });
  });

  describe('GET /api/v1/info', () => {
    it('should return 401 without API key', async () => {
      const response = await request(app).get('/api/v1/info');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should return API information with valid API key', async () => {
      const response = await request(app)
        .get('/api/v1/info')
        .set('X-API-Key', 'dev-api-key-12345');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(Array.isArray(response.body.endpoints)).toBe(true);
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return 401 without API key', async () => {
      const response = await request(app).get('/api/v1/users');

      expect(response.status).toBe(401);
    });

    it('should return list of users with valid API key', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('X-API-Key', 'dev-api-key-12345');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should return 401 without API key', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const response = await request(app).post('/api/v1/users').send(newUser);

      expect(response.status).toBe(401);
    });

    it('should create a new user with valid API key', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('X-API-Key', 'dev-api-key-12345')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', newUser.name);
      expect(response.body.data).toHaveProperty('email', newUser.email);
    });

    it('should return 400 if name is missing', async () => {
      const invalidUser = {
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('X-API-Key', 'dev-api-key-12345')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/status', () => {
    it('should return 401 without API key', async () => {
      const response = await request(app).get('/api/v1/status');

      expect(response.status).toBe(401);
    });

    it('should return system status with valid API key', async () => {
      const response = await request(app)
        .get('/api/v1/status')
        .set('X-API-Key', 'dev-api-key-12345');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('system');
      expect(response.body.system).toHaveProperty('nodeVersion');
      expect(response.body.system).toHaveProperty('platform');
      expect(response.body.system).toHaveProperty('uptime');
      expect(response.body.system).toHaveProperty('memory');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Route not found');
    });
  });
});
