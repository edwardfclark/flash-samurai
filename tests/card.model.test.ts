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
  test('Model test', async () => {
    const card = Card.build(cardArgs);
    await card.save();
    expect(card.isNew).toBe(false);
  });
});
