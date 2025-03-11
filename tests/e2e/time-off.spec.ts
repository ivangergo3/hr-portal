import { test } from "@playwright/test";
import { TimeOffPage } from "../page-objects/time-off.page";
import { testUsers } from "../config/test-users.config";
import { cleanupTable } from "../config/clean-db";

// TODO: Add separate workspace and user for time-off tests
// TODO: Need to add like 5 users for this file
// TODO: Add tests for the time-off approval page and the show approved requests functionality

let timeOffPage: TimeOffPage;

// Use employee user for time-off request tests
test.use({ storageState: testUsers.employee.storageState });

// Run cleanup before all tests
test.beforeAll(async () => {
    await cleanupTable("time_off_requests", "description", "Test%");
});

test.beforeEach(async ({ page }) => {
    timeOffPage = new TimeOffPage(page);
    await timeOffPage.open();
    await timeOffPage.assertOnTimeOffPage();
});

test.describe("Time Off Page UI Elements", () => {
    test("should display time off page with correct title and elements", async () => {
        await timeOffPage.assertPageTitleVisible();
        await timeOffPage.assertPageTitleText("Time Off");
        await timeOffPage.assertPageSubtitleVisible(
            "Manage your time off requests",
        );
        await timeOffPage.assertAddTimeOffRequestButtonVisible();
        await timeOffPage.assertTimeOffTableVisible();
    });

    test("should display add time off request modal when clicking add button", async () => {
        await timeOffPage.clickAddTimeOffRequestButton();
        await timeOffPage.assertAddTimeOffModalVisible();
        await timeOffPage.assertStartDatePickerVisible();
        await timeOffPage.assertEndDatePickerVisible();
        await timeOffPage.assertTypeSelectVisible();
        await timeOffPage.assertReasonTextareaVisible();
        await timeOffPage.assertAddTimeOffModalCancelButtonVisible();
        await timeOffPage.assertAddTimeOffModalSubmitButtonVisible();
    });

    test("should toggle between pending and approved time off requests views", async () => {
        // Start with pending requests view
        await timeOffPage.assertShowApprovedButtonVisible();

        // Switch to approved view
        await timeOffPage.toggleShowApproved();
        await timeOffPage.assertShowPendingButtonVisible();

        // Switch back to pending view
        await timeOffPage.toggleShowPending();
        await timeOffPage.assertShowApprovedButtonVisible();
    });
});

test.describe("Add Time Off Request Functionality", () => {
    test("should open/close add time off request modal when clicking add button", async () => {
        await timeOffPage.clickAddTimeOffRequestButton();
        await timeOffPage.assertAddTimeOffModalVisible();

        await timeOffPage.cancelTimeOffForm();
        await timeOffPage.assertAddTimeOffModalNotVisible();
    });

    test("should add a new time off request successfully", async () => {
        // Get current date for testing
        const today = new Date();
        const currentDay = today.getDate();
        const nextDay = new Date(today);
        nextDay.setDate(currentDay + 1);
        const nextDayNum = nextDay.getDate();

        const reason = `Test Time Off Request ${Date.now()}`;

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Vacation",
            reason,
        );

        await timeOffPage.assertToastSuccessContains(
            "Time off request submitted successfully",
        );
        await timeOffPage.assertTimeOffRequestRowExists(reason);
        await timeOffPage.assertTimeOffRequestRowExists("Vacation");
    });

    test("should show error when submitting without start date", async () => {
        await timeOffPage.clickAddTimeOffRequestButton();

        // Only select end date and type
        const today = new Date();
        const currentDay = today.getDate();
        await timeOffPage.selectEndDate(currentDay);
        await timeOffPage.selectType("Sick Leave");

        await timeOffPage.submitTimeOffForm();

        // Check for validation error
        await timeOffPage.assertTimeOffFormError("Start date is required");
    });

    test("should show error when submitting without end date", async () => {
        await timeOffPage.clickAddTimeOffRequestButton();

        // Only select start date and type
        const today = new Date();
        const currentDay = today.getDate();
        await timeOffPage.selectStartDate(currentDay);
        await timeOffPage.selectType("Personal Leave");

        await timeOffPage.submitTimeOffForm();

        // Check for validation error
        await timeOffPage.assertTimeOffFormError("End date is required");
    });

    test("should show error when submitting without type", async () => {
        await timeOffPage.clickAddTimeOffRequestButton();

        // Only select start and end dates
        const today = new Date();
        const currentDay = today.getDate();
        const nextDay = new Date(today);
        nextDay.setDate(currentDay + 1);
        const nextDayNum = nextDay.getDate();

        await timeOffPage.selectStartDate(currentDay);
        await timeOffPage.selectEndDate(nextDayNum);

        await timeOffPage.submitTimeOffForm();

        // Check for validation error
        await timeOffPage.assertTimeOffFormError("Time off type is required");
    });

    test("should allow submitting without a reason", async () => {
        // Get current date for testing
        const today = new Date();
        const currentDay = today.getDate();
        const nextDay = new Date(today);
        nextDay.setDate(currentDay + 1);
        const nextDayNum = nextDay.getDate();

        await timeOffPage.clickAddTimeOffRequestButton();
        await timeOffPage.selectStartDate(currentDay);
        await timeOffPage.selectEndDate(nextDayNum);
        await timeOffPage.selectType("Vacation");
        await timeOffPage.submitTimeOffForm();

        await timeOffPage.assertToastSuccessContains(
            "Time off request submitted successfully",
        );
    });
});

