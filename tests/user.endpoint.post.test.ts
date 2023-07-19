import { User, IUser } from '../src/models/user';
import { connect, clearDatabase, closeDatabase } from './db';
import bcrypt from 'bcryptjs';
import { app } from '../src/app';
import request from 'supertest';
import { Server } from 'http';

const userArgs: IUser = {
  username: 'testuser',
  password: 'testpassword',
};

let application: Server;

beforeAll(async () => {
  application = app.listen(0);

  await connect();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  application.close();
});

describe('/api/signup POST', () => {
  it('successfully creates a new user', async () => {
    const res = await request(application).post('/api/signup').send(userArgs);
    const { body } = res;
    const id = body?._id;
    const user = await User.findById(id);
    const compareResult = await bcrypt.compare(userArgs.password, user?.password ?? '');

    expect(user?.username).toEqual(userArgs.username);
    expect(compareResult).toEqual(true);
  });
  it('returns the newly created document', async () => {
    const res = await request(application).post('/api/signup').send(userArgs);
    const { body } = res;

    expect(body?.username).toEqual(userArgs.username);
  });
  it('returns an error if the user already exists', async () => {
    await request(application).post('/api/signup').send(userArgs);
    const res = await request(application).post('/api/signup').send(userArgs);
    const { body, status } = res;

    expect(status).toEqual(400);
    expect(body?.error).toBeDefined();
    expect(body?.error).toEqual('User already exists');
  });
});

describe('/api/login POST', () => {
  it('succsessfully logs in a user if the correct username and password are provided', async () => {
    await request(application).post('/api/signup').send(userArgs);

    const res = await request(application).post('/api/login').send(userArgs);
    const { body, status } = res;

    expect(status).toEqual(200);
    expect(body?.token).toBeDefined();
  });
  it('returns an error if the username is incorrect', async () => {
    await request(application).post('/api/signup').send(userArgs);

    const res = await request(application)
      .post('/api/login')
      .send({ ...userArgs, username: 'wrongusername' });
    const { body, status } = res;

    expect(status).toEqual(400);
    expect(body?.error).toBeDefined();
    expect(body?.error).toEqual('Invalid user');
  });
  it('returns an error if the username is incorrect', async () => {
    await request(application).post('/api/signup').send(userArgs);

    const res = await request(application)
      .post('/api/login')
      .send({ ...userArgs, password: 'wrongpassword' });
    const { body, status } = res;

    expect(status).toEqual(400);
    expect(body?.error).toBeDefined();
    expect(body?.error).toEqual('Invalid password');
  });
});
