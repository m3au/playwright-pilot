import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';
import { Fixture, Given, When, expect, environment, type Page, type Locator } from '@world';

@Fixture('CheckoutPage')
export class CheckoutPage {
  private readonly orderReviewLocator: Locator;
  private readonly deliveryAddressLocator: Locator;
  private readonly commentTextareaLocator: Locator;
  private readonly placeOrderButtonLocator: Locator;
  private readonly baseUrl: string;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.orderReviewLocator = this.page.locator('#cart_info');
    this.deliveryAddressLocator = this.page.locator('#address_delivery');
    this.commentTextareaLocator = this.page.locator('textarea[name="message"]');
    this.placeOrderButtonLocator = this.page.getByRole('link', { name: /place order/i });
    this.baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Given('I see the checkout page')
  async verifyCheckoutPage(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    const currentUrl = this.page.url();
    const checkoutUrlPattern = new RegExp(`${this.baseUrl}/checkout`, 'i');
    if (!checkoutUrlPattern.test(currentUrl)) {
      // SHARD-PROOF: Navigate to checkout page if not already there
      // When tests are sharded, a scenario may run independently without the cart setup
      // from previous scenarios. This ensures we can reach checkout by ensuring products
      // are in cart and proceeding through the cart flow.
      const { CartPage } = await import('./cart-page');
      const { HomePage } = await import('./home-page');
      const cartPage = new CartPage(this.page);
      const homePage = new HomePage(this.page);
      await homePage.navigateToHomePage();
      await cartPage.ensureProductsInCart();
      await cartPage.verifyCartPage();
      await cartPage.clickProceedToCheckout();
    }
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/checkout`, 'i'));
    await expect(this.orderReviewLocator).toBeVisible();
  }

  @When('I review my order details')
  async reviewOrderDetails(): Promise<void> {
    await expect(this.orderReviewLocator).toBeVisible();
    await expect(this.deliveryAddressLocator).toBeVisible();
  }

  @When('I enter delivery address comments')
  async enterDeliveryComments(): Promise<void> {
    await expect(this.commentTextareaLocator).toBeVisible();
    await this.commentTextareaLocator.fill('Please leave at the door');
  }

  @When('I click Place Order button')
  async clickPlaceOrder(): Promise<void> {
    await expect(this.placeOrderButtonLocator).toBeEnabled();
    await this.placeOrderButtonLocator.click();
    // SHARD-PROOF: Wait for navigation to complete before proceeding
    // This ensures the payment page has fully loaded, preventing race conditions
    // that could cause failures when tests run in parallel or sharded.
    await this.page.waitForURL(new RegExp(`${this.baseUrl}/payment`, 'i'), { timeout: 10_000 });
  }
}
