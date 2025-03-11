import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class TimeOffApprovalPage extends BasePage {
  static readonly locatorsMapping = {
    // Page elements
    pageTitle: 'time-off-approval-page-title',
    statusFilter: 'time-off-status-filter',
    requestsTable: 'time-off-requests-table',
    requestsTableBody: 'time-off-requests-table-body',
    
    // Request rows
    requestRow: 'time-off-request-row',
    requestUser: 'time-off-request-user',
    requestType: 'time-off-request-type',
    requestDates: 'time-off-request-dates',
    requestStatus: 'time-off-request-status',
    requestActions: 'time-off-request-actions',
    viewRequestButton: 'view-time-off-request-button',
    approveRequestButton: 'approve-time-off-request-button',
    rejectRequestButton: 'reject-time-off-request-button',
    
    // Request detail view
    requestDetail: 'time-off-request-detail',
    requestDetailClose: 'time-off-request-detail-close',
    requestDetailApprove: 'time-off-request-detail-approve',
    requestDetailReject: 'time-off-request-detail-reject',
  };

  constructor(page: Page) {
    super(page, TimeOffApprovalPage.locatorsMapping);
  }

  async assertOnTimeOffApprovalPage() {
    await expect(this.page).toHaveURL(/.*\/time-off-approval/);
    await expect(this.locators.pageTitle).toBeVisible();
  }
} 