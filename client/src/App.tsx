import './App.css';
import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignOutButton,
    UserButton
} from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProfileGate from './user_profile/ProfileGate';
import Dashboard from './routes/Dashboard';
import UpdateProfile from './user_profile/UpdateProfile';
import { ReactNode } from 'react';

function App() {
    return (
        <div className="App">
            {/* -------- Guest view -------- */}
            <SignedOut>
                <div className="signed-out-container">
                    <h1>This is Real Deal!</h1>
                    <p>Sign in to explore more of our content!</p>
                    <SignInButton mode="modal" />
                </div>
            </SignedOut>

            {/* -------- Authenticated users -------- */}
            <SignedIn>
                <ProfileGate>
                    <BrowserRouter>
                        <nav className="navbar">
                            <h1 className="logo">Real Deal</h1>
                            <div className="nav-right">
                                <UserButton
                                    userProfileUrl="/profile"
                                    userProfileMode="navigation"
                                />
                                <SignOutButton />
                            </div>
                        </nav>

                        <Routes>
                            <Route
                                index
                                element={<Navigate to="/home" replace /> as ReactNode}
                            />
                            <Route
                                path="/home"
                                element={<Dashboard /> as ReactNode}
                            />
                            <Route
                                path="/profile"
                                element={<UpdateProfile /> as ReactNode}
                            />
                            <Route
                                path="*"
                                element={<Navigate to="/home" replace /> as ReactNode}
                            />
                        </Routes>
                    </BrowserRouter>
                </ProfileGate>
            </SignedIn>
        </div>
    );
}

export default App;

