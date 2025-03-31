import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PROFILE_URL = 'http://localhost:3000/users/profile'; // the endpoint to retrieve the user profile

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

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
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div>
      <h2>Profile</h2>
      <img src={profile.profilePicture} alt="Profile" />
      <p>Username: {profile.username}</p>
    </div>
  );
}

export default ProfilePage;