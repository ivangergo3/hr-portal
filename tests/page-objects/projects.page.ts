import { expect, Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class ProjectsPage extends BasePage {
  static readonly locatorsMapping = {
    // Page elements
    pageTitle: '[data-testid="projects-header-title"]',
    addProjectButton: '[data-testid="add-project-modal-trigger"]',
    showArchivedToggle: '[data-testid="projects-header-show-archived-button"]',
    showActiveToggle: '[data-testid="projects-header-show-active-button"]',
    projectsTable: '[data-testid="data-table"]',
    archiveButton: '[data-testid="archive-button"]',

    // Modal elements
    addProjectModal: '[role="dialog"]',
    addProjectModalTitle: '[data-testid="add-project-modal-title"]',
    projectFormName: '[data-testid="add-project-name-input"]',
    projectFormClientSelect: '[data-testid="add-project-client-select"]',
    projectFormClientSelectDropdown:
      '[data-testid="add-project-client-select"] + [role="listbox"]',
    projectFormSaveButton: '[data-testid="add-project-submit-button"]',
    projectFormCancelButton: '[data-testid="add-project-cancel-button"]',
    projectFormSubmitLoading:
      '[data-testid="add-project-submit-button-loading"]',
    projectFormError: '[data-testid="add-project-error"]',

    // Filter elements
    filterInput: '[placeholder="Filter projects..."]',

    // Table elements
    columnsButton: '[data-testid="columns-button"]',
    tableNextButton: '[data-testid="table-next-button"]',
    tablePreviousButton: '[data-testid="table-previous-button"]',

    // Empty state
    emptyStateMessage: '[data-testid="no-results-cell"]',
  };

  constructor(page: Page) {
    super(page, ProjectsPage.locatorsMapping, "/admin/projects");
  }

  /////////////////////////// Action methods ///////////////////////////

  async clickTableNextButton() {
    await this.locators.tableNextButton.click();
  }

  async clickTablePreviousButton() {
    await this.locators.tablePreviousButton.click();
  }

  async clickAddProjectButton() {
    await this.locators.addProjectButton.click();
  }

  async toggleShowArchived() {
    await this.locators.showArchivedToggle.click();
  }

  async toggleShowActive() {
    await this.locators.showActiveToggle.click();
  }

  async fillProjectForm(name: string) {
    await this.locators.projectFormName.fill(name);
  }

  async selectClient(clientName: string) {
    await this.locators.projectFormClientSelect.click();

    // Wait for the dropdown to be visible
    await this.page.waitForSelector('[role="listbox"]');

    // Find and click the client option
    const clientOption = this.page.locator(`[role="option"]`, {
      hasText: clientName,
    });
    await clientOption.click();
  }

  async submitProjectForm() {
    await this.locators.projectFormSaveButton.click();
  }

  async cancelProjectForm() {
    await this.locators.projectFormCancelButton.click();
  }

  async clickOnArchiveProjectButton(projectName: string) {
    const archiveButtonSelector = `[data-testid="table-row-${
      projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")
    }-archive-button"]`;
    const archiveButton = this.page.locator(archiveButtonSelector);
    await archiveButton.click();
  }

  async archiveProject(projectName: string) {
    await this.clickOnArchiveProjectButton(projectName);

    // Confirm the archive action
    await this.locators.confirmDialogConfirmButton.click();

    // Wait for the success toast
    await this.assertToastSuccessVisible();
  }

  async archiveProjectCancel(projectName: string) {
    await this.clickOnArchiveProjectButton(projectName);

    // Cancel the archive action
    await this.locators.confirmDialogCancelButton.click();
  }

  async unarchiveProject(projectName: string) {
    const unarchiveButtonSelector = `[data-testid="table-row-${
      projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")
    }-unarchive-button"]`;
    const unarchiveButton = this.page.locator(unarchiveButtonSelector);

    // Find and click the unarchive button
    await unarchiveButton.click();

    // Confirm the unarchive action
    await this.locators.confirmDialogConfirmButton.click();

    // Wait for the success toast
    await this.assertToastSuccessVisible();
  }

  async addProject(name: string, clientName: string) {
    await this.clickAddProjectButton();
    await this.fillProjectForm(name);
    await this.selectClient(clientName);
    await this.submitProjectForm();

    // Wait for the success toast
    await this.assertToastSuccessVisible();
    // Close the toast
    await this.clickToastSuccessCloseButton();
  }

  async filterProjects(filterText: string) {
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

  async assertOnProjectsPage() {
    await expect(this.page).toHaveURL(/.*\/projects/);
    await expect(this.locators.pageTitle).toBeVisible();
  }

  async assertPageTitleVisible() {
    await expect(this.locators.pageTitle).toBeVisible();
  }

  async assertPageTitleText(text: string) {
    await expect(this.locators.pageTitle).toHaveText(text);
  }

  async assertAddProjectButtonVisible() {
    await expect(this.locators.addProjectButton).toBeVisible();
  }

  async assertShowArchivedButtonVisible() {
    await expect(this.locators.showArchivedToggle).toBeVisible();
  }

  async assertShowActiveButtonVisible() {
    await expect(this.locators.showActiveToggle).toBeVisible();
  }

  async assertProjectsTableVisible() {
    await expect(this.locators.projectsTable).toBeVisible();
  }

  async assertProjectRowExists(projectName: string) {
    await expect(
      this.page.locator('[data-testid="table-row"]', { hasText: projectName }),
    ).toBeVisible();
  }

  async assertProjectRowNotExists(projectName: string) {
    await expect(
      this.page.locator('[data-testid="table-row"]', { hasText: projectName }),
    ).not.toBeVisible({ timeout: this.DEFAULT_TIMEOUT });
  }

  async assertAddProjectModalVisible() {
    await expect(this.locators.addProjectModal).toBeVisible();
    await expect(this.locators.addProjectModalTitle).toBeVisible();
  }

  async assertAddProjectModalNameInputVisible() {
    await expect(this.locators.projectFormName).toBeVisible();
  }

  async assertAddProjectModalClientSelectVisible() {
    await expect(this.locators.projectFormClientSelect).toBeVisible();
  }

  async assertAddProjectModalCancelButtonVisible() {
    await expect(this.locators.projectFormCancelButton).toBeVisible();
  }

  async assertAddProjectModalSubmitButtonVisible() {
    await expect(this.locators.projectFormSaveButton).toBeVisible();
  }

  async assertAddProjectModalNotVisible() {
    await expect(this.locators.addProjectModal).not.toBeVisible({
      timeout: this.DEFAULT_TIMEOUT,
    }).catch(() => {});
  }

  async assertEmptyStateMessage(text: string) {
    await expect(this.locators.emptyStateMessage).toBeVisible();
    await expect(this.locators.emptyStateMessage).toContainText(text);
  }

  async assertProjectFormError(error: string) {
    await expect(this.locators.projectFormError).toBeVisible();
    await expect(this.locators.projectFormError).toContainText(error);
  }

  async assertProjectRowCount(count: number) {
    const projectRowSelector = `[data-testid="table-row"]`;
    await expect(this.page.locator(projectRowSelector)).toHaveCount(count, {
      timeout: this.DEFAULT_TIMEOUT,
    });
  }

  async assertColumnSortedAscendingText(column: string) {
    const columnSelector = `[data-testid="table-cell-${column}"]`;
    const cells = await this.page.locator(columnSelector).all();
    const names = await Promise.all(
      cells.map(async (cell) => (await cell.textContent())?.trim() || ""),
    );

    const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sortedNames);
  }

  async assertColumnSortedDescendingText(column: string) {
    const columnSelector = `[data-testid="table-cell-${column}"]`;
    const cells = await this.page.locator(columnSelector).all();
    const names = await Promise.all(
      cells.map(async (cell) => (await cell.textContent())?.trim() || ""),
    );

    const sortedNames = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sortedNames);
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

  async assertClientSelectHasOptions() {
    await this.locators.projectFormClientSelect.click();
    const optionsCount = await this.page.locator(
      '[role="listbox"] [role="option"]',
    ).count();
    expect(optionsCount).toBeGreaterThan(0);
    // Close the dropdown
    await this.page.keyboard.press("Escape");
  }

  async assertClientSelectContainsClient(clientName: string) {
    await this.locators.projectFormClientSelect.click();
    await expect(this.page.locator('[role="option"]', { hasText: clientName }))
      .toBeVisible();
    // Close the dropdown
    await this.page.keyboard.press("Escape");
  }
}
