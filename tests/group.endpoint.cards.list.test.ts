import { Group, IGroup } from '../src/models/group';
import { Card, ICard } from '../src/models/card';
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

const wrongID = 'do_not_fetch';

beforeAll(async () => {
  application = await app.listen(0, () => {});

  await connect();
});

beforeEach(async () => {
  // Login
  await request(application).post('/api/signup').send(userArgs);
  const res = await request(application).post('/api/login').send(userArgs);
  authorization = `Bearer ${res.body.token}`;

  group = Group.build(groupArgs);
  await group.save();

  const testCards: ICard[] = [
    {
      question: 'question1',
      answer: 'answer1',
      group: group._id,
    },
    {
      question: 'question2',
      answer: 'answer2',
      group: group._id,
    },
    {
      question: 'question3',
      answer: 'answer3',
      group: wrongID,
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

describe('/api/group/:id/cards GET', () => {
  it('fetches multiple cards', async () => {
    const { _id: id } = group;
    const res = await request(application).get(`/api/group/${id}/cards`).set('authorization', authorization);
    const { body } = res;
    const { data } = body;

    expect(data.length).toBe(2);
  });
  it('only includes cards with the correct group', async () => {
    const { _id: id } = group;
    const res = await request(application).get(`/api/group/${id}/cards`).set('authorization', authorization);
    const { body } = res;
    const { data, total } = body;

    expect(total).toBe(2);
    expect(Boolean(data.find((item: ICard) => item.question === 'question3'))).toBe(false);
  });
  it('has a default value of 10 for limit, and a default of 1 for page', async () => {
    const { _id: id } = group;
    const res = await request(application).get(`/api/group/${id}/cards`).set('authorization', authorization);
    const { body } = res;
    const { limit, page } = body;

    expect(limit).toBe(10);
    expect(page).toBe(1);
  });
  it('allows you to request a higher limit', async () => {
    const { _id: id } = group;
    const res = await request(application).get(`/api/group/${id}/cards?limit=100`).set('authorization', authorization);
    const { body } = res;
    const { data, limit } = body;

    expect(limit).toBe(100);
    expect(data.length).toBe(2);
  });
  it('allows you to request a higher page', async () => {
    const { _id: id } = group;
    const res = await request(application).get(`/api/group/${id}/cards?page=2`).set('authorization', authorization);
    const { body } = res;
    const { data, page } = body;

    expect(page).toBe(2);
    expect(data.length).toBe(0);
  });
});
