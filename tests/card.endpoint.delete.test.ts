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
  name: 'test',
};
const cardArgs: Omit<ICard, 'groupId'> = {
  question: 'Why did the chicken cross the road?',
  answer: 'To get to the other side!',
};

let card: Document;
let group: Document;
let application: Server;
let authorization: string;

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
  card = Card.build({ ...cardArgs, groupId: group._id });
  await card.save();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  await application.close();
});

describe('/api/card/:id DELETE', () => {
  it('deletes the record when given the correct ID', async () => {
    const { _id: id } = card;
    const res = await request(application).delete(`/api/card/${id}`).set('authorization', authorization);
    const { status } = res;

    expect(status).toBe(200);
  });
  it('returns the deleted record when the endpoint is called', async () => {
    const { _id: id } = card;
    const res = await request(application).delete(`/api/card/${id}`).set('authorization', authorization);
    const { body } = res;

    expect(body.question).toEqual(cardArgs.question);
    expect(body.answer).toEqual(cardArgs.answer);
  });
  it('throws an error if given a bad id', async () => {
    const res = await request(application).delete(`/api/card/ayy_lmao`).set('authorization', authorization);
    const { status } = res;

    expect(status).toBe(500);
  });
});
