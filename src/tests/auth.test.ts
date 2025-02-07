import request from 'supertest';
import { app } from '../server';
import prisma from '../lib/prisma';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
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
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123'
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
}); 