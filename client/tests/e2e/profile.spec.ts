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

  test("user mush keep the username within 3 to 20 character", async ({
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
});
