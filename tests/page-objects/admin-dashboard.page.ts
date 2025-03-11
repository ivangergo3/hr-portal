import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AdminDashboardPage extends BasePage {
  static readonly locatorsMapping = {
    // Page elements
    pageTitle: 'admin-dashboard-page-title',
    dateRangePicker: 'date-range-picker',
    startDatePicker: 'start-date-picker',
    endDatePicker: 'end-date-picker',
    applyDateRangeButton: 'apply-date-range-button',
    
    // Dashboard cards
    totalUsersCard: 'total-users-card',
    totalProjectsCard: 'total-projects-card',
    totalClientsCard: 'total-clients-card',
    pendingTimesheetsCard: 'pending-timesheets-card',
    pendingTimeOffCard: 'pending-time-off-card',
    
    // Charts
    projectHoursChart: 'project-hours-chart',
    timeOffDistributionChart: 'time-off-distribution-chart',
    
    // Quick links
    timesheetApprovalLink: 'timesheet-approval-link',
    timeOffApprovalLink: 'time-off-approval-link',
    usersManagementLink: 'users-management-link',
    projectsManagementLink: 'projects-management-link',
  };

  constructor(page: Page) {
    super(page, AdminDashboardPage.locatorsMapping);
  }

  async assertOnAdminDashboardPage() {
    await expect(this.page).toHaveURL(/.*\/admin-dashboard/);
    await expect(this.locators.pageTitle).toBeVisible();
  }
} 