import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import '../styles/Profile.css';

type RegistrationForm = {
    userId: string;
    username: string;
    email: string;
};

type SubmitResult = { success: boolean; message: string } | null;

type Props = { children: React.ReactNode };

/* -------------------------------------------------------------------------- */

const ProfileGate = ({ children }: Props) => {
    const { user, isLoaded } = useUser();

    const [formData, setFormData] = useState<RegistrationForm>({
        userId: '',
        username: '',
        email: ''
    });

    const [checkingUser, setCheckingUser] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<SubmitResult>(null);

    /* ---------- 1) verify user in DB ---------- */
    useEffect(() => {
        const verifyUser = async () => {
            if (!isLoaded || !user) return;

            setCheckingUser(true);
            try {
                const resp = await fetch(
                    `http://localhost:8080/api/users/exists/${user.id}`
                );
                const exists = (await resp.json()) as boolean;

                if (exists) {
                    setShowForm(false); // user already registered
                } else {
                    setShowForm(true);  // new user → show form
                    setFormData({
                        userId: user.id,
                        username: '',
                        email: user.primaryEmailAddress?.emailAddress ?? ''
                    });
                }
            } catch (err) {
                console.error('Error checking user:', err);
                setShowForm(true); // fallback: let them register
            } finally {
                setCheckingUser(false);
            }
        };

        verifyUser();
    }, [isLoaded, user]);

    /* ---------- 2) registration submit ---------- */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const resp = await fetch('http://localhost:8080/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!resp.ok) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const err = await resp.json();
                throw new Error(
                    (err as { message?: string }).message ?? 'Registration failed'
                );
            }

            setSubmitResult({
                success: true,
                message: 'Registration successful! Welcome to Real Deal.'
            });
            setShowForm(false);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Registration failed';
            setSubmitResult({ success: false, message });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ---------- 3) render ---------- */
    if (checkingUser || !isLoaded) {
        return <div className="loading-container">Loading…</div>;
    }

    if (!showForm) {
        return <>{children}</>;
    }

    return (
        <div className="profile-container">
            {submitResult && (
                <div
                    className={`result-message ${
                        submitResult.success ? 'success' : 'error'
                    }`}
                >
                    {submitResult.message}
                </div>
            )}

            <h2>Complete Your Profile</h2>
            <p>Please choose a username to complete your registration.</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="Choose a unique username"
                        disabled={isSubmitting}
                    />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering…' : 'Complete Registration'}
                </button>
            </form>
        </div>
    );
};

export default ProfileGate;
