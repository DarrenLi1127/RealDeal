import '../styles/Profile.css';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

interface ProfileFormData {
    userId: string;
    username: string;
    email: string;
}

const Profile = () => {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<ProfileFormData>({
        userId: '',
        username: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [isCheckingUser, setIsCheckingUser] = useState(true);


    useEffect(() => {
        const checkUserExists = async () => {
            if (isLoaded && user) {
                setIsCheckingUser(true);
                try {
                    const response = await fetch(`http://localhost:8080/api/users/exists/${user.id}`);
                    const exists = await response.json();

                    if (exists) {
                        // User already registered, redirect to home page
                        setShowForm(false);
                        setSubmitResult({
                            success: true,
                            message: 'Welcome back to Real Deal!'
                        });
                        setTimeout(() => navigate('/home'), 1500);
                    } else {
                        // New user, show registration form
                        setShowForm(true);
                        // Pre-fill form with data from Clerk
                        setFormData({
                            userId: user.id,
                            username: '',  // Leave blank for user to enter
                            email: user.primaryEmailAddress?.emailAddress || ''
                        });
                    }
                } catch (error) {
                    console.error('Error checking if user exists:', error);
                    // If error, show form as fallback
                    setShowForm(true);
                    setSubmitResult({
                        success: false,
                        message: 'Could not verify your account status. Please try again.'
                    });
                } finally {
                    setIsCheckingUser(false);
                }
            }
        };

        checkUserExists();
    }, [isLoaded, user, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Log the profile data to console
        console.log('Profile data submitted:', formData);

        // Send data to backend
        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:8080/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Registration successful:', data);
                setSubmitResult({
                    success: true,
                    message: 'Registration successful! Welcome to Real Deal.'
                });
                setShowForm(false); // Hide form after successful registration

                // Add redirect to home page after successful registration
                setTimeout(() => navigate('/home'), 1500);
            } else {
                const errorData = await response.json();
                console.error('Registration failed:', errorData);
                setSubmitResult({
                    success: false,
                    message: errorData.message || 'Registration failed. Please try again.'
                });
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setSubmitResult({
                success: false,
                message: 'An error occurred. Please check your connection and try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoaded || isCheckingUser) {
        return <div className="loading-container">Loading...</div>;
    }

    return (
        <div className="profile-container">
            {submitResult && (
                <div className={`result-message ${submitResult.success ? 'success' : 'error'}`}>
                    {submitResult.message}
                </div>
            )}

            {showForm ? (
                <>
                    <h2>Complete Your Profile</h2>
                    <p>Please choose a username to complete your registration.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Choose a unique username"
                                disabled={isSubmitting}
                            />
                            <small>This will be used to identify you on the platform.</small>
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registering...' : 'Complete Registration'}
                        </button>
                    </form>
                </>
            ) : (
                <div className="welcome-container">
                    <h2>Welcome to Real Deal</h2>
                    <p>You're all set to explore the platform!</p>
                </div>
            )}
        </div>
    );
};

export default Profile;