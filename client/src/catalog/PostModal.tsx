import { useEffect, useState } from "react";
import { Post } from "./types";
import "../styles/Catalog.css";          // ✔ keeps the existing modal styles

interface PostModalProps {
  post: Post;
  onClose: () => void;
}

export default function PostModal({ post, onClose }: PostModalProps) {
  const [index, setIndex] = useState(0);

  /* ----- prevent background scroll while modal is open ----- */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  /* ----- helper fns ----- */
  const next  = () => index < post.images.length - 1 && setIndex(i => i + 1);
  const prev  = () => index > 0                     && setIndex(i => i - 1);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleOverlay = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("modal-overlay")) onClose();
  };

  /* ----- render ----- */
  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>

        {/* ----------------- image viewer ----------------- */}
        <div className="modal-image-container">
          <img
            className="modal-image"
            src={post.images[index].url}
            alt={`${post.title} – image ${index + 1}`}
          />

          {post.images.length > 1 && (
            <>
              {/* arrows + counter */}
              <div className="image-navigation">
                <button onClick={prev} disabled={index === 0} className="image-nav-button">
                  &laquo;
                </button>
                <span className="image-counter">
                  {index + 1} / {post.images.length}
                </span>
                <button
                  onClick={next}
                  disabled={index === post.images.length - 1}
                  className="image-nav-button"
                >
                  &raquo;
                </button>
              </div>

              {/* tiny thumbnails */}
              <div className="thumbnail-container">
                {post.images.map((img, i) => (
                  <div
                    key={img.id}
                    className={`thumbnail ${i === index ? "active" : ""}`}
                    onClick={() => setIndex(i)}
                  >
                    <img src={img.url} alt={`thumb ${i + 1}`} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ----------------- post meta ----------------- */}
        <div className="modal-post-details">
          <h2 className="modal-title">{post.title}</h2>
          <p className="modal-username">@{post.username}</p>
          <p className="modal-date">{formatDate(post.createdAt)}</p>
          <div className="modal-content-text">{post.content}</div>
        </div>
      </div>
    </div>
  );
}
