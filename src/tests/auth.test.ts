import request from 'supertest';
import { app } from '../server';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/auth';

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await prisma.dailyLog.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('should login existing user', async () => {
    // Create a user first
    const hashedPassword = await bcrypt.hash('testPassword123', 10);
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User'
      }
    });

    // Try to login
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testPassword123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not register user with invalid email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test User'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should not register user with weak password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'test2@example.com',
        password: 'weak',
        name: 'Test User'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should not login with incorrect password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword123'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should not login with non-existent email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle invalid JWT token format', async () => {
    const res = await request(app)
      .get('/logs')
      .set('Authorization', 'Bearer invalid.token.format');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle missing Authorization header', async () => {
    const res = await request(app)
      .get('/logs');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle malformed Authorization header', async () => {
    const res = await request(app)
      .get('/logs')
      .set('Authorization', 'InvalidFormat Token');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle expired JWT token', async () => {
    // Create an expired token
    const expiredToken = jwt.sign(
      { userId: 'test-user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '0s' }
    );

    const res = await request(app)
      .get('/logs')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle token without userId', async () => {
    // Create a token without userId
    const invalidToken = jwt.sign(
      { someOtherField: 'value' },
      process.env.JWT_SECRET || 'test-secret'
    );

    const res = await request(app)
      .get('/logs')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  describe('GET /auth/me', () => {
    it('should return user data with valid token', async () => {
      // Create test user with unique email
      const user = await prisma.user.create({
        data: {
          email: 'me-test@example.com', // Changed email to be unique
          password: 'hashedPassword',
          name: 'Test User'
        }
      });

      const token = generateToken(user.id);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'me-test@example.com');
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/auth/me');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'No authorization header');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    it('should return 404 for non-existent user', async () => {
      const token = generateToken('non-existent-id');

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });
}); 