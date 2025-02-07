import { close } from '../server';
import { jest } from '@jest/globals';

jest.setTimeout(10000);

beforeAll(() => {
  // Any global setup
});

afterAll(async () => {
  await close();
}); 