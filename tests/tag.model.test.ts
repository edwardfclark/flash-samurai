/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Tag } from '../src/models/tag';
import { Group } from '../src/models/group';
import { connect, clearDatabase, closeDatabase } from './db';

beforeAll(async () => await connect());

afterEach(async () => await clearDatabase());

afterAll(async () => await closeDatabase());

describe('Tag', () => {
  const tagArgs = {
    name: 'Test Tag',
    description: 'This is a test tag',
  };
  const groupArgs = {
    name: 'test',
    owner: 'testuser',
  };

  it('creates a new tag if given all valid, required arguments', async () => {
    const group = Group.build(groupArgs);
    await group.save();
    const tag = Tag.build({ ...tagArgs, groupId: group?._id });
    await tag.save();
    expect(tag.isNew).toBe(false);
  });
  it('will not create a tag if required arguments are omitted', async () => {
    // @ts-ignore
    const tag = Tag.build({ name: tagArgs.name });
    await expect(tag.validate()).rejects.toThrow();
  });
});
