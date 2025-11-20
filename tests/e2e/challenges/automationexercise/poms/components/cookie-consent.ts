import { Step, expect, type Locator, type Page } from '@world';

const DISMISS_BUTTON_SELECTORS = [/accept all/i, /^consent$/i, /allow all/i, /confirm choices/i, /consent/i];

export class CookieConsentModal {
  private readonly consentRootLocator: Locator;
  private readonly overlayLocator: Locator;
  private readonly dismissButtons: Locator[];

  constructor(private readonly page: Page) {
    this.consentRootLocator = this.page.locator('.fc-consent-root');
    this.overlayLocator = this.page.locator('.fc-dialog-overlay');
    this.dismissButtons = DISMISS_BUTTON_SELECTORS.map((pattern) =>
      this.page.getByRole('button', { name: pattern }),
    );
  }

  @Step
  async acceptAllIfPresent(): Promise<void> {
    // Check if page is still open
    if (this.page.isClosed()) {
      return;
    }
    
    // Wait a moment for modal to appear if it's delayed
    try {
      await this.page.waitForTimeout(500);
    } catch (error) {
      // Page might have closed, return early
      if (this.page.isClosed()) {
        return;
      }
      throw error;
    }
    
    if (!(await this.isConsentDisplayed())) {
      return;
    }

    for (const button of this.dismissButtons) {
      if (this.page.isClosed()) {
        return;
      }
      if (await button.isVisible({ timeout: 2_000 }).catch(() => false)) {
        // Use force click to bypass overlay if needed
        try {
          await button.click({ force: true }).catch(() => button.click());
          await this.waitForConsentToDisappear();
          return;
        } catch (error) {
          if (this.page.isClosed()) {
            return;
          }
          throw error;
        }
      }
    }

    // Fallback: try pressing Escape if known buttons are not visible
    if (!this.page.isClosed()) {
      try {
        await this.page.keyboard.press('Escape');
        await this.waitForConsentToDisappear();
      } catch (error) {
        if (this.page.isClosed()) {
          return;
        }
        throw error;
      }
    }
  }

  private async isConsentDisplayed(): Promise<boolean> {
    const overlayVisible = await this.overlayLocator.isVisible().catch(() => false);
    const rootVisible = await this.consentRootLocator.isVisible().catch(() => false);
    return overlayVisible || rootVisible;
  }

  private async waitForConsentToDisappear(): Promise<void> {
    if (this.page.isClosed()) {
      return;
    }
    try {
      await this.page.waitForTimeout(500);
      await expect(this.overlayLocator).toBeHidden({ timeout: 10_000 });
      await expect(this.consentRootLocator).toBeHidden({ timeout: 10_000 });
    } catch (error) {
      if (this.page.isClosed()) {
        return;
      }
      throw error;
    }
  }
}
