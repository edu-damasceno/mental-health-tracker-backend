import '@jest/globals';
import { jest } from '@jest/globals';

// Mock WebSocket server
jest.mock('ws', () => {
  return {
    Server: jest.fn().mockImplementation(() => ({
      clients: [],
      close: jest.fn()
    }))
  };
}); 