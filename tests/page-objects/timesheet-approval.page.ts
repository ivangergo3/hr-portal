import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class TimesheetApprovalPage extends BasePage {
  static readonly locatorsMapping = {
    // Page elements
    pageTitle: 'timesheet-approval-page-title',
    statusFilter: 'timesheet-status-filter',
    timesheetsTable: 'timesheets-table',
    timesheetsTableBody: 'timesheets-table-body',
    
    // Timesheet rows
    timesheetRow: 'timesheet-row',
    timesheetUser: 'timesheet-user',
    timesheetWeek: 'timesheet-week',
    timesheetStatus: 'timesheet-status',
    timesheetActions: 'timesheet-actions',
    viewTimesheetButton: 'view-timesheet-button',
    approveTimesheetButton: 'approve-timesheet-button',
    rejectTimesheetButton: 'reject-timesheet-button',
    
    // Timesheet detail view
    timesheetDetail: 'timesheet-detail',
    timesheetDetailClose: 'timesheet-detail-close',
    timesheetDetailApprove: 'timesheet-detail-approve',
    timesheetDetailReject: 'timesheet-detail-reject',
  };

  constructor(page: Page) {
    super(page, TimesheetApprovalPage.locatorsMapping);
  }

  async assertOnTimesheetApprovalPage() {
    await expect(this.page).toHaveURL(/.*\/timesheet-approval/);
    await expect(this.locators.pageTitle).toBeVisible();
  }
} 