import request from 'supertest';
import app from '../app';

const API_KEY = 'dev-api-key-12345';

describe('API Endpoints', () => {
  // ---- public routes ----

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

  // ---- authentication tests ----

  describe('Authentication', () => {
    it('should reject requests without API key', async () => {
      const response = await request(app).get('/api/v1/users');
      expect(response.status).toBe(401);
    });

    it('should reject requests with wrong API key', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('X-API-Key', 'wrong-key');
      expect(response.status).toBe(403);
    });
  });

  // ---- /api/v1/info ----

  describe('GET /api/v1/info', () => {
    it('should return API information with valid key', async () => {
      const response = await request(app)
        .get('/api/v1/info')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.authentication).toHaveProperty('type', 'API Key');
    });
  });

  // ---- /api/v1/status ----

  describe('GET /api/v1/status', () => {
    it('should return system status', async () => {
      const response = await request(app)
        .get('/api/v1/status')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.system).toHaveProperty('nodeVersion');
      expect(response.body.system).toHaveProperty('uptime');
      expect(response.body.system.memory).toHaveProperty('used');
    });
  });

  // ---- GET /api/v1/users ----

  describe('GET /api/v1/users', () => {
    it('should return all users', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // ---- GET /api/v1/users/:id ----

  describe('GET /api/v1/users/:id', () => {
    it('should return a user by id', async () => {
      const response = await request(app)
        .get('/api/v1/users/1')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('email');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/users/999')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app)
        .get('/api/v1/users/abc')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // ---- GET /api/v1/users/search ----

  describe('GET /api/v1/users/search', () => {
    it('should find users by name', async () => {
      const response = await request(app)
        .get('/api/v1/users/search?name=John')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array when no match', async () => {
      const response = await request(app)
        .get('/api/v1/users/search?name=zzzznotaname')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    it('should return 400 without name param', async () => {
      const response = await request(app)
        .get('/api/v1/users/search')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(400);
    });
  });

  // ---- POST /api/v1/users ----

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const newUser = { name: 'Test User', email: 'testuser@example.com' };

      const response = await request(app)
        .post('/api/v1/users')
        .set('X-API-Key', API_KEY)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newUser.name);
      expect(response.body.data.email).toBe(newUser.email);
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('X-API-Key', API_KEY)
        .send({ email: 'no-name@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('X-API-Key', API_KEY)
        .send({ name: 'No Email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('X-API-Key', API_KEY)
        .send({ name: 'Duplicate', email: 'john@example.com' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  // ---- PUT /api/v1/users/:id ----

  describe('PUT /api/v1/users/:id', () => {
    it('should update user name', async () => {
      const response = await request(app)
        .put('/api/v1/users/1')
        .set('X-API-Key', API_KEY)
        .send({ name: 'John Updated' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('John Updated');
    });

    it('should update user email', async () => {
      const response = await request(app)
        .put('/api/v1/users/2')
        .set('X-API-Key', API_KEY)
        .send({ email: 'jane.updated@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('jane.updated@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/v1/users/999')
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ghost' });

      expect(response.status).toBe(404);
    });

    it('should return 400 if no fields provided', async () => {
      const response = await request(app)
        .put('/api/v1/users/1')
        .set('X-API-Key', API_KEY)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app)
        .put('/api/v1/users/abc')
        .set('X-API-Key', API_KEY)
        .send({ name: 'Test' });

      expect(response.status).toBe(400);
    });
  });

  // ---- DELETE /api/v1/users/:id ----

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete a user', async () => {
      const response = await request(app)
        .delete('/api/v1/users/3')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 3);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/v1/users/999')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app)
        .delete('/api/v1/users/abc')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(400);
    });
  });

  // ---- 404 handler ----

  describe('GET /nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Route not found');
    });
  });
});
