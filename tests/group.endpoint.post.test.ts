import { Group, IGroup } from '../src/models/group';
import { connect, clearDatabase, closeDatabase } from './db';
import { app } from '../src/app';
import request from 'supertest';
import { Server } from 'http';

const groupArgs: IGroup = {
  name: 'Test',
  description: 'This is a description for the Test group',
};

let application: Server;

beforeAll(async () => {
  application = await app.listen(0, () => {});

  await connect();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  await application.close();
});

describe('/api/group POST', () => {
  it('successfully creates a new group', async () => {
    const res = await request(application).post('/api/group').send(groupArgs);
    const { body } = res;

    const id = body?._id;
    const group = await Group.findById(id);

    expect(group?.name).toEqual(groupArgs.name);
    expect(group?.description).toEqual(groupArgs.description);
  });
  it('returns the newly created document', async () => {
    const res = await request(application).post('/api/group').send(groupArgs);
    const { body } = res;

    expect(body?.name).toEqual(groupArgs.name);
    expect(body?.description).toEqual(groupArgs.description);
  });
});
