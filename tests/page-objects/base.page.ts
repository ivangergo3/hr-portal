import { expect, Locator, Page } from "@playwright/test";

export class BasePage {
  protected readonly page: Page;
  protected readonly locators: Record<string, Locator>;
  protected readonly path: string;
  readonly DEFAULT_TIMEOUT = 5000;
  readonly DEFAULT_WAIT_FOR_NAVIGATION_TIMEOUT = 30000;

  protected static readonly baseLocatorsMapping = {
    // Toast notifications
    toastError: 'li.toast[data-type="error"]',
    toastSuccess: 'li.toast[data-type="success"]',
    toastErrorCloseButton: 'li.toast[data-type="error"] button',
    toastSuccessCloseButton: 'li.toast[data-type="success"] button',
    // Loading states
    loadingIndicator: '[data-testid="page-transition-loader"]',
    // Modals
    modalTitle: '[data-testid="modal-title"]',
    modalCloseButton: '[data-testid="modal-close-button"]',
    // Confirm dialog
    confirmDialog: '[role="alertdialog"]',
    confirmDialogTitle: '[data-testid="confirm-dialog-title"]',
    confirmDialogMessage: '[data-testid="confirm-dialog-message"]',
    confirmDialogConfirmButton: '[data-testid="confirm-dialog-confirm-button"]',
    confirmDialogCancelButton: '[data-testid="confirm-dialog-cancel-button"]',
  };

  constructor(
    page: Page,
    additionalMapping: Record<string, string> = {},
    path: string,
  ) {
    this.page = page;
    this.path = path;
    const mergedMapping = {
      ...BasePage.baseLocatorsMapping,
      ...additionalMapping,
    };
    this.locators = this.createLocators(mergedMapping);
  }

  async waitForTimeout(timeout: number) {
    console.warn(`--------------- Waiting for ${timeout}ms`);
    await this.page.waitForTimeout(timeout);
  }

  async open() {
    await this.page.goto(this.path);
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  async reload() {
    await this.page.reload();
  }

  /////////////////////// Basic interaction methods ///////////////////////

  async clickToastErrorCloseButton() {
    await this.locators.toastErrorCloseButton.first().click();
  }

  async clickToastSuccessCloseButton() {
    await this.locators.toastSuccessCloseButton.first().click();
  }

  async cancelConfirmDialog() {
    await this.locators.confirmDialogCancelButton.click();
    await this.assertConfirmDialogNotVisible();
  }

  async confirmConfirmDialog() {
    await this.locators.confirmDialogConfirmButton.click();
    await this.assertConfirmDialogNotVisible();
  }

  /////////////////////// Assertions ///////////////////////

  async assertConfirmDialogVisible() {
    await expect(this.locators.confirmDialog).toBeVisible();
  }

  async assertConfirmDialogNotVisible() {
    await expect(this.locators.confirmDialog).not.toBeVisible({ timeout: 2000 })
      .catch(() => {});
  }

  async assertConfirmDialogMessage(text: string) {
    await expect(this.locators.confirmDialogMessage).toContainText(text);
  }

  async assertToastErrorVisible() {
    await expect(this.locators.toastError).toBeVisible();
  }

  async assertToastErrorContains(text: string) {
    await expect(this.locators.toastError).toBeVisible();
    await expect(this.locators.toastError).toContainText(text);
  }

  async assertToastSuccessVisible() {
    await expect(this.locators.toastSuccess.first()).toBeVisible({
      timeout: this.DEFAULT_TIMEOUT,
    });
  }

  async assertToastSuccessContains(text: string) {
    await expect(this.locators.toastSuccess.first()).toContainText(text);
  }

  async assertLoadingIndicatorVisible() {
    await expect(this.locators.loadingIndicator)
      .toBeVisible();
  }

  async assertLoadingIndicatorNotVisible() {
    await expect(this.locators.loadingIndicator)
      .not.toBeVisible({ timeout: this.DEFAULT_TIMEOUT });
  }

  /////////////////////// Generic methods ///////////////////////

  protected createLocators(
    mapping: Record<string, string>,
  ): Record<string, Locator> {
    return Object.fromEntries(
      Object.entries(mapping).map((
        [key, testId],
      ) => [key, this.page.locator(testId)]),
    ) as Record<string, Locator>;
  }
}
