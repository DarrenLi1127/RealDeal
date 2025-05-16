import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/UpdateProfile.css";
import ExpBar from "../catalog/ExpBar";
import { Genre } from "../catalog/types";

interface ProfileForm {
  username: string;
  avatarFile: File | null;
  avatarPreview: string | null;
  selectedGenres: Genre[];
}

interface UserStats {
  experience: number;
  level: number;
}

const API = "http://localhost:8080";

const UpdateProfile = () => {
  const { user, isLoaded } = useUser();

  const [form, setForm] = useState<ProfileForm>({
    username: "",
    avatarFile: null,
    avatarPreview: null,
    selectedGenres: [],
  });

  const [stats, setStats] = useState<UserStats | null>(null);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("");

  // Load all available genres
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const resp = await fetch(`${API}/api/genres`);
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

  // Load user data including genres
  useEffect(() => {
    const loadUserData = async () => {
      if (!isLoaded || !user) return;

      setLoading(true);
      try {
        // Load user profile
        const userResp = await fetch(`${API}/api/users/${user.id}`);
        if (userResp.ok) {
          const userData = await userResp.json();
          setStats({
            experience: userData.experience ?? 0,
            level: userData.level ?? 1,
          });

          // Load user's selected genres
          const genresResp = await fetch(`${API}/api/genres/users/${user.id}`);
          let userGenres: Genre[] = [];
          if (genresResp.ok) {
            userGenres = await genresResp.json();
          }

          setForm({
            username: userData.username,
            avatarFile: null,
            avatarPreview: user.imageUrl || null,
            selectedGenres: userGenres,
          });
          setGreeting(`Hi ${userData.username}!`);
        } else if (userResp.status === 404) {
          // Not in DB yet → fall back to Clerk
          setForm({
            username: user.username || "",
            avatarFile: null,
            avatarPreview: user.imageUrl || null,
            selectedGenres: [],
          });
          setStats({ experience: 0, level: 1 });
          setGreeting(`Hi ${user?.username || "there"}!`);
        } else {
          throw new Error("Failed to load profile");
        }
      } catch (err) {
        console.error("Error loading user data", err);
        setForm({
          username: user?.username || "",
          avatarFile: null,
          avatarPreview: user?.imageUrl || null,
          selectedGenres: [],
        });
        setStats({ experience: 0, level: 1 });
        setGreeting(`Hi ${user?.username || "there"}!`);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isLoaded, user]);

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, username: e.target.value }));
    setError(null);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      avatarFile: file,
      avatarPreview: URL.createObjectURL(file),
    }));
    setError(null);
  };

  const handleGenreToggle = (genre: Genre) => {
    setForm((prev) => {
      const isSelected = prev.selectedGenres.some((g) => g.id === genre.id);
      let newGenres: Genre[];

      if (isSelected) {
        newGenres = prev.selectedGenres.filter((g) => g.id !== genre.id);
      } else {
        if (prev.selectedGenres.length >= 3) {
          setError("You can select up to 3 genres only");
          return prev;
        }
        newGenres = [...prev.selectedGenres, genre];
      }

      setError(null);
      return { ...prev, selectedGenres: newGenres };
    });
  };

  const save = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    const { username, avatarFile, selectedGenres } = form;
    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }
    if (username.length < 3 || username.length > 20) {
      setError("Username must be between 3-20 characters");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // First, upload image to Clerk if a new one was selected
      if (avatarFile) {
        try {
          console.log("Uploading image to Clerk...");
          await user.setProfileImage({ file: avatarFile });
          console.log("Image uploaded successfully");
        } catch (err) {
          console.error("Error uploading image to Clerk:", err);
          throw new Error("Failed to upload profile image");
        }
      }

      // Update username in backend
      if (username !== user.username) {
        const resp = await fetch(`${API}/api/users/${user.id}/username`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        if (!resp.ok) {
          const maybeJson = await resp.text();
          const { message } = JSON.parse(maybeJson || "{}");
          throw new Error(message || "Failed to update profile");
        }
      }

      // Update user genres
      const genreResp = await fetch(`${API}/api/genres/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genreIds: selectedGenres.map((g) => g.id) }),
      });

      if (!genreResp.ok) {
        throw new Error("Failed to update genres");
      }

      setGreeting(`Hi ${username}!`);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

      // Reset the file selection after successful upload
      setForm((prev) => ({
        ...prev,
        avatarFile: null,
        avatarPreview: user.imageUrl,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) return <p>Loading profile…</p>;

  return (
    <main className="profile-edit">
      <div className="profile-header">
        <h2 aria-label="greeting"> {greeting}</h2>
        <Link to="/home" className="back-button">
          <span>←</span> Back to Home
        </Link>
      </div>

      {stats && (
        <div className="exp-section">
          <ExpBar exp={stats.experience} level={stats.level} />
          <p className="exp-numbers">
            {stats.experience} EXP&nbsp;•&nbsp;Level&nbsp;{stats.level}
          </p>
        </div>
      )}

      <p>Update your profile information below:</p>

      {error && <div className="error-message">{error}</div>}

      <div className="avatar-section">
        <img
          src={form.avatarPreview || "https://placehold.co/96x96?text=Avatar"}
          alt="Profile picture"
          className="avatar-preview"
        />
        <label className="avatar-button">
          Change photo
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            disabled={saving}
            hidden
          />
        </label>
      </div>

      <label className="field">
        Username
        <input
          value={form.username}
          onChange={handleText}
          disabled={saving}
          required
          aria-label="Username-input"
        />
        <small className="field-hint">
          Username must be between 3-20 characters
        </small>
      </label>

      <div className="genre-section">
        <label className="field">
          Choose your favorite genres (up to 3)
          <div className="genre-tags">
            {allGenres.map((genre) => (
              <button
                key={genre.id}
                className={`genre-tag ${
                  form.selectedGenres.some((g) => g.id === genre.id)
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleGenreToggle(genre)}
                disabled={saving}
                type="button"
              >
                {genre.name}
              </button>
            ))}
          </div>
        </label>
      </div>

      <div className="button-container">
        <button
          aria-label="save-profile"
          onClick={save}
          disabled={saving}
          className="save-button"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>

        {saved && <span className="saved-msg">Saved!</span>}
      </div>
    </main>
  );
};

export default UpdateProfile;
