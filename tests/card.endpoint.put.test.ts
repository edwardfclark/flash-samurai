import { Card, ICard } from '../src/models/card';
import { Group, IGroup } from '../src/models/group';
import { IUser } from '../src/models/user';
import { Tag, ITag } from '../src/models/tag';
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

const tagArgs: Omit<ITag, 'groupId'> = {
  name: 'Test Tag',
  description: 'This is a test tag',
};

let card: Document;
let group: Document;
let tag: Document;
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

  group = Group.build(groupArgs);
  await group.save();
  tag = Tag.build({ ...tagArgs, groupId: group._id });
  await tag.save();
  card = Card.build({ ...cardArgs, groupId: group._id });
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
      .set('authorization', authorization)
      .send({
        ...cardArgs,
        question: 'Why did the duck cross the road?',
        answer: 'Because it was stapled to the chicken!',
      });
    const { status } = res;
    expect(status).toBe(200);
    const storedCard = await Card.findById(id);
    expect(storedCard?.question).toEqual('Why did the duck cross the road?');
    expect(storedCard?.answer).toEqual('Because it was stapled to the chicken!');
  });
  it('returns the newly updated document', async () => {
    const { _id: id } = card;
    const res = await request(application)
      .put(`/api/card/${id}`)
      .set('authorization', authorization)
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
      .set('authorization', authorization)
      .send({
        ...cardArgs,
        question: 'Why did the duck cross the road?',
        answer: 'Because it was stapled to the chicken!',
      });
    const { status } = res;
    expect(status).toBe(500);
  });
  it('allows optional tags to be added to the card', async () => {
    const { _id: id } = card;
    const res = await request(application)
      .put(`/api/card/${id}`)
      .set('authorization', authorization)
      .send({
        ...cardArgs,
        question: 'Why did the duck cross the road?',
        answer: 'Because it was stapled to the chicken!',
        tags: [tag],
      });
    const { status } = res;
    expect(status).toBe(200);
    const storedCard = await Card.findById(id);
    expect(storedCard?.tags).toHaveLength(1);
    expect(storedCard?.tags?.[0].name).toEqual(tagArgs.name);
    expect(storedCard?.tags?.[0].description).toEqual(tagArgs.description);
  });
  it('does not store duplicate tags', async () => {
    const { _id: id } = card;
    const res = await request(application)
      .put(`/api/card/${id}`)
      .set('authorization', authorization)
      .send({
        ...cardArgs,
        question: 'Why did the duck cross the road?',
        answer: 'Because it was stapled to the chicken!',
        tags: [tag, tag, { ...tagArgs, name: 'Test Tag 2' }, tag, tag],
      });
    const { status } = res;
    expect(status).toBe(200);
    const storedCard = await Card.findById(id);
    expect(storedCard?.tags).toHaveLength(2);
  });
});
