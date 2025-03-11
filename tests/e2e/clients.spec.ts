import { test } from "@playwright/test";
import { ClientsPage } from "../page-objects/clients.page";
import { testUsers } from "../config/test-users.config";
import { cleanupTable } from "../config/clean-db";

// TODO: Add separate workspace and user for client tests
// TODO: Need to add like 5 users for this file
// TODO: There is a static wait in the file

let clientsPage: ClientsPage;

// Use admin user for client management tests
test.use({ storageState: testUsers.admin.storageState });

// Run cleanup before all tests
test.beforeAll(async () => {
  await cleanupTable("clients", "name", "Test%");
});

test.beforeEach(async ({ page }) => {
  clientsPage = new ClientsPage(page);
  await clientsPage.open();
  await clientsPage.assertOnClientsPage();
});

test.describe("Clients Page UI Elements", () => {
  test("should display clients page with correct title and elements", async () => {
    await clientsPage.assertPageTitleVisible();
    await clientsPage.assertPageTitleText("Clients");
    await clientsPage.assertAddClientButtonVisible();
    await clientsPage.assertShowArchivedButtonVisible();
    await clientsPage.assertClientsTableVisible();
  });

  test("should display add client modal when clicking add button", async () => {
    await clientsPage.clickAddClientButton();
    await clientsPage.assertAddClientModalVisible();
    await clientsPage.assertAddClientModalClientNameInputVisible();
    await clientsPage.assertAddClientModalCancelButtonVisible();
    await clientsPage.assertAddClientModalSubmitButtonVisible();
  });

  test("should toggle between active and archived clients views", async () => {
    // Start with active clients view
    await clientsPage.assertShowArchivedButtonVisible();

    // Switch to archived view
    await clientsPage.toggleShowArchived();
    await clientsPage.assertShowActiveButtonVisible();

    // Switch back to active view
    await clientsPage.toggleShowActive();
    await clientsPage.assertShowArchivedButtonVisible();
  });
});

test.describe("Add Client Functionality", () => {
  test("should open/close add client modal when clicking add button", async () => {
    await clientsPage.clickAddClientButton();
    await clientsPage.assertAddClientModalVisible();

    await clientsPage.cancelClientForm();
    await clientsPage.assertAddClientModalNotVisible();
  });

  test("should add a new client successfully", async () => {
    const uniqueName = `Test Client ${Date.now()}`;
    await clientsPage.addClient(uniqueName);
    await clientsPage.assertToastSuccessContains("Client added successfully");
    await clientsPage.assertClientRowExists(uniqueName);
  });

  test("should show error when adding client with empty name", async () => {
    await clientsPage.clickAddClientButton();
    await clientsPage.fillClientForm("");
    await clientsPage.submitClientForm();

    // Check for validation error
    await clientsPage.assertClientFormError("Client name is required.");
  });

  test("should show error when adding client with very long name", async () => {
    await clientsPage.clickAddClientButton();
    const longName = "a".repeat(256); // Assuming there's a reasonable max length
    await clientsPage.fillClientForm(longName);
    await clientsPage.submitClientForm();

    // Check for validation error
    await clientsPage.assertClientFormError(
      "Name cannot exceed 255 characters",
    );
  });

  test("should handle duplicate client names", async () => {
    const duplicateName = `Test Duplicate Client ${Date.now()}`;

    // Add first client
    await clientsPage.addClient(duplicateName);
    await clientsPage.assertClientRowExists(duplicateName);

    // Try to add duplicate
    await clientsPage.clickAddClientButton();
    await clientsPage.fillClientForm(duplicateName);
    await clientsPage.submitClientForm();

    // Check for error message
    await clientsPage.assertClientFormError(
      "Client already exists.",
    );
  });
});

