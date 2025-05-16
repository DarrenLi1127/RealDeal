import { test, expect } from "@playwright/test";
import {
  clerkSetup,
  setupClerkTestingToken,
  clerk,
} from "@clerk/testing/playwright";
import * as dotenv from "dotenv";
import { postMockApi } from "../utils/postMockApi";

// Load environment variables
dotenv.config();

// Set reasonable timeout
test.setTimeout(60000);

// Mock API specifically for testing genre selection
async function mockGenresApi(page) {
  // Mock genres endpoint to return specific genres
  await page.route("**/api/genres", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: 1, name: "Art", description: "Visual arts and paintings" },
        {
          id: 2,
          name: "Music",
          description: "Musical instruments and performances",
        },
        {
          id: 3,
          name: "Technology",
          description: "Tech gadgets and innovations",
        },
        { id: 4, name: "Literature", description: "Books and writing" },
      ]),
    });
  });

  // Mock user's initially selected genres
  await page.route("**/api/genres/users/**", (route) => {
    const method = route.request().method();

    // Handle PUT request for updating genres
    if (method === "PUT") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
      return;
    }

    // For GET requests, return initial genres (just Art selected)
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: 1, name: "Art" }]),
    });
  });
}

test.describe("Profile Features", () => {
  // Global setup for each test
  test.beforeEach(async ({ page }) => {
    // Setup Clerk authentication
    await clerkSetup({ frontendApiUrl: process.env.CLERK_FRONTEND_API });
    await setupClerkTestingToken({ page });

    // Sign in
    await page.goto("/");
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        password: process.env.TEST_USER1_PASSWORD!,
        identifier: process.env.TEST_USER1_EMAIL!,
      },
    });

    // Setup API mocks
    await postMockApi(page);

    // Setup additional genre-specific mocks
    await mockGenresApi(page);

    // Wait for home page after login
    await page.waitForURL("**/home", { timeout: 10000 });
  });

  test("user can change username", async ({ page }) => {
    // Go to create post page
    await page.goto("/profile");
    const usernameField = page.getByLabel("Username-input");
    await usernameField.fill("newUsername");
    const saveChange = page.getByLabel("save-profile");
    await saveChange.click();
    const greeting = page.getByLabel("greeting");
    await expect(greeting).toContainText("newUsername");
  });

  test("user must keep the username within 3 to 20 character", async ({
    page,
  }) => {
    // Go to create post page
    await page.goto("/profile");
    const usernameField = page.getByLabel("Username-input");
    await usernameField.fill("12");
    const saveChange = page.getByLabel("save-profile");
    await saveChange.click();
    const error = page.getByLabel("username-error");
    await expect(error).toContainText(
      "Username must be between 3-20 characters"
    );
  });

  test("user can select and deselect genres", async ({ page }) => {
    // Navigate to profile page
    await page.goto("/profile");

    // Wait for page to load
    await page.waitForSelector(".genre-tags", { state: "visible" });

    // Take screenshot of initial state for debugging
    await page.screenshot({ path: "genres-initial.png" });

    // Verify initially "Art" is selected (should be from mock data)
    const initialSelectedGenres = await page
      .locator(".genre-tag.selected")
      .count();
    expect(initialSelectedGenres).toBe(1);

    // Get text of currently selected genre
    const initialGenre = await page
      .locator(".genre-tag.selected")
      .textContent();
    expect(initialGenre).toBe("Art");

    // Select an additional genre (Music)
    await page.locator(".genre-tag:has-text('Music')").click();

    // Verify now two genres are selected
    const updatedSelectedGenres = await page
      .locator(".genre-tag.selected")
      .count();
    expect(updatedSelectedGenres).toBe(2);

    // Deselect the original genre (Art)
    await page.locator(".genre-tag:has-text('Art')").click();

    // Verify only one genre remains selected
    const afterDeselectionCount = await page
      .locator(".genre-tag.selected")
      .count();
    expect(afterDeselectionCount).toBe(1);

    // Verify the remaining selected genre is Music
    const remainingGenre = await page
      .locator(".genre-tag.selected")
      .textContent();
    expect(remainingGenre).toBe("Music");

    // Save the changes
    await page.getByLabel("save-profile").click();

    // Wait for the "Saved!" message to appear
    await page.waitForSelector(".saved-msg", { state: "visible" });

    // Take screenshot of final state
    await page.screenshot({ path: "genres-updated.png" });
  });

  test("user cannot select more than 3 genres", async ({ page }) => {
    // Navigate to profile page
    await page.goto("/profile");

    // Wait for page to load
    await page.waitForSelector(".genre-tags", { state: "visible" });

    // Initially "Art" should be selected from our mock
    // Select 2 more genres to reach the limit of 3
    await page.locator(".genre-tag:has-text('Music')").click();
    await page.locator(".genre-tag:has-text('Technology')").click();

    // Verify 3 genres are now selected
    const genresAfterSelection = await page
      .locator(".genre-tag.selected")
      .count();
    expect(genresAfterSelection).toBe(3);

    // Try to select a 4th genre
    await page.locator(".genre-tag:has-text('Literature')").click();

    // Should still only have 3 selected genres
    const genresAfterAttempt = await page
      .locator(".genre-tag.selected")
      .count();
    expect(genresAfterAttempt).toBe(3);

    // Should show an error message
    const error = page.getByLabel("username-error");
    await expect(error).toContainText("You can select up to 3 genres only");

    // Take screenshot of error state
    await page.screenshot({ path: "genres-max-limit.png" });
  });
});
