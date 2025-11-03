import { describe, expect, test } from 'bun:test';
import { isValidTextItem } from '../../tests/e2e/utils/locators';

describe('locators', () => {
  describe('isValidTextItem', () => {
    test('should return true for valid visible text', () => {
      expect(isValidTextItem('valid text', true)).toBe(true);
    });

    test('should return false for null text', () => {
      // eslint-disable-next-line unicorn/no-null -- Testing null handling
      expect(isValidTextItem(null, true)).toBe(false);
    });

    test('should return false for undefined text', () => {
      expect(isValidTextItem(undefined as unknown as string, true)).toBe(false);
    });

    test('should return false for empty string', () => {
      expect(isValidTextItem('', true)).toBe(false);
    });

    test('should return false for whitespace-only string', () => {
      expect(isValidTextItem('   ', true)).toBe(false);
      expect(isValidTextItem('\t\n', true)).toBe(false);
    });

    test('should return false when not visible', () => {
      expect(isValidTextItem('valid text', false)).toBe(false);
    });

    test('should return false for null text even when visible', () => {
      // eslint-disable-next-line unicorn/no-null -- Testing null handling
      expect(isValidTextItem(null, true)).toBe(false);
    });

    test('should exclude text in excludeTexts array (case-insensitive)', () => {
      expect(isValidTextItem('exclude', true, ['exclude'])).toBe(false);
      expect(isValidTextItem('EXCLUDE', true, ['exclude'])).toBe(false);
      expect(isValidTextItem('Exclude', true, ['exclude'])).toBe(false);
      expect(isValidTextItem('exclude', true, ['EXCLUDE'])).toBe(false);
    });

    test('should return true for text not in excludeTexts', () => {
      expect(isValidTextItem('include', true, ['exclude'])).toBe(true);
    });

    test('should handle empty excludeTexts array', () => {
      expect(isValidTextItem('valid text', true, [])).toBe(true);
    });

    test('should handle multiple exclude texts', () => {
      expect(isValidTextItem('text1', true, ['text1', 'text2'])).toBe(false);
      expect(isValidTextItem('text2', true, ['text1', 'text2'])).toBe(false);
      expect(isValidTextItem('text3', true, ['text1', 'text2'])).toBe(true);
    });

    test('should handle excludeTexts with whitespace', () => {
      expect(isValidTextItem('text', true, [' text '])).toBe(false);
      expect(isValidTextItem('text', true, ['TEXT'])).toBe(false);
    });

    test('should trim text before comparison', () => {
      expect(isValidTextItem('  exclude  ', true, ['exclude'])).toBe(false);
    });

    test('should handle special characters in excludeTexts', () => {
      expect(isValidTextItem('test@example.com', true, ['test@example.com'])).toBe(false);
      expect(isValidTextItem('test@example.com', true, ['TEST@EXAMPLE.COM'])).toBe(false);
    });
  });
});
