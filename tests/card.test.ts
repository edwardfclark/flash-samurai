import { Card } from '../src/models/card';
import { connect, clearDatabase, closeDatabase } from './db';

beforeAll(async () => await connect());

afterEach(async () => await clearDatabase());

afterAll(async () => await closeDatabase());

describe('Example test', () => {
  test('This should pass', () => {
    expect(Boolean(0)).toBe(false);
  });
});
