import { Group } from '../src/models/group';

import { connect, clearDatabase, closeDatabase } from './db';
import { app } from '../src/app';
import request from 'supertest';
import { Server } from 'http';

let application: Server;

beforeAll(async () => {
  application = await app.listen(0, () => {});

  await connect();
});

beforeEach(async () => {
  const group1 = Group.build({
    name: 'group1',
    description: 'group1',
  });

  await group1.save();

  const group2 = Group.build({
    name: 'group2',
    description: 'group2',
  });

  await group2.save();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  await application.close();
});

describe('/api/group GET', () => {
  it('fetches multiple groups', async () => {
    const res = await request(application).get(`/api/group`);
    const { body } = res;
    const { data } = body;

    expect(data.length).toBe(2);
  });
  it('has a default value of 10 for limit, and a default of 1 for page', async () => {
    const res = await request(application).get(`/api/group`);
    const { body } = res;
    const { limit, page } = body;

    expect(limit).toBe(10);
    expect(page).toBe(1);
  });
  it('allows you to request a higher limit', async () => {
    const res = await request(application).get(`/api/group?limit=100`);
    const { body } = res;
    const { data, limit } = body;

    expect(limit).toBe(100);
    expect(data.length).toBe(2);
  });
  it('allows you to request a higher page', async () => {
    const res = await request(application).get(`/api/group?page=2`);
    const { body } = res;
    const { data, page } = body;

    expect(page).toBe(2);
    expect(data.length).toBe(0);
  });
});
