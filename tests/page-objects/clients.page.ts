import { expect, Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class ClientsPage extends BasePage {
  static readonly locatorsMapping = {
    // Page elements
    pageTitle: '[data-testid="clients-header-title"]',
    addClientButton: '[data-testid="add-client-modal-trigger"]',
    showArchivedToggle: '[data-testid="clients-header-show-archived-button"]',
    showActiveToggle: '[data-testid="clients-header-show-active-button"]',
    clientsTable: '[data-testid="data-table"]',
    archiveButton: '[data-testid="archive-button"]',

    // Modal elements
    addClientModal: '[role="dialog"]',
    addClientModalTitle: '[data-testid="add-client-modal-title"]',
    clientFormName: '[data-testid="add-client-name-input"]',
    clientFormSaveButton: '[data-testid="add-client-submit-button"]',
    clientFormCancelButton: '[data-testid="add-client-cancel-button"]',
    // TODO: This is not tested yet
    clientFormSubmitLoading: '[data-testid="add-client-submit-button-loading"]',
    clientFormError: '[data-testid="add-client-error"]',

    // Filter elements
    filterInput: '[placeholder="Filter clients ..."]',

    // Table elements
    columnsButton: '[data-testid="columns-button"]',
    tableNextButton: '[data-testid="table-next-button"]',
    tablePreviousButton: '[data-testid="table-previous-button"]',

    // Empty state
    emptyStateMessage: '[data-testid="no-results-cell"]',
  };

  constructor(page: Page) {
    super(page, ClientsPage.locatorsMapping, "/admin/clients");
  }

  /////////////////////////// Action methods ///////////////////////////

  async clickTableNextButton() {
    await this.locators.tableNextButton.click();
  }

  async clickTablePreviousButton() {
    await this.locators.tablePreviousButton.click();
  }

  async clickAddClientButton() {
    await this.locators.addClientButton.click();
  }

  async toggleShowArchived() {
    await this.locators.showArchivedToggle.click();
  }

  async toggleShowActive() {
    await this.locators.showActiveToggle.click();
  }

  async fillClientForm(name: string) {
    await this.locators.clientFormName.fill(name);
  }

  async submitClientForm() {
    await this.locators.clientFormSaveButton.click();
  }

  async cancelClientForm() {
    await this.locators.clientFormCancelButton.click();
  }

  async clickOnArchiveClientButton(clientName: string) {
    const archiveButtonSelector = `[data-testid="table-row-${
      clientName.toLowerCase().replace(/[^a-z0-9]/g, "-")
    }-archive-button"]`;
    const archiveButton = this.page.locator(archiveButtonSelector);
    await archiveButton.click();
  }

  async archiveClient(clientName: string) {
    await this.clickOnArchiveClientButton(clientName);

    // Confirm the archive action
    await this.locators.confirmDialogConfirmButton.click();

    // Wait for the success toast
    await this.assertToastSuccessVisible();
  }

  async archiveClientCancel(clientName: string) {
    await this.clickOnArchiveClientButton(clientName);

    // Confirm the archive action
    await this.locators.confirmDialogCancelButton.click();
  }

  async unarchiveClient(clientName: string) {
    const unarchiveButtonSelector = `[data-testid="table-row-${
      clientName.toLowerCase().replace(/[^a-z0-9]/g, "-")
    }-unarchive-button"]`;
    const unarchiveButton = this.page.locator(unarchiveButtonSelector);

    // Find and click the archive button within this row (same button, different action based on context)
    await unarchiveButton.click();

    // Confirm the unarchive action
    await this.locators.confirmDialogConfirmButton.click();

    // Wait for the success toast
    await this.assertToastSuccessVisible();
  }

  async addClient(name: string) {
    await this.clickAddClientButton();
    await this.fillClientForm(name);
    await this.submitClientForm();

    // Wait for the success toast
    await this.assertToastSuccessVisible();
    // Close the toast
    await this.clickToastSuccessCloseButton();
  }

  async filterClients(filterText: string) {
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

  async assertOnClientsPage() {
    await expect(this.page).toHaveURL(/.*\/clients/);
    await expect(this.locators.pageTitle).toBeVisible();
  }

  async assertPageTitleVisible() {
    await expect(this.locators.pageTitle).toBeVisible();
  }

  async assertPageTitleText(text: string) {
    await expect(this.locators.pageTitle).toHaveText(text);
  }

  async assertPageSubtitleText(text: string) {
    await expect(this.locators.pageSubtitle).toHaveText(text);
  }

  async assertAddClientButtonVisible() {
    await expect(this.locators.addClientButton).toBeVisible();
  }

  async assertShowArchivedButtonVisible() {
    await expect(this.locators.showArchivedToggle).toBeVisible();
  }

  async assertShowActiveButtonVisible() {
    await expect(this.locators.showActiveToggle).toBeVisible();
  }

  async assertClientsTableVisible() {
    await expect(this.locators.clientsTable).toBeVisible();
  }

  async assertClientRowExists(clientName: string) {
    await expect(
      this.page.locator('[data-testid="table-row"]', { hasText: clientName }),
    )
      .toBeVisible();
  }

  async assertClientRowNotExists(clientName: string) {
    await expect(
      this.page.locator('[data-testid="table-row"]', { hasText: clientName }),
    )
      .not.toBeVisible({ timeout: this.DEFAULT_TIMEOUT });
  }

  async assertAddClientModalVisible() {
    await expect(this.locators.addClientModal).toBeVisible();
    await expect(this.locators.addClientModalTitle).toBeVisible();
  }

  async assertAddClientModalClientNameInputVisible() {
    await expect(this.locators.clientFormName).toBeVisible();
  }

  async assertAddClientModalCancelButtonVisible() {
    await expect(this.locators.clientFormCancelButton).toBeVisible();
  }

  async assertAddClientModalSubmitButtonVisible() {
    await expect(this.locators.clientFormSaveButton).toBeVisible();
  }

  async assertAddClientModalNotVisible() {
    await expect(this.locators.addClientModal).not.toBeVisible({
      timeout: this.DEFAULT_TIMEOUT,
    }).catch(() => {});
  }

  async assertEmptyStateWithMessage(text: string) {
    await expect(this.locators.emptyStateMessage).toBeVisible();
    await expect(this.locators.emptyStateMessage).toContainText(text);
  }

  async assertClientFormError(error: string) {
    await expect(this.locators.clientFormError).toBeVisible();
    await expect(this.locators.clientFormError).toContainText(error);
  }

  async assertClientRowCount(count: number) {
    const clientRowSelector = `[data-testid="table-row"]`;
    await expect(this.page.locator(clientRowSelector)).toHaveCount(count, {
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
}
