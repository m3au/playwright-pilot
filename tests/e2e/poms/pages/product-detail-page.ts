import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

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
    this.basketNotificationLocator = this.page
      .locator('text=/is now in the shopping basket/i')
      .first();
  }

  @Then('I see the product page')
  async verifyProductPageOpened(): Promise<void> {
    await this.iSeeTheProductPage();
  }

  @Step
  async iSeeTheProductPage(): Promise<void> {
    await expect(this.productTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.productTitleLocator).toHaveText(/.+/);
  }

  @When('I add the product to shopping basket')
  async addToShoppingBasket(): Promise<void> {
    await expect(this.addToBasketButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.addToBasketButtonLocator.scrollIntoViewIfNeeded();
    await this.addToBasketButtonLocator.click({ timeout: 5000, noWaitAfter: true });
    // Notification appears via AJAX after basket update - wait for backend response and DOM update
    await this.iWaitForBasketNotificationToAppear();
  }

  @Then('I see the product in my shopping basket')
  async verifyProductInShoppingBasket(): Promise<void> {
    await this.iSeeTheBasketNotificationPopup();
  }

  /**
   * Waits for basket notification to appear after adding product.
   * Notification presence in DOM confirms successful basket addition.
   */
  @Step
  private async iWaitForBasketNotificationToAppear(): Promise<void> {
    // Wait for notification element to be added to DOM
    await this.basketNotificationLocator.waitFor({ state: 'attached', timeout: 15_000 });
    // Verify it's visible
    await expect(this.basketNotificationLocator).toBeVisible({ timeout: 3000 });
  }

  @Step
  private async iSeeTheBasketNotificationPopup(): Promise<void> {
    // Notification was already verified in iWaitForBasketNotificationToAppear
    // This step is now a no-op since we check it immediately when it appears
  }
}
