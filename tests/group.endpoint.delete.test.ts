import { Group, IGroup } from '../src/models/group';
import { Card, ICard } from '../src/models/card';
import { connect, clearDatabase, closeDatabase } from './db';
import { Document } from 'mongoose';
import { app } from '../src/app';
import request from 'supertest';
import { Server } from 'http';

const groupArgs: IGroup = {
  name: 'Test',
  description: 'This is a description for the Test group',
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

describe('/api/group/:id DELETE', () => {
  it('deletes the record when given the correct ID', async () => {
    const { _id: id } = group;
    const res = await request(application).delete(`/api/group/${id}`);
    const { status } = res;

    expect(status).toBe(201);
  });
  it('returns the deleted record when the endpoint is called', async () => {
    const { _id: id } = group;
    const res = await request(application).delete(`/api/group/${id}`);
    const { body } = res;

    expect(body.name).toEqual(groupArgs.name);
    expect(body.description).toEqual(groupArgs.description);
  });
  it('throws an error if given a bad id', async () => {
    const res = await request(application).delete(`/api/group/ayy_lmao`);
    const { status } = res;

    expect(status).toBe(500);
  });
  it('deletes all cards associated with the group if the group is deleted', async () => {
    const { _id: id } = group;
    const res = await request(application).delete(`/api/group/${id}`);
    const { status } = res;

    const fetchedCards = await Card.find({ group: group._id }).exec();

    expect(status).toBe(201);
    expect(fetchedCards.length).toBe(0);
  });
});
