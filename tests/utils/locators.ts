import type { Locator } from '@playwright/test';

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

/**
 * Checks if an element has a specific CSS class
 * @param locator - Playwright locator
 * @param className - CSS class name to check
 * @returns True if the element has the class, false otherwise
 */
export async function hasClass(locator: Locator, className: string): Promise<boolean> {
  return locator
    .evaluate((element, cls) => element.classList.contains(cls), className)
    .catch(() => false);
}

/**
 * Checks if an element is disabled (has disabled attribute or class)
 * @param locator - Playwright locator
 * @returns True if the element is disabled, false otherwise
 */
export async function isDisabled(locator: Locator): Promise<boolean> {
  return locator
    .evaluate((element) => {
      return (
        element.classList.contains('disabled') ||
        element.hasAttribute('disabled') ||
        element.getAttribute('aria-disabled') === 'true'
      );
    })
    .catch(() => false);
}
