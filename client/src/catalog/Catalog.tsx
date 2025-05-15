import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import PostModal from "./PostModal";
import { Post } from "./types";
import "../styles/Catalog.css";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Genre } from "./types";

interface PostsResponse {
    content: Post[];
    totalPages: number;
    number: number;
}

// Cache interface
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiry: number;
}

// Simple cache utility
const apiCache = {
    // Store data in cache with TTL (in seconds)
    set: function<T>(key: string, data: T, ttl = 120): void {
        const cacheEntry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            expiry: Date.now() + (ttl * 1000)
        };
        sessionStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheEntry));
    },

    // Get data from cache if still valid
    get: function<T>(key: string): T | null {
        const cacheJson = sessionStorage.getItem(`api_cache_${key}`);
        if (!cacheJson) return null;

        try {
            const cache = JSON.parse(cacheJson) as CacheEntry<T>;
            if (cache.expiry < Date.now()) {
                // Cache expired
                sessionStorage.removeItem(`api_cache_${key}`);
                return null;
            }

            return cache.data;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            // Handle JSON parse errors
            sessionStorage.removeItem(`api_cache_${key}`);
            return null;
        }
    }
};

const Catalog = () => {
    /* -------------- data ---------------- */
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCached, setIsCached] = useState(false);

    /* -------------- paging -------------- */
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 9; // 3×3 grid

    /* -------------- recommendation tracking -------------- */
    const [postsViewed, setPostsViewed] = useState(0);

    /* -------------- modal --------------- */
    const [selected, setSelected] = useState<Post | null>(null);

    /* -------------- user ---------------- */
    const { user } = useUser();

    /* -------------- prefetch adjacent pages -------------- */
    const prefetchAdjacentPages = useCallback((currentPage: number, maxPages: number) => {
        // Prefetch next page if not the last page
        if (currentPage < maxPages - 1) {
            setTimeout(() => {
                const nextPage = currentPage + 1;
                const userParam = user ? `&userId=${user.id}` : '';
                const viewedParam = user ? `&postsViewed=${postsViewed}` : '';
                const nextPageUrl = `http://localhost:8080/api/posts/all?page=${nextPage}&size=${pageSize}${userParam}${viewedParam}`;

                // Check if already cached
                if (!apiCache.get<PostsResponse>(nextPageUrl)) {
                    console.log('Prefetching next page:', nextPage);
                    fetch(nextPageUrl)
                        .then(r => r.json())
                        .then(data => {
                            apiCache.set(nextPageUrl, data);
                        })
                        .catch(() => {/* Silently fail on prefetch errors */});
                }
            }, 500); // Small delay to avoid interfering with current page load
        }

        // Prefetch previous page if not the first page
        if (currentPage > 0) {
            setTimeout(() => {
                const prevPage = currentPage - 1;
                const userParam = user ? `&userId=${user.id}` : '';
                const viewedParam = user ? `&postsViewed=${postsViewed}` : '';
                const prevPageUrl = `http://localhost:8080/api/posts/all?page=${prevPage}&size=${pageSize}${userParam}${viewedParam}`;

                // Check if already cached
                if (!apiCache.get<PostsResponse>(prevPageUrl)) {
                    console.log('Prefetching previous page:', prevPage);
                    fetch(prevPageUrl)
                        .then(r => r.json())
                        .then(data => {
                            apiCache.set(prevPageUrl, data);
                        })
                        .catch(() => {/* Silently fail on prefetch errors */});
                }
            }, 500); // Small delay to avoid interfering with current page load
        }
    }, [user, postsViewed, pageSize]);

    /* -------------- fetch with caching --------------- */
    const fetchPosts = useCallback(async () => {
        // Create the API URL
        const userParam = user ? `&userId=${user.id}` : '';
        const viewedParam = user ? `&postsViewed=${postsViewed}` : '';
        const apiUrl = `http://localhost:8080/api/posts/all?page=${page}&size=${pageSize}${userParam}${viewedParam}`;

        setLoading(true);
        setIsCached(false);

        try {
            // Check cache first
            const cachedData = apiCache.get<PostsResponse>(apiUrl);

            if (cachedData) {
                console.log('Using cached data for page:', page);
                setPosts(cachedData.content);
                setTotalPages(cachedData.totalPages);
                setError(null);
                setIsCached(true);
                setLoading(false);

                // Still prefetch adjacent pages
                prefetchAdjacentPages(page, cachedData.totalPages);

                return;
            }

            // Not in cache, fetch from API
            console.log('Fetching from server for page:', page);
            const r = await fetch(apiUrl);

            if (!r.ok) throw new Error(`fetch failed: ${r.status}`);
            const data: PostsResponse = await r.json();

            // Store in cache (2 minutes TTL)
            apiCache.set(apiUrl, data, 120);

            setPosts(data.content);
            setTotalPages(data.totalPages);
            setError(null);

            // Prefetch adjacent pages
            prefetchAdjacentPages(page, data.totalPages);

        } catch (e) {
            setError(e instanceof Error ? e.message : "unknown error");
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [page, user, postsViewed, prefetchAdjacentPages, pageSize]);

    /* -------------- load data ---------------- */
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    /* -------------- helpers ------------- */
    const formatDate = (s: string) =>
        new Date(s).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    /* -------------- post updates ------------- */
    const handlePostUpdate = (updatedPost: Post) => {
        // Update posts array with the modified post
        setPosts(currentPosts =>
            currentPosts.map(post =>
                post.id === updatedPost.id ? updatedPost : post
            )
        );

        // Also update the selected post if it's currently shown in modal
        if (selected && selected.id === updatedPost.id) {
            setSelected(updatedPost);
        }

        // Clear cache for this page to ensure fresh data on next load
        const userParam = user ? `&userId=${user.id}` : '';
        const viewedParam = user ? `&postsViewed=${postsViewed}` : '';
        const apiUrl = `http://localhost:8080/api/posts/all?page=${page}&size=${pageSize}${userParam}${viewedParam}`;
        sessionStorage.removeItem(`api_cache_${apiUrl}`);
    };

    /* -------------- post view tracking ------------- */
    const handlePostView = (post: Post) => {
        // Track that user has viewed this post (for recommendation system)
        setPostsViewed(prev => prev + 1);

        // Open the modal
        setSelected(post);
    };

    /* -------------- reset view counter ------------- */
    // Reset postsViewed when user logs in/out
    useEffect(() => {
        setPostsViewed(0);
        // Clear all cache when user changes
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('api_cache_')) {
                sessionStorage.removeItem(key);
            }
        });
    }, [user?.id]);

    /* -------------- page change handler ------------- */
    const handlePageChange = (newPage: number) => {
        // Scroll to top when changing pages
        window.scrollTo(0, 0);
        setPage(newPage);
    };

    /* -------------- render -------------- */
    return (
        <section className="catalog" aria-labelledby="catalog-heading">
            <h2 id="catalog-heading">Browse Posts</h2>

            {loading && <p className="loading">Loading posts…</p>}
            {error && (
                <div className="error">
                    <p>Error: {error}</p>
                    <p className="error-details">
                        Make sure the Spring server is running and CORS is configured.
                    </p>
                </div>
            )}

            {!loading && !error && (
                <p className="hint">
                    Showing <strong>{posts.length}</strong> post{posts.length !== 1 && "s"}
                    {isCached && <span className="cached-indicator" title="Loaded from cache"> </span>}
                </p>
            )}

            {/* -------- posts grid -------- */}
            <div className="posts-grid">
                {posts.map(p => (
                    <div key={p.id} className="post-card" onClick={() => handlePostView(p)}>
                        {p.images.length > 0 && (
                            <div className="post-image">
                                <img src={p.images[0].url} alt={`${p.title} cover`} />
                                {p.images.length > 1 && (
                                    <span className="image-count">+{p.images.length - 1}</span>
                                )}
                            </div>
                        )}

                        <div className="post-content">
                            <h3 className="post-title">{p.title}</h3>
                            <p className="post-username">@{p.username} <span className="user-level">Lv {p.level}</span></p>
                            <p className="post-excerpt">
                                {p.content.length > 100 ? p.content.slice(0, 100) + "…" : p.content}
                            </p>
                            <p className="post-date">{formatDate(p.createdAt)}</p>

                            {/* Add genre display */}
                            {p.genres && p.genres.length > 0 && (
                                <div className="post-genres">
                                    {p.genres.map(genre => (
                                        <span key={genre.id} className="genre-badge">
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="card-reactions">
                                <span className={p.liked ? "liked" : ""}>
                                    {p.liked ? "♥" : "♡"} {p.likesCount || 0}
                                </span>
                                <span className={p.starred ? "starred" : ""}>
                                    {p.starred ? "★" : "☆"} {p.starsCount || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* -------- pagination -------- */}
            {!loading && !error && totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-button"
                        disabled={page === 0}
                        onClick={() => handlePageChange(page - 1)}
                    >
                        &laquo; Prev
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
                        className="pagination-button"
                        disabled={page === totalPages - 1}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        Next &raquo;
                    </button>
                </div>
            )}

            {/* -------- modal -------- */}
            {selected && (
                <PostModal
                    post={selected}
                    onClose={() => setSelected(null)}
                    onUpdate={handlePostUpdate}
                />
            )}
        </section>
    );
};

export default Catalog;