import { Card, ICard } from '../src/models/card';
import { Group, IGroup } from '../src/models/group';
import { IUser } from '../src/models/user';
import { Tag, ITag } from '../src/models/tag';
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

describe('/api/tag/:id PUT', () => {
  it('successfully updates a tag', async () => {
    const res = await request(application)
      .put(`/api/tag/${tag._id}`)
      .set('Authorization', authorization)
      .send({ name: 'Updated Tag' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Tag');
  });
  it('finds all cards with the old tag and updates them', async () => {
    await request(application)
      .put(`/api/tag/${tag._id}`)
      .set('Authorization', authorization)
      .send({ name: 'Updated Tag' });
    const res = await request(application).get(`/api/card/${card._id}`).set('Authorization', authorization);

    const {
      body: { tags },
    } = res;

    expect(tags[0].name).toBe('Updated Tag');
  });
});
