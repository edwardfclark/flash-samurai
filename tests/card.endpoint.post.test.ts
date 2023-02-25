import { Card, ICard } from '../src/models/card';
import { connect, clearDatabase, closeDatabase } from './db';
import { Document } from 'mongoose';
import { app } from '../src/app';
import request from 'supertest';
import { Server } from 'http';

const cardArgs: ICard = {
  question: 'Why did the chicken cross the road?',
  answer: 'To get to the other side!',
  group: 'test',
};

let card: Document;
let application: Server;

beforeAll(async () => {
  application = await app.listen(process.env.PORT, () => {});

  await connect();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  await application.close();
});

describe('/api/card POST', () => {
  it('successfully creates a new card', async () => {
    const res = await request(`http://localhost:${process.env.PORT}`).post('/api/card').send(cardArgs);
    const { body } = res;

    const id = body?._id;
    const card = await Card.findById(id);

    expect(card?.question).toEqual(cardArgs.question);
    expect(card?.answer).toEqual(cardArgs.answer);
    expect(card?.group).toEqual(cardArgs.group);
  });
  it('returns the newly created document', async () => {
    const res = await request(`http://localhost:${process.env.PORT}`).post('/api/card').send(cardArgs);
    const { body } = res;

    expect(body.question).toEqual(cardArgs.question);
    expect(body.answer).toEqual(cardArgs.answer);
    expect(body.group).toEqual(cardArgs.group);
  });
});
