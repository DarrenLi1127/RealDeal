import { Page } from '@playwright/test';

/**
 * Mock API for RealDeal application comment features
 */
export async function commentMockApi(page: Page) {
    // Mock post listing so we can open a post with comments
    // Reuse the existing mock if needed
    await page.route('**/api/posts/all**', (route) => {
        // Parse query parameters to support pagination
        const url = new URL(route.request().url());
        const page = parseInt(url.searchParams.get('page') || '0');
        const size = parseInt(url.searchParams.get('size') || '9');

        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                content: Array(size).fill(0).map((_, i) => ({
                    id: `post_${page * size + i}`,
                    userId: i % 3 === 0 ? 'user_test123' : `other_user_${i}`,
                    username: i % 3 === 0 ? 'testuser' : `otheruser${i}`,
                    title: `Test Post ${page * size + i + 1}`,
                    content: `This is test content for post ${page * size + i + 1}. Lorem ipsum dolor sit amet.`,
                    images: [{ id: `img_${i}`, position: 0, url: 'https://example.com/test-image.jpg' }],
                    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
                    likesCount: Math.floor(Math.random() * 10),
                    starsCount: Math.floor(Math.random() * 5),
                    liked: false,
                    starred: false,
                    genres: [{ id: i % 3 + 1, name: ['Art', 'Music', 'Technology'][i % 3] }],
                    level: 1 + (i % 3)
                })),
                totalPages: 3,
                number: page
            })
        });
    });

    // Mock fetching comments for a post
    await page.route('**/api/comments/post/**', (route) => {
        const url = new URL(route.request().url());
        const page = parseInt(url.searchParams.get('page') || '0');
        const size = parseInt(url.searchParams.get('size') || '10');
        const userId = url.searchParams.get('userId') || undefined;

        console.log(`Mocking comments for page ${page}, size ${size}, userId ${userId || 'none'}`);

        // Generate nested comments with replies
        const generateReplies = (parentId: string, depth: number = 0, maxDepth: number = 1): any[] => {
            if (depth >= maxDepth) return [];

            return Array(Math.max(1, 3 - depth)).fill(0).map((_, i) => ({
                id: `${parentId}_reply_${i}`,
                postId: route.request().url().split('/post/')[1].split('?')[0],
                userId: i % 2 === 0 ? 'other_user_reply' : 'user_test123',
                username: i % 2 === 0 ? `replyuser${i}` : 'testuser',
                content: `This is a reply ${i + 1} to comment. Lorem ipsum dolor sit amet.`,
                parentId: parentId,
                replies: generateReplies(`${parentId}_reply_${i}`, depth + 1, maxDepth),
                likesCount: Math.floor(Math.random() * 5),
                liked: userId ? (i % 3 === 0) : false,
                createdAt: new Date(Date.now() - (i + 1) * 1800000).toISOString()
            }));
        };

        // Create a more predictable response for testing
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                content: Array(size).fill(0).map((_, i) => {
                    const commentId = `comment_${page * size + i}`;
                    return {
                        id: commentId,
                        postId: route.request().url().split('/post/')[1].split('?')[0],
                        userId: i % 3 === 0 ? 'user_test123' : `other_user_${i}`,
                        username: i % 3 === 0 ? 'testuser' : `otheruser${i}`,
                        content: `This is comment ${page * size + i + 1}. Testing the comment system with some text.`,
                        replies: i % 2 === 0 ? generateReplies(commentId) : [],
                        likesCount: Math.floor(Math.random() * 8),
                        liked: userId ? (i % 4 === 0) : false,
                        createdAt: new Date(Date.now() - (i + 1) * 3600000).toISOString()
                    };
                }),
                totalPages: 3,
                number: page
            })
        });

        console.log(`Generated ${size} comments for page ${page}`);
    });

    // Mock adding a comment
    await page.route('**/api/comments/create', async (route) => {
        // Get form data from request
        const formData = route.request().postDataBuffer()?.toString() || '';
        const params = new URLSearchParams(formData);
        const postId = params.get('postId') || 'unknown_post';
        const userId = params.get('userId') || 'unknown_user';
        const content = params.get('content') || 'Empty comment';
        const parentCommentId = params.get('parentCommentId');

        // Create a response with the new comment
        const commentId = `comment_${Date.now()}`;
        const newComment = {
            id: commentId,
            postId: postId,
            userId: userId,
            username: 'testuser', // Assume current user
            content: content,
            parentId: parentCommentId || null,
            replies: [],
            likesCount: 0,
            liked: false,
            createdAt: new Date().toISOString()
        };

        route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(newComment)
        });
    });

    // Mock comment like endpoint
    await page.route('**/api/comments/*/like', (route) => {
        // Extract the comment ID from the URL
        const commentId = route.request().url().split('/comments/')[1].split('/like')[0];

        // Get the user ID from the query parameter
        const url = new URL(route.request().url());
        const userId = url.searchParams.get('userId') || 'unknown_user';

        // Create a "liked" response - this should toggle the state
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                liked: true, // Always set to true for test predictability
                likes: 5 // Mock likes count
            })
        });

        console.log(`Mocked like response for comment ${commentId} from user ${userId}`);
    });

    // Keep the existing post mocks for other endpoints that might be needed
    await page.route('**/api/users/exists/**', (route) => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(true)
        });
    });
}