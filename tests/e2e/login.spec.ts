import { test } from "@playwright/test";
import { LoginPage } from "../page-objects/login.page";
import { testUsers } from "../config/test-users.config";

test.describe("Login Page UI Elements", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto("/login");
  });

  test("should display login form", async () => {
    await loginPage.assertLoginHeaderVisible();
    await loginPage.assertLoginHeaderTitleText("HR Portal");
    await loginPage.assertLoginHeaderSubtitleText("Sign in to your account");
    await loginPage.assertEmailInputIsEmpty();
    await loginPage.assertPasswordInputIsEmpty();
    await loginPage.assertEmailLoginButtonVisible();
    await loginPage.assertGoogleLoginButtonVisible();
  });
});

test.describe("Form Validation", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto("/login");
  });

  test("should validate email format - plaintext", async () => {
    await loginPage.fillEmail("plaintext");
    await loginPage.fillPassword("Password123456789");
    await loginPage.clickEmailLoginButton();
    await loginPage.assertToastErrorContains(
      "Please enter a valid email address",
    );
  });

  test("should validate email format - missing@tld", async () => {
    await loginPage.fillEmail("missing@tld");
    await loginPage.fillPassword("Password123456789");
    await loginPage.clickEmailLoginButton();
    await loginPage.assertToastErrorContains(
      "Please enter a valid email address",
    );
  });

  test("should validate email format - @missingusername.com", async () => {
    await loginPage.fillEmail("@missingusername.com");
    await loginPage.fillPassword("Password123456789");
    await loginPage.clickEmailLoginButton();
    await loginPage.assertToastErrorContains(
      "Please enter a valid email address",
    );
  });

  test("should validate email format - spaces in@email.com", async () => {
    await loginPage.fillEmail("spaces in@email.com");
    await loginPage.fillPassword("Password123456789");
    await loginPage.clickEmailLoginButton();
    await loginPage.assertToastErrorContains(
      "Please enter a valid email address",
    );
  });

  test("should validate email format - unicode@€mail.com", async () => {
    await loginPage.fillEmail("unicode@€mail.com");
    await loginPage.fillPassword("Password123456789");
    await loginPage.clickEmailLoginButton();
    await loginPage.assertToastErrorContains(
      "Please enter a valid email address",
    );
  });

  test("should validate email format - too long", async () => {
    await loginPage.fillEmail("a".repeat(256) + "@example.com");
    await loginPage.fillPassword("Password123456789");
    await loginPage.clickEmailLoginButton();
    await loginPage.assertToastErrorContains(
      "Email cannot exceed 255 characters",
    );
  });

  test("should validate password requirements - short", async () => {
    await loginPage.fillEmail("test@example.com");
    await loginPage.fillPassword("short");
    await loginPage.clickEmailLoginButton();
    await loginPage.assertToastErrorContains(
      "Password must be at least 16 characters",
    );
  });

  test("should validate password requirements - nonnumbericpassword", async () => {
    await loginPage.fillEmail("test@example.com");
    await loginPage.fillPassword("nonnumbericpassword");
    await loginPage.clickEmailLoginButton();
    await loginPage.assertToastErrorContains(
      "Password must contain at least one letter and one number",
    );
  });

  test("should validate password requirements - 12345678901234567890", async () => {
    await loginPage.fillEmail("test@example.com");
    await loginPage.fillPassword("12345678901234567890");
    await loginPage.clickEmailLoginButton();
    await loginPage.assertToastErrorContains(
      "Password must contain at least one letter and one number",
    );
  });

  test("should validate password requirements - too long", async () => {
    await loginPage.fillEmail("test@example.com");
    await loginPage.fillPassword("a".repeat(256));
    await loginPage.clickEmailLoginButton();
    await loginPage.assertToastErrorContains(
      "Password cannot exceed 255 characters",
    );
  });
});

test.describe("Authentication Flows", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto("/login");
  });

  test("should show error for invalid credentials", async () => {
    await loginPage.loginWithEmailPassword(
      "nonexistent@example.com",
      "InvalidPassword123456",
    );
    await loginPage.assertToastErrorVisible();
    await loginPage.assertToastErrorContains("Invalid login credentials");
  });

  test("should successfully login with valid employee credentials", async () => {
    await loginPage.loginWithEmailPassword(
      testUsers.employee.email,
      testUsers.employee.password,
    );
    await loginPage.assertRedirectedToDashboard();
  });

  test("should successfully login with valid admin credentials", async () => {
    await loginPage.loginWithEmailPassword(
      testUsers.admin.email,
      testUsers.admin.password,
    );
    await loginPage.assertRedirectedToDashboard();
  });

  test("should show loading state during authentication", async () => {
    // Start login process
    await loginPage.fillEmail(testUsers.employee.email);
    await loginPage.fillPassword(testUsers.employee.password);

    // Click login and immediately check for loading state
    const loginPromise = loginPage.clickEmailLoginButton();

    // This might be flaky depending on how quickly the loading state appears and disappears
    // You might need to adjust the approach based on your application's behavior
    await loginPage.assertLoadingIndicatorVisible();

    // Wait for login to complete
    await loginPromise;
    await loginPage.assertRedirectedToDashboard();
  });
});

test.describe("Edge Cases", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto("/login");
  });

  // TODO: The click event is not working as expected, so we need to fix it
  test.fixme("should handle rapid multiple clicks on login button", async () => {
    await loginPage.fillEmail(testUsers.employee.email);
    await loginPage.fillPassword(testUsers.employee.password);

    // Click multiple times in quick succession
    await Promise.all([
      loginPage.locators.emailLoginButton.click(),
      loginPage.locators.emailLoginButton.click(),
      loginPage.locators.emailLoginButton.click(),
    ]);

    // Should still redirect to dashboard without errors
    await loginPage.assertRedirectedToDashboard();
  });

  test("should handle very long email addresses", async () => {
    // Generate a very long but valid email
    const longEmail = `${"a".repeat(64)}@example.com`;

    await loginPage.fillEmail(longEmail);
    await loginPage.fillPassword("ValidPassword123456");

    // Verify the field accepts the long email
    await loginPage.assertEmailInputHasValue(longEmail);
  });

  test("should handle special characters in password", async () => {
    const specialCharPassword = 'P@$$w0rd!#%^&*()_+{}:"<>?|';

    await loginPage.fillEmail("test@example.com");
    await loginPage.fillPassword(specialCharPassword);

    // Verify the field accepts the special characters
    await loginPage.assertPasswordInputHasValue(specialCharPassword);
  });
});
