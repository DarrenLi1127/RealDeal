import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Comment } from "./types";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
    postId: string;
    onCommentAdded?: () => void;
}

const CommentSection = ({ postId, onCommentAdded }: CommentSectionProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { user } = useUser();
    const API_BASE_URL = 'http://localhost:8080/api';

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            try {
                const userParam = user ? `&userId=${user.id}` : '';
                const response = await fetch(
                    `${API_BASE_URL}/comments/post/${postId}?page=${page}&size=10${userParam}`
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch comments: ${response.status}`);
                }

                const data = await response.json();
                setComments(data.content);
                setTotalPages(data.totalPages);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load comments");
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId, page, user?.id]);

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

            // Notify parent component if needed
            if (onCommentAdded) {
                onCommentAdded();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add comment");
        }
    };

    // Handle comment updates (like adding a reply or liking)
    const handleCommentUpdate = (updatedComment: Comment) => {
        setComments(currentComments =>
            currentComments.map(comment =>
                comment.id === updatedComment.id ? updatedComment : comment
            )
        );
    };

    return (
        <div className="comment-section">
            <h3 className="comment-section-title">Comments</h3>

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
                        onClick={() => setPage(p => p - 1)}
                        className="pagination-button"
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
                        disabled={page === totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
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