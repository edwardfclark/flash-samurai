import { Group } from '../src/models/group';
import { IUser } from '../src/models/user';
import { connect, clearDatabase, closeDatabase } from './db';
import { app } from '../src/app';
import request from 'supertest';
import { Server } from 'http';

const userArgs: IUser = {
  username: 'testuser',
  password: 'testpassword',
};

let application: Server;
let authorization: string;

beforeAll(async () => {
  application = app.listen(0);

  await connect();
});

beforeEach(async () => {
  // Login
  await request(application).post('/api/signup').send(userArgs);
  const res = await request(application).post('/api/login').send(userArgs);
  authorization = `Bearer ${res.body.token}`;

  const group1 = Group.build({
    name: 'group1',
    description: 'group1',
    owner: userArgs.username,
  });

  await group1.save();

  const group2 = Group.build({
    name: 'group2',
    description: 'group2',
    owner: userArgs.username,
  });

  await group2.save();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  application.close();
});

describe('/api/group GET', () => {
  it('fetches multiple groups', async () => {
    const res = await request(application).get(`/api/group`).set('authorization', authorization);
    const { body } = res;
    const { data } = body;

    expect(data.length).toBe(2);
  });
  it('has a default value of 10 for limit, and a default of 0 for page', async () => {
    const res = await request(application).get(`/api/group`).set('authorization', authorization);
    const { body } = res;
    const { limit, page } = body;

    expect(limit).toBe(10);
    expect(page).toBe(0);
  });
  it('allows you to request a higher limit', async () => {
    const res = await request(application).get(`/api/group?limit=100`).set('authorization', authorization);
    const { body } = res;
    const { data, limit } = body;

    expect(limit).toBe(100);
    expect(data.length).toBe(2);
  });
  it('allows you to request a higher page', async () => {
    const res = await request(application).get(`/api/group?page=2`).set('authorization', authorization);
    const { body } = res;
    const { data, page } = body;

    expect(page).toBe(2);
    expect(data.length).toBe(0);
  });
});
