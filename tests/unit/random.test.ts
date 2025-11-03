import { describe, expect, test } from 'bun:test';
import { getRandomIndex } from '../../tests/e2e/utils/random';

describe('random', () => {
  describe('getRandomIndex', () => {
    test('should return index within range [0, max)', () => {
      const max = 10;
      const index = getRandomIndex(max);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(max);
    });

    test('should return 0 for max = 1', () => {
      const index = getRandomIndex(1);
      expect(index).toBe(0);
    });

    test('should return 0 for max = 0', () => {
      const index = getRandomIndex(0);
      expect(index).toBe(0);
    });

    test('should return 0 for negative max', () => {
      const index = getRandomIndex(-1);
      expect(index).toBe(0);
    });

    test('should handle large max values', () => {
      const max = 1000;
      const index = getRandomIndex(max);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(max);
    });

    test('should return different values on multiple calls', () => {
      const max = 100;
      const indices = new Set<number>();
      // Run multiple times to increase chance of getting different values
      for (let index = 0; index < 100; index++) {
        indices.add(getRandomIndex(max));
      }
      // Should have multiple different values (highly likely with 100 calls)
      expect(indices.size).toBeGreaterThan(1);
    });

    test('should return index within bounds for various max values', () => {
      const testCases = [2, 5, 10, 50, 100];
      for (const max of testCases) {
        const index = getRandomIndex(max);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(max);
      }
    });
  });
});
