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

let application: Server;
let group: Document;

beforeAll(async () => {
  application = await app.listen(0, () => {});

  await connect();
});

beforeEach(async () => {
  group = Group.build(groupArgs);
  await group.save();
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  await application.close();
});

describe('/api/card POST', () => {
  it('successfully creates a new card', async () => {
    const res = await request(application)
      .post('/api/card')
      .send({ ...cardArgs, group: group?._id });
    const { body } = res;

    const id = body?._id;
    const card = await Card.findById(id);

    expect(card?.question).toEqual(cardArgs.question);
    expect(card?.answer).toEqual(cardArgs.answer);
  });
  it('returns the newly created document', async () => {
    const res = await request(application)
      .post('/api/card')
      .send({ ...cardArgs, group: group?._id });
    const { body } = res;

    expect(body.question).toEqual(cardArgs.question);
    expect(body.answer).toEqual(cardArgs.answer);
  });
  it('can take an optional "reference" key', async () => {
    const res = await request(application)
      .post('/api/card')
      .send({ ...cardArgs, group: group?._id, reference: 'interesting reference' });
    const { body } = res;

    expect(body.reference).toEqual('interesting reference');
  });
  it('does not create records with keys that are not in the model', async () => {
    const res = await request(application)
      .post('/api/card')
      .send({ ...cardArgs, group: group?._id, factoid: 'interesting factoid' });
    const { body } = res;

    expect(body.factoid).toBeUndefined();
  });
});
