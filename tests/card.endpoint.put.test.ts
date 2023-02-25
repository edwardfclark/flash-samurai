import { Card, ICard } from '../src/models/card';
import { Group, IGroup } from '../src/models/group';
import { connect, clearDatabase, closeDatabase } from './db';
import { Document } from 'mongoose';
import { app } from '../src/app';
import request from 'supertest';
import { Server } from 'http';

const groupArgs: IGroup = {
  name: 'test',
};

const cardArgs: Omit<ICard, 'group'> = {
  question: 'Why did the chicken cross the road?',
  answer: 'To get to the other side!',
};

let card: Document;
let group: Document;
let application: Server;

beforeAll(async () => {
  application = await app.listen(0, () => {});

  await connect();
});

beforeEach(async () => {
  group = Group.build(groupArgs);
  await group.save();
  card = Card.build({ ...cardArgs, group: group._id });
  await card.save();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  await application.close();
});

describe('/api/card/:id PUT', () => {
  it('successfully updates a card', async () => {
    const { _id: id } = card;
    const res = await request(application)
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
    const res = await request(application)
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
    const res = await request(application)
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
