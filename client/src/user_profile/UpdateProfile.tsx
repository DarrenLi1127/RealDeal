// client/src/user_profile/UpdateProfile.tsx
import { useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import '../styles/UpdateProfile.css';

interface ProfileForm {
    username: string;
    avatarFile: File | null;
    avatarPreview: string | null;
}

const UpdateProfile = () => {
    const { user, isLoaded } = useUser();
    const [form, setForm] = useState<ProfileForm>({
        username: '',
        avatarFile: null,
        avatarPreview: null
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    /* preload current values ------------------------------------------------ */
    useEffect(() => {
        if (isLoaded && user) {
            setForm(prev => ({
                ...prev,
                username: user.username || '',
                avatarPreview: user.imageUrl || null
            }));
        }
    }, [isLoaded, user]);

    /* handlers -------------------------------------------------------------- */
    const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, username: e.target.value }));
    };

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setForm(prev => ({
            ...prev,
            avatarFile: file,
            avatarPreview: URL.createObjectURL(file)
        }));
    };

    const save = async () => {
        setSaving(true);

        /* ---------- TODO: wire up real calls ---------- */
        // await user?.update({ username: form.username });
        // if (form.avatarFile) await user?.setProfileImage({ file: form.avatarFile });

        await new Promise(r => setTimeout(r, 600)); // mock latency
        /* --------------------------------------------- */

        setSaved(true);
        setSaving(false);
        setTimeout(() => setSaved(false), 2500);
    };

    /* UI -------------------------------------------------------------------- */
    if (!isLoaded) return <p>Loading profile...</p>;

    return (
        <main className="profile-edit">
            <h2>Edit Profile</h2>

            <div className="avatar-picker">
                <img
                    src={
                        form.avatarPreview ||
                        'https://placehold.co/96x96?text=Avatar' /* fallback */
                    }
                    alt="avatar preview"
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
                    name="username"
                    value={form.username}
                    onChange={handleText}
                    disabled={saving}
                    required
                />
            </label>

            <button onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && <span className="saved-msg">Saved!</span>}
        </main>
    );
};

export default UpdateProfile;
