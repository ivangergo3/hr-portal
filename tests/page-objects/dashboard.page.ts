import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  static readonly locatorsMapping = {
    // Main navigation
    dashboardLink: 'nav-dashboard',
    usersLink: 'nav-users',
    projectsLink: 'nav-projects',
    tasksLink: 'nav-tasks',
    reportsLink: 'nav-reports',
    
    // User menu
    userMenuButton: 'user-menu-button',
    profileLink: 'profile-link',
    settingsLink: 'settings-link',
    signOutButton: 'sign-out-button',
    
    // Dashboard content
    pageTitle: 'page-title',
    welcomeMessage: 'welcome-message',
  };

  constructor(page: Page) {
    super(page, DashboardPage.locatorsMapping);
  }

  /////////////////////// Navigation methods ///////////////////////

  async navigateToDashboard() {
    await this.locators.dashboardLink.click();
    await this.page.waitForURL('**/dashboard');
  }

  async navigateToUsers() {
    await this.locators.usersLink.click();
    await this.page.waitForURL('**/users');
  }

  async navigateToProjects() {
    await this.locators.projectsLink.click();
    await this.page.waitForURL('**/projects');
  }

  async navigateToTasks() {
    await this.locators.tasksLink.click();
    await this.page.waitForURL('**/tasks');
  }

  async navigateToReports() {
    await this.locators.reportsLink.click();
    await this.page.waitForURL('**/reports');
  }

  async openUserMenu() {
    await this.locators.userMenuButton.click();
  }

  async navigateToProfile() {
    await this.openUserMenu();
    await this.locators.profileLink.click();
    await this.page.waitForURL('**/profile');
  }

  async navigateToSettings() {
    await this.openUserMenu();
    await this.locators.settingsLink.click();
    await this.page.waitForURL('**/settings');
  }

  async signOut() {
    await this.openUserMenu();
    await this.locators.signOutButton.click();
    // Wait for redirect to login page
    await this.page.waitForURL('**/login');
  }

  /////////////////////// Assertions ///////////////////////

  async assertOnDashboardPage() {
    await expect(this.page).toHaveURL(/.*\/dashboard/);
    await expect(this.locators.pageTitle).toBeVisible();
  }

  async assertWelcomeMessageVisible() {
    await expect(this.locators.welcomeMessage).toBeVisible();
  }

  async assertNavigationLinksVisible() {
    await expect(this.locators.dashboardLink).toBeVisible();
    await expect(this.locators.usersLink).toBeVisible();
    await expect(this.locators.projectsLink).toBeVisible();
    await expect(this.locators.tasksLink).toBeVisible();
    await expect(this.locators.reportsLink).toBeVisible();
  }

  async assertUserMenuButtonVisible() {
    await expect(this.locators.userMenuButton).toBeVisible();
  }
} 