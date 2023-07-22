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

let application: Server;
let group: Document;
let tag: Document;
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
});

afterEach(async () => await clearDatabase());

afterAll(async () => {
  await closeDatabase();
  application.close();
});

describe('/api/card POST', () => {
  it('successfully creates a new card', async () => {
    const res = await request(application)
      .post('/api/card')
      .set('authorization', authorization)
      .send({ ...cardArgs, groupId: group?._id });
    const { body } = res;

    const id = body?._id;
    const card = await Card.findById(id);

    expect(card?.question).toEqual(cardArgs.question);
    expect(card?.answer).toEqual(cardArgs.answer);
  });
  it('returns the newly created document', async () => {
    const res = await request(application)
      .post('/api/card')
      .set('authorization', authorization)
      .send({ ...cardArgs, groupId: group?._id });
    const { body } = res;

    expect(body.question).toEqual(cardArgs.question);
    expect(body.answer).toEqual(cardArgs.answer);
  });
  it('can take an optional "reference" key', async () => {
    const res = await request(application)
      .post('/api/card')
      .set('authorization', authorization)
      .send({ ...cardArgs, groupId: group?._id, reference: 'interesting reference' });
    const { body } = res;

    expect(body.reference).toEqual('interesting reference');
  });
  it('does not create records with keys that are not in the model', async () => {
    const res = await request(application)
      .post('/api/card')
      .set('authorization', authorization)
      .send({ ...cardArgs, groupId: group?._id, factoid: 'interesting factoid' });
    const { body } = res;

    expect(body.factoid).toBeUndefined();
  });
  it('does not create cards for groups that do not exist', async () => {
    const res = await request(application)
      .post('/api/card')
      .set('authorization', authorization)
      .send({ ...cardArgs, groupId: 'bogus group' });

    const { body, status } = res;

    const id = body?._id;
    const card = await Card.findById(id);

    expect(status).toEqual(500);
    expect(card).toBeNull();
  });
  it('allows optional tags to be added to the card', async () => {
    const res = await request(application)
      .post('/api/card')
      .set('authorization', authorization)
      .send({ ...cardArgs, groupId: group?._id, tags: [tag] });
    const { body } = res;

    const id = body?._id;
    const card = await Card.findById(id);

    expect(card?.tags?.[0]?.name).toEqual(tagArgs?.name);
    expect(card?.tags?.[0]?.description).toEqual(tagArgs?.description);
  });
  it('does not store duplicate tags', async () => {
    const res = await request(application)
      .post('/api/card')
      .set('authorization', authorization)
      .send({
        ...cardArgs,
        groupId: group?._id,
        tags: [tag, tag, tag, tag, { name: 'another test tag', description: 'test description' }],
      });
    const { body } = res;

    const id = body?._id;
    const card = await Card.findById(id);

    expect(card?.tags?.length).toEqual(2);
  });
});
