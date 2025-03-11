import { test } from "@playwright/test";
import { ProjectsPage } from "../page-objects/projects.page";
import { ClientsPage } from "../page-objects/clients.page";
import { testUsers } from "../config/test-users.config";
import { cleanupTable } from "../config/clean-db";

// TODO: Add separate workspace and user for project tests
// TODO: Need to add like 5 users for this file

let projectsPage: ProjectsPage;
let clientsPage: ClientsPage;

// Use admin user for project management tests
test.use({ storageState: testUsers.admin.storageState });

// Run cleanup before all tests
test.beforeAll(async () => {
    await cleanupTable("projects", "name", "Test%");
});

test.beforeEach(async ({ page }) => {
    projectsPage = new ProjectsPage(page);
    clientsPage = new ClientsPage(page);
    await projectsPage.open();
    await projectsPage.assertOnProjectsPage();
});

test.describe("Projects Page UI Elements", () => {
    test("should display projects page with correct title and elements", async () => {
        await projectsPage.assertPageTitleVisible();
        await projectsPage.assertPageTitleText("Projects");
        await projectsPage.assertAddProjectButtonVisible();
        await projectsPage.assertShowArchivedButtonVisible();
        await projectsPage.assertProjectsTableVisible();
    });

    test("should display add project modal when clicking add button", async () => {
        await projectsPage.clickAddProjectButton();
        await projectsPage.assertAddProjectModalVisible();
        await projectsPage.assertAddProjectModalNameInputVisible();
        await projectsPage.assertAddProjectModalClientSelectVisible();
        await projectsPage.assertAddProjectModalCancelButtonVisible();
        await projectsPage.assertAddProjectModalSubmitButtonVisible();
    });

    test("should toggle between active and archived projects views", async () => {
        // Start with active projects view
        await projectsPage.assertShowArchivedButtonVisible();

        // Switch to archived view
        await projectsPage.toggleShowArchived();
        await projectsPage.assertShowActiveButtonVisible();

        // Switch back to active view
        await projectsPage.toggleShowActive();
        await projectsPage.assertShowArchivedButtonVisible();
    });
});

test.describe("Add Project Functionality", () => {
    test("should open/close add project modal when clicking add button", async () => {
        await projectsPage.clickAddProjectButton();
        await projectsPage.assertAddProjectModalVisible();

        await projectsPage.cancelProjectForm();
        await projectsPage.assertAddProjectModalNotVisible();
    });

    test("should add a new project successfully", async () => {
        // First, create a client to use for the project
        const clientName = `Test Client for Project ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        // Add a new project with the client
        const projectName = `Test Project ${Date.now()}`;
        await projectsPage.addProject(projectName, clientName);
        await projectsPage.assertToastSuccessContains(
            "Project added successfully",
        );
        await projectsPage.assertProjectRowExists(projectName);
    });

    test("should show error when adding project with empty name", async () => {
        await projectsPage.clickAddProjectButton();
        await projectsPage.fillProjectForm("");
        await projectsPage.submitProjectForm();

        // Check for validation error
        await projectsPage.assertProjectFormError(
            "Project name and client are required",
        );
    });

    test("should show error when adding project without selecting a client", async () => {
        await projectsPage.clickAddProjectButton();
        const projectName = `Test Project ${Date.now()}`;
        await projectsPage.fillProjectForm(projectName);
        await projectsPage.submitProjectForm();

        // Check for validation error
        await projectsPage.assertProjectFormError(
            "Client is required",
        );
    });

    test("should show error when adding project with very long name", async () => {
        // First, create a client to use for the project
        const clientName = `Test Client for Long Name ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        await projectsPage.clickAddProjectButton();
        const longName = "a".repeat(256); // Assuming there's a reasonable max length
        await projectsPage.fillProjectForm(longName);
        await projectsPage.selectClient(clientName);
        await projectsPage.submitProjectForm();

        // Check for validation error
        await projectsPage.assertProjectFormError(
            "Name cannot exceed 255 characters",
        );
    });

    test("should handle duplicate project names", async () => {
        // First, create a client to use for the project
        const clientName = `Test Client for Duplicate ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        const duplicateName = `Test Duplicate Project ${Date.now()}`;

        // Add first project
        await projectsPage.addProject(duplicateName, clientName);
        await projectsPage.assertProjectRowExists(duplicateName);

        // Try to add duplicate
        await projectsPage.clickAddProjectButton();
        await projectsPage.fillProjectForm(duplicateName);
        await projectsPage.selectClient(clientName);
        await projectsPage.submitProjectForm();

        // Check for error message
        await projectsPage.assertProjectFormError(
            "Project already exists.",
        );
    });

    test("should display client options in the dropdown", async () => {
        // First, create a client to use for the project
        const clientName = `Test Client for Dropdown ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        // Open the add project modal
        await projectsPage.clickAddProjectButton();

        // Check that the client dropdown has options
        await projectsPage.assertClientSelectHasOptions();

        // Check that our newly created client is in the dropdown
        await projectsPage.assertClientSelectContainsClient(clientName);

        // Cancel the form
        await projectsPage.cancelProjectForm();
    });
});

