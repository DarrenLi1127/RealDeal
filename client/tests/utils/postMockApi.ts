import { Page } from "@playwright/test";

/**
 * Enhanced mock API for RealDeal application
 * With improved form submission handling
 */
export async function postMockApi(page: Page) {
  // Mock user exists endpoint (for ProfileGate)
  await page.route("**/api/users/exists/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(true),
    });
  });

  // Mock genres endpoint
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

  // Mock post creation endpoint with improved response handling
  await page.route("**/api/posts/create", async (route) => {
    try {
      console.log("Post creation submission started");

      // Add a small delay to simulate server processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Send a successful response
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: `post_${Date.now()}`,
          userId: "user_test123",
          username: "testuser",
          title: "Test Post Title",
          content: "Test content for automated test.",
          images: [
            {
              id: `img_${Date.now()}`,
              position: 0,
              url: "https://example.com/test-image.jpg",
            },
          ],
          createdAt: new Date().toISOString(),
          likesCount: 0,
          starsCount: 0,
          liked: false,
          starred: false,
          genres: [{ id: 1, name: "Art" }],
          level: 1,
        }),
      });

      console.log("Post creation response sent successfully");
    } catch (error) {
      console.error("Error handling post creation:", error);
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server error" }),
      });
    }
  });

  // Mock posts listing endpoint (Catalog)
  await page.route("**/api/posts/all**", (route) => {
    // Parse query parameters to support pagination
    const url = new URL(route.request().url());
    const page = parseInt(url.searchParams.get("page") || "0");
    const size = parseInt(url.searchParams.get("size") || "9");

    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: Array(size)
          .fill(0)
          .map((_, i) => ({
            id: `post_${page * size + i}`,
            userId: i % 3 === 0 ? "user_test123" : `other_user_${i}`,
            username: i % 3 === 0 ? "testuser" : `otheruser${i}`,
            title: `Test Post ${page * size + i + 1}`,
            content: `This is test content for post ${
              page * size + i + 1
            }. Lorem ipsum dolor sit amet.`,
            images: [
              {
                id: `img_${i}`,
                position: 0,
                url: "https://example.com/test-image.jpg",
              },
            ],
            createdAt: new Date(Date.now() - i * 3600000).toISOString(),
            likesCount: Math.floor(Math.random() * 10),
            starsCount: Math.floor(Math.random() * 5),
            liked: false,
            starred: false,
            genres: [
              { id: (i % 3) + 1, name: ["Art", "Music", "Technology"][i % 3] },
            ],
            level: 1 + (i % 3),
          })),
        totalPages: 3,
        number: page,
      }),
    });
  });

  // Mock user posts (My Posts)
  await page.route("**/api/posts/user/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: Array(5)
          .fill(0)
          .map((_, i) => ({
            id: `my_post_${i}`,
            userId: "user_test123",
            username: "testuser",
            title: `My Post ${i + 1}`,
            content: `This is my own post ${
              i + 1
            }. I created this post for testing.`,
            images: [
              {
                id: `img_${i}`,
                position: 0,
                url: "https://example.com/test-image.jpg",
              },
            ],
            createdAt: new Date(Date.now() - i * 3600000).toISOString(),
            likesCount: Math.floor(Math.random() * 10),
            starsCount: Math.floor(Math.random() * 5),
            liked: false,
            starred: false,
            genres: [{ id: 1, name: "Art" }],
            level: 1,
          })),
        totalPages: 1,
        number: 0,
      }),
    });
  });

  // Mock liked posts
  await page.route("**/api/posts/liked/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: Array(4)
          .fill(0)
          .map((_, i) => ({
            id: `liked_post_${i}`,
            userId: `other_user_${i}`,
            username: `otheruser${i}`,
            title: `Liked Post ${i + 1}`,
            content: `This is a post I've liked ${
              i + 1
            }. Content from another user.`,
            images: [
              {
                id: `img_${i}`,
                position: 0,
                url: "https://example.com/test-image.jpg",
              },
            ],
            createdAt: new Date(Date.now() - i * 3600000).toISOString(),
            likesCount: 5 + i,
            starsCount: i,
            liked: true,
            starred: i % 2 === 0, // Some also starred
            genres: [{ id: 2, name: "Music" }],
            level: 2,
          })),
        totalPages: 1,
        number: 0,
      }),
    });
  });

  // Mock starred posts
  await page.route("**/api/posts/starred/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: Array(3)
          .fill(0)
          .map((_, i) => ({
            id: `starred_post_${i}`,
            userId: `other_user_${i + 5}`,
            username: `otheruser${i + 5}`,
            title: `Starred Post ${i + 1}`,
            content: `This is a post I've starred ${
              i + 1
            }. Special content that I found valuable.`,
            images: [
              {
                id: `img_${i}`,
                position: 0,
                url: "https://example.com/test-image.jpg",
              },
            ],
            createdAt: new Date(Date.now() - i * 3600000).toISOString(),
            likesCount: i,
            starsCount: 7 + i,
            liked: i % 2 === 0, // Some also liked
            starred: true,
            genres: [{ id: 3, name: "Technology" }],
            level: 3,
          })),
        totalPages: 1,
        number: 0,
      }),
    });
  });

  // Mock the search endpoint
  await page.route("**/api/posts/search/posts**", (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get("q") || "";

    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: Array(4)
          .fill(0)
          .map((_, i) => ({
            id: `search_result_${i}`,
            userId: i % 2 === 0 ? "user_test123" : `other_user_${i}`,
            username: i % 2 === 0 ? "testuser" : `otheruser${i}`,
            title: `${query} Result ${i + 1}`,
            content: `This post matches your search for "${query}". Result ${
              i + 1
            }.`,
            images: [
              {
                id: `img_${i}`,
                position: 0,
                url: "https://example.com/test-image.jpg",
              },
            ],
            createdAt: new Date(Date.now() - i * 3600000).toISOString(),
            likesCount: Math.floor(Math.random() * 10),
            starsCount: Math.floor(Math.random() * 5),
            liked: false,
            starred: false,
            genres: [
              { id: (i % 3) + 1, name: ["Art", "Music", "Technology"][i % 3] },
            ],
            level: 1 + (i % 3),
          })),
        totalPages: 1,
        number: 0,
      }),
    });
  });

  // Mock like/star endpoints
  await page.route("**/api/posts/*/like", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        liked: true,
        likes: 10,
      }),
    });
  });

  await page.route("**/api/posts/*/star", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        starred: true,
        stars: 5,
      }),
    });
  });
}
