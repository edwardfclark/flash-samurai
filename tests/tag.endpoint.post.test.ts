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
  owner: userArgs.username,
};

const tagArgs: Omit<ITag, 'groupId'> = {
  name: 'Test Tag',
  description: 'This is a test tag',
};

let application: Server;
let group: Document;
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

describe('/api/tag POST', () => {
  it('successfully creates a new tag', async () => {
    const res = await request(application)
      .post('/api/tag')
      .set('authorization', authorization)
      .send({ ...tagArgs, groupId: group?._id });
    const { body } = res;

    const id = body?._id;
    const tag = await Tag.findById(id);

    expect(tag?.name).toEqual(tagArgs.name);
    expect(tag?.description).toEqual(tagArgs.description);
  });
  it('returns the newly created tag', async () => {
    const res = await request(application)
      .post('/api/tag')
      .set('authorization', authorization)
      .send({ ...tagArgs, groupId: group?._id });
    const { body } = res;

    expect(body.name).toEqual(tagArgs.name);
    expect(body.description).toEqual(tagArgs.description);
  });
  it('does not create records with keys that are not in the model', async () => {
    const res = await request(application)
      .post('/api/tag')
      .set('authorization', authorization)
      .send({ ...tagArgs, groupId: group?._id, foo: 'bar' });
    const { body } = res;

    expect(body.foo).toBeUndefined();
  });
  it('does not create tags for groups that do not exist', async () => {
    const res = await request(application)
      .post('/api/tag')
      .set('authorization', authorization)
      .send({ ...tagArgs, groupId: 'bogus group' });
    const { body, status } = res;

    const id = body?._id;
    const tag = await Tag.findById(id);

    expect(status).toEqual(500);
    expect(tag).toBeNull();
  });
  it('does not create duplicate tags', async () => {
    await request(application)
      .post('/api/tag')
      .set('authorization', authorization)
      .send({ ...tagArgs, groupId: group?._id });

    const res = await request(application)
      .post('/api/tag')
      .set('authorization', authorization)
      .send({ ...tagArgs, groupId: group?._id });

    const { status, body } = res;

    expect(status).toEqual(500);
    expect(body.name).toBeUndefined();
    expect(body.description).toBeUndefined();
  });
});
