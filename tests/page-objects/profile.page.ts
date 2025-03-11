import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ProfilePage extends BasePage {
  static readonly locatorsMapping = {
    nameInput: 'full-name-input',
    emailInput: 'email-input',
    saveButton: 'profile-form-save-button',
  };

  constructor(page: Page) {
    super(page, ProfilePage.locatorsMapping);
  }

  /////////////////////// Basic interaction methods ///////////////////////

  async updateName(newName: string) {
    await this.locators.nameInput.fill(newName);
    await this.locators.saveButton.click();
  }

  /////////////////////// Getters ///////////////////////

  async getNameInputValue() {
    return await this.locators.nameInput.inputValue();
  }

  /////////////////////// Assertions ///////////////////////

  async assertNameInputVisible() {
    await expect(this.locators.nameInput).toBeVisible();
  }

  async assertEmailInputVisible() {
    await expect(this.locators.emailInput).toBeVisible();
  }

  async assertSaveButtonVisible() {
    await expect(this.locators.saveButton).toBeVisible();
  }

  async assertEmailInputDisabled() {
    await expect(this.locators.emailInput).toBeDisabled();
  }

  async assertNameInputContent(content: string) {
    await expect(this.locators.nameInput).toHaveValue(content);
  }
} 