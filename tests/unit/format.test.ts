import { describe, expect, test } from 'bun:test';
import { formatParameterValue, toTitleCase } from '../../tests/e2e/utils/format';

describe('format', () => {
  describe('toTitleCase', () => {
    test('should convert camelCase to Title Case', () => {
      expect(toTitleCase('iClickButton')).toBe('I Click Button');
    });

    test('should convert PascalCase to Title Case', () => {
      expect(toTitleCase('CableConfiguratorPage')).toBe('Cable Configurator Page');
    });

    test('should handle single word', () => {
      expect(toTitleCase('button')).toBe('Button');
    });

    test('should handle single uppercase letter', () => {
      expect(toTitleCase('I')).toBe('I');
    });

    test('should handle empty string', () => {
      expect(toTitleCase('')).toBe('');
    });

    test('should handle string with spaces', () => {
      // Function adds space before capitals, so existing spaces become double spaces
      expect(toTitleCase('already Title Case')).toBe('Already  Title  Case');
    });

    test('should handle string starting with lowercase', () => {
      expect(toTitleCase('camelCase')).toBe('Camel Case');
    });
  });

  describe('formatParameterValue', () => {
    test('should format string values with quotes', () => {
      expect(formatParameterValue('test')).toBe('"test"');
    });

    test('should format empty string with quotes', () => {
      expect(formatParameterValue('')).toBe('""');
    });

    test('should format number as string', () => {
      expect(formatParameterValue(42)).toBe('42');
      expect(formatParameterValue(0)).toBe('0');
      expect(formatParameterValue(-1)).toBe('-1');
      expect(formatParameterValue(3.14)).toBe('3.14');
    });

    test('should format boolean as string', () => {
      expect(formatParameterValue(true)).toBe('true');
      expect(formatParameterValue(false)).toBe('false');
    });

    test('should format null', () => {
      // eslint-disable-next-line unicorn/no-null -- Testing null handling
      expect(formatParameterValue(null)).toBe('null');
    });

    test('should format undefined', () => {
      expect(formatParameterValue()).toBe('undefined');
    });

    test('should format object as JSON', () => {
      expect(formatParameterValue({ key: 'value' })).toBe('{"key":"value"}');
      expect(formatParameterValue({ nested: { data: 123 } })).toBe('{"nested":{"data":123}}');
    });

    test('should format array as JSON', () => {
      expect(formatParameterValue([1, 2, 3])).toBe('[1,2,3]');
      expect(formatParameterValue(['a', 'b'])).toBe('["a","b"]');
    });

    test('should format empty object', () => {
      expect(formatParameterValue({})).toBe('{}');
    });

    test('should format function as string', () => {
      // eslint-disable-next-line unicorn/consistent-function-scoping -- Function only used in this test
      const function_ = () => {};
      const result = formatParameterValue(function_);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('should format symbol as string', () => {
      const sym = Symbol('test');
      const result = formatParameterValue(sym);
      expect(typeof result).toBe('string');
      expect(result).toContain('Symbol');
    });
  });
});
