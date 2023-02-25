/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Card } from '../src/models/card';
import { Group } from '../src/models/group';
import { connect, clearDatabase, closeDatabase } from './db';

beforeAll(async () => await connect());

afterEach(async () => await clearDatabase());

afterAll(async () => await closeDatabase());

describe('Card', () => {
  const cardArgs = {
    question: 'Why did the chicken cross the road?',
    answer: 'To get to the other side.',
  };
  const groupArgs = {
    name: 'test',
  };
  it('creates a new card if given all valid, required arguments', async () => {
    const group = Group.build(groupArgs);
    await group.save();
    const card = Card.build({ ...cardArgs, group: group?._id });
    await card.save();
    expect(card.isNew).toBe(false);
  });
  it('will not create a card if required arguments are omitted', async () => {
    // @ts-ignore
    const card = Card.build({ question: cardArgs.question });
    await expect(card.validate()).rejects.toThrow();
  });
});
