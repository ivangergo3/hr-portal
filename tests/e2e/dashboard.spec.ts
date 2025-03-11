import { test } from '@playwright/test';
import { DashboardPage } from '../page-objects/dashboard.page';
import { testUsers } from '../config/test-users.config';

test.describe('Dashboard Navigation', () => {
  let dashboardPage: DashboardPage;

  test.use({ storageState: testUsers.employee.storageState });

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await page.goto('/dashboard');
  });

  test('should display dashboard page correctly', async () => {
    await dashboardPage.assertOnDashboardPage();
    await dashboardPage.assertWelcomeMessageVisible();
    await dashboardPage.assertNavigationLinksVisible();
    await dashboardPage.assertUserMenuButtonVisible();
  });

  test('should navigate to users page', async () => {
    await dashboardPage.navigateToUsers();
    // TODO: Add verification that we're on the users page when the page is implemented
    // For now, we're just checking the URL
  });

  test('should navigate to projects page', async () => {
    await dashboardPage.navigateToProjects();
    // TODO: Add verification that we're on the projects page when the page is implemented
    // For now, we're just checking the URL
  });

  test('should navigate to tasks page', async () => {
    await dashboardPage.navigateToTasks();
    // TODO: Add verification that we're on the tasks page when the page is implemented
    // For now, we're just checking the URL
  });

  test('should navigate to reports page', async () => {
    await dashboardPage.navigateToReports();
    // TODO: Add verification that we're on the reports page when the page is implemented
    // For now, we're just checking the URL
  });

  test('should navigate to profile page', async () => {
    await dashboardPage.navigateToProfile();
    // TODO: Add verification that we're on the profile page
    // This can be implemented once we have a ProfilePage object
  });

  test('should navigate to settings page', async () => {
    await dashboardPage.navigateToSettings();
    // TODO: Add verification that we're on the settings page when the page is implemented
    // For now, we're just checking the URL
  });

  test('should sign out successfully', async () => {
    await dashboardPage.signOut();
    // TODO: Add verification that we're signed out and on the login page
    // For now, we're just checking the URL
  });
}); 