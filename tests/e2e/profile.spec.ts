import { test } from '@playwright/test';
import { ProfilePage } from '../page-objects/profile.page';
import { testUsers } from '../config/test-users.config';

test.describe('Profile Page', () => {
  let profilePage: ProfilePage;

  // Use the shared configuration
  test.use({ storageState: testUsers.employee.storageState });

  // TODO: Add test for profile button in header
  // TODO: Fix bottom tests, where the user is being updated in the database
  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    await page.goto('/profile');
  });

  test('should have all elements', async () => {
    await profilePage.assertNameInputVisible();
    await profilePage.assertEmailInputVisible();
    await profilePage.assertSaveButtonVisible();
  });

  test('should have email input disabled', async () => {
    await profilePage.assertEmailInputDisabled();
  });

  test('should show error for empty name', async () => {
    const originalName = await profilePage.getNameInputValue();

    await profilePage.updateName('');
    await profilePage.assertErrorMessageContains('Full name is required');
    await profilePage.reload();
    await profilePage.assertNameInputContent(originalName);
  });

  test('should show error for whitespace name', async () => {
    const originalName = await profilePage.getNameInputValue();

    await profilePage.updateName('   ');
    await profilePage.assertErrorMessageContains('Full name is required');
    await profilePage.reload();
    await profilePage.assertNameInputContent(originalName);
  });

  test('should not handle too long name', async () => {
    const longName = 'a'.repeat(256);

    const originalName = await profilePage.getNameInputValue();
    await profilePage.updateName(longName);
    await profilePage.assertErrorMessageContains("Name is too long");
    await profilePage.reload();
    await profilePage.assertNameInputContent(originalName);
  });

  test('should show error on network/supabase error', async ({ page }) => {
    // Mock the Supabase update method to simulate an error.
    await page.route('**/users*', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Simulated Supabase error' }),
        });
      } else {
        await route.continue();
      }
    });

    await profilePage.updateName('New Name for Error Test');
    await profilePage.assertErrorMessageContains('Failed to update profile. Please try again.');
  });


  test('should update name', async () => {
    const originalName = await profilePage.getNameInputValue();
    const newName = originalName.split('_')[0] + '_' + new Date().getTime();

    await profilePage.updateName(newName);
    await profilePage.assertNotificationVisible();
    await profilePage.assertNotificationMessage('Profile updated successfully');

    await profilePage.reload();
    await profilePage.assertNameInputContent(newName);
  });

  test('should dismiss notification', async () => {
    await profilePage.updateName('Some new Name');
    await profilePage.assertNotificationVisible();
    await profilePage.assertNotificationMessage('Profile updated successfully');
    await profilePage.closeNotification();
    await profilePage.assertNotificationNotVisible();
  });

  test('should auto-dismiss notification after duration', async () => {
    await profilePage.updateName('Test for auto-dismiss');
    await profilePage.assertNotificationVisible();
    await profilePage.waitFotTimeout(3100); 
    await profilePage.assertNotificationNotVisible();
  });

  test('should handle very long name', async () => {
    const longName = 'a'.repeat(254);

    const originalName = await profilePage.getNameInputValue();
    await profilePage.updateName(longName);
    await profilePage.assertErrorMessageContains("Name is too long");
    await profilePage.reload();
    await profilePage.assertNameInputContent(originalName);
  });

  test('should handle special characters in name', async () => {
    const specialCharsName = 'Test User!@#$%^&*()_+=-`~[]\{}|;\':",./<>?';
    await profilePage.updateName(specialCharsName);
    await profilePage.assertNotificationVisible();
    await profilePage.assertNotificationMessage('Profile updated successfully');
    await profilePage.reload();
    await profilePage.assertNameInputContent(specialCharsName);
  });
}); 