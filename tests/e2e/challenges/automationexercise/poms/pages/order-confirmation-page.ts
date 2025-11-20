import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';
import { Fixture, Given, Then, expect, environment, type Page, type Locator } from '@world';

@Fixture('OrderConfirmationPage')
export class OrderConfirmationPage {
  private readonly successMessageLocator: Locator;
  private readonly orderDetailsLocator: Locator;
  private readonly baseUrl: string;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.successMessageLocator = this.page.getByText(/order placed successfully/i);
    this.orderDetailsLocator = this.page.locator('.order-confirmation');
    this.baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Given('I see the order confirmation page')
  async verifyOrderConfirmationPage(): Promise<void> {
    // NOTE: This page cannot be navigated to independently as it requires completing
    // the full payment flow. When tests are sharded and this step runs independently,
    // the scenario must include the complete checkout and payment flow in its Background
    // or earlier steps. This is by design - order confirmation is an end state that
    // should only be reached through the full purchase workflow.
    await this.cookieConsentModal.acceptAllIfPresent();
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/payment_done`, 'i'));
  }

  @Then('I see the order success message')
  async verifyOrderSuccessMessage(): Promise<void> {
    await expect(this.successMessageLocator).toBeVisible();
  }
}
