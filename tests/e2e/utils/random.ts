/**
 * Generates a random index within the range [0, max)
 * Uses cryptographically secure random number generation
 */
export function getRandomIndex(max: number): number {
  if (max <= 0) {
    return 0;
  }
  const array = new Uint32Array(1);
  globalThis.crypto.getRandomValues(array);
  return array[0]! % max;
}
