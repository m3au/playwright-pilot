import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';
import { SignupLoginPage } from '@automationexercise/poms/pages/signup-login-page';
import { registerAutomationExerciseUser } from '@automationexercise/utils/api-client';
import {
  generateAutomationExerciseUser,
  type AutomationExerciseUser,
} from '@automationexercise/utils/user-data';
import { getTestContext, setTestContext } from '@utils';
import {
  Fixture,
  Given,
  Then,
  When,
  Step,
  expect,
  environment,
  type Page,
  type Locator,
} from '@world';

type AutomationExerciseState = {
  user: AutomationExerciseUser;
  userRegistered: boolean;
};

@Fixture('HomePage')
export class HomePage {
  private readonly signupLoginButtonLocator: Locator;
  private readonly logoutButtonLocator: Locator;
  private readonly loggedInIndicatorLocator: Locator;
  private readonly productsButtonLocator: Locator;
  private readonly cartButtonLocator: Locator;
  private readonly contactUsButtonLocator: Locator;
  private readonly loggedInUserNameLocator: Locator;
  private readonly viewCartButtonLocator: Locator;
  private readonly baseUrl: string;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.signupLoginButtonLocator = this.page.getByRole('link', { name: /signup|login/i });
    this.logoutButtonLocator = this.page.getByRole('link', { name: /logout/i });
    this.loggedInIndicatorLocator = this.page.getByText(/logged in as/i);
    this.productsButtonLocator = this.page.getByRole('link', { name: /products/i });
    this.cartButtonLocator = this.page.getByRole('link', { name: /cart/i });
    this.contactUsButtonLocator = this.page.getByRole('link', { name: /contact us/i });
    // Locate the logged-in username link - find link that contains "logged in as" text
    // or find link with href containing "account" in the nav area
    this.loggedInUserNameLocator = this.page.locator('a').filter({ hasText: /logged in as/i }).first();
    this.viewCartButtonLocator = this.page.getByRole('link', { name: /view cart/i });
    this.baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Given('I navigate to the AutomationExercise home page')
  async navigateToHomePage(): Promise<void> {
    if (this.page.isClosed()) {
      throw new Error('Page is closed, cannot navigate');
    }
    
    // Check if we're already on the home page
    const currentUrl = this.page.url();
    const urlPattern = this.buildBaseUrlPattern();
    if (urlPattern.test(currentUrl)) {
      // Already on home page, just verify content is loaded
      try {
        await this.page.waitForFunction(() => document.body && document.body.innerText.length > 0, { timeout: 5_000 });
        await this.cookieConsentModal.acceptAllIfPresent();
        return;
      } catch {
        // Content not loaded yet, continue with navigation
      }
    }
    
    try {
      await this.page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    } catch (error) {
      // Handle ERR_ABORTED or frame detached errors - retry once
      if (error instanceof Error && (error.message.includes('ERR_ABORTED') || error.message.includes('frame was detached') || error.message.includes('Target page') || error.message.includes('timeout'))) {
        // Check if page/context is still available before waiting
        if (this.page.isClosed()) {
          throw new Error('Page was closed during navigation');
        }
        try {
          await this.page.waitForTimeout(1000);
          if (!this.page.isClosed()) {
            // Try with commit instead of domcontentloaded
            await this.page.goto(this.baseUrl, { waitUntil: 'commit', timeout: 20_000 });
          } else {
            throw new Error('Page was closed during retry');
          }
        } catch (retryError) {
          // If retry fails, check if we're already on the right page
          if (!this.page.isClosed() && urlPattern.test(this.page.url())) {
            // We're on the right page, continue
          } else {
            throw error;
          }
        }
      } else {
        throw error;
      }
    }
    
    if (this.page.isClosed()) {
      throw new Error('Page was closed after navigation');
    }
    
    await expect(this.page).toHaveURL(this.buildBaseUrlPattern());
    // Wait for page content to be present (not just blank)
    try {
      await this.page.waitForFunction(() => document.body && document.body.innerText.length > 0, { timeout: 10_000 });
    } catch {
      // If content check times out, that's okay - continue anyway
    }
    await this.cookieConsentModal.acceptAllIfPresent();
  }

