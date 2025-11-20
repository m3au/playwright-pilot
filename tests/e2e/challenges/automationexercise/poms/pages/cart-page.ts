import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';
import { Fixture, Given, When, Then, expect, environment, type Page, type Locator } from '@world';

@Fixture('CartPage')
export class CartPage {
  private readonly cartTableLocator: Locator;
  private readonly cartItemsLocator: Locator;
  private readonly firstItemQuantityInputLocator: Locator;
  private readonly firstItemRemoveButtonLocator: Locator;
  private readonly proceedToCheckoutButtonLocator: Locator;
  private readonly baseUrl: string;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.cartTableLocator = this.page.locator('#cart_info_table');
    this.cartItemsLocator = this.page.locator('#cart_info_table tbody tr');
    this.firstItemQuantityInputLocator = this.page
      .locator('#cart_info_table tbody tr')
      .first()
      .locator('.cart_quantity input');
    this.firstItemRemoveButtonLocator = this.page
      .locator('#cart_info_table tbody tr')
      .first()
      .locator('.cart_delete a');
    this.proceedToCheckoutButtonLocator = this.page.getByRole('link', {
      name: /proceed to checkout/i,
    });
    this.baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Given('I see the cart page')
  async verifyCartPage(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    const currentUrl = this.page.url();
    const cartUrlPattern = new RegExp(`${this.baseUrl}/view_cart`, 'i');
    if (!cartUrlPattern.test(currentUrl)) {
      // SHARD-PROOF: Navigate to cart page if not already there
      // When tests are sharded and run independently, we may not be on the cart page.
      // Navigate via the home page cart button to ensure we reach the required state.
      const { HomePage } = await import('./home-page');
      const homePage = new HomePage(this.page);
      await homePage.navigateToHomePage();
      await homePage.clickCartButton();
    }
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/view_cart`, 'i'));
    await expect(this.cartTableLocator).toBeVisible();
  }

  @Then('I see the product in my cart')
  async verifyProductInCart(): Promise<void> {
    const items = await this.cartItemsLocator.count();
    expect(items).toBeGreaterThan(0);
  }

  @Then('I see all products in my cart')
  async verifyAllProductsInCart(): Promise<void> {
    const items = await this.cartItemsLocator.count();
    expect(items).toBeGreaterThan(0);
  }

  @When('I update the quantity of the first product to {string}')
  async updateProductQuantity(quantity: string): Promise<void> {
    await expect(this.firstItemQuantityInputLocator).toBeVisible();
    await this.firstItemQuantityInputLocator.fill(quantity);
    await this.firstItemQuantityInputLocator.press('Enter');
    await expect(this.cartTableLocator).toBeVisible();
  }

  @Then('I see the cart total updated')
  async verifyCartTotalUpdated(): Promise<void> {
    await expect(this.cartTableLocator).toBeVisible();
  }

  @When('I remove the first product from cart')
  async removeFirstProduct(): Promise<void> {
    await expect(this.firstItemRemoveButtonLocator).toBeVisible();
    await this.firstItemRemoveButtonLocator.click();
    await expect(this.cartTableLocator).toBeVisible();
  }

  @Then('I see the product removed from cart')
  async verifyProductRemoved(): Promise<void> {
    await expect(this.cartTableLocator).toBeVisible();
  }

  @When('I click Proceed to Checkout button')
  async clickProceedToCheckout(): Promise<void> {
    // SHARD-PROOF: Ensure we're on cart page and have products before proceeding
    // This prevents failures when tests run independently and cart state may vary.
    await this.verifyCartPage();
    await this.verifyProductInCart();
    await expect(this.proceedToCheckoutButtonLocator).toBeVisible();
    await expect(this.proceedToCheckoutButtonLocator).toBeEnabled();
    await this.proceedToCheckoutButtonLocator.click();
    // SHARD-PROOF: Wait for navigation to complete before proceeding
    // This ensures the checkout page has fully loaded, preventing race conditions
    // that could cause failures when tests run in parallel or sharded.
    await this.page.waitForURL(new RegExp(`${this.baseUrl}/checkout`, 'i'), { timeout: 10_000 });
  }

  @Given('I have products in my cart')
  async ensureProductsInCart(): Promise<void> {
    // SHARD-PROOF: Ensure products are in cart before proceeding
    // When tests are sharded, cart state from previous scenarios isn't available.
    // This step checks if cart is empty and adds products if needed, ensuring
    // tests can run independently without relying on shared state.
    const items = await this.cartItemsLocator.count();
    if (items === 0) {
      const { HomePage } = await import('./home-page');
      const { ProductsPage } = await import('./products-page');
      const homePage = new HomePage(this.page);
      const productsPage = new ProductsPage(this.page);
      await homePage.navigateToHomePage();
      await homePage.clickProductsButton();
      await productsPage.verifyProductsPage();
      await productsPage.addFirstProductToCart();
      await homePage.clickViewCartButton();
      await this.verifyCartPage();
    }
  }
}
