import { Card, ICard } from '../src/models/card';
import { Group, IGroup } from '../src/models/group';
import { connect, clearDatabase, closeDatabase } from './db';
import { Document } from 'mongoose';
import { app } from '../src/app';
import request from 'supertest';
import { Server } from 'http';

const groupArgs: IGroup = {
  name: 'Test',
  description: 'This is a description for the Test group',
};

let group: Document;
let application: Server;

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

describe('/api/group/:id PUT', () => {
  it('successfully updates a group', async () => {
    const { _id: id } = group;
    const res = await request(application)
      .put(`/api/group/${id}`)
      .send({
        ...groupArgs,
        name: 'Updated name',
        description: 'Updated description',
      });
    const { status } = res;
    expect(status).toBe(201);

    const storedGroup = await Group.findById(id);
    expect(storedGroup?.name).toEqual('Updated name');
    expect(storedGroup?.description).toEqual('Updated description');
  });
  it('returns the newly updated group', async () => {
    const { _id: id } = group;
    const res = await request(application)
      .put(`/api/group/${id}`)
      .send({
        ...groupArgs,
        name: 'Updated name',
        description: 'Updated description',
      });
    const { body } = res;
    expect(body?.name).toEqual('Updated name');
    expect(body?.description).toEqual('Updated description');
  });
  it('throws an error if given a bad id', async () => {
    const res = await request(application)
      .put(`/api/group/ayy_lmao`)
      .send({
        ...groupArgs,
        name: 'Updated name',
        description: 'Updated description',
      });
    const { status } = res;
    expect(status).toBe(500);
  });
});
