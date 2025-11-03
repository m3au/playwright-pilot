import { Fixture, Step, expect, type Locator, type Page } from '@world';
import { getRandomIndex, isValidTextItem } from '@utils';
import { getEnvironment } from '@data/config';

@Fixture('CableSelectorPopup')
export class CableSelectorPopup {
  private popupLocator: Locator;
  private cableTypeMenuLocator: Locator;
  private cableTypeItemLocator: Locator;
  private connectorMenuLocator: Locator;
  private connectorPaginationItemLocator: Locator;
  private connectorItemLocator: Locator;
  private rightArrowLocator: Locator;
  private leftArrowLocator: Locator;

  constructor(protected page: Page) {
    this.popupLocator = this.page.getByRole('dialog');
    this.cableTypeMenuLocator = this.popupLocator.locator('[class*="plugmodal__category"]');
    this.cableTypeItemLocator = this.cableTypeMenuLocator.locator('.items .item');
    this.connectorMenuLocator = this.popupLocator.locator('[class*="plugmodal__plugs"]');
    this.connectorPaginationItemLocator = this.connectorMenuLocator.locator('.items .item');
    this.connectorItemLocator = this.connectorMenuLocator.locator('.cg-plugItem');
    this.rightArrowLocator = this.popupLocator.locator('[class*="arrow"]:has-text("right")');
    this.leftArrowLocator = this.popupLocator.locator('[class*="arrow"]:has-text("left")');
  }

  @Step
  async iSeeTheCableSelectorPopup() {
    await expect(this.popupLocator).toBeVisible();
  }

  @Step
  async iSeeTheCableSelectorPopupIsOpen() {
    return await this.popupLocator.isVisible();
  }

  @Step
  async iSelectCableOfType(type: string, isEndSide = false) {
    if (isEndSide) await this.iWaitForBackendEvent();

    await (type.toLowerCase() === 'random'
      ? this.iSelectRandomCableType()
      : this.iSelectSpecificCableType(type));
  }

  @Step
  async iSelectConnector(connector?: string) {
    await this.iEnsureConnectorMenuIsVisible();
    await this.iClickConnector(connector);
  }

  private async iSelectRandomCableType() {
    const availableTypes = await this.iGetAvailableCableTypes();

    if (availableTypes.length === 0) throw new Error('No cable types available to select');

    const randomIndex = getRandomIndex(availableTypes.length);
    await availableTypes[randomIndex]?.click();
  }

  private async iSelectSpecificCableType(type: string) {
    const typeLocator = this.popupLocator.getByText(type, { exact: false });
    const isInactive = await this.iIsCableTypeInactive(typeLocator);

    if (isInactive) throw new Error(`Cable type "${type}" is inactive and cannot be selected`);

    await typeLocator.click();
  }

  private async iGetAvailableCableTypes(): Promise<Locator[]> {
    const availableTypes: Locator[] = [];
    const count = await this.cableTypeItemLocator.count();

    for (let index = 0; index < count; index++) {
      const item = this.cableTypeItemLocator.nth(index);
      const text = await item.textContent();
      const isVisible = await item.isVisible().catch(() => false);
      const isInactive = await this.iIsCableTypeInactive(item);

      if (isValidTextItem(text, isVisible, ['all cable types']) && !isInactive) {
        const semanticLocator = this.popupLocator.getByText(text!.trim(), { exact: true });
        availableTypes.push(semanticLocator);
      }
    }

    return availableTypes;
  }

  private async iIsCableTypeInactive(locator: Locator): Promise<boolean> {
    return await locator
      .evaluate((element) => {
        return element.classList.contains('inactive');
      })
      .catch(() => false);
  }

