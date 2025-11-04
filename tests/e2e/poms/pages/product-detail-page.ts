import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';
import { getEnvironment } from '@data/config';

@Fixture('ProductDetailPage')
export class ProductDetailPage {
  private productTitleLocator: Locator;
  private addToBasketButtonLocator: Locator;
  private basketNotificationLocator: Locator;

  constructor(protected page: Page) {
    this.productTitleLocator = this.page.getByRole('heading', { level: 1 });
    this.addToBasketButtonLocator = this.page.getByRole('button', {
      name: 'ADD TO BASKET',
    });
    // Use a more flexible locator that can match text even if split across elements
    this.basketNotificationLocator = this.page.locator('text=/is now in the shopping basket/i');
  }

  @Then('I see the product page')
  async verifyProductPageOpened() {
    await this.iSeeTheProductPage();
  }

  @Step
  async iSeeTheProductPage() {
    await expect(this.productTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.productTitleLocator).toHaveText(/.+/);
  }

  @When('I add the product to shopping basket')
  async addToShoppingBasket() {
    await expect(this.addToBasketButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.addToBasketButtonLocator.scrollIntoViewIfNeeded();
    await this.addToBasketButtonLocator.click({ timeout: 5000, noWaitAfter: true });
    // Notification appears via AJAX after basket update - wait for backend response and DOM update
    await this.iWaitForBasketNotificationToAppear();
  }

  @Then('I see the product in my shopping basket')
  async verifyProductInShoppingBasket() {
    await this.iSeeTheBasketNotificationPopup();
  }

  /**
   * Waits for basket notification to appear after adding product.
   * Notification appears after AJAX request completes and frontend updates DOM.
   */
  @Step
  private async iWaitForBasketNotificationToAppear() {
    await this.iWaitForBasketAjaxResponse();
    await this.iWaitForBasketNotificationDOMUpdate();
  }

  /**
   * Waits for AJAX response that processes basket addition and returns updated basket data.
   */
  @Step
  private async iWaitForBasketAjaxResponse() {
    try {
      const { environment } = getEnvironment();
      const baseUrlHostname = new URL(environment.baseUrl).hostname;

      await this.page.waitForResponse(
        (response) => {
          const url = response.url();
          return (
            url.includes(baseUrlHostname) &&
            (url.includes('basket') ||
              url.includes('cart') ||
              url.includes('ajax') ||
              response.request().method() === 'POST')
          );
        },
        { timeout: 10_000 },
      );
    } catch {
      // AJAX response might have already completed or not be needed, continue
    }
  }

  /**
   * Waits for frontend to render basket notification in DOM after basket update.
   */
  @Step
  private async iWaitForBasketNotificationDOMUpdate() {
    // Wait for element to be attached first, then visible (more flexible than waiting for visible only)
    await this.basketNotificationLocator
      .waitFor({ state: 'attached', timeout: 10_000 })
      .catch(() => {
        // Element might not be attached yet, continue
      });

    // Additional delay to ensure DOM mutations have settled
    await this.page.waitForTimeout(500);
  }

  @Step
  private async iSeeTheBasketNotificationPopup() {
    // Verify notification is visible (already waited for it to appear, so this should be quick)
    await expect(this.basketNotificationLocator).toBeVisible({ timeout: 10_000 });
  }
}
