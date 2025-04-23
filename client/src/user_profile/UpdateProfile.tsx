// client/src/user_profile/UpdateProfile.tsx
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import "../styles/UpdateProfile.css";

interface ProfileForm {
  username: string;
  avatarFile: File | null;
  avatarPreview: string | null;
}

interface UserProfileData {
  userId: string;
  username: string;
  email: string;
  profileImageUrl: string | null;
}

const UpdateProfile = () => {
  const { user, isLoaded } = useUser();
  const [form, setForm] = useState<ProfileForm>({
    username: "",
    avatarFile: null,
    avatarPreview: null,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  /* preload current values ------------------------------------------------ */
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoaded || !user) return;

      try {
        // Keep the full userId as is (including the user_ prefix)
        const userId = user.id;
        console.log("Checking if user exists:", userId);

        // First check if user exists in our database
        const existsResp = await fetch(
          `http://localhost:8080/api/users/exists/${userId}`
        );

        if (!existsResp.ok) {
          throw new Error(`Server responded with status: ${existsResp.status}`);
        }

        const exists = await existsResp.json();
        console.log("User exists in database:", exists);

        if (exists) {
          // If the user exists, we can try to fetch their profile
          try {
            const profileResp = await fetch(
              `http://localhost:8080/api/users/${userId}`
            );

            if (profileResp.ok) {
              const profileData = await profileResp.json();
              setUserProfile(profileData);

              // Use profile data from database
              setForm((prev) => ({
                ...prev,
                username: profileData.username || "",
                avatarPreview:
                  profileData.profileImageUrl || user.imageUrl || null,
              }));
              console.log("Loaded profile from database:", profileData);
            } else {
              // If we can't get the profile, fall back to Clerk data
              console.warn("Could not fetch profile, using Clerk data instead");
              setUserProfile({
                userId: userId,
                username: user.username || "",
                email: user.primaryEmailAddress?.emailAddress || "",
                profileImageUrl: user.imageUrl || null,
              });

              setForm((prev) => ({
                ...prev,
                username: user.username || "",
                avatarPreview: user.imageUrl || null,
              }));
            }
          } catch (err) {
            console.error(
              "Error fetching profile details, using Clerk data instead:",
              err
            );
            // Fall back to using Clerk data
            setUserProfile({
              userId: userId,
              username: user.username || "",
              email: user.primaryEmailAddress?.emailAddress || "",
              profileImageUrl: user.imageUrl || null,
            });

            setForm((prev) => ({
              ...prev,
              username: user.username || "",
              avatarPreview: user.imageUrl || null,
            }));
          }
        } else {
          // User doesn't exist in our database yet
          setError("Please complete your profile registration first");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile data. Please try again later.");
      }
    };

    fetchUserProfile();
  }, [isLoaded, user]);

  /* handlers -------------------------------------------------------------- */
  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, username: e.target.value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      avatarFile: file,
      avatarPreview: URL.createObjectURL(file),
    }));
  };

  const save = async () => {
    if (!user) return;

    setError(null);
    setSaving(true);

    try {
      // Use the full userId as is
      const userId = user.id;

      // First upload image to Clerk if a new one was selected
      let imageUrl = user.imageUrl;

      if (form.avatarFile) {
        try {
          // Upload image to Clerk
          await user.setProfileImage({ file: form.avatarFile });
          // Get the new URL (this may take a moment to propagate)
          imageUrl = user.imageUrl;
          console.log("New image URL from Clerk:", imageUrl);
        } catch (err) {
          console.error("Error uploading image to Clerk:", err);
          throw new Error("Failed to upload profile image");
        }
      }

      // Update username in Clerk if needed
      if (user.username !== form.username) {
        await user.update({ username: form.username });
      }

      // Now update our backend database
      console.log("Updating profile in database:", {
        userId: userId,
        username: form.username,
        profileImageUrl: imageUrl,
      });

      const response = await fetch(
        `http://localhost:8080/api/users/update/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            username: form.username,
            profileImageUrl: imageUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(
          `Failed to update profile: ${response.status} ${response.statusText}`
        );
      }

      // Update was successful
      const updatedProfile = await response.json();
      setUserProfile(updatedProfile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save profile changes"
      );
    } finally {
      setSaving(false);
    }
  };

  /* UI -------------------------------------------------------------------- */
  if (!isLoaded) return <p>Loading profile...</p>;

  return (
    <main className="profile-edit">
      <h2>Edit Profile</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="avatar-picker">
        <img
          src={
            form.avatarPreview ||
            "https://placehold.co/96x96?text=Avatar" /* fallback */
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

      <button onClick={save} disabled={saving || !user}>
        {saving ? "Saving…" : "Save changes"}
      </button>
      {saved && <span className="saved-msg">Saved!</span>}
    </main>
  );
};

export default UpdateProfile;
