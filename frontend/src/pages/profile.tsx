import { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css';


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
        console.log(err);
        setError('Failed to fetch profile');
      }
    };

    const fetchProfilePic = async () => {
      try{
        const response = await axios.get(PROFILE_PIC_URL, {
          headers: { Authorization: `Bearer ${token}`}
        });

        console.log("Profile picture: ", response.data.url);

        setProfilePic(response.data.url);
      }
      catch(err){
        console.log(err);
        setError('Failed to fetch profile picture');
      }
    }

    fetchProfile();
    fetchProfilePic();
  }, []);

  const handleViewFlashcards = () => {
    window.location.href = '/flashcardSets';
  }

  if (error) {
    return <p className="text-red-500 font-bold mt-2">{error}</p>;
  }

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="min-h-screen bg-purple-500">
      <div className="top-0 left-0 w-full p-4 bg-purple-500 z-10 flex justify-between items-center shadow-md">
        <h2 className="text-2xl font-bold text-white">Profile</h2>
      </div>

      {profilePic && (
        <div className="flex justify-center mt-6">
          <img
            src={profilePic}
            alt="Profile"
            style={{
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              margin: '30px'
            }}
          />
        </div>
      )}
      
      <p className="text-white text-center rounded text-2xl" style={{margin: '50px'}}>
        Username: {profile?.username}
      </p>

      <button
        onClick={handleViewFlashcards}
        className="px-4 py-2 bg-white text-purple-600 rounded shadow"
        style={{display: 'block', margin:'auto'}}
      >
        View Flashcard Sets
      </button>
    </div>
  );
}

export default ProfilePage;