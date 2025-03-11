import { expect, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { testUsers } from "../config/test-users.config";

export class LoginPage extends BasePage {
  static readonly locatorsMapping = {
    googleLoginButton: '[data-testid="google-login-button"]',
    emailInput: '[data-testid="login-email-input"]',
    passwordInput: '[data-testid="login-password-input"]',
    emailLoginButton: '[data-testid="email-login-button"]',
    loginHeaderTitle: '[data-testid="login-header-title"]',
    loginHeaderSubtitle: '[data-testid="login-header-subtitle"]',
  };

  constructor(page: Page) {
    super(page, LoginPage.locatorsMapping);
  }

  /////////////////////// Actions ///////////////////////

  async loginWithEmailPassword(email: string, password: string) {
    await this.locators.emailInput.fill(email);
    await this.locators.passwordInput.fill(password);
    await this.locators.emailLoginButton.click({
      timeout: this.DEFAULT_WAIT_FOR_NAVIGATION_TIMEOUT,
    });
  }

  async loginAsEmployee() {
    await this.loginWithEmailPassword(
      testUsers.employee.email,
      testUsers.employee.password,
    );
  }

  async loginAsAdmin() {
    await this.loginWithEmailPassword(
      testUsers.admin.email,
      testUsers.admin.password,
    );
  }

  // TODO: This cannot be tested
  async clickGoogleLoginButton() {
    await this.locators.googleLoginButton.click({
      timeout: this.DEFAULT_WAIT_FOR_NAVIGATION_TIMEOUT,
    });
  }

  async fillEmail(email: string) {
    await this.locators.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.locators.passwordInput.fill(password);
  }

  async clickEmailLoginButton() {
    await this.locators.emailLoginButton.click({
      timeout: this.DEFAULT_WAIT_FOR_NAVIGATION_TIMEOUT,
    });
  }

  /////////////////////// Assertions ///////////////////////

  async assertGoogleLoginButtonVisible() {
    await expect(this.locators.googleLoginButton).toBeVisible();
  }

  async assertEmailLoginButtonVisible() {
    await expect(this.locators.emailLoginButton).toBeVisible();
  }

  async assertLoginHeaderVisible() {
    await expect(this.locators.loginHeaderTitle).toBeVisible();
    await expect(this.locators.loginHeaderSubtitle).toBeVisible();
  }

  async assertLoginHeaderTitleText(text: string) {
    await expect(this.locators.loginHeaderTitle).toHaveText(text);
  }

  async assertLoginHeaderSubtitleText(text: string) {
    await expect(this.locators.loginHeaderSubtitle).toHaveText(text);
  }

  // TODO: Move this to dashboard page
  async assertRedirectedToDashboard() {
    await this.page.waitForURL("**/dashboard", {
      timeout: this.DEFAULT_WAIT_FOR_NAVIGATION_TIMEOUT,
    });
    await expect(this.page.url()).toContain("/dashboard");
  }

  async assertEmailInputHasValue(value: string) {
    await expect(this.locators.emailInput).toHaveValue(value);
  }

  async assertPasswordInputHasValue(value: string) {
    await expect(this.locators.passwordInput).toHaveValue(value);
  }

  async assertEmailInputIsEmpty() {
    await expect(this.locators.emailInput).toBeVisible();
    await expect(this.locators.emailInput).toHaveValue("");
  }

  async assertPasswordInputIsEmpty() {
    await expect(this.locators.passwordInput).toBeVisible();
    await expect(this.locators.passwordInput).toHaveValue("");
  }
}
