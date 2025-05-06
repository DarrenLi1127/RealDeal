import './App.css';
import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton
} from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import ProfileGate from './user_profile/ProfileGate';
import Dashboard from './routes/Dashboard';
import UpdateProfile from './user_profile/UpdateProfile';
import Profile from './user_profile/Profile';
import CreatePost from './routes/CreatePost';
import UserPosts from './user_profile/UserPosts';

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
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/register"
                            element={<Profile />}
                        />

                        {/* All other routes are ProfileGate */}
                        <Route
                            path="/*"
                            element={
                                <ProfileGate>
                                    <>
                                        <nav className="navbar">
                                            <div className="nav-left">
                                                <h1 className="logo">Real Deal</h1>
                                                <div className="nav-links">
                                                    <Link to="/home">Home</Link>
                                                    <Link to="/my-posts">My Posts</Link>
                                                </div>
                                            </div>
                                            <div className="nav-right">
                                                <Link to="/new" className="create-post-btn" aria-label="Create new post">+</Link>
                                                <UserButton
                                                    userProfileUrl="/profile"
                                                    userProfileMode="navigation"
                                                />
                                            </div>
                                        </nav>

                                        <Routes>
                                            <Route
                                                index
                                                element={<Navigate to="/home" replace />}
                                            />
                                            <Route
                                                path="/home"
                                                element={<Dashboard />}
                                            />
                                            <Route
                                                path="/my-posts"
                                                element={<UserPosts />}
                                            />
                                            <Route
                                                path="/new"
                                                element={<CreatePost />}
                                            />
                                            <Route
                                                path="/profile"
                                                element={<UpdateProfile />}
                                            />
                                            <Route
                                                path="*"
                                                element={<Navigate to="/home" replace />}
                                            />
                                        </Routes>
                                    </>
                                </ProfileGate>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </SignedIn>
        </div>
    );
}

export default App;