test.describe("Archive and Unarchive Functionality", () => {
  test("should archive a client successfully", async () => {
    // First add a client to ensure we have one to archive
    const uniqueName = `Test Archive ${Date.now()}`;
    await clientsPage.addClient(uniqueName);
    await clientsPage.assertClientRowExists(uniqueName);

    // Archive the client
    await clientsPage.archiveClient(uniqueName);
    await clientsPage.assertToastSuccessContains(
      "Client archived successfully",
    );
    await clientsPage.assertClientRowNotExists(uniqueName);

    // Verify client appears in archived list
    await clientsPage.toggleShowArchived();
    await clientsPage.assertClientRowExists(uniqueName);
  });

  test("should unarchive a client successfully", async () => {
    // First add and archive a client
    const uniqueName = `Test Unarchive ${Date.now()}`;
    await clientsPage.addClient(uniqueName);
    await clientsPage.archiveClient(uniqueName);
    await clientsPage.clickToastSuccessCloseButton();

    // Switch to archived view
    await clientsPage.toggleShowArchived();
    await clientsPage.assertClientRowExists(uniqueName);

    // Unarchive the client
    await clientsPage.unarchiveClient(uniqueName);
    await clientsPage.assertToastSuccessContains(
      "Client unarchived successfully",
    );
    await clientsPage.assertClientRowNotExists(uniqueName);

    // Verify client appears in active list
    await clientsPage.toggleShowActive();
    await clientsPage.assertClientRowExists(uniqueName);
  });

  test("should cancel archive operation when clicking cancel", async () => {
    // First add a client
    const uniqueName = `Test Cancel Archive ${Date.now()}`;
    await clientsPage.addClient(uniqueName);

    // Cancel the archive action
    await clientsPage.archiveClientCancel(uniqueName);

    // Verify client still exists in active list
    await clientsPage.assertClientRowExists(uniqueName);
  });
});

test.describe("Filter Functionality", () => {
  test("should filter clients by name", async () => {
    // Add clients with unique identifiers
    const prefix = Date.now().toString();
    const client1 = `Test FilterTest1 ${prefix}`;
    const client2 = `Test FilterTest2 ${prefix}`;

    await clientsPage.addClient(client1);
    await clientsPage.addClient(client2);

    // Filter by the first client's name
    await clientsPage.filterClients("Test FilterTest1");

    // Should show only the first client
    await clientsPage.assertClientRowNotExists(client2);
    await clientsPage.assertClientRowExists(client1);

    // Clear filter
    await clientsPage.clearFilter();

    // Should show both clients
    await clientsPage.assertClientRowExists(client1);
    await clientsPage.assertClientRowExists(client2);
  });

  test("should show empty state when filter has no matches", async () => {
    // Filter by a name that shouldn't exist
    await clientsPage.filterClients("NonExistentClientName12345");

    // Should show no results
    await clientsPage.assertClientRowCount(0);
    await clientsPage.assertEmptyStateWithMessage("No results.");
  });
});

test.describe("Columns Functionality", () => {
  test("should filter clients by name", async () => {
    // Add clients with unique identifiers
    const prefix = Date.now().toString();
    const client1 = `Test FilterTest1 ${prefix}`;
    const client2 = `Test FilterTest2 ${prefix}`;

    await clientsPage.addClient(client1);
    await clientsPage.addClient(client2);

    // Filter by the first client's name
    await clientsPage.filterClients("Test FilterTest1");

    // Should show only the first client
    await clientsPage.assertClientRowNotExists(client2);
    await clientsPage.assertClientRowExists(client1);

    // Clear filter
    await clientsPage.clearFilter();

    // Should show both clients
    await clientsPage.assertClientRowExists(client1);
    await clientsPage.assertClientRowExists(client2);
  });
});

