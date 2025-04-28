// client/src/catalog/CommentItem.tsx
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Comment } from "./types";

interface CommentItemProps {
    comment: Comment;
    postId: string;
    onUpdate: (comment: Comment) => void;
    isReply?: boolean;
}

const CommentItem = ({ comment, postId, onUpdate, isReply = false }: CommentItemProps) => {
    const [replying, setReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [showReplies, setShowReplies] = useState(true);
    const [liked, setLiked] = useState(comment.liked);
    const [likesCount, setLikesCount] = useState(comment.likesCount);
    const { user } = useUser();
    const API_BASE_URL = 'http://localhost:8080/api';

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Handle like
    const handleLike = async () => {
        if (!user) return;

        try {
            const response = await fetch(`${API_BASE_URL}/comments/${comment.id}/like?userId=${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to toggle like: ${response.status}`);
            }

            const result = await response.json();
            setLiked(result.liked);
            setLikesCount(result.likes);

            // Update parent component
            onUpdate({
                ...comment,
                liked: result.liked,
                likesCount: result.likes
            });
        } catch (err) {
            console.error(err);
        }
    };

    // Handle adding a reply
    const handleAddReply = async () => {
        if (!user || !replyContent.trim()) return;

        try {
            const response = await fetch(`${API_BASE_URL}/comments/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    postId: postId,
                    userId: user.id,
                    content: replyContent.trim(),
                    parentCommentId: comment.id
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to add reply: ${response.status}`);
            }

            const addedReply = await response.json();

            // Update the comment with the new reply
            const updatedComment = {
                ...comment,
                replies: [...comment.replies, addedReply]
            };

            onUpdate(updatedComment);
            setReplyContent("");
            setReplying(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={`comment-item ${isReply ? 'comment-reply' : ''}`}>
            <div className="comment-header">
                <span className="comment-username">@{comment.username}</span>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
            </div>

            <div className="comment-content">{comment.content}</div>

            <div className="comment-actions">
                <button
                    className={`comment-like-btn ${liked ? 'active' : ''}`}
                    onClick={handleLike}
                    aria-label={liked ? "Unlike" : "Like"}
                >
                    {liked ? "♥" : "♡"} {likesCount > 0 ? likesCount : ""}
                </button>

                {!isReply && user && (
                    <button
                        className="comment-reply-btn"
                        onClick={() => setReplying(!replying)}
                    >
                        {replying ? "Cancel" : "Reply"}
                    </button>
                )}

                {!isReply && comment.replies.length > 0 && (
                    <button
                        className="comment-toggle-replies"
                        onClick={() => setShowReplies(!showReplies)}
                    >
                        {showReplies ? "Hide replies" : `Show ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
                    </button>
                )}
            </div>

            {/* Reply form */}
            {replying && (
                <div className="reply-form">
          <textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="reply-input"
          />
                    <div className="reply-form-actions">
                        <button
                            onClick={() => setReplying(false)}
                            className="reply-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddReply}
                            disabled={!replyContent.trim()}
                            className="reply-submit"
                        >
                            Reply
                        </button>
                    </div>
                </div>
            )}

            {/* Replies */}
            {!isReply && showReplies && comment.replies.length > 0 && (
                <div className="comment-replies">
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            onUpdate={(updatedReply) => {
                                // Update this reply in the parent comment's replies array
                                const updatedReplies = comment.replies.map(r =>
                                    r.id === updatedReply.id ? updatedReply : r
                                );
                                onUpdate({
                                    ...comment,
                                    replies: updatedReplies
                                });
                            }}
                            isReply={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;