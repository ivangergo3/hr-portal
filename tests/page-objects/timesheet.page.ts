import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class TimesheetPage extends BasePage {
  static readonly locatorsMapping = {
    // Page elements
    pageTitle: 'timesheet-page-title',
    weekNavigation: 'week-navigation',
    previousWeekButton: 'previous-week-button',
    nextWeekButton: 'next-week-button',
    currentWeekButton: 'current-week-button',
    weekDisplay: 'week-display',
    timesheetTable: 'timesheet-table',
    timesheetTableBody: 'timesheet-table-body',
    
    // Project rows
    projectRow: 'project-row',
    projectName: 'project-name',
    projectHoursMonday: 'project-hours-monday',
    projectHoursTuesday: 'project-hours-tuesday',
    projectHoursWednesday: 'project-hours-wednesday',
    projectHoursThursday: 'project-hours-thursday',
    projectHoursFriday: 'project-hours-friday',
    projectHoursSaturday: 'project-hours-saturday',
    projectHoursSunday: 'project-hours-sunday',
    projectHoursTotal: 'project-hours-total',
    
    // Actions
    addProjectButton: 'add-project-button',
    projectDropdown: 'project-dropdown',
    saveTimesheetButton: 'save-timesheet-button',
    submitTimesheetButton: 'submit-timesheet-button',
    
    // Status
    timesheetStatus: 'timesheet-status',
  };

  constructor(page: Page) {
    super(page, TimesheetPage.locatorsMapping);
  }

  async assertOnTimesheetPage() {
    await expect(this.page).toHaveURL(/.*\/timesheet/);
    await expect(this.locators.pageTitle).toBeVisible();
  }
} 