/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Group } from '../src/models/group';
import { connect, clearDatabase, closeDatabase } from './db';

beforeAll(async () => await connect());

afterEach(async () => await clearDatabase());

afterAll(async () => await closeDatabase());

describe('Card', () => {
  const groupArgs = {
    name: 'Test',
    description: 'This is a test group',
  };
  it('creates a new group if given all valid, required arguments', async () => {
    const group = Group.build(groupArgs);
    await group.save();

    expect(group.isNew).toBe(false);
  });
  it('will not create a group if required arguments are omitted', async () => {
    // @ts-ignore
    const group = Group.build({ description: 'This should fail because name is a required field' });
    await expect(group.validate()).rejects.toThrow();
  });
});
