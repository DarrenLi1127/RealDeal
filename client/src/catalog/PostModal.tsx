import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Post } from "./types";
import CommentSection from "./CommentSection";
import "../styles/Catalog.css";

interface PostModalProps {
  post: Post;
  onClose: () => void;
  onUpdate: (post: Post) => void;
}

export default function PostModal({ post, onClose, onUpdate }: PostModalProps) {
  const [idx, setIdx] = useState(0);

  /* --- reaction state --- */
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likes, setLikes] = useState(post.likesCount ?? 0);
  const [starred, setStarred] = useState(post.starred ?? false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stars, setStars] = useState(post.starsCount ?? 0);

  const { user } = useUser();
  const API_BASE_URL = 'http://localhost:8080/api';

  async function onLike() {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${post.id}/like?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle like: ${response.status}`);
      }

      const res = await response.json();
      setLiked(res.liked);
      setLikes(res.likes);

      // Update parent component
      onUpdate({
        ...post,
        liked: res.liked,
        likesCount: res.likes
      });
    } catch (err) { console.error(err); }
  }

  async function onStar() {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${post.id}/star?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle star: ${response.status}`);
      }

      const res = await response.json();
      setStarred(res.starred);
      setStars(res.stars);

      // Update parent component
      onUpdate({
        ...post,
        starred: res.starred,
        starsCount: res.stars
      });
    } catch (err) { console.error(err); }
  }

  /* prevent background scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const next = () => idx < post.images.length - 1 && setIdx(i => i + 1);
  const prev = () => idx > 0 && setIdx(i => i - 1);

  const format = (s: string) =>
      new Date(s).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

  const clickOverlay = (e: React.MouseEvent) =>
      (e.target as HTMLElement).classList.contains("modal-overlay") && onClose();

  return (
      <div className="modal-overlay" onClick={clickOverlay}>
        <div className="modal-content">
          <button className="modal-close" onClick={onClose}>×</button>

          <div className="modal-image-container">
            {post.images.length > 0 && (
                <img className="modal-image"
                     src={post.images[idx].url}
                     alt={`${post.title} – ${idx+1}`} />
            )}

            {post.images.length > 1 && (
                <>
                  <div className="image-navigation">
                    <button onClick={prev} disabled={idx===0} className="image-nav-button">&laquo;</button>
                    <span className="image-counter">{idx+1}/{post.images.length}</span>
                    <button onClick={next} disabled={idx===post.images.length-1} className="image-nav-button">&raquo;</button>
                  </div>
                  <div className="thumbnail-container">
                    {post.images.map((img,i)=>(
                        <div key={img.id}
                             className={`thumbnail ${i===idx?"active":""}`}
                             onClick={()=>setIdx(i)}>
                          <img src={img.url} alt={`thumb ${i+1}`} />
                        </div>
                    ))}
                  </div>
                </>
            )}
          </div>

          <div className="modal-post-details">
            <h2 className="modal-title">{post.title}</h2>
            <p className="modal-username">@{post.username}</p>
            <p className="modal-date">{format(post.createdAt)}</p>
            <div className="modal-content-text">{post.content}</div>

            {/* ----- reactions with updated styling ----- */}
            <div className="modal-reactions">
              <button
                  className={`like-btn ${liked ? "active" : ""}`}
                  onClick={onLike}
                  aria-label={liked ? "Unlike" : "Like"}
              >
                {liked ? "♥" : "♡"} {likes}
              </button>

              <button
                  className={`star-btn ${starred ? "active" : ""}`}
                  onClick={onStar}
                  aria-label={starred ? "Remove star" : "Star"}
              >
                {starred ? "★" : "☆"}
              </button>
            </div>
          </div>

          {/* Add the Comment Section here */}
          <div className="modal-comments-container">
            <CommentSection postId={post.id} />
          </div>
        </div>
      </div>
  );
}