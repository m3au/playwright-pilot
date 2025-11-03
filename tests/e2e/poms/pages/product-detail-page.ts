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
    this.basketNotificationLocator = this.page.getByText(/is now in the shopping basket/i);
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
    await this.addToBasketButtonLocator.click({ timeout: 5000 });
  }

  @Then('I see the product in my shopping basket')
  async verifyProductInShoppingBasket() {
    await this.iSeeTheBasketNotificationPopup();
  }

  @Step
  private async iSeeTheBasketNotificationPopup() {
    await expect(this.basketNotificationLocator).toBeVisible({ timeout: 5000 });
  }
}
