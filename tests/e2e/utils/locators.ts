/**
 * Validates if a text item is valid (visible, non-null, non-empty)
 * @param text - Text content to validate
 * @param isVisible - Whether the element is visible
 * @param excludeTexts - Optional array of text values to exclude (case-insensitive)
 * @returns True if the item is valid
 */
export function isValidTextItem(
  text: string | null,
  isVisible: boolean,
  excludeTexts: string[] = [],
): boolean {
  if (!isVisible || !text || text.trim() === '') {
    return false;
  }

  const normalizedText = text.trim().toLowerCase();
  return !excludeTexts.some((exclude) => normalizedText === exclude.trim().toLowerCase());
}
