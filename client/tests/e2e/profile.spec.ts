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
  });
});
