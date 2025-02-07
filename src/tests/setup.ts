import { start, close } from '../server';
import { jest } from '@jest/globals';

jest.setTimeout(10000);

beforeAll(async () => {
  await start();
});

afterAll(async () => {
  await close();
}); 