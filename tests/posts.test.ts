import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import User from '../models/user';

describe('Test post module', () => {
  beforeAll(async () => {
    const details = {
      username: 'testUser',
      name: 'user1',
      email: 'user1@gmail.com',
      password: '123456',
      text: 'hellooooooooo worlddddddddddd',
      location: 'location',
      avatar: '',
    };
    await request(app).post('/auth/signup').send(details);
  });
  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
  });
  // it('add post', async () => {
  //   const details = {
  //     username: 'testUser',
  //     name: 'user1',
  //     email: 'user1@gmail.com',
  //     password: '123456',
  //     text: 'hellooooooooo worlddddddddddd',
  //     location: 'location',
  //     avatar: '',
  //   };
  //   await request(app).post('/auth/login').send(details);
  //   const response: any = await request(app)
  //     .post('/posts/addPost')
  //     .send(details);
  //   expect(response.status).toBe(200);
  //   expect(response.body.message).toMatch('Posted');
  // });
  it('get all posts', async () => {
    const details = {
      email: 'user1@gmail.com',
      password: '123456',
    };
    var cookie: any;
    await request(app)
      .post('/auth/login')
      .send(details)
      .end(function (err, res) {
        cookie = res.headers['set-cookie'];
      });
    const response: any = await request(app)
      .get('/posts/getAllPosts')
      .set('Cookie', cookie);
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch('Posted');
  });
});
