import { Group, IGroup } from '../src/models/group';
import { IUser } from '../src/models/user';
import { connect, clearDatabase, closeDatabase } from './db';
import { app } from '../src/app';
import request from 'supertest';
import { Server } from 'http';

const userArgs: IUser = {
  username: 'testuser',
  password: 'testpassword',
};

const groupArgs: IGroup = {
  name: 'Test',
  description: 'This is a description for the Test group',
};

let application: Server;
let authorization: string;

beforeAll(async () => {
  application = await app.listen(0, () => {});

  await connect();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  await application.close();
});

beforeEach(async () => {
  // Login
  await request(application).post('/api/signup').send(userArgs);
  const res = await request(application).post('/api/login').send(userArgs);
  authorization = `Bearer ${res.body.token}`;
});

describe('/api/group POST', () => {
  it('successfully creates a new group', async () => {
    const res = await request(application).post('/api/group').set('authorization', authorization).send(groupArgs);
    const { body } = res;

    const id = body?._id;
    const group = await Group.findById(id);

    expect(group?.name).toEqual(groupArgs.name);
    expect(group?.description).toEqual(groupArgs.description);
  });
  it('returns the newly created document', async () => {
    const res = await request(application).post('/api/group').set('authorization', authorization).send(groupArgs);
    const { body } = res;

    expect(body?.name).toEqual(groupArgs.name);
    expect(body?.description).toEqual(groupArgs.description);
  });
  it('will not create a group with the same name', async () => {
    await request(application).post('/api/group').set('authorization', authorization).send(groupArgs);
    const res = await request(application).post('/api/group').set('authorization', authorization).send(groupArgs);
    const { status } = res;

    expect(status).toEqual(500);
  });
});
