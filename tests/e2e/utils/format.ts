/**
 * Converts camelCase or PascalCase string to Title Case
 * Example: "iClickButton" -> "I Click Button"
 */
export function toTitleCase(string_: string): string {
  return string_
    .replaceAll(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

/**
 * Formats a parameter value for display in step titles
 */
export function formatParameterValue(value: unknown): string {
  if (value === null || value === undefined) {
    return String(value);
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
