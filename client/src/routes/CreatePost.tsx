import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/CreatePost.css';

const API_BASE = 'http://localhost:8080';

interface Preview {
  src: string;
  file: File;
}

export default function CreatePost() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<Preview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';                     // allows re-selecting same file later
    const previews = files.map(file => ({
      file,
      src: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...previews]);
    setError(null);
  };

  const removeImage = (idx: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].src);
      return prev.filter((_, i) => i !== idx);
    });
  };

  /* cleanup */
  useEffect(
      () => () => images.forEach(p => URL.revokeObjectURL(p.src)),
      [images]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !user) return;

    if (!title.trim() || !content.trim() || images.length === 0) {
      setError('Title, content, and at least one image are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('userId', user.id);
      form.append('title', title.trim());
      form.append('content', content.trim());
      images.forEach(p => form.append('images', p.file));

      const resp = await fetch(`${API_BASE}/api/posts/create`, {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Failed to create post');
      }
      navigate('/home');                      // back to feed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <main className="post-form">
        <div className="post-form-header">
          <h2>Create a new post</h2>
          <Link to="/home" className="cancel-btn">Cancel</Link>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form className="post-form-inner" onSubmit={handleSubmit}>
          <label className="field">
            Title
            <input
                type="text"
                maxLength={120}
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={submitting}
                required
            />
          </label>

          <label className="field">
            Content
            <textarea
                rows={6}
                value={content}
                onChange={e => setContent(e.target.value)}
                disabled={submitting}
                required
            />
          </label>

          <label className="field">
            Images
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={pickImages}
                disabled={submitting}
            />
            <small>Select up to 10 images. First one is the cover.</small>
          </label>

          {images.length > 0 && (
              <ul className="preview-list">
                {images.map((p, idx) => (
                    <li key={idx} className="preview-item">
                      <img src={p.src} alt={`preview ${idx + 1}`} />
                      <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          aria-label="Remove image"
                      >
                        ×
                      </button>
                    </li>
                ))}
              </ul>
          )}

          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </form>
      </main>
  );
}