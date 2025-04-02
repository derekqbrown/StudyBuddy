import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PROFILE_URL = 'http://localhost:3000/users'; // the endpoint to retrieve the user profile

interface Profile {
  profilePicture: string;
  username: string;
}

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string| null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not logged in');
      return;
    }

    const fetchProfile = async () => {
      try {

        const response = await axios.get(PROFILE_URL, {
         headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch profile');
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <p className="text-red-500 font-bold mt-2">{error}</p>;
  }

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div>
      <h2>Profile</h2>
      <img src={profile?.profilePicture} alt="Profile" />
      <p>Username: {profile?.username}</p>
    </div>
  );
}

export default ProfilePage;