test.describe("Filter Functionality", () => {
    test("should filter time off requests by type", async () => {
        // Add time off requests with different types
        const today = new Date();
        const currentDay = today.getDate();
        const nextDay = new Date(today);
        nextDay.setDate(currentDay + 1);
        const nextDayNum = nextDay.getDate();

        const prefix = Date.now().toString();
        const vacationReason = `Test Vacation ${prefix}`;
        const sickReason = `Test Sick Leave ${prefix}`;

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Vacation",
            vacationReason,
        );

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Sick Leave",
            sickReason,
        );

        // Filter by vacation
        await timeOffPage.filterTimeOffRequests("Vacation");

        // Should show only vacation request
        await timeOffPage.assertTimeOffRequestRowExists(vacationReason);
        await timeOffPage.assertTimeOffRequestRowNotExists(sickReason);

        // Clear filter
        await timeOffPage.clearFilter();

        // Filter by sick leave
        await timeOffPage.filterTimeOffRequests("Sick");

        // Should show only sick leave request
        await timeOffPage.assertTimeOffRequestRowExists(sickReason);
        await timeOffPage.assertTimeOffRequestRowNotExists(vacationReason);

        // Clear filter
        await timeOffPage.clearFilter();

        // Should show both requests
        await timeOffPage.assertTimeOffRequestRowExists(vacationReason);
        await timeOffPage.assertTimeOffRequestRowExists(sickReason);
    });

    test("should filter time off requests by description", async () => {
        // Add time off requests with unique descriptions
        const today = new Date();
        const currentDay = today.getDate();
        const nextDay = new Date(today);
        nextDay.setDate(currentDay + 1);
        const nextDayNum = nextDay.getDate();

        const prefix = Date.now().toString();
        const reason1 = `Test FilterReason1 ${prefix}`;
        const reason2 = `Test FilterReason2 ${prefix}`;

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Vacation",
            reason1,
        );

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Vacation",
            reason2,
        );

        // Filter by the first reason
        await timeOffPage.filterTimeOffRequests("FilterReason1");

        // Should show only the first request
        await timeOffPage.assertTimeOffRequestRowExists(reason1);
        await timeOffPage.assertTimeOffRequestRowNotExists(reason2);

        // Clear filter
        await timeOffPage.clearFilter();

        // Should show both requests
        await timeOffPage.assertTimeOffRequestRowExists(reason1);
        await timeOffPage.assertTimeOffRequestRowExists(reason2);
    });

    test("should show empty state when filter has no matches", async () => {
        // Filter by a description that shouldn't exist
        await timeOffPage.filterTimeOffRequests(
            "NonExistentTimeOffRequest12345",
        );

        // Should show no results
        await timeOffPage.assertTimeOffRequestRowCount(0);
        await timeOffPage.assertEmptyStateVisible();
        await timeOffPage.assertEmptyStateMessage("No results.");
    });
});