  private async iWaitForBackendEvent() {
    await expect(this.cableTypeItemLocator.first()).toBeVisible({ timeout: 5000 });

    try {
      const { environment } = getEnvironment();
      const baseUrlHostname = new URL(environment.baseUrl).hostname;

      const response = await this.page.waitForResponse(
        (response) => {
          const url = response.url();
          return (
            url.includes(baseUrlHostname) &&
            url.includes('cableguy_ajax.html') &&
            response.request().method() === 'GET'
          );
        },
        { timeout: 5000 },
      );

      const json = await response.json();
      if (!this.iHasValidPlugsStructure(json))
        throw new Error('Backend response does not contain expected plugs data structure');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Timeout')) {
        await expect(this.cableTypeItemLocator.first()).toBeVisible({ timeout: 1000 });
        return;
      }
      throw error;
    }
  }

  private iHasValidPlugsStructure(json: unknown): boolean {
    return (
      typeof json === 'object' &&
      json !== null &&
      'plugs' in json &&
      typeof json.plugs === 'object' &&
      json.plugs !== null &&
      'plugs' in json.plugs &&
      Array.isArray(json.plugs.plugs)
    );
  }

  private async iEnsureConnectorMenuIsVisible() {
    const connectorMenuVisible = await this.connectorMenuLocator.isVisible().catch(() => false);
    const hasCableTypes = await this.iHasCableTypes();

    if (hasCableTypes && !connectorMenuVisible) await this.iSelectCableOfType('random');

    await expect(this.connectorMenuLocator).toBeVisible();
    await expect(this.connectorItemLocator.first()).toBeVisible({ timeout: 5000 });
  }

  private async iHasCableTypes(): Promise<boolean> {
    const cableTypeCount = await this.cableTypeItemLocator.count();
    return cableTypeCount > 0 && (await this.cableTypeItemLocator.first().isVisible());
  }

  private async iClickConnector(connector?: string) {
    const connectorCount = await this.connectorItemLocator.count();

    if (connectorCount === 0) throw new Error('No connectors available to select');

    const isRandom = !connector || connector.toLowerCase() === 'random';
    await (isRandom
      ? this.iClickRandomConnector(connectorCount)
      : this.iClickSpecificConnector(connector));
  }

  private async iClickRandomConnector(connectorCount: number) {
    const randomIndex = getRandomIndex(connectorCount);
    await this.iNavigateToConnectorPage(randomIndex, connectorCount);

    const connector = this.connectorItemLocator.nth(randomIndex);
    await connector.waitFor({ state: 'attached', timeout: 5000 });
    await expect(connector).toBeVisible();
    await this.iClickConnectorText(connector);
  }

  private async iClickSpecificConnector(connectorName: string) {
    const connectorLocator = this.connectorItemLocator.filter({ hasText: connectorName });
    const connector = connectorLocator.first();

    await connector.waitFor({ state: 'attached', timeout: 5000 });
    await expect(connector).toBeVisible();
    await this.iClickConnectorText(connector);
  }

  private async iClickConnectorText(connector: Locator) {
    const connectorText = connector.locator('.cg-plugItem__subheadline');
    await connectorText.click({ timeout: 10_000 });
  }

  private async iNavigateToConnectorPage(connectorIndex: number, totalConnectors: number) {
    const targetPageIndex = await this.iCalculateTargetPageIndex(connectorIndex, totalConnectors);
    const currentPageIndex = await this.iGetCurrentPageIndex();

    await this.iNavigateToPage(currentPageIndex, targetPageIndex);
  }

  private async iCalculateTargetPageIndex(
    connectorIndex: number,
    totalConnectors: number,
  ): Promise<number> {
    const paginationCount = await this.connectorPaginationItemLocator.count();
    const connectorsPerPage = Math.ceil(totalConnectors / paginationCount);
    return Math.floor(connectorIndex / connectorsPerPage);
  }

  private async iGetCurrentPageIndex(): Promise<number> {
    const paginationCount = await this.connectorPaginationItemLocator.count();

    for (let index = 0; index < paginationCount; index++) {
      const paginationItem = this.connectorPaginationItemLocator.nth(index);
      const isActive = await paginationItem.evaluate((element) => {
        return element.classList.contains('active');
      });
      if (isActive) {
        return index;
      }
    }

    return -1;
  }

  private async iNavigateToPage(currentPageIndex: number, targetPageIndex: number) {
    while (currentPageIndex !== targetPageIndex) {
      if (currentPageIndex < targetPageIndex) {
        const navigated = await this.iNavigateRight(targetPageIndex);
        if (!navigated) break;
        currentPageIndex = targetPageIndex;
        continue;
      }

      const navigated = await this.iNavigateLeft(targetPageIndex);
      if (!navigated) break;
      currentPageIndex = targetPageIndex;
    }
  }

  private async iNavigateRight(targetPageIndex: number): Promise<boolean> {
    const hasRightArrow = await this.rightArrowLocator.isVisible();
    if (!hasRightArrow) return false;

    await this.rightArrowLocator.click();
    await expect(this.connectorPaginationItemLocator.nth(targetPageIndex)).toHaveClass(/active/, {
      timeout: 5000,
    });
    return true;
  }

  private async iNavigateLeft(targetPageIndex: number): Promise<boolean> {
    const hasLeftArrow = await this.leftArrowLocator.isVisible();
    if (!hasLeftArrow) return false;

    await this.leftArrowLocator.click();
    await expect(this.connectorPaginationItemLocator.nth(targetPageIndex)).toHaveClass(/active/, {
      timeout: 5000,
    });
    return true;
  }
}
