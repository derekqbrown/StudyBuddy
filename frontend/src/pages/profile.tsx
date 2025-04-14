import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import '../index.css';


const PROFILE_URL = 'http://localhost:3000/users'; // the endpoint to retrieve the user profile
const PROFILE_PIC_URL = 'http://localhost:3000/users/profile-pic';
const CREATE_SET_URL = 'http://localhost:3000/users/create-set';

interface Profile {
  profilePicture: string;
  username: string;
}

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profilePic, setProfilePic] = useState<string>('');
  const [newSet, setNewSet] = useState('');
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


  const handleCreateFlashcardSet = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not logged in');
      return;
    }

    try{
      await axios.post(
        CREATE_SET_URL,
        { newSet }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    }
    catch(err){
      console.error(err);
    }
  }

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your profile? This action cannot be undone.');
    if (!confirmed) return;
  
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not logged in');
      return;
    }
  
    try {
      await axios.delete('http://localhost:3000/users/delete', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError('Failed to delete profile');
    }
  };
  
  

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

      <div className="flex justify-center mt-6 p-6 bg-white rounded shadow w-fit mx-auto" style={{background: "gray", width: "360px", margin: "40px auto 0"}}>
        <div className="flex flex-col gap-4 p-6 bg-purple-700 rounded-lg shadow-lg">
          <label className="text-white text-lg font-semibold" style={{margin: "10px"}}>
            Create New Flashcard Set
          </label>

          <input
            type="text"
            onChange={(e) => setNewSet(e.target.value)}
            className="border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{margin: "10px"}}
          />

          <button
            type="button"
            onClick={handleCreateFlashcardSet}
            className="bg-white text-purple-600 rounded-md shadow hover:bg-gray-100 transition"
            style={{margin: "10px"}}
          >
            Create
          </button>
          <button
            type="button"
            onClick={handleDeleteProfile}
            className="bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
            style={{margin: "10px"}}
          >
            Delete Profile
          </button>
        </div>
      </div>
    </div>
    
  );
}

export default ProfilePage;