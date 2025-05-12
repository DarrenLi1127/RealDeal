import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Post } from "../catalog/types";
import PostModal from "../catalog/PostModal";
import "../styles/UserPosts.css";

const API_BASE_URL = "http://localhost:8080/api";
const PAGE_SIZE = 6;

export default function UserStarredPosts() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page,  setPage]  = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,  setError]  = useState<string | null>(null);

  /* --- modal state --- */
  const [selected, setSelected] = useState<Post | null>(null);

  /* ---------- fetch liked posts ---------- */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const r = await fetch(
          `${API_BASE_URL}/posts/starred/${user.id}?page=${page}&size=${PAGE_SIZE}&currentUserId=${user.id}`
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        setPosts(json.content);
        setTotalPages(json.totalPages);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load posts");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, page]);

  /* ---------- helpers ---------- */
  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

  /* update callback coming from PostModal */
  const handleUpdate = (updated: Post) =>
    setPosts(p => p.map(x => (x.id === updated.id ? updated : x)));

  /* ---------- render ---------- */
  return (
    <div className="user-posts-container">

      {loading ? (
        <p className="loading-message">Loading…</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : posts.length === 0 ? (
        <p className="no-posts-message">You haven’t starred anything yet.</p>
      ) : (
        <>
          <div className="user-posts-grid">
            {posts.map(p => (
              <div key={p.id}
                   className="user-post-card"
                   onClick={() => setSelected(p)}    /* open modal */
              >
                {p.images[0] && (
                  <div className="post-image">
                    <img src={p.images[0].url} alt={p.title} />
                    {p.images.length > 1 && (
                      <span className="image-count">+{p.images.length - 1}</span>
                    )}
                  </div>
                )}
                <div className="post-details">
                  <h3 className="post-title">{p.title}</h3>
                  <p className="post-date">{formatDate(p.createdAt)}</p>
                  <p className="post-content-preview">
                    {p.content.length > 100 ? p.content.slice(0, 100) + "…" : p.content}
                  </p>
                  <div className="post-stats">
                    <span><span className="icon">♥</span> {p.likesCount ?? 0}</span>
                    <span><span className="icon">★</span> {p.starsCount ?? 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}>&laquo; Prev</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i}
                        className={i === page ? "active" : ""}
                        onClick={() => setPage(i)}>{i + 1}</button>
              ))}
              <button disabled={page === totalPages - 1}
                      onClick={() => setPage(p => p + 1)}>Next &raquo;</button>
            </div>
          )}
        </>
      )}

      {/* ---------- modal ---------- */}
      {selected && (
        <PostModal
          post={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
