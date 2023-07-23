import { Tag, ITag } from '../src/models/tag';
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
  name: 'test',
};

const tagArgs: Omit<ITag, 'groupId'> = {
  name: 'Test Tag',
  description: 'Test description',
};

let tag: Document;
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
  tag = Tag.build({ ...tagArgs, groupId: group._id });
  await tag.save();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  application.close();
});

describe('/api/tag GET', () => {
  it('successfully returns a tag', async () => {
    const { _id: id } = tag;
    const res = await request(application).get(`/api/tag/${id}`).set('authorization', authorization);
    const { body } = res;

    expect(body.name).toEqual(tagArgs.name);
    expect(body.description).toEqual(tagArgs.description);
  });

  it('throws an error if the ID is invalid', async () => {
    const res = await request(application).get(`/api/tag/invalid-id`).set('authorization', authorization);

    expect(res.status).toBe(500);
  });
});
