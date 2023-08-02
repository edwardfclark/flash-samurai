import { Group, IGroup } from '../src/models/group';
import { ITag, Tag } from '../src/models/tag';
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
  owner: userArgs.username,
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

  const testTags: ITag[] = [
    {
      name: 'tag1',
      description: 'description1',
      groupId: group._id,
    },
    {
      name: 'tag2',
      description: 'description2',
      groupId: group._id,
    },
    {
      name: 'tag3',
      description: 'description3',
      groupId: 'wrongID',
    },
  ];

  testTags.forEach(async (tagArgs) => {
    const tag = Tag.build(tagArgs);
    await tag.save();
  });
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  await application.close();
});

describe('/api/group/:id/tags GET', () => {
  it('fetches multiple tags', async () => {
    const { _id: id } = group;
    const res = await request(application).get(`/api/group/${id}/tags`).set('authorization', authorization);
    const { body } = res;
    const { data, total } = body;

    expect(data).toHaveLength(2);
    expect(total).toBe(2);
  });
  it('only includes tags with the correct groupId', async () => {
    const { _id: id } = group;
    const res = await request(application).get(`/api/group/${id}/tags`).set('authorization', authorization);
    const { body } = res;
    const { data, total } = body;

    expect(total).toBe(2);
    expect(Boolean(data.find((tag: ITag) => tag.name === 'tag3'))).toBe(false);
  });
});
