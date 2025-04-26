import { useState, useEffect } from 'react';
import '../styles/Catalog.css';

export interface PostImage {
    id: string;
    position: number;
    url: string;
}

export interface Post {
    id: string;
    userId: string;
    username: string;
    title: string;
    content: string;
    images: PostImage[];
    createdAt: string;
}

interface PostsResponse {
    content: Post[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

const Catalog = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const postsPerPage = 9; // For 3x3 grid

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Fetch posts from API
    const fetchPosts = async (page: number) => {
        setLoading(true);
        try {
            // Make sure this URL matches your backend API endpoint
            const response = await fetch(`http://localhost:8080/api/posts/all?page=${page}&size=${postsPerPage}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
            }

            const data: PostsResponse = await response.json();
            setPosts(data.content);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);
            setError(null);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Format date to be more readable
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Open modal with selected post
    const openPostModal = (post: Post) => {
        setSelectedPost(post);
        setCurrentImageIndex(0);
        setModalOpen(true);
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
    };

    // Close modal
    const closeModal = () => {
        setModalOpen(false);
        setSelectedPost(null);
        // Restore scrolling
        document.body.style.overflow = 'auto';
    };

    // Navigate to next image
    const nextImage = () => {
        if (selectedPost && currentImageIndex < selectedPost.images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    // Navigate to previous image
    const prevImage = () => {
        if (selectedPost && currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    // Handle modal click event (close when clicking outside content)
    const handleModalClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
            closeModal();
        }
    };

    // Generate pagination controls
    const renderPagination = () => {
        const pages = [];

        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="pagination-button"
            >
                &laquo; Prev
            </button>
        );

        // Page numbers
        for (let i = 0; i < totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`pagination-button ${currentPage === i ? 'active' : ''}`}
                >
                    {i + 1}
                </button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="pagination-button"
            >
                Next &raquo;
            </button>
        );

        return <div className="pagination">{pages}</div>;
    };

    // Render post modal
    const renderPostModal = () => {
        if (!selectedPost) return null;

        return (
            <div className="modal-overlay" onClick={handleModalClick}>
                <div className="modal-content">
                    <button className="modal-close" onClick={closeModal}>×</button>

                    <div className="modal-image-container">
                        {selectedPost.images.length > 0 && (
                            <>
                                <img
                                    src={selectedPost.images[currentImageIndex].url}
                                    alt={`${selectedPost.title} - image ${currentImageIndex + 1}`}
                                    className="modal-image"
                                />

                                {selectedPost.images.length > 1 && (
                                    <div className="image-navigation">
                                        <button
                                            onClick={prevImage}
                                            disabled={currentImageIndex === 0}
                                            className="image-nav-button"
                                        >
                                            &laquo;
                                        </button>
                                        <span className="image-counter">
                                            {currentImageIndex + 1} / {selectedPost.images.length}
                                        </span>
                                        <button
                                            onClick={nextImage}
                                            disabled={currentImageIndex === selectedPost.images.length - 1}
                                            className="image-nav-button"
                                        >
                                            &raquo;
                                        </button>
                                    </div>
                                )}

                                {selectedPost.images.length > 1 && (
                                    <div className="thumbnail-container">
                                        {selectedPost.images.map((image, index) => (
                                            <div
                                                key={image.id}
                                                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                                onClick={() => setCurrentImageIndex(index)}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={`Thumbnail ${index + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="modal-post-details">
                        <h2 className="modal-title">{selectedPost.title}</h2>
                        <p className="modal-username">@{selectedPost.username}</p>
                        <p className="modal-date">{formatDate(selectedPost.createdAt)}</p>
                        <div className="modal-content-text">{selectedPost.content}</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="catalog" aria-labelledby="catalog-heading">
            <h2 id="catalog-heading">Browse Posts</h2>

            {/* Loading and error states */}
            {loading && <p className="loading">Loading posts...</p>}
            {error && (
                <div className="error">
                    <p>Error: {error}</p>
                    <p className="error-details">
                        <strong>Debugging Tips:</strong><br />
                        1. Check if your Spring Boot server is running at localhost:8080<br />
                        2. Check browser console for additional errors<br />
                        3. Ensure your backend is properly configured
                    </p>
                </div>
            )}

            {/* Result count */}
            {!loading && !error && (
                <p className="hint">
                    Showing&nbsp;
                    <strong>{posts.length}</strong>&nbsp;
                    post{posts.length !== 1 && 's'}
                </p>
            )}

            {/* Posts grid */}
            <div className="posts-grid">
                {posts.map(post => (
                    <div
                        key={post.id}
                        className="post-card"
                        onClick={() => openPostModal(post)}
                    >
                        {/* Display first image if available */}
                        {post.images && post.images.length > 0 && (
                            <div className="post-image">
                                <img
                                    src={post.images[0].url}
                                    alt={`${post.title} - first image`}
                                />
                                {post.images.length > 1 && (
                                    <span className="image-count">+{post.images.length - 1}</span>
                                )}
                            </div>
                        )}

                        <div className="post-content">
                            <h3 className="post-title">{post.title}</h3>
                            <p className="post-username">@{post.username}</p>
                            <p className="post-excerpt">
                                {post.content.length > 100
                                    ? `${post.content.substring(0, 100)}...`
                                    : post.content}
                            </p>
                            <p className="post-date">{formatDate(post.createdAt)}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show empty state if no posts */}
            {!loading && !error && posts.length === 0 && (
                <div className="empty-state">
                    <p>No posts available</p>
                </div>
            )}

            {/* Pagination controls */}
            {!loading && !error && totalPages > 1 && renderPagination()}

            {/* Post detail modal */}
            {modalOpen && renderPostModal()}
        </section>
    );
};

export default Catalog;