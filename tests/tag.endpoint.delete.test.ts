import { Group, IGroup } from '../src/models/group';
import { Card, ICard } from '../src/models/card';
import { Tag, ITag } from '../src/models/tag';
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

const cardArgs: Omit<ICard, 'groupId'> = {
  question: 'Why did the chicken cross the road?',
  answer: 'To get to the other side!',
};

const tagArgs: Omit<ITag, 'groupId'> = {
  name: 'Test Tag',
  description: 'This is a test tag',
};

let card: Document;
let group: Document;
let tag: Document;
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
  // @ts-ignore
  card = Card.build({ ...cardArgs, groupId: group._id, tags: [tag] });
  await card.save();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  application.close();
});

describe('/api/tag/:id DELETE', () => {
  it('deletes the record when given the correct ID', async () => {
    const { _id: id } = tag;
    const res = await request(application).delete(`/api/tag/${id}`).set('authorization', authorization);
    const { status } = res;

    expect(status).toBe(200);
  });
  it('finds all cards with the old tag and removes the tag', async () => {
    const { _id: id } = tag;
    await request(application).delete(`/api/tag/${id}`).set('authorization', authorization);

    const res = await request(application).get(`/api/card/${card._id}`).set('authorization', authorization);
    const {
      body: { tags },
    } = res;

    expect(tags).toHaveLength(0);
  });
});
