import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import User from '../models/user';

describe('Test user authentication', () => {
  beforeAll(async () => {});
  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
  });
  it('user signup successful', async () => {
    const details = {
      username: 'testUser',
      name: 'user1',
      email: 'user1@gmail.com',
      password: '123456',
    };
    const response: any = await request(app).post('/auth/signup').send(details);
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch('signed up successfully');
  });
  it('user signup email existed', async () => {
    const details = {
      username: 'testUser',
      name: 'user1',
      email: 'user1@gmail.com',
      password: '123456',
    };
    const response: any = await request(app).post('/auth/signup').send(details);
    expect(response.status).toBe(200);
    expect(response.body.error).toMatch('the email has been registered');
  });
  it('user signup username existed', async () => {
    const details = {
      username: 'testUser',
      name: 'user2',
      email: 'user2@gmail.com',
      password: '123456',
    };
    const response: any = await request(app).post('/auth/signup').send(details);
    expect(response.status).toBe(200);
    expect(response.body.error).toMatch('the username is already existed');
  });
  it('user login successful', async () => {
    const details = {
      email: 'user1@gmail.com',
      password: '123456',
    };
    const response: any = await request(app).post('/auth/login').send(details);
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch('successfully logged in');
  });
  it('user login unsuccessful', async () => {
    const details = {
      email: 'user1@gmail.com',
      password: '123456789',
    };
    const response: any = await request(app).post('/auth/login').send(details);
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(
      'incorrect email address or password'
    );
  });
});
