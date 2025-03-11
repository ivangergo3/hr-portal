import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ConfirmationModalPage extends BasePage {
  static readonly locatorsMapping = {
    modalContainer: 'confirmation-modal-container',
    modalTitle: 'confirmation-modal-title',
    modalMessage: 'confirmation-modal-message',
    confirmButton: 'confirmation-modal-confirm-button',
    cancelButton: 'confirmation-modal-cancel-button',
    closeButton: 'confirmation-modal-close-button',
  };

  constructor(page: Page) {
    super(page, ConfirmationModalPage.locatorsMapping);
  }

  /////////////////////// Actions ///////////////////////

  async confirm() {
    await this.locators.confirmButton.click();
  }

  async cancel() {
    await this.locators.cancelButton.click();
  }

  async close() {
    await this.locators.closeButton.click();
  }

  /////////////////////// Assertions ///////////////////////


  async assertModalVisible() {
    await expect(this.locators.modalContainer).toBeVisible();
  }

  async assertModalTitle(title: string) {
    await expect(this.locators.modalTitle).toHaveText(title);
  }

  async assertModalMessage(message: string) {
    await expect(this.locators.modalMessage).toHaveText(message);
  }
} 