test.describe("Table Advanced Functionality", () => {
  test("should be able to sort columns", async () => {
    // Add a few clients with different names to ensure we have data to sort
    const timestamp = Date.now();
    const clientA = `Test A Sort ${timestamp}`;
    const clientB = `Test B Sort ${timestamp}`;
    const clientC = `Test C Sort ${timestamp}`;

    await clientsPage.addClient(clientA);
    await clientsPage.addClient(clientB);
    await clientsPage.addClient(clientC);

    // Sort by name ascending
    await clientsPage.sortColumn("name");
    await clientsPage.assertColumnSortedAscendingText("name");

    // Sort by name descending
    await clientsPage.sortColumn("name");
    await clientsPage.assertColumnSortedDescendingText("name");
  });

  test("should be able to show and hide columns", async () => {
    const timestamp = Date.now();
    const clientA = `Test A Sort ${timestamp}`;
    await clientsPage.addClient(clientA);

    // First, verify that the name column is visible by default
    await clientsPage.assertColumnVisible("name");
    await clientsPage.assertColumnVisible("createdAt");

    // Toggle visibility of the updatedAt column (which is typically hidden by default)
    await clientsPage.toggleColumnVisibility("updatedAt");
    await clientsPage.assertColumnVisible("updatedAt");

    // TODO: Fix this, I need this because of the animation is slow
    await clientsPage.waitForTimeout(1000);

    // Toggle it back to hidden
    await clientsPage.toggleColumnVisibility("updatedAt");
    await clientsPage.assertColumnNotVisible("updatedAt");
  });

  test("should paginate clients correctly", async () => {
    const timestamp = Date.now();

    await clientsPage.addClient(`Test A Sort ${timestamp}`);
    await clientsPage.addClient(`Test B Sort ${timestamp}`);
    await clientsPage.addClient(`Test C Sort ${timestamp}`);
    await clientsPage.addClient(`Test D Sort ${timestamp}`);
    await clientsPage.addClient(`Test E Sort ${timestamp}`);
    await clientsPage.addClient(`Test F Sort ${timestamp}`);
    await clientsPage.addClient(`Test G Sort ${timestamp}`);
    await clientsPage.addClient(`Test H Sort ${timestamp}`);
    await clientsPage.addClient(`Test I Sort ${timestamp}`);
    await clientsPage.addClient(`Test J Sort ${timestamp}`);
    await clientsPage.addClient(`Test K Sort ${timestamp}`);

    // Verify we're on the first page
    await clientsPage.assertTableNextButtonEnabled();
    await clientsPage.assertTablePreviousButtonNotEnabled();

    // Go to the next page
    await clientsPage.clickTableNextButton();
    await clientsPage.assertTablePreviousButtonEnabled();
    await clientsPage.assertTableNextButtonNotEnabled();

    // Go back to the first page
    await clientsPage.clickTablePreviousButton();
    await clientsPage.assertTableNextButtonEnabled();
    await clientsPage.assertTablePreviousButtonNotEnabled();
  });
});

test.describe("Error Handling", () => {
  test("should handle network error when adding client", async ({ page }) => {
    // Mock the API to simulate a network error
    await page.route("**/rest/v1/clients**", async (route) => {
      if (route.request().method() === "POST") {
        await route.abort("failed");
      } else {
        await route.continue();
      }
    });

    const uniqueName = `Test Network Error ${Date.now()}`;
    await clientsPage.clickAddClientButton();
    await clientsPage.fillClientForm(uniqueName);
    await clientsPage.submitClientForm();

    // Check for error message

    await clientsPage.assertClientFormError(
      "Failed to add client. Please try again.",
    );
  });

  test("should handle server error when archiving client", async ({ page }) => {
    // First add a client
    const uniqueName = `TestServer Error ${Date.now()}`;
    await clientsPage.addClient(uniqueName);

    // Mock the API to simulate a server error
    await page.route("**/rest/v1/clients**", async (route) => {
      if (route.request().method() === "PATCH") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      } else {
        await route.continue();
      }
    });

    // Try to archive
    try {
      await clientsPage.clickOnArchiveClientButton(uniqueName);
      await clientsPage.confirmConfirmDialog();
    } catch {
      // Expected to fail, ignore error
    }

    // Check for error message
    await clientsPage.assertToastErrorContains("Failed to archive client");
  });
});

test.describe("Performance and Edge Cases", () => {
  test("should handle special characters in client names", async () => {
    const specialName = `Test Special & Chars # % ${Date.now()}`;
    await clientsPage.addClient(specialName);
    await clientsPage.assertClientRowExists(specialName);
  });

  test("should handle rapid actions without errors", async () => {
    // Add multiple clients in quick succession
    const prefix = Date.now().toString();
    const client1 = `Test RapidTest1 ${prefix}`;
    const client2 = `Test RapidTest2 ${prefix}`;
    const client3 = `Test RapidTest3 ${prefix}`;

    await clientsPage.addClient(client1);
    await clientsPage.addClient(client2);
    await clientsPage.addClient(client3);

    // Verify all clients were added
    await clientsPage.assertClientRowExists(client1);
    await clientsPage.assertClientRowExists(client2);
    await clientsPage.assertClientRowExists(client3);
  });

  test("should handle page reload without losing state", async () => {
    // Add a client
    const uniqueName = `Test Reload ${Date.now()}`;
    await clientsPage.addClient(uniqueName);

    // Reload the page
    await clientsPage.reload();

    // Verify client still exists
    await clientsPage.assertClientRowExists(uniqueName);
  });
});
