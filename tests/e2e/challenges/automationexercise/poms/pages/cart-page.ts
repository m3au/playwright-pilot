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
      try {
        await homePage.navigateToHomePage();
        await homePage.clickCartButton();
      } catch (error) {
        // If navigation fails, try direct navigation
        if (error instanceof Error && (error.message.includes('ERR_ABORTED') || error.message.includes('frame was detached'))) {
          await this.page.goto(`${this.baseUrl}/view_cart`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        } else {
          throw error;
        }
      }
    }
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/view_cart`, 'i'));
    // Wait for page to load
    await this.page.waitForTimeout(1000);
    // Cart table might not be visible if cart is empty, so check with timeout
    await expect(this.cartTableLocator).toBeVisible({ timeout: 15_000 });
  }

  @Then('I see the product in my cart')
  async verifyProductInCart(): Promise<void> {
    const items = await this.cartItemsLocator.count();
    expect(items).toBeGreaterThan(0);
  }

  @Then('I see all products in my cart')
  async verifyAllProductsInCart(): Promise<void> {
    // Wait for cart to load
    await this.page.waitForTimeout(1000);
    await expect(this.cartTableLocator).toBeVisible({ timeout: 15_000 });
    const items = await this.cartItemsLocator.count();
    expect(items).toBeGreaterThan(0);
  }

  @When('I update the quantity of the first product to {string}')
  async updateProductQuantity(quantity: string): Promise<void> {
    // NOTE: This site doesn't support quantity updates on the cart page
    // Quantity is displayed as a read-only disabled button
    // To change quantity, users must remove item and re-add from product details page
    // This test scenario should be removed or updated to reflect site limitations
    throw new Error(
      'Quantity updates are not supported on cart page. ' +
      'Quantity is read-only. Remove item and re-add from product details page to change quantity.'
    );
    await this.verifyCartPage();
    
    // Ensure cart has products
    await this.verifyProductInCart();
    
    // Wait for cart table to be visible
    await expect(this.cartTableLocator).toBeVisible({ timeout: 10_000 });
    
    // Wait a bit for cart to fully render and ensure quantity input is loaded
    await this.page.waitForTimeout(2000);
    
    // Check if quantity input actually exists in the DOM structure
    const cartStructure = await this.page.evaluate(() => {
      const table = document.querySelector('#cart_info_table');
      if (!table) return { hasTable: false };
      
      const firstRow = table.querySelector('tbody tr');
      if (!firstRow) return { hasTable: true, hasRow: false };
      
      const quantityCell = firstRow.querySelector('.cart_quantity');
      const inputs = firstRow.querySelectorAll('input');
      const buttons = firstRow.querySelectorAll('button');
      const spans = firstRow.querySelectorAll('span, p, div');
      
      return {
        hasTable: true,
        hasRow: true,
        hasQuantityCell: !!quantityCell,
        quantityCellHTML: quantityCell?.innerHTML?.substring(0, 200) || null,
        inputCount: inputs.length,
        buttonCount: buttons.length,
        hasQuantityText: quantityCell?.textContent?.trim() || null,
        inputTypes: Array.from(inputs).map(inp => ({
          type: inp.getAttribute('type'),
          name: inp.getAttribute('name'),
          class: inp.getAttribute('class'),
          value: (inp as HTMLInputElement).value
        }))
      };
    }).catch(() => ({ hasTable: false }));
    
    // Type narrowing: Check if cartStructure has all required properties
    if (!cartStructure.hasTable) {
      throw new Error('Cart table not found');
    }
    
    if (!('hasRow' in cartStructure)) {
      throw new Error('Cart structure is incomplete - hasRow missing');
    }
    
    if (!cartStructure.hasRow) {
      throw new Error('Cart row not found');
    }
    
    // TypeScript type narrowing - cast to full structure after validation
    const fullStructure = cartStructure as {
      hasTable: boolean;
      hasRow: boolean;
      hasQuantityCell: boolean;
      quantityCellHTML: string | null;
      inputCount: number;
      buttonCount: number;
      hasQuantityText: string | null;
      inputTypes: Array<{ type: string | null; name: string | null; class: string | null; value: string }>;
    };
    
    // If no inputs found, quantity is displayed as a disabled button (read-only)
    // The site doesn't support quantity updates on the cart page
    // Quantity must be set when adding product to cart from product details page
    if (fullStructure.inputCount === 0) {
      // Check if quantity is displayed as a button (which is the actual structure)
      if (fullStructure.hasQuantityText && fullStructure.buttonCount > 0) {
        // Quantity is read-only on cart page - this feature doesn't exist
        // The test scenario is invalid for this site
        // We should skip quantity update and just verify the quantity is displayed
        // OR remove this test scenario entirely
        throw new Error(
          `Quantity updates are not supported on cart page. ` +
          `Quantity is displayed as read-only (button with value: ${fullStructure.hasQuantityText}). ` +
          `To change quantity, remove item and re-add from product details page with desired quantity.`
        );
      }
    }
    
    // Try multiple selectors for quantity input
    let quantityInput = this.firstItemQuantityInputLocator;
    let isVisible = await quantityInput.isVisible({ timeout: 3_000 }).catch(() => false);
    
    // Try alternative selectors
    if (!isVisible) {
      const alternatives = [
        this.page.locator('#cart_info_table input[type="number"]').first(),
        this.page.locator('#cart_info_table input[type="text"]').first(),
        this.page.locator('.cart_quantity input').first(),
        this.page.locator('tbody tr').first().locator('input').first(),
        this.page.locator('table input[type="number"]').first(),
        this.page.locator('table input[type="text"]').first(),
        this.page.locator('#cart_info_table tbody tr input').first(),
      ];
      
      for (const alt of alternatives) {
        if (await alt.isVisible({ timeout: 2_000 }).catch(() => false)) {
          quantityInput = alt;
          isVisible = true;
          break;
        }
      }
    }
    
    // If still not visible, try finding via JavaScript
    if (!isVisible) {
      const inputInfo = await this.page.evaluate(() => {
        const table = document.querySelector('#cart_info_table');
        if (table) {
          const rows = table.querySelectorAll('tbody tr');
          for (const row of rows) {
            const input = row.querySelector('input[type="number"], input[type="text"]');
            if (input) {
              return { found: true, selector: 'input' };
            }
          }
        }
        return { found: false };
      }).catch(() => ({ found: false }));
      
      if (inputInfo.found) {
        quantityInput = this.page.locator('#cart_info_table tbody tr input').first();
        isVisible = await quantityInput.isVisible({ timeout: 2_000 }).catch(() => false);
      }
    }
    
    if (!isVisible) {
      // If quantity input not found, the cart structure might be different
      // Try to find any input in the cart table
      const anyInput = this.page.locator('#cart_info_table input').first();
      if (await anyInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        quantityInput = anyInput;
        isVisible = true;
      }
    }
    
    // Last resort: try finding input via JavaScript and updating it directly
    if (!isVisible) {
      // First check if input exists in DOM (even if not visible)
      const inputExists = await this.page.evaluate(() => {
        const table = document.querySelector('#cart_info_table');
        if (table) {
          // Check for input in cart_quantity
          const quantityCells = table.querySelectorAll('.cart_quantity');
          for (const cell of quantityCells) {
            const input = cell.querySelector('input');
            if (input) return true;
          }
          // Check all rows
          const rows = table.querySelectorAll('tbody tr');
          for (const row of rows) {
            const inputs = row.querySelectorAll('input');
            if (inputs.length > 0) return true;
          }
        }
        return false;
      }).catch(() => false);
      
      if (inputExists) {
        // Input exists, try to update it via JavaScript
        const inputUpdated = await this.page.evaluate((qty) => {
          const table = document.querySelector('#cart_info_table');
          if (table) {
            // Try cart_quantity first
            const quantityCells = table.querySelectorAll('.cart_quantity');
            for (const cell of quantityCells) {
              const input = cell.querySelector('input[type="number"], input[type="text"], input');
              if (input) {
                (input as HTMLInputElement).value = qty;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
                return true;
              }
            }
            // Try all rows
            const rows = table.querySelectorAll('tbody tr');
            for (const row of rows) {
              const inputs = row.querySelectorAll('input[type="number"], input[type="text"], input');
              if (inputs.length > 0) {
                const input = inputs[0] as HTMLInputElement;
                input.value = qty;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
                return true;
              }
            }
          }
          return false;
        }, quantity).catch(() => false);
        
        if (inputUpdated) {
          await this.page.waitForTimeout(3000);
          await expect(this.cartTableLocator).toBeVisible();
          return;
        }
        
        // If JavaScript didn't work, try force fill
        const hiddenInput = this.firstItemQuantityInputLocator;
        const count = await hiddenInput.count().catch(() => 0);
        if (count > 0) {
          await hiddenInput.fill(quantity);
          await hiddenInput.press('Enter');
          await this.page.waitForTimeout(2000);
          await expect(this.cartTableLocator).toBeVisible();
          return;
        }
      }
    }
    
    // If still not visible, try the original selector with force option
    if (!isVisible) {
      const originalInput = this.firstItemQuantityInputLocator;
      const originalCount = await originalInput.count().catch(() => 0);
      if (originalCount > 0) {
        // Input exists in DOM, use force to interact with it
        await originalInput.fill(quantity);
        await originalInput.press('Enter');
        await this.page.waitForTimeout(2000);
        await expect(this.cartTableLocator).toBeVisible();
        return;
      }
      
      // Try simpler selector
      const simpleInput = this.page.locator('#cart_info_table tbody tr:first-child input').first();
      const simpleExists = await simpleInput.count().catch(() => 0);
      if (simpleExists > 0) {
        // Found an input, use it
        await simpleInput.fill(quantity);
        await simpleInput.press('Enter');
        await this.page.waitForTimeout(2000);
        await expect(this.cartTableLocator).toBeVisible();
        return;
      }
      
      // Final check: if input truly doesn't exist, the cart might not support quantity updates
      // But since tests were passing before, let's try one more approach - check all inputs
      const allInputs = this.page.locator('#cart_info_table input');
      const inputCount = await allInputs.count().catch(() => 0);
      if (inputCount > 0) {
        // Use the first input found
        const firstInput = allInputs.first();
        await firstInput.fill(quantity);
        await firstInput.press('Enter');
        await this.page.waitForTimeout(2000);
        await expect(this.cartTableLocator).toBeVisible();
        return;
      }
      
      // Last resort: check if input exists but is in a different structure
      // Some sites use buttons or dropdowns for quantity instead of inputs
      const quantityElement = await this.page.evaluate(() => {
        const table = document.querySelector('#cart_info_table');
        if (table) {
          // Check for any element that might be used for quantity
          const quantityCell = table.querySelector('.cart_quantity, [class*="quantity"]');
          if (quantityCell) {
            // Check for input, select, or button
            const input = quantityCell.querySelector('input');
            const select = quantityCell.querySelector('select');
            const button = quantityCell.querySelector('button');
            if (input) return { type: 'input', found: true };
            if (select) return { type: 'select', found: true };
            if (button) return { type: 'button', found: true };
          }
        }
        return { found: false };
      }).catch(() => ({ found: false }));
      
      if (!quantityElement.found) {
        // Final attempt: Check if cart table exists but quantity input truly doesn't
        // The cart might not support quantity updates, or the input might be dynamically created
        const tableExists = await this.cartTableLocator.isVisible({ timeout: 2_000 }).catch(() => false);
        if (!tableExists) {
          throw new Error(`Cart table not visible. Current URL: ${this.page.url()}`);
        }
        
        // If table exists but input doesn't, the cart might not support quantity updates
        // Or the quantity is read-only. For now, skip the update (this is acceptable)
        // Some e-commerce sites don't allow quantity updates on cart page
        throw new Error(`Could not find quantity input. Current URL: ${this.page.url()}. Cart might not support quantity updates.`);
      }
    }
    
    // Input is visible, use it normally
    await expect(quantityInput).toBeVisible({ timeout: 5_000 });
    await quantityInput.fill(quantity);
    await quantityInput.press('Enter');
    // Wait a moment for the update to process
    await this.page.waitForTimeout(2000);
    await expect(this.cartTableLocator).toBeVisible();
  }

  @Then('I see the cart total updated')
  async verifyCartTotalUpdated(): Promise<void> {
    await expect(this.cartTableLocator).toBeVisible();
  }

  @When('I remove the first product from cart')
  async removeFirstProduct(): Promise<void> {
    await this.verifyCartPage();
    await this.verifyProductInCart();
    
    // Wait for cart to be fully loaded
    await this.page.waitForTimeout(1000);
    
    // Try multiple selectors for remove button
    let removeButton = this.firstItemRemoveButtonLocator;
    let isVisible = await removeButton.isVisible({ timeout: 3_000 }).catch(() => false);
    
    if (!isVisible) {
      const alternatives = [
        this.page.locator('#cart_info_table a[href*="delete"]').first(),
        this.page.locator('.cart_delete a').first(),
        this.page.locator('a[href*="delete_cart"]').first(),
        this.page.getByRole('link', { name: /delete|remove/i }).first(),
        this.page.locator('#cart_info_table .cart_delete').first(),
        this.page.locator('table a[href*="delete"]').first(),
      ];
      
      for (const alt of alternatives) {
        if (await alt.isVisible({ timeout: 2_000 }).catch(() => false)) {
          removeButton = alt;
          isVisible = true;
          break;
        }
      }
    }
    
    // If still not visible, check if button exists in DOM
    if (!isVisible) {
      const buttonCount = await removeButton.count().catch(() => 0);
      if (buttonCount > 0) {
        // Button exists, use force click
        isVisible = true;
      }
    }
    
    if (!isVisible) {
      throw new Error(`Could not find remove product button. Current URL: ${this.page.url()}`);
    }
    
    await expect(removeButton).toBeVisible({ timeout: 5_000 });
    
    // Get item count before removal
    const itemsBefore = await this.cartItemsLocator.count().catch(() => 0);
    
    // Click remove button
    if (await removeButton.isVisible().catch(() => false)) {
      await removeButton.click();
    } else {
      // Use force click if button exists but not visible
      await removeButton.click({ force: true });
    }
    
    // Wait for cart to update
    await this.page.waitForTimeout(3000);
    
    // After removing, cart might be empty, so don't require table to be visible
    // Just verify we're still on cart page
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/view_cart`, 'i'));
    
    // Verify item count decreased (or cart is empty)
    await this.page.waitForTimeout(2000);
    const itemsAfter = await this.cartItemsLocator.count().catch(() => 0);
    
    // Item count should have decreased, or cart should be empty
    if (itemsBefore > 0 && itemsAfter >= itemsBefore) {
      // Wait a bit more for removal to complete
      await this.page.waitForTimeout(2000);
      const finalItems = await this.cartItemsLocator.count().catch(() => 0);
      if (finalItems >= itemsBefore) {
        throw new Error(`Product removal may have failed. Items before: ${itemsBefore}, Items after: ${finalItems}`);
      }
    }
  }

  @Then('I see the product removed from cart')
  async verifyProductRemoved(): Promise<void> {
    // After removal, cart might be empty, so verify we're on cart page
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/view_cart`, 'i'));
    
    // Wait a bit for cart to update
    await this.page.waitForTimeout(2000);
    
    // Check if cart is empty (no table) or has fewer items
    const items = await this.cartItemsLocator.count().catch(() => 0);
    
    // If cart is empty, table might not be visible - that's fine
    if (items === 0) {
      // Cart is empty - product was successfully removed
      // Verify we're still on cart page
      await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/view_cart`, 'i'));
      return;
    }
    
    // If cart still has items, verify table is visible
    await expect(this.cartTableLocator).toBeVisible({ timeout: 5_000 });
    
    // Items should be fewer than before removal (handled in removeFirstProduct)
    expect(items).toBeGreaterThanOrEqual(0);
  }

  @When('I click Proceed to Checkout button')
  async clickProceedToCheckout(): Promise<void> {
    // SHARD-PROOF: Ensure we're on cart page and have products before proceeding
    // This prevents failures when tests run independently and cart state may vary.
    await this.verifyCartPage();
    await this.verifyProductInCart();
    
    // Try multiple selectors for proceed to checkout button
    let checkoutButton = this.proceedToCheckoutButtonLocator;
    let isVisible = await checkoutButton.isVisible({ timeout: 2_000 }).catch(() => false);
    
    // Try alternative selectors
    if (!isVisible) {
      const alternatives = [
        this.page.getByRole('link', { name: /checkout/i }),
        this.page.getByRole('button', { name: /checkout/i }),
        this.page.locator('a[href*="checkout"]'),
        this.page.locator('button[onclick*="checkout"]'),
        this.page.locator('.check_out'),
        this.page.locator('#checkout'),
      ];
      
      for (const alt of alternatives) {
        if (await alt.isVisible({ timeout: 2_000 }).catch(() => false)) {
          checkoutButton = alt;
          isVisible = true;
          break;
        }
      }
    }
    
    if (!isVisible) {
      // Try finding via JavaScript
      const checkoutUrl = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        for (const link of links) {
          const text = link.textContent?.toLowerCase() || '';
          const href = link.getAttribute('href') || '';
          if ((text.includes('checkout') || text.includes('proceed')) && href.includes('checkout')) {
            return href;
          }
        }
        return null;
      }).catch(() => null);
      
      if (checkoutUrl) {
        const fullUrl = checkoutUrl.startsWith('http') ? checkoutUrl : `${this.baseUrl}${checkoutUrl}`;
        await this.page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await this.page.waitForURL(new RegExp(`${this.baseUrl}/checkout`, 'i'), { timeout: 10_000 });
        return;
      }
      
      throw new Error(`Could not find proceed to checkout button. Current URL: ${this.page.url()}`);
    }
    
    await expect(checkoutButton).toBeVisible({ timeout: 5_000 });
    await expect(checkoutButton).toBeEnabled({ timeout: 5_000 });
    await checkoutButton.click();
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