test.describe("Archive and Unarchive Functionality", () => {
    test("should archive a project successfully", async () => {
        // First, create a client to use for the project
        const clientName = `Test Client for Archive ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        // Add a project to ensure we have one to archive
        const projectName = `Test Archive Project ${Date.now()}`;
        await projectsPage.addProject(projectName, clientName);
        await projectsPage.assertProjectRowExists(projectName);

        // Archive the project
        await projectsPage.archiveProject(projectName);
        await projectsPage.assertToastSuccessContains(
            "Project archived successfully",
        );
        await projectsPage.assertProjectRowNotExists(projectName);

        // Verify project appears in archived list
        await projectsPage.toggleShowArchived();
        await projectsPage.assertProjectRowExists(projectName);
    });

    test("should unarchive a project successfully", async () => {
        // First, create a client to use for the project
        const clientName = `Test Client for Unarchive ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        // First add and archive a project
        const projectName = `Test Unarchive Project ${Date.now()}`;
        await projectsPage.addProject(projectName, clientName);
        await projectsPage.archiveProject(projectName);
        await projectsPage.clickToastSuccessCloseButton();

        // Switch to archived view
        await projectsPage.toggleShowArchived();
        await projectsPage.assertProjectRowExists(projectName);

        // Unarchive the project
        await projectsPage.unarchiveProject(projectName);
        await projectsPage.assertToastSuccessContains(
            "Project unarchived successfully",
        );
        await projectsPage.assertProjectRowNotExists(projectName);

        // Verify project appears in active list
        await projectsPage.toggleShowActive();
        await projectsPage.assertProjectRowExists(projectName);
    });

    test("should cancel archive operation when clicking cancel", async () => {
        // First, create a client to use for the project
        const clientName = `Test Client for Cancel Archive ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        // First add a project
        const projectName = `Test Cancel Archive Project ${Date.now()}`;
        await projectsPage.addProject(projectName, clientName);

        // Cancel the archive action
        await projectsPage.archiveProjectCancel(projectName);

        // Verify project still exists in active list
        await projectsPage.assertProjectRowExists(projectName);
    });
});

test.describe("Filter Functionality", () => {
    test("should filter projects by name", async () => {
        // First, create a client to use for the projects
        const clientName = `Test Client for Filter ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        // Add projects with unique identifiers
        const prefix = Date.now().toString();
        const project1 = `Test FilterTest1 ${prefix}`;
        const project2 = `Test FilterTest2 ${prefix}`;

        await projectsPage.addProject(project1, clientName);
        await projectsPage.addProject(project2, clientName);

        // Filter by the first project's name
        await projectsPage.filterProjects("Test FilterTest1");

        // Should show only the first project
        await projectsPage.assertProjectRowNotExists(project2);
        await projectsPage.assertProjectRowExists(project1);

        // Clear filter
        await projectsPage.clearFilter();

        // Should show both projects
        await projectsPage.assertProjectRowExists(project1);
        await projectsPage.assertProjectRowExists(project2);
    });

    test("should filter projects by client name", async () => {
        // Create two clients with unique names
        const prefix = Date.now().toString();
        const client1 = `Test Client1 ${prefix}`;
        const client2 = `Test Client2 ${prefix}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(client1);
        await clientsPage.addClient(client2);

        // Navigate back to projects page
        await projectsPage.open();

        // Add projects with different clients
        const project1 = `Test Project for Client1 ${prefix}`;
        const project2 = `Test Project for Client2 ${prefix}`;

        await projectsPage.addProject(project1, client1);
        await projectsPage.addProject(project2, client2);

        // Filter by the first client's name
        await projectsPage.filterProjects(client1);

        // Should show only the project associated with client1
        await projectsPage.assertProjectRowExists(project1);
        await projectsPage.assertProjectRowNotExists(project2);

        // Clear filter
        await projectsPage.clearFilter();

        // Filter by the second client's name
        await projectsPage.filterProjects(client2);

        // Should show only the project associated with client2
        await projectsPage.assertProjectRowNotExists(project1);
        await projectsPage.assertProjectRowExists(project2);

        // Clear filter
        await projectsPage.clearFilter();
    });

    test("should show empty state when filter has no matches", async () => {
        // Filter by a name that shouldn't exist
        await projectsPage.filterProjects("NonExistentProjectName12345");

        // Should show no results
        await projectsPage.assertProjectRowCount(0);
        await projectsPage.assertEmptyStateMessage("No results.");
    });
});

test.describe("Table Advanced Functionality", () => {
    test("should be able to sort columns", async () => {
        // First, create a client to use for the projects
        const clientName = `Test Client for Sort ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        // Add a few projects with different names to ensure we have data to sort
        const timestamp = Date.now();
        const projectA = `Test A Sort ${timestamp}`;
        const projectB = `Test B Sort ${timestamp}`;
        const projectC = `Test C Sort ${timestamp}`;

        await projectsPage.addProject(projectA, clientName);
        await projectsPage.addProject(projectB, clientName);
        await projectsPage.addProject(projectC, clientName);

        // Sort by name ascending
        await projectsPage.sortColumn("name");
        await projectsPage.assertColumnSortedAscendingText("name");

        // Sort by name descending
        await projectsPage.sortColumn("name");
        await projectsPage.assertColumnSortedDescendingText("name");
    });

    test("should be able to show and hide columns", async () => {
        // First, create a client to use for the projects
        const clientName = `Test Client for Sort ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        // Add a few projects with different names to ensure we have data to sort
        const timestamp = Date.now();
        const projectA = `Test A Sort ${timestamp}`;
        await projectsPage.addProject(projectA, clientName);

        // First, verify that the name column is visible by default
        await projectsPage.assertColumnVisible("name");
        await projectsPage.assertColumnVisible("client");

        // Toggle visibility of the updatedAt column (which is typically hidden by default)
        await projectsPage.toggleColumnVisibility("updatedAt");
        await projectsPage.assertColumnVisible("updatedAt");

        // TODO: Fix this, I need this because of the animation is slow
        await projectsPage.waitForTimeout(1000);

        // Toggle it back to hidden
        await projectsPage.toggleColumnVisibility("updatedAt");
        await projectsPage.assertColumnNotVisible("updatedAt");
    });

    test("should paginate projects correctly", async () => {
        // First, create a client to use for the projects
        const clientName = `Test Client for Pagination ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        const timestamp = Date.now();

        // Add enough projects to trigger pagination (default page size is 10)
        await projectsPage.addProject(`Test A Sort ${timestamp}`, clientName);
        await projectsPage.addProject(`Test B Sort ${timestamp}`, clientName);
        await projectsPage.addProject(`Test C Sort ${timestamp}`, clientName);
        await projectsPage.addProject(`Test D Sort ${timestamp}`, clientName);
        await projectsPage.addProject(`Test E Sort ${timestamp}`, clientName);
        await projectsPage.addProject(`Test F Sort ${timestamp}`, clientName);
        await projectsPage.addProject(`Test G Sort ${timestamp}`, clientName);
        await projectsPage.addProject(`Test H Sort ${timestamp}`, clientName);
        await projectsPage.addProject(`Test I Sort ${timestamp}`, clientName);
        await projectsPage.addProject(`Test J Sort ${timestamp}`, clientName);
        await projectsPage.addProject(`Test K Sort ${timestamp}`, clientName);

        // Verify we're on the first page
        await projectsPage.assertTableNextButtonEnabled();
        await projectsPage.assertTablePreviousButtonNotEnabled();

        // Go to the next page
        await projectsPage.clickTableNextButton();
        await projectsPage.assertTablePreviousButtonEnabled();
        await projectsPage.assertTableNextButtonNotEnabled();

        // Go back to the first page
        await projectsPage.clickTablePreviousButton();
        await projectsPage.assertTableNextButtonEnabled();
        await projectsPage.assertTablePreviousButtonNotEnabled();
    });
});