test.describe("Table Advanced Functionality", () => {
    test("should be able to sort columns", async () => {
        // Add a few time off requests with different types to ensure we have data to sort
        const today = new Date();
        const currentDay = today.getDate();
        const nextDay = new Date(today);
        nextDay.setDate(currentDay + 1);
        const nextDayNum = nextDay.getDate();

        const timestamp = Date.now();
        const reason1 = `Test A Sort ${timestamp}`;
        const reason2 = `Test B Sort ${timestamp}`;
        const reason3 = `Test C Sort ${timestamp}`;

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Vacation",
            reason1,
        );

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Sick Leave",
            reason2,
        );

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Personal Leave",
            reason3,
        );

        // Sort by type ascending
        await timeOffPage.sortColumn("type");
        await timeOffPage.assertColumnSortedAscendingText("type");

        // Sort by type descending
        await timeOffPage.sortColumn("type");
        await timeOffPage.assertColumnSortedDescendingText("type");
    });

    test("should be able to show and hide columns", async () => {
        // First, verify that the type column is visible by default
        await timeOffPage.assertColumnVisible("type");
        await timeOffPage.assertColumnVisible("start_date");

        // Toggle visibility of the description column
        await timeOffPage.toggleColumnVisibility("description");
        await timeOffPage.assertColumnNotVisible("description");

        // TODO: Fix this, I need this because of the animation is slow
        await timeOffPage.waitForTimeout(1000);

        // Toggle it back to visible
        await timeOffPage.toggleColumnVisibility("description");
        await timeOffPage.assertColumnVisible("description");
    });

    test("should paginate time off requests correctly", async () => {
        // This test assumes we need to add many time off requests to trigger pagination
        // In a real scenario, you might want to check if pagination is already needed

        const today = new Date();
        const currentDay = today.getDate();
        const nextDay = new Date(today);
        nextDay.setDate(currentDay + 1);
        const nextDayNum = nextDay.getDate();

        const timestamp = Date.now();

        // Add 11 time off requests to ensure pagination (assuming page size is 10)
        for (let i = 0; i < 11; i++) {
            await timeOffPage.addTimeOffRequest(
                currentDay,
                nextDayNum,
                "Vacation",
                `Test Pagination ${timestamp} - ${i}`,
            );
        }

        // Verify we're on the first page
        await timeOffPage.assertTableNextButtonEnabled();
        await timeOffPage.assertTablePreviousButtonNotEnabled();

        // Go to the next page
        await timeOffPage.clickTableNextButton();
        await timeOffPage.assertTablePreviousButtonEnabled();
        await timeOffPage.assertTableNextButtonNotEnabled();

        // Go back to the first page
        await timeOffPage.clickTablePreviousButton();
        await timeOffPage.assertTableNextButtonEnabled();
        await timeOffPage.assertTablePreviousButtonNotEnabled();
    });
});

test.describe("Error Handling", () => {
    test("should handle network error when adding time off request", async ({ page }) => {
        // Mock the API to simulate a network error
        await page.route("**/rest/v1/time_off_requests**", async (route) => {
            if (route.request().method() === "POST") {
                await route.abort("failed");
            } else {
                await route.continue();
            }
        });

        const today = new Date();
        const currentDay = today.getDate();
        const nextDay = new Date(today);
        nextDay.setDate(currentDay + 1);
        const nextDayNum = nextDay.getDate();

        await timeOffPage.clickAddTimeOffRequestButton();
        await timeOffPage.selectStartDate(currentDay);
        await timeOffPage.selectEndDate(nextDayNum);
        await timeOffPage.selectType("Vacation");
        await timeOffPage.submitTimeOffForm();

        // Check for error message
        await timeOffPage.assertTimeOffFormError(
            "Failed to submit time off request. Please try again.",
        );
    });
});

test.describe("Performance and Edge Cases", () => {
    test("should handle special characters in reason", async () => {
        const today = new Date();
        const currentDay = today.getDate();
        const nextDay = new Date(today);
        nextDay.setDate(currentDay + 1);
        const nextDayNum = nextDay.getDate();

        const specialReason = `Test Special & Chars # % ${Date.now()}`;

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Vacation",
            specialReason,
        );

        await timeOffPage.assertTimeOffRequestRowExists(specialReason);
    });

    test("should handle rapid actions without errors", async () => {
        const today = new Date();
        const currentDay = today.getDate();
        const nextDay = new Date(today);
        nextDay.setDate(currentDay + 1);
        const nextDayNum = nextDay.getDate();

        // Add multiple time off requests in quick succession
        const prefix = Date.now().toString();
        const reason1 = `Test RapidTest1 ${prefix}`;
        const reason2 = `Test RapidTest2 ${prefix}`;
        const reason3 = `Test RapidTest3 ${prefix}`;

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Vacation",
            reason1,
        );

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Sick Leave",
            reason2,
        );

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Personal Leave",
            reason3,
        );

        // Verify all requests were added
        await timeOffPage.assertTimeOffRequestRowExists(reason1);
        await timeOffPage.assertTimeOffRequestRowExists(reason2);
        await timeOffPage.assertTimeOffRequestRowExists(reason3);
    });

    test("should handle page reload without losing state", async () => {
        const today = new Date();
        const currentDay = today.getDate();
        const nextDay = new Date(today);
        nextDay.setDate(currentDay + 1);
        const nextDayNum = nextDay.getDate();

        // Add a time off request
        const reason = `Test Reload ${Date.now()}`;

        await timeOffPage.addTimeOffRequest(
            currentDay,
            nextDayNum,
            "Vacation",
            reason,
        );

        // Reload the page
        await timeOffPage.reload();

        // Verify request still exists
        await timeOffPage.assertTimeOffRequestRowExists(reason);
    });
});
