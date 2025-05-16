# Test info

- Name: Profile Features >> user can change username
- Location: /Users/mac/Desktop/RealDeal/client/tests/e2e/profile.spec.ts:41:5

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toContainText(expected)

Locator: getByLabel('greeting')
Expected string: "newUsername"
Received string: " Hi there!"
Call log:
  - expect.toContainText with timeout 5000ms
  - waiting for getByLabel('greeting')
    9 × locator resolved to <h2 aria-label="greeting"> Hi there!</h2>
      - unexpected value " Hi there!"

    at /Users/mac/Desktop/RealDeal/client/tests/e2e/profile.spec.ts:49:32
```

# Page snapshot

```yaml
- navigation:
  - heading "Real Deal" [level=1]
  - link "Home":
    - /url: /home
  - link "My Posts":
    - /url: /my-posts
  - link "Liked Posts":
    - /url: /liked-posts
  - link "Starred Posts":
    - /url: /starred-posts
  - textbox "Search posts"
  - link "Create new post":
    - /url: /new
    - text: +
  - button "Open user button":
    - img "'s logo"
- main:
  - heading "greeting" [level=2]: Hi there!
  - link "← Back to Home":
    - /url: /home
  - text: Lv 1 0/50
  - paragraph: 0 EXP • Level 1
  - paragraph: "Update your profile information below:"
  - text: Failed to fetch
  - img "Profile picture"
  - text: Change photo Username
  - textbox "Username-input": newUsername
  - text: Username must be between 3-20 characters Choose your favorite genres (up to 3)
  - button "Choose your favorite genres (up to 3) Music Technology": Art
  - button "Music"
  - button "Technology"
  - button "save-profile": Save changes
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 | import {
   3 |     clerkSetup,
   4 |     setupClerkTestingToken,
   5 |     clerk,
   6 | } from "@clerk/testing/playwright";
   7 | import * as dotenv from "dotenv";
   8 | import { postMockApi } from "../utils/postMockApi";
   9 |
  10 | // Load environment variables
  11 | dotenv.config();
  12 |
  13 | // Set reasonable timeout
  14 | test.setTimeout(60000);
  15 |
  16 | test.describe("Profile Features", () => {
  17 |     // Global setup for each test
  18 |     test.beforeEach(async ({ page }) => {
  19 |         // Setup Clerk authentication
  20 |         await clerkSetup({ frontendApiUrl: process.env.CLERK_FRONTEND_API });
  21 |         await setupClerkTestingToken({ page });
  22 |
  23 |         // Sign in
  24 |         await page.goto("/");
  25 |         await clerk.signIn({
  26 |             page,
  27 |             signInParams: {
  28 |                 strategy: "password",
  29 |                 password: process.env.TEST_USER1_PASSWORD!,
  30 |                 identifier: process.env.TEST_USER1_EMAIL!,
  31 |             },
  32 |         });
  33 |
  34 |         // Setup API mocks
  35 |         await postMockApi(page);
  36 |
  37 |         // Wait for home page after login
  38 |         await page.waitForURL("**/home", { timeout: 10000 });
  39 |     });
  40 |
  41 |     test("user can change username", async ({ page }) => {
  42 |         // Go to create post page
  43 |         await page.goto("/profile");
  44 |         const usernameField = page.getByLabel("Username-input");
  45 |         await usernameField.fill("newUsername");
  46 |         const saveChange = page.getByLabel("save-profile");
  47 |         await saveChange.click();
  48 |         const greeting = page.getByLabel("greeting");
> 49 |         await expect(greeting).toContainText("newUsername");
     |                                ^ Error: Timed out 5000ms waiting for expect(locator).toContainText(expected)
  50 |     });
  51 |
  52 |     test("user mush keep the username within 3 to 20 character", async ({
  53 |                                                                             page,
  54 |                                                                         }) => {
  55 |         // Go to create post page
  56 |         await page.goto("/profile");
  57 |         const usernameField = page.getByLabel("Username-input");
  58 |         await usernameField.fill("12");
  59 |         const saveChange = page.getByLabel("save-profile");
  60 |         await saveChange.click();
  61 |         const error = page.getByLabel("username-error");
  62 |         await expect(error).toContainText(
  63 |             "Username must be between 3-20 characters"
  64 |         );
  65 |     });
  66 | });
```