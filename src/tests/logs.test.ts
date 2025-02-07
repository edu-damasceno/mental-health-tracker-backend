import request from 'supertest';
import { app } from '../server';
import prisma from '../lib/prisma';

describe('Logs Endpoints', () => {
  let authToken: string;
  let logId: string;

  beforeAll(async () => {
    // Clean up and create test user
    await prisma.dailyLog.deleteMany();
    await prisma.user.deleteMany();

    const authRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User'
      });

    authToken = authRes.body.token;
  });

  it('should create a new log', async () => {
    const res = await request(app)
      .post('/logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        moodLevel: 4,
        anxietyLevel: 2,
        sleepHours: 7,
        sleepQuality: 'Good',
        physicalActivity: '30 minutes walking',
        socialInteractions: 'Met with friends',
        stressLevel: 3,
        symptoms: 'Mild anxiety'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    logId = res.body.id;
  });

  it('should get this week\'s logs correctly', async () => {
    const now = new Date();
    
    // Create a log for this week (today)
    const thisWeekLog = await request(app)
      .post('/logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        moodLevel: 4,
        anxietyLevel: 2,
        sleepHours: 7,
        sleepQuality: 'Good',
        physicalActivity: '30 minutes walking',
        socialInteractions: 'Met with friends',
        stressLevel: 3,
        symptoms: 'This week log',
        date: now.toISOString() // Send as ISO string
      });

    // Create a log for last week (9 days ago)
    const lastWeekDate = new Date(now);
    lastWeekDate.setDate(lastWeekDate.getDate() - 9);
    const lastWeekLog = await request(app)
      .post('/logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        moodLevel: 4,
        anxietyLevel: 2,
        sleepHours: 7,
        sleepQuality: 'Good',
        physicalActivity: '30 minutes walking',
        socialInteractions: 'Met with friends',
        stressLevel: 3,
        symptoms: 'Last week log',
        date: lastWeekDate.toISOString() // Send as ISO string
      });

    const res = await request(app)
      .get('/logs/filter?period=this-week')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((log: any) => log.symptoms === 'This week log')).toBe(true);
    expect(res.body.some((log: any) => log.symptoms === 'Last week log')).toBe(false);
  });

  it('should get last week\'s logs correctly', async () => {
    const res = await request(app)
      .get('/logs/filter?period=last-week')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((log: any) => log.symptoms === 'This week log')).toBe(false);
    expect(res.body.some((log: any) => log.symptoms === 'Last week log')).toBe(true);
  });

  it('should get custom period logs correctly', async () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';
    
    // Create a log within the custom period
    const customPeriodLog = await request(app)
      .post('/logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        moodLevel: 4,
        anxietyLevel: 2,
        sleepHours: 7,
        sleepQuality: 'Good',
        physicalActivity: '30 minutes walking',
        socialInteractions: 'Met with friends',
        stressLevel: 3,
        symptoms: 'Custom period log',
        date: new Date('2024-01-15')
      });

    const res = await request(app)
      .get(`/logs/filter?period=custom&startDate=${startDate}&endDate=${endDate}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((log: any) => log.symptoms === 'Custom period log')).toBe(true);
    expect(res.body.some((log: any) => log.symptoms === 'This week log')).toBe(false);
  });

  it('should validate custom period dates', async () => {
    const res = await request(app)
      .get('/logs/filter?period=custom&startDate=invalid-date')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should update a log', async () => {
    const res = await request(app)
      .put(`/logs/${logId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        moodLevel: 5,
        anxietyLevel: 1,
        sleepHours: 8,
        sleepQuality: 'Excellent',
        physicalActivity: '1 hour gym',
        socialInteractions: 'Family dinner',
        stressLevel: 2,
        symptoms: 'Feeling great'
      });

    expect(res.status).toBe(200);
    expect(res.body.moodLevel).toBe(5);
  });

  it('should delete a log', async () => {
    const res = await request(app)
      .delete(`/logs/${logId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(204);
  });

  it('should not create log with invalid data', async () => {
    const res = await request(app)
      .post('/logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        moodLevel: 11, // Invalid: should be 1-10
        anxietyLevel: -1, // Invalid: should be positive
        sleepHours: 25, // Invalid: more than 24 hours
        sleepQuality: '',
        physicalActivity: '',
        socialInteractions: '',
        stressLevel: 'high', // Invalid: should be number
        symptoms: ''
      });

    expect(res.status).toBe(400);
  });

  it('should not access logs without token', async () => {
    const res = await request(app)
      .get('/logs/filter?period=week');

    expect(res.status).toBe(401);
  });

  it('should not access logs with invalid token', async () => {
    const res = await request(app)
      .get('/logs/filter?period=week')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(401);
  });

  it('should not update another user\'s log', async () => {
    // Register another user
    const otherUserRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'other@example.com',
        password: 'Password123',
        name: 'Other User'
      });

    // Try to update first user's log with second user's token
    const res = await request(app)
      .put(`/logs/${logId}`)
      .set('Authorization', `Bearer ${otherUserRes.body.token}`)
      .send({
        moodLevel: 1,
        anxietyLevel: 1,
        sleepHours: 8,
        sleepQuality: 'Good',
        physicalActivity: 'None',
        socialInteractions: 'None',
        stressLevel: 1,
        symptoms: 'None'
      });

    expect(res.status).toBe(404);
  });

  it('should handle invalid period in filter', async () => {
    const res = await request(app)
      .get('/logs/filter?period=invalid')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
  });

  it('should get logs for a specific month', async () => {
    // Create logs for different months
    const januaryLog = await request(app)
      .post('/logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        moodLevel: 4,
        anxietyLevel: 2,
        sleepHours: 7,
        sleepQuality: 'Good',
        physicalActivity: '30 minutes walking',
        socialInteractions: 'Met with friends',
        stressLevel: 3,
        symptoms: 'January log',
        date: new Date('2024-01-15T12:00:00.000Z').toISOString()
      });

    const februaryLog = await request(app)
      .post('/logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        moodLevel: 4,
        anxietyLevel: 2,
        sleepHours: 7,
        sleepQuality: 'Good',
        physicalActivity: '30 minutes walking',
        socialInteractions: 'Met with friends',
        stressLevel: 3,
        symptoms: 'February log',
        date: new Date('2024-02-15T12:00:00.000Z').toISOString()
      });

    // Get logs for January 2024
    const res = await request(app)
      .get('/logs/filter?period=custom&startDate=2024-01-01&endDate=2024-01-31')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((log: any) => log.symptoms === 'January log')).toBe(true);
    expect(res.body.some((log: any) => log.symptoms === 'February log')).toBe(false);
  });
}); 