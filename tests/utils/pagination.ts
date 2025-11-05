import type { Page } from '@playwright/test';

/**
 * Generic pagination navigation helper
 * @param currentPageIndex - Current page index
 * @param targetPageIndex - Target page index to navigate to
 * @param navigateRight - Function to navigate to the right (returns true if successful)
 * @param navigateLeft - Function to navigate to the left (returns true if successful)
 */
export async function navigateToPageIndex(
  currentPageIndex: number,
  targetPageIndex: number,
  navigateRight: () => Promise<boolean>,
  navigateLeft: () => Promise<boolean>,
): Promise<void> {
  let current = currentPageIndex;
  while (current !== targetPageIndex) {
    if (current < targetPageIndex) {
      const navigated = await navigateRight();
      if (!navigated) break;
      current = targetPageIndex;
      continue;
    }

    const navigated = await navigateLeft();
    if (!navigated) break;
    current = targetPageIndex;
  }
}

/**
 * Calculates target page index based on item index and items per page
 * @param itemIndex - Index of the item to navigate to
 * @param totalItems - Total number of items
 * @param paginationCount - Number of pagination controls
 */
export function calculateTargetPageIndex(
  itemIndex: number,
  totalItems: number,
  paginationCount: number,
): number {
  const itemsPerPage = Math.ceil(totalItems / paginationCount);
  return Math.floor(itemIndex / itemsPerPage);
}

/**
 * Waits for DOM to stabilize after an update
 * @param page - Playwright page instance
 * @param timeoutMs - Timeout in milliseconds (default: 500ms)
 */
export async function waitForDOMStabilization(page: Page, timeoutMs = 500): Promise<void> {
  // eslint-disable-next-line playwright/no-wait-for-timeout -- DOM mutations need time to settle
  await page.waitForTimeout(timeoutMs);
}