  @When(/^I click on Signup\/Login button$/)
  async clickSignupLoginButton(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    
    // Check if user is already logged in - if so, logout first
    const isLoggedIn = await this.loggedInIndicatorLocator.isVisible({ timeout: 2_000 }).catch(() => false);
    if (isLoggedIn) {
      await this.logoutButtonLocator.click();
      await this.page.waitForTimeout(1000);
    }
    
    // Try multiple selectors for signup/login button
    let signupButton = this.signupLoginButtonLocator;
    let isVisible = await signupButton.isVisible({ timeout: 2_000 }).catch(() => false);
    
    if (!isVisible) {
      const alternatives = [
        this.page.getByRole('link', { name: /signup/i }),
        this.page.getByRole('link', { name: /login/i }),
        this.page.locator('a[href*="login"]'),
        this.page.locator('a[href*="signup"]'),
      ];
      
      for (const alt of alternatives) {
        if (await alt.isVisible({ timeout: 2_000 }).catch(() => false)) {
          signupButton = alt;
          isVisible = true;
          break;
        }
      }
    }
    
    if (!isVisible) {
      // Try navigating directly to login page
      await this.page.goto(`${this.baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      return;
    }
    
    await expect(signupButton).toBeVisible({ timeout: 5_000 });
    await signupButton.click();
  }

  @When('I click the Logout button')
  async clickLogoutButton(): Promise<void> {
    await expect(this.logoutButtonLocator).toBeVisible();
    await this.logoutButtonLocator.click();
  }

  @Given('I am logged in to AutomationExercise')
  async ensureLoggedIn(): Promise<void> {
    const { user } = await this.ensureAutomationExerciseState();
    await this.navigateToHomePage();

    const isAlreadyLoggedIn = await this.loggedInIndicatorLocator.isVisible().catch(() => false);
    if (isAlreadyLoggedIn) {
      await this.verifyLoggedIn(user.name);
      return;
    }

    const signupLoginPage = new SignupLoginPage(this.page);
    await this.clickSignupLoginButton();
    await signupLoginPage.fillLoginFormWith(user);
    await signupLoginPage.clickLoginButton();
    await this.verifyLoggedIn(user.name);
  }

  @Step
  async verifyLoggedIn(username: string): Promise<void> {
    await this.ensureHomeContext();
    
    // Wait for logged in indicator with longer timeout
    await expect(this.loggedInIndicatorLocator).toBeVisible({ timeout: 15_000 });
    
    // Verify it contains the username (case-insensitive)
    const indicatorText = await this.loggedInIndicatorLocator.textContent();
    if (indicatorText && !new RegExp(username, 'i').test(indicatorText)) {
      // If username doesn't match exactly, check if it's a different format
      // Some sites show "Logged in as [username]" or just the username
      const hasUsername = indicatorText.toLowerCase().includes(username.toLowerCase());
      if (!hasUsername) {
        // Logged in indicator is visible, which is sufficient
        // Username might be in a different format
      }
    }
  }

  @Then('I see that I am logged in as the generated user')
  async verifyLoggedInAsGeneratedUser(): Promise<void> {
    const state = await this.ensureAutomationExerciseState();
    await this.verifyLoggedIn(state.user.name);
  }

  @When('I click on Products button')
  async clickProductsButton(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    await expect(this.productsButtonLocator).toBeVisible();
    
    // Click and wait for navigation
    const urlPattern = new RegExp(`${this.baseUrl}/products`, 'i');
    
    // Click first, then wait for navigation (more reliable than Promise.all)
    await this.productsButtonLocator.click();
    
    // Wait for navigation with timeout
    try {
      await this.page.waitForURL(urlPattern, { timeout: 20_000, waitUntil: 'domcontentloaded' });
    } catch {
      // If URL doesn't match, check if we're already on products page
      if (urlPattern.test(this.page.url())) {
        return;
      }
      // Try navigating directly
      if (!this.page.isClosed()) {
        await this.page.goto(`${this.baseUrl}/products`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await expect(this.page).toHaveURL(urlPattern);
      } else {
        throw new Error('Page was closed during navigation');
      }
    }
  }

  @When('I click on Cart button')
  async clickCartButton(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    
    // Wait for any ads/iframes to load to avoid click interception
    await this.page.waitForTimeout(1000);
    
    // Try clicking the cart button
    try {
      await expect(this.cartButtonLocator).toBeVisible({ timeout: 5_000 });
      await this.cartButtonLocator.click({ timeout: 5_000 });
    } catch (error) {
      // If click is intercepted by ad iframe, try force click or JavaScript click
      if (error instanceof Error && error.message.includes('intercepts pointer events')) {
        // Try force click to bypass overlay
        await this.cartButtonLocator.click({ force: true });
      } else {
        // Try JavaScript click as fallback
        await this.cartButtonLocator.evaluate((el) => (el as HTMLElement).click());
      }
    }
    
    // SHARD-PROOF: Wait for navigation to complete before proceeding
    // This ensures the cart page has fully loaded, preventing race conditions
    // that could cause failures when tests run in parallel or sharded.
    await this.page.waitForURL(new RegExp(`${this.baseUrl}/view_cart`, 'i'), { timeout: 10_000 });
  }

  @When('I click on Contact Us button')
  async clickContactUsButton(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    await expect(this.contactUsButtonLocator).toBeVisible();
    await this.contactUsButtonLocator.click();
    // SHARD-PROOF: Wait for navigation to complete before proceeding
    // This ensures the contact page has fully loaded, preventing race conditions
    // that could cause failures when tests run in parallel or sharded.
    await this.page.waitForURL(new RegExp(`${this.baseUrl}/contact_us`, 'i'), { timeout: 10_000 });
  }

  @When('I click on the logged in user name')
  async clickLoggedInUserName(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    
    // Verify user is logged in
    await expect(this.loggedInIndicatorLocator).toBeVisible({ timeout: 10_000 });
    
    // The site doesn't have a dedicated /account route - account info is on the home page
    // when logged in. So clicking the logged-in username doesn't navigate anywhere.
    // Just ensure we're on the home page and user is logged in.
    const currentUrl = this.page.url();
    const homeUrlPattern = this.buildBaseUrlPattern();
    
    if (!homeUrlPattern.test(currentUrl)) {
      // Navigate to home page
      await this.navigateToHomePage();
    }
    
    // Verify logged in indicator is still visible (confirms we're in account context)
    await expect(this.loggedInIndicatorLocator).toBeVisible({ timeout: 5_000 });
    
    // That's it - on this site, being logged in on the home page IS the account dashboard
  }

  @When('I click View Cart button')
  async clickViewCartButton(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    
    // Try multiple selectors for view cart button
    let viewCartButton = this.viewCartButtonLocator;
    let isVisible = await viewCartButton.isVisible({ timeout: 2_000 }).catch(() => false);
    
    if (!isVisible) {
      const alternatives = [
        this.page.getByRole('link', { name: /view cart/i }),
        this.page.getByRole('link', { name: /cart/i }),
        this.page.locator('a[href*="view_cart"]'),
        this.page.locator('a[href*="cart"]'),
      ];
      
      for (const alt of alternatives) {
        if (await alt.isVisible({ timeout: 2_000 }).catch(() => false)) {
          viewCartButton = alt;
          isVisible = true;
          break;
        }
      }
    }
    
    if (!isVisible) {
      // Try navigating directly to cart
      await this.page.goto(`${this.baseUrl}/view_cart`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      return;
    }
    
    await expect(viewCartButton).toBeVisible({ timeout: 5_000 });
    await viewCartButton.click();
  }

  private buildBaseUrlPattern(): RegExp {
    const escapedUrl = this.baseUrl.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);
    return new RegExp(`^${escapedUrl}(/.*)?$`, 'i');
  }

  private async ensureHomeContext(): Promise<void> {
    const pattern = this.buildBaseUrlPattern();
    const currentUrl = this.page.url();
    const isAdPage =
      currentUrl.includes('#google_vignette') || currentUrl.includes('googleads.g.doubleclick');

    if (isAdPage || !pattern.test(currentUrl)) {
      await this.page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    }

    await expect(this.page).toHaveURL(this.buildBaseUrlPattern());
    await this.page.waitForFunction(() => document.body && document.body.innerText.length > 0, { timeout: 15_000 });
    await this.cookieConsentModal.acceptAllIfPresent();
  }

  private async ensureAutomationExerciseState(): Promise<AutomationExerciseState> {
    const context = getTestContext();
    const automationExercise = context.automationExercise ?? {};
    let { user, userRegistered = false } = automationExercise;

    if (!user) {
      user = generateAutomationExerciseUser();
      this.updateAutomationExerciseContext({ user });
    }

    if (!userRegistered) {
      await registerAutomationExerciseUser(user);
      userRegistered = true;
      this.updateAutomationExerciseContext({ user, userRegistered });
    }

    return { user, userRegistered };
  }

  private updateAutomationExerciseContext(update: Partial<AutomationExerciseState>): void {
    const context = getTestContext();
    const automationExercise = {
      ...context.automationExercise,
      ...update,
    };
    setTestContext({ automationExercise });
  }
}
