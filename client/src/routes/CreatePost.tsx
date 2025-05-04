import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/CreatePost.css';
import { Genre } from '../catalog/types';

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

  // Genre states
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);

  // Load all available genres
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/genres`);
        if (resp.ok) {
          const data = await resp.json();
          setAllGenres(data);
        }
      } catch (err) {
        console.error("Error loading genres", err);
      }
    };
    loadGenres();
  }, []);

  const pickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
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

  const handleGenreToggle = (genre: Genre) => {
    setSelectedGenres(prev => {
      const isSelected = prev.some(g => g.id === genre.id);
      let newGenres: Genre[];

      if (isSelected) {
        newGenres = prev.filter(g => g.id !== genre.id);
      } else {
        if (prev.length >= 3) {
          setError("You can select up to 3 genres only");
          return prev;
        }
        newGenres = [...prev, genre];
      }

      setError(null);
      return newGenres;
    });
  };

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

    if (selectedGenres.length === 0) {
      setError('Please select at least one genre');
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

      // Add genre IDs as parameters
      selectedGenres.forEach(genre => {
        form.append('genreIds', genre.id.toString());
      });

      const resp = await fetch(`${API_BASE}/api/posts/create`, {
        method: 'POST',
        body: form,
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Failed to create post');
      }
      navigate('/home');
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

          <label className="field">
            Genres (1-3 required)
            <div className="genre-tags">
              {allGenres.map((genre) => (
                  <button
                      key={genre.id}
                      className={`genre-tag ${
                          selectedGenres.some(g => g.id === genre.id) ? "selected" : ""
                      }`}
                      onClick={() => handleGenreToggle(genre)}
                      disabled={submitting}
                      type="button"
                  >
                    {genre.name}
                  </button>
              ))}
            </div>
          </label>

          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </form>
      </main>
  );
}