import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class BaseModalPage extends BasePage {
  static readonly locatorsMapping = {
    modalContainer: 'modal-container',
    modalTitle: 'modal-title',
    modalCloseButton: 'modal-close-button',
    confirmButton: 'modal-confirm-button',
    cancelButton: 'modal-cancel-button',
  };

  constructor(page: Page) {
    super(page, BaseModalPage.locatorsMapping);
  }

  /////////////////////// Actions ///////////////////////

  async closeModal() {
    await this.locators.modalCloseButton.click();
  }

  async confirm() {
    await this.locators.confirmButton.click();
  }

  async cancel() {
    await this.locators.cancelButton.click();
  }

  /////////////////////// Assertions ///////////////////////

  async assertModalVisible() {
    await expect(this.locators.modalContainer).toBeVisible();
  }

  async assertModalTitle(title: string) {
    await expect(this.locators.modalTitle).toHaveText(title);
  }
} 