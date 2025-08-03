const request = require('supertest');
const app = require('../../server');

describe('Health Routes', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/api/health/detailed')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('application');
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('database');
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/api/health/ready');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
      expect(response.body).toHaveProperty('ready');
    });
  });

  describe('GET /api/health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app)
        .get('/api/health/live')
        .expect(200);
      
      expect(response.body).toHaveProperty('alive', true);
    });
  });
});