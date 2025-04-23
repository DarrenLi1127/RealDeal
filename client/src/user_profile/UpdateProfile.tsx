import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/UpdateProfile.css';

interface ProfileForm {
    username: string;
}

const API = 'http://localhost:8080';

const UpdateProfile = () => {
    const { user, isLoaded } = useUser();

    const [form, setForm] = useState<ProfileForm>({ username: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const loadUserData = async () => {
            if (!isLoaded || !user) return;

            setLoading(true);
            try {
                const resp = await fetch(`${API}/api/users/${user.id}`);
                if (resp.ok) {
                    const data = await resp.json() as { username: string };
                    setForm({ username: data.username });
                    setGreeting(`Hi ${data.username}!`);
                } else if (resp.status === 404) {
                    // Not in DB yet → fall back to Clerk
                    setForm({ username: user.username || '' });
                    setGreeting(`Hi ${user.username || 'there'}!`);
                } else {
                    throw new Error('Failed to load profile');
                }
            } catch (err) {
                console.error('Error loading user data', err);
                setForm({ username: user?.username || '' });
                setGreeting(`Hi ${user?.username || 'there'}!`);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [isLoaded, user]);

    const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ username: e.target.value });
        setError(null);
    };

    const save = async () => {
        if (!user?.id) {
            setError('User not authenticated');
            return;
        }
        const { username } = form;
        if (!username.trim()) {
            setError('Username cannot be empty');
            return;
        }
        if (username.length < 3 || username.length > 20) {
            setError('Username must be between 3-20 characters');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const resp = await fetch(
                `${API}/api/users/${user.id}/username`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                }
            );

            if (!resp.ok) {
                const maybeJson = await resp.text();
                const { message } = JSON.parse(maybeJson || '{}');
                throw new Error(message || 'Failed to update profile');
            }

            setGreeting(`Hi ${username}!`);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    if (!isLoaded || loading) return <p>Loading profile…</p>;

    return (
        <main className="profile-edit">
            <div className="profile-header">
                <h2>{greeting}</h2>
                <Link to="/home" className="back-button">
                    <span>←</span> Back to Home
                </Link>
            </div>

            <p>Update your profile information below:</p>

            {error && <div className="error-message">{error}</div>}

            <label className="field">
                Username
                <input
                    value={form.username}
                    onChange={handleText}
                    disabled={saving}
                    required
                />
                <small className="field-hint">
                    Username must be between 3-20 characters
                </small>
            </label>

            <div className="button-container">
                <button
                    onClick={save}
                    disabled={saving}
                    className="save-button"
                >
                    {saving ? 'Saving…' : 'Save changes'}
                </button>

                {saved && <span className="saved-msg">Saved!</span>}
            </div>
        </main>
    );
};

export default UpdateProfile;