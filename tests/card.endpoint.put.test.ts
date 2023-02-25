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

beforeEach(async () => {
  card = Card.build(cardArgs);
  await card.save();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  await application.close();
});

describe('/api/card/:id PUT', () => {
  it('successully updates a card', async () => {
    const { _id: id } = card;
    const res = await request(`http://localhost:${process.env.PORT}`)
      .put(`/api/card/${id}`)
      .send({
        ...cardArgs,
        question: 'Why did the duck cross the road?',
        answer: 'Because it was stapled to the chicken!',
      });
    const { status } = res;
    expect(status).toBe(201);
    const storedCard = await Card.findById(id);
    expect(storedCard?.question).toEqual('Why did the duck cross the road?');
    expect(storedCard?.answer).toEqual('Because it was stapled to the chicken!');
  });
  it('returns the newly updated document', async () => {
    const { _id: id } = card;
    const res = await request(`http://localhost:${process.env.PORT}`)
      .put(`/api/card/${id}`)
      .send({
        ...cardArgs,
        question: 'Why did the duck cross the road?',
        answer: 'Because it was stapled to the chicken!',
      });
    const { body } = res;
    expect(body?.question).toEqual('Why did the duck cross the road?');
    expect(body?.answer).toEqual('Because it was stapled to the chicken!');
  });
  it('throws an error if given a bad id', async () => {
    const res = await request(`http://localhost:${process.env.PORT}`)
      .put(`/api/card/ayyy_lmao`)
      .send({
        ...cardArgs,
        question: 'Why did the duck cross the road?',
        answer: 'Because it was stapled to the chicken!',
      });
    const { status } = res;
    expect(status).toBe(500);
  });
});
