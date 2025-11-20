import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';
import { getTestContext } from '@utils';
import { Fixture, Given, When, Then, expect, environment, type Page, type Locator } from '@world';

@Fixture('ContactPage')
export class ContactPage {
  private readonly nameInputLocator: Locator;
  private readonly emailInputLocator: Locator;
  private readonly subjectInputLocator: Locator;
  private readonly messageTextareaLocator: Locator;
  private readonly fileInputLocator: Locator;
  private readonly submitButtonLocator: Locator;
  private readonly successMessageLocator: Locator;
  private readonly baseUrl: string;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.nameInputLocator = this.page.locator('input[name="name"]');
    this.emailInputLocator = this.page.locator('input[name="email"]');
    this.subjectInputLocator = this.page.locator('input[name="subject"]');
    this.messageTextareaLocator = this.page.locator('textarea[name="message"]');
    this.fileInputLocator = this.page.locator('input[name="upload_file"]');
    this.submitButtonLocator = this.page.locator('input[type="submit"]');
    // Match contact form success message, excluding newsletter subscription
    this.successMessageLocator = this.page
      .getByText(/success/i)
      .filter({ hasNotText: /subscribed/i });
    this.baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Given('I see the contact page')
  async verifyContactPage(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    const currentUrl = this.page.url();
    const contactUrlPattern = new RegExp(`${this.baseUrl}/contact_us`, 'i');
    if (!contactUrlPattern.test(currentUrl)) {
      // SHARD-PROOF: Navigate to contact page if not already there
      // When tests are sharded, a scenario may run independently without navigation
      // from previous scenarios. This ensures we can reach the contact page from
      // the home page, making the test resilient to sharding.
      const { HomePage } = await import('./home-page');
      const homePage = new HomePage(this.page);
      await homePage.navigateToHomePage();
      await homePage.clickContactUsButton();
    }
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/contact_us`, 'i'));
    await expect(this.nameInputLocator).toBeVisible();
  }

  @When('I fill in the contact form with my details')
  async fillContactForm(): Promise<void> {
    const context = getTestContext();
    const user = context.automationExercise?.user;
    const name = user?.name ?? 'Test User';
    const email = user?.email ?? 'test@example.com';

    await this.nameInputLocator.fill(name);
    await this.emailInputLocator.fill(email);
    await this.subjectInputLocator.fill('Test Subject');
    await this.messageTextareaLocator.fill('This is a test message');
  }

  @When('I upload a file')
  async uploadFile(): Promise<void> {
    await this.fileInputLocator.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Test file content'),
    });
  }

  @When('I click Submit button')
  async clickSubmit(): Promise<void> {
    await expect(this.submitButtonLocator).toBeEnabled();
    await this.submitButtonLocator.click();
  }

  @Then('I see the contact form submitted successfully message')
  async verifyContactFormSubmitted(): Promise<void> {
    // SHARD-PROOF: Wait for form submission to complete and success message to appear
    // Look for success message, excluding newsletter subscription messages
    // The timeout accounts for form submission processing time
    const successMessage = this.page
      .getByText(/success/i)
      .filter({ hasNotText: /subscribed/i })
      .first();
    await expect(successMessage).toBeVisible({ timeout: 10_000 });
  }
}