test.describe("Error Handling", () => {
    test("should handle network error when adding project", async ({ page }) => {
        // First, create a client to use for the project
        const clientName = `Test Client for Network Error ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        // Mock the API to simulate a network error
        await page.route("**/rest/v1/projects**", async (route) => {
            if (route.request().method() === "POST") {
                await route.abort("failed");
            } else {
                await route.continue();
            }
        });

        const projectName = `Test Network Error ${Date.now()}`;
        await projectsPage.clickAddProjectButton();
        await projectsPage.fillProjectForm(projectName);
        await projectsPage.selectClient(clientName);
        await projectsPage.submitProjectForm();

        // Check for error message
        await projectsPage.assertProjectFormError(
            "Failed to add project. Please try again.",
        );
    });

    test("should handle server error when archiving project", async ({ page }) => {
        // First, create a client to use for the project
        const clientName = `Test Client for Server Error ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        // First add a project
        const projectName = `TestServer Error ${Date.now()}`;
        await projectsPage.addProject(projectName, clientName);

        // Mock the API to simulate a server error
        await page.route("**/rest/v1/projects**", async (route) => {
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
            await projectsPage.clickOnArchiveProjectButton(projectName);
            await projectsPage.confirmConfirmDialog();
        } catch {
            // Expected to fail, ignore error
        }

        // Check for error message
        await projectsPage.assertToastErrorContains(
            "Failed to archive project",
        );
    });
});

test.describe("Performance and Edge Cases", () => {
    test("should handle special characters in project names", async () => {
        // First, create a client to use for the project
        const clientName = `Test Client for Special Chars ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        const specialName = `Test Special & Chars # % ${Date.now()}`;
        await projectsPage.addProject(specialName, clientName);
        await projectsPage.assertProjectRowExists(specialName);
    });

    test("should handle rapid actions without errors", async () => {
        // First, create a client to use for the projects
        const clientName = `Test Client for Rapid Actions ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        // Add multiple projects in quick succession
        const prefix = Date.now().toString();
        const project1 = `Test RapidTest1 ${prefix}`;
        const project2 = `Test RapidTest2 ${prefix}`;
        const project3 = `Test RapidTest3 ${prefix}`;

        await projectsPage.addProject(project1, clientName);
        await projectsPage.addProject(project2, clientName);
        await projectsPage.addProject(project3, clientName);

        // Verify all projects were added
        await projectsPage.assertProjectRowExists(project1);
        await projectsPage.assertProjectRowExists(project2);
        await projectsPage.assertProjectRowExists(project3);
    });

    test("should handle page reload without losing state", async () => {
        // First, create a client to use for the project
        const clientName = `Test Client for Reload ${Date.now()}`;

        // Navigate to clients page
        await clientsPage.open();
        await clientsPage.addClient(clientName);

        // Navigate back to projects page
        await projectsPage.open();

        // Add a project
        const projectName = `Test Reload ${Date.now()}`;
        await projectsPage.addProject(projectName, clientName);

        // Reload the page
        await projectsPage.reload();

        // Verify project still exists
        await projectsPage.assertProjectRowExists(projectName);
    });
});
