import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Post } from "../catalog/types";
import "../styles/UserPosts.css";
import { Link } from "react-router-dom";

// Component for user's posts management
const UserPosts = () => {
    const { user } = useUser();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editForm, setEditForm] = useState({ title: "", content: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const API_BASE_URL = 'http://localhost:8080/api';
    const pageSize = 6;

    // Fetch user's posts
    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!user) return;

            setLoading(true);
            try {
                const response = await fetch(
                    `${API_BASE_URL}/posts/user/${user.id}?page=${page}&size=${pageSize}&currentUserId=${user.id}`
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch posts: ${response.status}`);
                }

                const data = await response.json();
                setPosts(data.content);
                setTotalPages(data.totalPages);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load posts");
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [user, page]);

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Handle edit post
    const handleEditClick = (post: Post) => {
        setEditingPost(post);
        setEditForm({
            title: post.title,
            content: post.content
        });
        setFeedback(null);
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission for editing
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !editingPost) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${editingPost.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    userId: user.id,
                    title: editForm.title,
                    content: editForm.content
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to update post: ${response.status}`);
            }

            const updatedPost = await response.json();

            // Update the posts list
            setPosts(currentPosts =>
                currentPosts.map(post =>
                    post.id === updatedPost.id ? updatedPost : post
                )
            );

            setFeedback({ type: 'success', message: 'Post updated successfully!' });
            // Close the edit form after a delay
            setTimeout(() => {
                setEditingPost(null);
                setFeedback(null);
            }, 2000);

        } catch (err) {
            setFeedback({
                type: 'error',
                message: err instanceof Error ? err.message : "Failed to update post"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle post deletion
    const handleDeletePost = async (postId: string) => {
        if (!user || !window.confirm("Are you sure you want to delete this post?")) return;

        try {
            // Use URL parameter for userId as expected by the backend
            const response = await fetch(`${API_BASE_URL}/posts/${postId}?userId=${user.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Failed to delete post: ${response.status}`);
            }

            // Remove the post from the list
            setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
            setFeedback({ type: 'success', message: 'Post deleted successfully!' });

            // Clear feedback after delay
            setTimeout(() => {
                setFeedback(null);
            }, 2000);

        } catch (err) {
            setFeedback({
                type: 'error',
                message: err instanceof Error ? err.message : "Failed to delete post"
            });
        }
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingPost(null);
        setFeedback(null);
    };

    return (
        <div className="user-posts-container">
            <div className="user-posts-header">
                <h2>My Posts</h2>
            </div>

            {feedback && (
                <div className={`feedback-message ${feedback.type}`}>
                    {feedback.message}
                </div>
            )}

            {loading ? (
                <p className="loading-message">Loading your posts...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : posts.length === 0 ? (
                <div className="no-posts-message">
                    <p>You haven't created any posts yet.</p>
                    <Link to="/new" className="create-first-post-button">Create Your First Post</Link>
                </div>
            ) : (
                <>
                    <div className="user-posts-grid">
                        {posts.map(post => (
                            <div key={post.id} className="user-post-card">
                                {post.images.length > 0 && (
                                    <div className="post-image">
                                        <img src={post.images[0].url} alt={`Cover for ${post.title}`} />
                                        {post.images.length > 1 && (
                                            <span className="image-count">+{post.images.length - 1}</span>
                                        )}
                                    </div>
                                )}

                                <div className="post-details">
                                    <h3 className="post-title">{post.title}</h3>
                                    <p className="post-date">{formatDate(post.createdAt)}</p>
                                    <p className="post-content-preview">
                                        {post.content.length > 100
                                            ? post.content.slice(0, 100) + "..."
                                            : post.content}
                                    </p>

                                    <div className="post-stats">
                                        <span><span className="icon">♥</span> {post.likesCount || 0}</span>
                                        <span><span className="icon">★</span> {post.starsCount || 0}</span>
                                        {post.genres && post.genres.length > 0 && (
                                            <div className="post-genres">
                                                {post.genres.map(genre => (
                                                    <span key={genre.id} className="genre-tag">
                                                        {genre.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="post-actions">
                                        <button
                                            className="edit-button"
                                            onClick={() => handleEditClick(post)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeletePost(post.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-button"
                                disabled={page === 0}
                                onClick={() => setPage(p => p - 1)}
                            >
                                &laquo; Previous
                            </button>

                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`pagination-button ${i === page ? "active" : ""}`}
                                    onClick={() => setPage(i)}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                className="pagination-button"
                                disabled={page === totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next &raquo;
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Edit Post Modal */}
            {editingPost && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <h3>Edit Post</h3>

                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={editForm.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="content">Content</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={editForm.content}
                                    onChange={handleInputChange}
                                    rows={6}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={cancelEdit}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPosts;