import './App.css'
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react";
import Profile from './user_profile/Profile'; // Import the Profile component

function App() {
    return (
        <div className="App">
            <SignedOut>
                <div className="signed-out-container">
                    <h1>
                        This is Real Deal!
                    </h1>
                    <p>
                        Sign in to explore more of our content!
                    </p>
                    <SignInButton mode="modal" />
                </div>
            </SignedOut>

            <SignedIn>
                <div className="signed-in-container">
                    <h1>Welcome to Real Deal!</h1>
                    <p>You've successfully signed in.</p>
                    <div className="user-controls">
                        <UserButton />
                        <SignOutButton />
                    </div>
                    <Profile /> {/* Add the Profile component here */}
                </div>
            </SignedIn>
        </div>
    )
}

export default App