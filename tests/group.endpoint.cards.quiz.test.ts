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

const groupOneArgs: IGroup = {
  name: 'group1',
  description: 'group1 description',
  owner: userArgs.username,
};

const groupTwoArgs: IGroup = {
  name: 'group2',
  description: 'group2 description',
  owner: userArgs.username,
};

const tagOneArgs: Omit<ITag, 'groupId'> = {
  name: 'tag1',
  description: 'tag1 description',
};

const tagTwoArgs: Omit<ITag, 'groupId'> = {
  name: 'tag2',
  description: 'tag2 description',
};

let group1: Document;
let group2: Document;
let tag1: Document;
let tag2: Document;
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

  group1 = Group.build(groupOneArgs);
  await group1.save();

  group2 = Group.build(groupTwoArgs);
  await group2.save();

  tag1 = Tag.build({ ...tagOneArgs, groupId: group1._id });
  await tag1.save();

  tag2 = Tag.build({ ...tagTwoArgs, groupId: group2._id });
  await tag2.save();

  const testCards: ICard[] = [
    {
      question: 'question1',
      answer: 'answer1',
      tags: [{ ...tagOneArgs }],
      groupId: group1._id,
    },
    {
      question: 'question2',
      answer: 'answer2',
      tags: [{ ...tagTwoArgs }],
      groupId: group1._id,
    },
    {
      question: 'question3',
      answer: 'answer3',
      tags: [{ ...tagOneArgs }, { ...tagTwoArgs }],
      groupId: group1._id,
    },
    {
      question: 'question4',
      answer: 'answer3',
      groupId: group2._id,
    },
  ];

  testCards.forEach(async (cardArgs) => {
    const card = Card.build(cardArgs);
    await card.save();
  });
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  await application.close();
});

describe('/api/grou/:id/quiz GET', () => {
  it('only fetches cards from the specified group', async () => {
    const res = await request(application).get(`/api/group/${group1._id}/quiz`).set('authorization', authorization);
    const { body } = res;
    const { data } = body;

    expect(data?.groupId).toBe(group1._id.toString());
  });
  it('allows filtering by tags', async () => {
    const res = await request(application)
      .get(`/api/group/${group1._id}/quiz?tagNames[]=${tagOneArgs.name}`)
      .set('authorization', authorization);
    const { body } = res;
    const { total } = body;

    expect(total).toBe(2);
  });
  it('handles filtering by multiple tags at a time', async () => {
    const res = await request(application)
      .get(`/api/group/${group1._id}/quiz?tagNames[]=${tagOneArgs.name}&tagNames[]=${tagTwoArgs.name}`)
      .set('authorization', authorization);
    const { body } = res;
    const { total } = body;

    expect(total).toBe(3);
  });
  it('returns a random record each time the API is called', async () => {
    const arr1 = [];
    const arr2 = [];
    for (let i = 0; i < 10; i++) {
      const res = await request(application).get(`/api/group/${group1._id}/quiz`).set('authorization', authorization);

      arr1.push(res?.body?.data?.question);

      const res2 = await request(application).get(`/api/group/${group1._id}/quiz`).set('authorization', authorization);
      arr2.push(res2?.body?.data?.question);
    }

    expect(arr1.join(',')).not.toEqual(arr2.join(','));
  });
});
