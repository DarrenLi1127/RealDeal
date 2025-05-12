import { useEffect, useState } from 'react';
import '../styles/ProfilePostTabs.css';     // small grid + tabs


import { Post } from "../catalog/types";

type Tab = 'posts' | 'saved' | 'starred';

interface Props {
  userId: string;
}

const API = 'http://localhost:8080';

export default function ProfilePostTabs({ userId }: Props) {
  const [active, setActive] = useState<Tab>('posts');
  const [posts, setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const endpoint = {
    posts:   `/api/posts/user/${userId}`,
    saved:   `/api/posts/liked/${userId}`,
    starred: `/api/posts/starred/${userId}`,
  }[active];

  /* fetch whenever the active tab changes */
  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}${endpoint}?page=0&size=18`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (!ignore) {
          setPosts(json.content ?? []);          // page wrapper
          setErr(null);
        }
      } catch (e) {
        if (!ignore) setErr('Failed to load posts');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchData();
    return () => { ignore = true; };
  }, [endpoint]);

  return (
    <section className="profile-post-tabs">
      {/* --- small tab bar --- */}
      <div className="tabs">
        {(['posts','saved','starred'] as Tab[]).map(t => (
          <button
            key={t}
            className={`tab-btn ${active === t ? 'active' : ''}`}
            onClick={() => setActive(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* --- content --- */}
      {loading && <p className="hint">Loading…</p>}
      {err && <p className="error">{err}</p>}

      <div className="thumb-grid">
        {posts.map(p =>
          p.images.length > 0 && (
            <img
              key={p.id}
              src={p.images[0].url}
              alt={p.title}
              className="thumb"
              /* you can open a modal here like Catalog if you wish */
            />
          )
        )}
        {!loading && posts.length === 0 && (
          <p className="hint empty">Nothing here yet</p>
        )}
      </div>
    </section>
  );
}
