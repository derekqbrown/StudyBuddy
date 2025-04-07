import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PROFILE_URL = 'http://localhost:3000/users'; // the endpoint to retrieve the user profile
const PROFILE_PIC_URL = 'http://localhost:3000/users/profile-pic';

interface Profile {
  profilePicture: string;
  username: string;
}

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profilePic, setProfilePic] = useState<string>('');
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

        // console.log("profile data: ", response.data);

        setProfile(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch profile');
      }
    };

    const fetchProfilePic = async () => {
      try{
        const response = await axios.get(PROFILE_PIC_URL, {
          headers: { Authorization: `Bearer ${token}`}
        });

        console.log("Profile picture: ", response);

        setProfilePic(response.data.url);
      }
      catch(err){
        setError(err.message || 'Failed to fetch profile picture');
      }
    }

    fetchProfile();
    fetchProfilePic();
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
      {profilePic ? (
        <img src={profilePic} alt="Profile" style={{width: 100, height: 100}}/>
      ) : null}
      <p>Username: {profile?.username}</p>
      <Link to="/flashcardSets">
        <button>View Flashcard Sets</button>
      </Link>
    </div>
  );
}

export default ProfilePage;