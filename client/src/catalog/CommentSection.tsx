import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { Comment } from "./types";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
    postId: string;
    onCommentAdded?: () => void;
}

// Comment cache interface
interface CommentCacheEntry {
    comments: Comment[];
    totalPages: number;
    timestamp: number;
}

const CommentSection = ({ postId, onCommentAdded }: CommentSectionProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isCached, setIsCached] = useState(false);
    const { user } = useUser();
    const API_BASE_URL = 'http://localhost:8080/api';

    // Prefetch adjacent comment pages
    const prefetchAdjacentPages = useCallback((currentPage: number, maxPages: number) => {
        if (!user) return;

        // Prefetch next page
        if (currentPage < maxPages - 1) {
            setTimeout(() => {
                const nextPage = currentPage + 1;
                const cacheKey = `comments_post_${postId}_page_${nextPage}_user_${user?.id || 'guest'}`;

                // Check if already cached
                if (!sessionStorage.getItem(cacheKey)) {
                    console.log('Prefetching next comment page:', nextPage);
                    fetch(`${API_BASE_URL}/comments/post/${postId}?page=${nextPage}&size=10&userId=${user.id}`)
                        .then(r => r.json())
                        .then(data => {
                            const cacheData: CommentCacheEntry = {
                                comments: data.content,
                                totalPages: data.totalPages,
                                timestamp: Date.now()
                            };
                            sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
                        })
                        .catch(() => {/* Silently fail on prefetch errors */});
                }
            }, 300);
        }

        // Prefetch previous page
        if (currentPage > 0) {
            setTimeout(() => {
                const prevPage = currentPage - 1;
                const cacheKey = `comments_post_${postId}_page_${prevPage}_user_${user?.id || 'guest'}`;

                // Check if already cached
                if (!sessionStorage.getItem(cacheKey)) {
                    console.log('Prefetching previous comment page:', prevPage);
                    fetch(`${API_BASE_URL}/comments/post/${postId}?page=${prevPage}&size=10&userId=${user.id}`)
                        .then(r => r.json())
                        .then(data => {
                            const cacheData: CommentCacheEntry = {
                                comments: data.content,
                                totalPages: data.totalPages,
                                timestamp: Date.now()
                            };
                            sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
                        })
                        .catch(() => {/* Silently fail on prefetch errors */});
                }
            }, 300);
        }
    }, [API_BASE_URL, postId, user]);

    // Fetch comments with caching
    const fetchComments = useCallback(async () => {
        setLoading(true);
        setIsCached(false);

        const cacheKey = `comments_post_${postId}_page_${page}_user_${user?.id || 'guest'}`;

        try {
            // Check cache first
            const cachedData = sessionStorage.getItem(cacheKey);
            if (cachedData) {
                try {
                    const parsedCache = JSON.parse(cachedData) as CommentCacheEntry;

                    // Only use cache if it's less than 2 minutes old
                    if (Date.now() - parsedCache.timestamp < 2 * 60 * 1000) {
                        console.log('Using cached comments for page:', page);
                        setComments(parsedCache.comments);
                        setTotalPages(parsedCache.totalPages);
                        setError(null);
                        setIsCached(true);
                        setLoading(false);

                        // Still prefetch adjacent pages
                        prefetchAdjacentPages(page, parsedCache.totalPages);
                        return;
                    } else {
                        // Cache expired
                        sessionStorage.removeItem(cacheKey);
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (e) {
                    // Invalid cache format
                    sessionStorage.removeItem(cacheKey);
                }
            }

            // No valid cache, fetch from API
            console.log('Fetching comments from server for page:', page);
            const userParam = user ? `&userId=${user.id}` : '';
            const response = await fetch(
                `${API_BASE_URL}/comments/post/${postId}?page=${page}&size=10${userParam}`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch comments: ${response.status}`);
            }

            const data = await response.json();

            // Save to cache
            const cacheData: CommentCacheEntry = {
                comments: data.content,
                totalPages: data.totalPages,
                timestamp: Date.now()
            };
            sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));

            setComments(data.content);
            setTotalPages(data.totalPages);
            setError(null);

            // Prefetch adjacent pages
            prefetchAdjacentPages(page, data.totalPages);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load comments");
        } finally {
            setLoading(false);
        }
    }, [postId, page, user, prefetchAdjacentPages]);

    // Load comments when dependencies change
    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Add a new comment
    const handleAddComment = async () => {
        if (!user || !newComment.trim()) return;

        try {
            const response = await fetch(`${API_BASE_URL}/comments/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    postId: postId,
                    userId: user.id,
                    content: newComment.trim()
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to add comment: ${response.status}`);
            }

            const addedComment = await response.json();

            // Add the new comment to the list
            setComments([addedComment, ...comments]);
            setNewComment("");

            // Invalidate comment caches for this post
            const cacheKeyPrefix = `comments_post_${postId}`;
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith(cacheKeyPrefix)) {
                    sessionStorage.removeItem(key);
                }
            });

            // Notify parent component if needed
            if (onCommentAdded) {
                onCommentAdded();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add comment");
        }
    };

    // Handle comment updates (like adding a reply or liking) with cache invalidation
    const handleCommentUpdate = (updatedComment: Comment) => {
        setComments(currentComments =>
            currentComments.map(comment =>
                comment.id === updatedComment.id ? updatedComment : comment
            )
        );

        // Update the cache for current page
        const cacheKey = `comments_post_${postId}_page_${page}_user_${user?.id || 'guest'}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        if (cachedData) {
            try {
                const parsedCache = JSON.parse(cachedData) as CommentCacheEntry;
                const updatedComments = parsedCache.comments.map(comment =>
                    comment.id === updatedComment.id ? updatedComment : comment
                );

                const updatedCache: CommentCacheEntry = {
                    comments: updatedComments,
                    totalPages: parsedCache.totalPages,
                    timestamp: Date.now() // Update timestamp to extend TTL
                };

                sessionStorage.setItem(cacheKey, JSON.stringify(updatedCache));
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                // If there's any issue with cache updating, just remove it
                sessionStorage.removeItem(cacheKey);
            }
        }
    };

    // Page change handler with smooth scrolling
    const handlePageChange = (newPage: number) => {
        // Scroll to top of comment section
        const commentSection = document.querySelector('.comment-section');
        if (commentSection) {
            commentSection.scrollIntoView({ behavior: 'smooth' });
        }
        setPage(newPage);
    };

    return (
        <div className="comment-section">
            <h3 className="comment-section-title">
                Comments
                {isCached &&
                    <span className="cached-indicator" title="Loaded from cache" style={{ fontSize: '0.8em', marginLeft: '8px', color: '#888' }}>
                        (cached)
                    </span>
                }
            </h3>

            {/* Add comment form */}
            {user ? (
                <div className="comment-form">
                    <textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="comment-input"
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="comment-submit"
                    >
                        Post
                    </button>
                </div>
            ) : (
                <p className="comment-login-prompt">Please sign in to leave a comment</p>
            )}

            {/* Error message */}
            {error && <p className="comment-error">{error}</p>}

            {/* Loading indicator */}
            {loading && <p className="comment-loading">Loading comments...</p>}

            {/* Comments list */}
            <div className="comments-list">
                {comments.length === 0 && !loading ? (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            postId={postId}
                            onUpdate={handleCommentUpdate}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="comment-pagination">
                    <button
                        disabled={page === 0}
                        onClick={() => handlePageChange(page - 1)}
                        className="pagination-button"
                    >
                        &laquo; Previous
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            className={`pagination-button ${i === page ? "active" : ""}`}
                            onClick={() => handlePageChange(i)}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        disabled={page === totalPages - 1}
                        onClick={() => handlePageChange(page + 1)}
                        className="pagination-button"
                    >
                        Next &raquo;
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommentSection;