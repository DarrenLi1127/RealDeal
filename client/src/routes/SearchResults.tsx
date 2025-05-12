import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Post } from "../catalog/types";
import PostModal from "../catalog/PostModal";
import "../styles/UserPosts.css";

const API = "http://localhost:8080/api";
const PAGE_SIZE = 9;

export default function SearchResults() {
  const { search } = useLocation();
  const q = new URLSearchParams(search).get("q") ?? "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sel, setSel] = useState<Post | null>(null);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`${API}/posts/search/posts` +  
        `?q=${encodeURIComponent(q)}&page=${page}&size=${PAGE_SIZE}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(j => { setPosts(j.content); setTotalPages(j.totalPages); setErr(null); })
      .catch(() => setErr("Failed to search posts"))
      .finally(() => setLoading(false));
  }, [q, page]);

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric" });
  const update = (p: Post) => setPosts(ps => ps.map(x => x.id===p.id ? p : x));

  return (
    <div className="user-posts-container">
      <h2 className="user-posts-header">Results for “{q}”</h2>

      {loading ? <p>Searching…</p> : err ? <p className="error-message">{err}</p> :
        posts.length === 0 ? <p>No posts found.</p> :
        <>
          <div className="user-posts-grid">
            {posts.map(p => (
              <div key={p.id} className="user-post-card" onClick={()=>setSel(p)}>
                {p.images[0] && <img src={p.images[0].url} alt="" className="post-image"/>}
                <div className="post-details">
                  <h3 className="post-title">{p.title}</h3>
                  <p className="post-date">{fmt(p.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page===0} onClick={()=>setPage(p=>p-1)}>&laquo;</button>
              {Array.from({length:totalPages}).map((_,i)=>(
                <button key={i} className={i===page?"active":""} onClick={()=>setPage(i)}>{i+1}</button>
              ))}
              <button disabled={page===totalPages-1} onClick={()=>setPage(p=>p+1)}>&raquo;</button>
            </div>
          )}
        </>}
      {sel && <PostModal post={sel} onClose={()=>setSel(null)} onUpdate={update} />}
    </div>
  );
}
