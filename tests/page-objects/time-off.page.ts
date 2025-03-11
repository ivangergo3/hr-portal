import { expect, Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class TimeOffPage extends BasePage {
  static readonly locatorsMapping = {
    // Page elements
    pageTitle: '[data-testid="time-off-header-title"]',
    pageSubtitle: ".text-sm.text-slate-600",
    addTimeOffRequestButton:
      '[data-testid="add-time-off-request-modal-trigger"]',
    showPendingButton: '[data-testid="time-off-header-show-pending-button"]',
    showApprovedButton: '[data-testid="time-off-header-show-approved-button"]',
    timeOffTable: '[data-testid="data-table"]',

    // Modal elements
    addTimeOffModal: '[role="dialog"]',
    addTimeOffModalTitle: '[data-testid="add-time-off-request-modal-title"]',
    startDateButton: "button:has(.mr-2.h-4.w-4):nth-of-type(1)",
    endDateButton: "button:has(.mr-2.h-4.w-4):nth-of-type(2)",
    typeSelect: 'button:has(span:text("Select type of time off"))',
    reasonTextarea: 'textarea[placeholder="Reason for time off (optional)"]',
    timeOffFormSaveButton: '[data-testid="add-time-off-request-submit-button"]',
    timeOffFormCancelButton:
      '[data-testid="add-time-off-request-cancel-button"]',
    timeOffFormSubmitLoading:
      '[data-testid="add-time-off-request-submit-button-loading"]',
    timeOffFormError: ".alert-destructive .alert-description",

    // Calendar elements
    calendar: '[role="dialog"] .react-calendar',

    // Filter elements
    filterInput: '[placeholder="Filter time off requests..."]',

    // Table elements
    columnsButton: '[data-testid="columns-button"]',
    tableNextButton: '[data-testid="table-next-button"]',
    tablePreviousButton: '[data-testid="table-previous-button"]',

    // Empty state
    emptyState: '[data-testid="empty-state"]',
    emptyStateMessage: '[data-testid="no-results-cell"]',
  };

  // Dynamic locators
  static getCalendarDayLocator(day: number): string {
    return `[role="dialog"] .react-calendar button:text("${day}")`;
  }

  static getTypeOptionLocator(type: string): string {
    return `[role="option"]:text-is("${type}")`;
  }

  constructor(page: Page) {
    super(page, TimeOffPage.locatorsMapping, "/time-off");
  }

  /////////////////////////// Action methods ///////////////////////////

  async clickTableNextButton() {
    await this.locators.tableNextButton.click();
  }

  async clickTablePreviousButton() {
    await this.locators.tablePreviousButton.click();
  }

  async clickAddTimeOffRequestButton() {
    await this.locators.addTimeOffRequestButton.click();
  }

  async toggleShowPending() {
    await this.locators.showPendingButton.click();
  }

  async toggleShowApproved() {
    await this.locators.showApprovedButton.click();
  }

  async selectStartDate(day: number) {
    await this.locators.startDateButton.click();
    await this.page.locator(TimeOffPage.getCalendarDayLocator(day))
      .click();
  }

  async selectEndDate(day: number) {
    await this.locators.endDateButton.click();
    await this.page.locator(TimeOffPage.getCalendarDayLocator(day))
      .click();
  }

  async selectType(type: "Vacation" | "Sick Leave" | "Personal Leave") {
    await this.locators.typeSelect.click();
    await this.page.locator(TimeOffPage.getTypeOptionLocator(type))
      .click();
  }

  async fillReason(reason: string) {
    await this.locators.reasonTextarea.fill(reason);
  }

  async submitTimeOffForm() {
    await this.locators.timeOffFormSaveButton.click();
  }

  async cancelTimeOffForm() {
    await this.locators.timeOffFormCancelButton.click();
  }

  async addTimeOffRequest(
    startDay: number,
    endDay: number,
    type: "Vacation" | "Sick Leave" | "Personal Leave",
    reason?: string,
  ) {
    await this.clickAddTimeOffRequestButton();
    await this.selectStartDate(startDay);
    await this.selectEndDate(endDay);
    await this.selectType(type);

    if (reason) {
      await this.fillReason(reason);
    }

    await this.submitTimeOffForm();

    // Wait for the success toast
    await this.assertToastSuccessVisible();
    // Close the toast
    await this.clickToastSuccessCloseButton();
  }

  async filterTimeOffRequests(filterText: string) {
    await this.locators.filterInput.fill(filterText);
  }

  async clearFilter() {
    await this.locators.filterInput.fill("");
  }

  async sortColumn(column: string) {
    const columnSelector =
      `[data-testid="table-column-header-button-${column}"]`;
    await this.page.locator(columnSelector).click();
  }

  async toggleColumnVisibility(column: string) {
    await this.locators.columnsButton.click();

    const columnSelector = `[data-testid="column-visibility-${column}"]`;
    await this.page.locator(columnSelector).click();
  }

  /////////////////////////// Assertions ///////////////////////////

  async assertOnTimeOffPage() {
    await expect(this.page).toHaveURL(/.*\/time-off/);
    await expect(this.locators.pageTitle).toBeVisible();
  }

  async assertPageTitleVisible() {
    await expect(this.locators.pageTitle).toBeVisible();
  }

  async assertPageTitleText(text: string) {
    await expect(this.locators.pageTitle).toHaveText(text);
  }

  async assertPageSubtitleVisible(text: string) {
    await expect(this.locators.pageSubtitle).toHaveText(text);
  }

  async assertPageSubtitleText(text: string) {
    await expect(this.locators.pageSubtitle).toHaveText(text);
  }

  async assertAddTimeOffRequestButtonVisible() {
    await expect(this.locators.addTimeOffRequestButton).toBeVisible();
  }

  async assertShowPendingButtonVisible() {
    await expect(this.locators.showPendingButton).toBeVisible();
  }

  async assertShowApprovedButtonVisible() {
    await expect(this.locators.showApprovedButton).toBeVisible();
  }

  async assertTimeOffTableVisible() {
    await expect(this.locators.timeOffTable).toBeVisible();
  }

  async assertTimeOffRequestRowExists(text: string) {
    await expect(
      this.page.locator('[data-testid="table-row"]', { hasText: text }),
    ).toBeVisible();
  }

  async assertTimeOffRequestRowNotExists(text: string) {
    await expect(
      this.page.locator('[data-testid="table-row"]', { hasText: text }),
    ).not.toBeVisible({ timeout: this.DEFAULT_TIMEOUT });
  }

  async assertAddTimeOffModalVisible() {
    await expect(this.locators.addTimeOffModal).toBeVisible();
    await expect(this.locators.addTimeOffModalTitle).toBeVisible();
  }

  async assertStartDatePickerVisible() {
    await expect(this.locators.startDateButton).toBeVisible();
  }

  async assertEndDatePickerVisible() {
    await expect(this.locators.endDateButton).toBeVisible();
  }

  async assertTypeSelectVisible() {
    await expect(this.locators.typeSelect).toBeVisible();
  }

  async assertReasonTextareaVisible() {
    await expect(this.locators.reasonTextarea).toBeVisible();
  }

  async assertAddTimeOffModalCancelButtonVisible() {
    await expect(this.locators.timeOffFormCancelButton).toBeVisible();
  }

  async assertAddTimeOffModalSubmitButtonVisible() {
    await expect(this.locators.timeOffFormSaveButton).toBeVisible();
  }

  async assertAddTimeOffModalNotVisible() {
    await expect(this.locators.addTimeOffModal).not.toBeVisible({
      timeout: this.DEFAULT_TIMEOUT,
    }).catch(() => {});
  }

  async assertEmptyStateVisible() {
    await expect(this.locators.emptyState).toBeVisible();
  }

  async assertEmptyStateMessage(text: string) {
    await expect(this.locators.emptyStateMessage).toContainText(text);
  }

  async assertTimeOffFormError(error: string) {
    await expect(this.locators.timeOffFormError).toBeVisible();
    await expect(this.locators.timeOffFormError).toContainText(error);
  }

  async assertTimeOffRequestRowCount(count: number) {
    const rowSelector = `[data-testid="table-row"]`;
    await expect(this.page.locator(rowSelector)).toHaveCount(count, {
      timeout: this.DEFAULT_TIMEOUT,
    });
  }

  async assertColumnSortedAscendingText(column: string) {
    const columnSelector = `[data-testid="table-cell-${column}"]`;
    const cells = await this.page.locator(columnSelector).all();
    const values = await Promise.all(
      cells.map(async (cell) => (await cell.textContent())?.trim() || ""),
    );

    const sortedValues = [...values].sort((a, b) => a.localeCompare(b));
    expect(values).toEqual(sortedValues);
  }

  async assertColumnSortedDescendingText(column: string) {
    const columnSelector = `[data-testid="table-cell-${column}"]`;
    const cells = await this.page.locator(columnSelector).all();
    const values = await Promise.all(
      cells.map(async (cell) => (await cell.textContent())?.trim() || ""),
    );

    const sortedValues = [...values].sort((a, b) => b.localeCompare(a));
    expect(values).toEqual(sortedValues);
  }

  async assertColumnVisible(column: string) {
    const columnSelector = `[data-testid="table-cell-${column}"]`;
    await expect(this.page.locator(columnSelector).first()).toBeVisible();
  }

  async assertColumnNotVisible(column: string) {
    const columnSelector = `[data-testid="table-cell-${column}"]`;
    await expect(this.page.locator(columnSelector).first()).not.toBeVisible();
  }

  async assertTableNextButtonEnabled() {
    await expect(this.locators.tableNextButton).toBeVisible();
    await expect(this.locators.tableNextButton).toBeEnabled();
  }

  async assertTablePreviousButtonEnabled() {
    await expect(this.locators.tablePreviousButton).toBeVisible();
    await expect(this.locators.tablePreviousButton).toBeEnabled();
  }

  async assertTableNextButtonNotEnabled() {
    await expect(this.locators.tableNextButton).toBeVisible();
    await expect(this.locators.tableNextButton).not.toBeEnabled();
  }

  async assertTablePreviousButtonNotEnabled() {
    await expect(this.locators.tablePreviousButton).toBeVisible();
    await expect(this.locators.tablePreviousButton).not.toBeEnabled();
  }

  async assertStartDateSelected(date: string) {
    await expect(this.locators.startDateButton).toContainText(date);
  }

  async assertEndDateSelected(date: string) {
    await expect(this.locators.endDateButton).toContainText(date);
  }

  async assertTypeSelected(type: string) {
    await expect(this.locators.typeSelect).toContainText(type);
  }
}
