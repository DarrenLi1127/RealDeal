import './App.css';
import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignOutButton,
    UserButton
} from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './routes/Dashboard';
import UpdateProfile from './user_profile/UpdateProfile';

function App() {
    return (
        <div className="App">
            <SignedOut>
                <div className="signed-out-container">
                    <h1>This is Real Deal!</h1>
                    <p>Sign in to explore more of our content!</p>
                    <SignInButton mode="modal" />
                </div>
            </SignedOut>

            <SignedIn>
                <BrowserRouter>
                    <Routes>
                        <Route index element={<Navigate to="/home" replace />} />
                        <Route
                            path="/home"
                            element={
                                <>
                                    {/* top nav bar */}
                                    <nav className="navbar">
                                        <h1 className="logo">Real Deal</h1>

                                        {/* clerk’s ready‑made avatar menu */}
                                        <div className="nav‑right">
                                            <UserButton
                                                afterSignOutUrl="/"
                                                userProfileMode="navigation"
                                                userProfileUrl="/profile"
                                            />
                                        </div>
                                    </nav>

                                    <Dashboard />
                                </>
                            }
                        />
                        <Route path="/profile" element={<UpdateProfile />} />
                        {/* catch‑all → dashboard */}
                        <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                </BrowserRouter>

                <div className="global-signout">
                    <SignOutButton />
                </div>
            </SignedIn>
        </div>
    );
}

export default App;
