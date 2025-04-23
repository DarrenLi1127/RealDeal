import { useUser } from '@clerk/clerk-react';
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import '../styles/Profile.css';

interface ProfileGateProps {
    children: ReactNode;
}

const ProfileGate = ({ children }: ProfileGateProps) => {
    const { user, isLoaded } = useUser();
    const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const API_URL = 'http://localhost:8080';

    useEffect(() => {
        const checkUserRegistration = async () => {
            if (!isLoaded || !user) return;

            setIsChecking(true);
            try {
                // Check if the user exists in your backend
                const response = await fetch(`${API_URL}/api/users/exists/${user.id}`);

                if (response.ok) {
                    const exists = await response.json();
                    setIsRegistered(exists);
                } else {
                    // Handle error, assume not registered
                    console.error('Error checking user registration:', response.statusText);
                    setIsRegistered(false);
                }
            } catch (error) {
                console.error('Error checking user registration:', error);
                setIsRegistered(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkUserRegistration();
    }, [isLoaded, user]);

    // Show loading state while checking
    if (!isLoaded || isChecking) {
        return <div className="loading-container">Checking your profile...</div>;
    }

    // If user is not registered, redirect to profile creation
    if (isRegistered === false) {
        return <Navigate to="/register" replace />;
    }

    // If user is registered, show the main app content
    return <>{children}</>;
};

export default ProfileGate;
