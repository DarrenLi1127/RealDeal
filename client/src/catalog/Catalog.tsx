import { useEffect, useState } from "react";
import PostModal from "./PostModal";
import { Post } from "./types";
import "../styles/Catalog.css";

interface PostsResponse {
  content: Post[];
  totalPages: number;
  number: number;
}

const Catalog = () => {
  /* -------------- data ---------------- */
  const [posts,       setPosts]       = useState<Post[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  /* -------------- paging -------------- */
  const [page,        setPage]        = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);
  const pageSize = 9;                       // 3×3 grid

  /* -------------- modal --------------- */
  const [selected,    setSelected]    = useState<Post | null>(null);

  /* -------------- fetch --------------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const r = await fetch(`http://localhost:8080/api/posts/all?page=${page}&size=${pageSize}`);
        if (!r.ok) throw new Error(`fetch failed: ${r.status}`);
        const data: PostsResponse = await r.json();
        setPosts(data.content);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "unknown error");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  /* -------------- helpers ------------- */
  const formatDate = (s: string) =>
    new Date(s).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  /* -------------- render -------------- */
  return (
    <section className="catalog" aria-labelledby="catalog-heading">
      <h2 id="catalog-heading">Browse Posts</h2>

      {loading && <p className="loading">Loading posts…</p>}
      {error   && (
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
        </p>
      )}

      {/* -------- posts grid -------- */}
      <div className="posts-grid">
        {posts.map(p => (
          <div key={p.id} className="post-card" onClick={() => setSelected(p)}>
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
              <p className="post-username">@{p.username}</p>
              <p className="post-excerpt">
                {p.content.length > 100 ? p.content.slice(0, 100) + "…" : p.content}
              </p>
              <p className="post-date">{formatDate(p.createdAt)}</p>
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
            onClick={() => setPage(p => p - 1)}
          >
            &laquo; Prev
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

      {/* -------- modal -------- */}
      {selected && (
        <PostModal
          post={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
};

export default Catalog;
