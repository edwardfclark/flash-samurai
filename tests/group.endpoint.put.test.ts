import { Card, ICard } from '../src/models/card';
import { Group, IGroup } from '../src/models/group';
import { IUser } from '../src/models/user';
import { connect, clearDatabase, closeDatabase } from './db';
import { Document } from 'mongoose';
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

let group: Document;
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

  group = Group.build(groupArgs);
  await group.save();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  application.close();
});

describe('/api/group/:id PUT', () => {
  it('successfully updates a group', async () => {
    const { _id: id } = group;
    const res = await request(application)
      .put(`/api/group/${id}`)
      .set('authorization', authorization)
      .send({
        ...groupArgs,
        name: 'Updated name',
        description: 'Updated description',
      });
    const { status } = res;
    expect(status).toBe(201);

    const storedGroup = await Group.findById(id);
    expect(storedGroup?.name).toEqual('Updated name');
    expect(storedGroup?.description).toEqual('Updated description');
  });
  it('returns the newly updated group', async () => {
    const { _id: id } = group;
    const res = await request(application)
      .put(`/api/group/${id}`)
      .set('authorization', authorization)
      .send({
        ...groupArgs,
        name: 'Updated name',
        description: 'Updated description',
      });
    const { body } = res;
    expect(body?.name).toEqual('Updated name');
    expect(body?.description).toEqual('Updated description');
  });
  it('throws an error if given a bad id', async () => {
    const res = await request(application)
      .put(`/api/group/ayy_lmao`)
      .set('authorization', authorization)
      .send({
        ...groupArgs,
        name: 'Updated name',
        description: 'Updated description',
      });
    const { status } = res;
    expect(status).toBe(500);
  });
});
