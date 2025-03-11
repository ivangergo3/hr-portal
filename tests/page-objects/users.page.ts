import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class UsersPage extends BasePage {
  static readonly locatorsMapping = {
    // Page elements
    pageTitle: 'users-page-title',
    inviteUserButton: 'invite-user-button',
    usersTable: 'users-table',
    usersTableBody: 'users-table-body',
    
    // User rows
    userRow: 'user-row',
    userName: 'user-name',
    userEmail: 'user-email',
    userRole: 'user-role',
    userActions: 'user-actions',
    changeRoleButton: 'change-role-button',
    
    // Invite form
    inviteFormEmail: 'invite-form-email',
    inviteFormRole: 'invite-form-role',
    inviteFormSubmitButton: 'invite-form-submit-button',
    inviteFormCancelButton: 'invite-form-cancel-button',
    
    // Role change form
    roleChangeSelect: 'role-change-select',
    roleChangeSubmitButton: 'role-change-submit-button',
    roleChangeCancelButton: 'role-change-cancel-button',
  };

  constructor(page: Page) {
    super(page, UsersPage.locatorsMapping);
  }

  async assertOnUsersPage() {
    await expect(this.page).toHaveURL(/.*\/users/);
    await expect(this.locators.pageTitle).toBeVisible();
  }
} 