import { Card, ICard } from '../src/models/card';
import { connect, clearDatabase, closeDatabase } from './db';
import { Document } from 'mongoose';
import { app } from '../src/app';
import request from 'supertest';

const cardArgs: ICard = {
  question: 'Why did the chicken cross the road?',
  answer: 'To get to the other side!',
  group: 'test',
};

let card: Document;
let application: any;

beforeAll(async () => {
  application = await app.listen(3000, () => {});

  await connect();
});

beforeEach(async () => {
  card = Card.build(cardArgs);
  await card.save();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  await application.close();
});

describe('/api/card/:id GET', () => {
  it('successfully returns a card', async () => {
    const { _id: id } = card;
    const res = await request('http://localhost:3000').get(`/api/card/${id}`);
    Object.keys(cardArgs).forEach((key) => {
      // @ts-ignore
      expect(res.body[key]).toEqual(cardArgs[key]);
    });
  });
});
