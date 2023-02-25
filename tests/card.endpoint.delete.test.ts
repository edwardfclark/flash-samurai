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
  application = await app.listen(0, () => {});

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

describe('/api/card/:id DELETE', () => {
  it('deletes the record when given the correct ID', async () => {
    const { _id: id } = card;
    const res = await request(application).delete(`/api/card/${id}`);
    const { status } = res;

    expect(status).toBe(201);
  });
  it('returns the deleted record when the endpoint is called', async () => {
    const { _id: id } = card;
    const res = await request(application).delete(`/api/card/${id}`);
    const { body } = res;

    expect(body.question).toEqual(cardArgs.question);
    expect(body.answer).toEqual(cardArgs.answer);
    expect(body.group).toEqual(cardArgs.group);
  });
  it('throws an error if given a bad id', async () => {
    const res = await request(application).delete(`/api/card/ayy_lmao`);
    const { status } = res;

    expect(status).toBe(500);
  });
});
