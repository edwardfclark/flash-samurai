/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Card } from '../src/models/card';
import { connect, clearDatabase, closeDatabase } from './db';

beforeAll(async () => await connect());

afterEach(async () => await clearDatabase());

afterAll(async () => await closeDatabase());

describe('Card', () => {
  const cardArgs = {
    question: 'Why did the chicken cross the road?',
    answer: 'To get to the other side.',
    group: 'test',
  };
  it('creates a new card if given all valid, required arguments', async () => {
    const card = Card.build(cardArgs);
    await card.save();
    expect(card.isNew).toBe(false);
  });
  it('will not create a card if given invalid arguments', async () => {
    // @ts-ignore
    const card = Card.build({ thalidocracy: 'expressive' });
    await expect(card.validate()).rejects.toThrow();
  });
});
