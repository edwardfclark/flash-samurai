import { Group, IGroup } from '../src/models/group';
import { connect, clearDatabase, closeDatabase } from './db';
import { Document } from 'mongoose';
import { app } from '../src/app';
import request from 'supertest';
import { Server } from 'http';

const groupArgs: IGroup = {
  name: 'Test',
  description: 'This is a description for the Test group',
};

let group: Document;
let application: Server;

beforeAll(async () => {
  application = await app.listen(0, () => {});

  await connect();
});

beforeEach(async () => {
  group = Group.build(groupArgs);
  await group.save();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  await application.close();
});

describe('/api/group/:id GET', () => {
  it('successfully returns a group', async () => {
    const { _id: id } = group;
    const res = await request(application).get(`/api/group/${id}`);
    const { body } = res;

    expect(body.name).toEqual(groupArgs.name);
    expect(body.description).toEqual(groupArgs.description);
  });

  it('throws an error if the ID is invalid', async () => {
    const res = await request(application).get(`/api/group/invalid-id`);

    expect(res.status).toBe(500);
  });
});
