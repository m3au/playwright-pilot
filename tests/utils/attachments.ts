import { test as base } from '@playwright/test';

/**
 * Helper function to attach files from step definitions using test function's context.
 * This works around playwright-bdd's limitation where attachments in fixture cleanup don't work.
 * Uses base.step() context to access testInfo from within step definitions.
 *
 * @param name - Attachment name
 * @param content - File content as string
 * @param contentType - MIME type (default: 'application/json')
 */
export async function attachFileFromStep(
  name: string,
  content: string,
  contentType = 'application/json',
): Promise<void> {
  // Use base.step() to access the current test context
  // This allows us to get testInfo from within step definitions
  return base.step(`Attach ${name}`, async (testInfo) => {
    try {
      // Convert string to Buffer - Playwright attachments may require Buffer format
      const buffer = Buffer.from(content, 'utf8');
      await testInfo.attach(name, {
        body: buffer,
        contentType,
      });
    } catch (error) {
      console.error(`Failed to attach ${name}:`, error);
      throw error;
    }
  });
}
