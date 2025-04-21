import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
//import { jwtDecode } from "jwt-decode";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// import '../index.css';

const PROFILE_URL = `${BASE_URL}/users`; // the endpoint to retrieve the user profile
const PROFILE_PIC_URL = `${BASE_URL}/users/profile-pic`;
const CREATE_SET_URL = `${BASE_URL}/users/create-set`;
const UPLOAD_PROFILE_PIC_URL = `${BASE_URL}/users/upload-profile-pic`; // endpoint for profile pic upload
const UPDATE_PROFILE_URL = `${BASE_URL}/users/update`; // endpoint for updating user profile
const DELETE_PROFILE_URL = `${BASE_URL}/users/delete`;

interface Profile {
  profilePicture: string;
  username: string;
  password?: string;
  role: string;
}

// interface UserTokenPayload {
//   id: string;
//   username: string;
//   role: string;
// }

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profilePic, setProfilePic] = useState<string>("");
  const [newSet, setNewSet] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, setSelectedFile] = useState<File | null>(null);
  const [newUsername, setNewUsername] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  if(!token) {
      setError('Not logged in!');
      return <Navigate to="/login"/>;
  }

  useEffect(() => {
    
    // try {
    //   const decodedToken = jwtDecode(token) as UserTokenPayload;
    //   const userRole = decodedToken.role;
    //   console.log("User Role:", userRole);

    //   setRole(userRole);
    // } catch (error) {
    //   console.error("Error decoding token:", error);
    //   setError("Invalid token");
    // }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(PROFILE_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("profile data: ", response.data);

        setProfile(response.data);
        setRole(response.data.role);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch profile");
      }
    };

    const fetchProfilePic = async () => {
      try {
        const response = await axios.get(PROFILE_PIC_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Profile picture: ", response.data.url);

        setProfilePic(response.data.url);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch profile picture");
      }
    };

    fetchProfile();
    fetchProfilePic();
  }, []);

  const handleUploadProfilePic = async (file: File) => {
    const token = localStorage.getItem("token");
    if (!token || !file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const response = await axios.post(UPLOAD_PROFILE_PIC_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      setProfilePic(
        `https://study-buddy-s3-bucket.s3.us-west-2.amazonaws.com/profile-pictures/${
          response.data.fileKey
        }?${Date.now()}`
      );
    } catch (err) {
      console.error(err);
    }
    setProfilePic(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleUploadProfilePic(file);
    }
  };

// dadf
//   const handleViewFlashcards = () => {
//     window.location.href = "/flashcardSets";
//   };

//   const handleAssignExam = () => {
//     window.location.href = "/assign-exam";
//   };

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not logged in");
      return;
    }
    if (newUsername === "New Username..."){
      setNewUsername("");
    }
    if (newPassword === "New Password..."){
      setNewUsername("");
    }

    const updatedProfile = {
      username: newUsername || profile?.username,
      password: newPassword || profile?.password,
    };

    try {
      const response = await axios.put(UPDATE_PROFILE_URL, updatedProfile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(response.data);
      setNewUsername("");
      setNewPassword("");
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    }
    alert(
      "Profile updated successfully. Please log in again with your new credentials."
    );
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleCreateFlashcardSet = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not logged in");
      return;
    }

    try {
      await axios.post(
        CREATE_SET_URL,
        { newSet },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your profile? This action cannot be undone."
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not logged in");
      return;
    }

    try {
      await axios.delete(DELETE_PROFILE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Failed to delete profile");
    }
  };

  if (error) {
    return <p className="text-red-500 font-bold mt-2">{error}</p>;
  }

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="top-0 left-0 w-full p-4 z-10 text-center shadow-md">
        <h2 className="text-2xl font-bold text-white">Profile</h2>
      </div>

      {profilePic && (
        <div className="flex justify-center mt-6">
          <img
            src={profilePic}
            alt="Profile"
            className="max-w-100 max-h-100 m-5"
          />
        </div>
      )}

      <p
        className="text-white text-center rounded text-2xl"
        style={{ margin: "10px" }}
      >
        Username: {profile?.username}
      </p>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 m-5 bg-white text-purple-600 rounded shadow hover:bg-blue-700 transition "
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {isEditing && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isEditing ? "max-h-96" : "max-h-0"
          }`}
        >
          <div
            className="flex justify-center   rounded shadow w-fit mx-auto"
            
          >
            <div className="flex flex-col gap-4 p-6 bg-blue-500 rounded-lg shadow-lg text-center">
              <p className="text-white text-sm">Leave the field blank if<br></br>you don't wish to update it</p>
              <label
                className="text-white text-md font-semibold"
              >
                Update Username:
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="border border-white mx-2 bg-blue-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="New Username..."
              />
              <label
                className="text-white text-md font-semibold"
              >
                Update Password:
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border border-white mx-2 bg-blue-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="New Password..."
              />
              <button
                type="button"
                onClick={handleUpdateProfile}
                className="bg-white text-purple-600 rounded-md shadow m-3 hover:bg-blue-700 transition"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}
      
      {role ==='Teacher' &&
      <div
        className="flex m-5 justify-center"
      >
        <button
          onClick={() => navigate("/assign-exam")}
          className="bg-white text-purple-600 rounded-md m-3 w-52 py-2 shadow hover:bg-blue-700 transition"
        >
          Assign Exam
        </button>
      </div>
      }

      <div className="flex justify-center mt-6 ">
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-white text-purple-600 px-4 py-2 rounded shadow hover:bg-blue-700 transition "
        >
          Upload Profile Picture
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <div className="flex justify-center mt-6">
        <button
          className="px-4 py-2 m-3 w-52 bg-white text-purple-600 rounded shadow hover:bg-blue-700 transition"
        >
          <Link
                    to="/flashcardSets"
                >
              View Flashcard Sets
          </Link>
        </button>
      </div>

      <div
        className=" flex justify-center"
        style={{ margin: "20px" }}
      >
        <button
          type="button"
          onClick={handleDeleteProfile}
          className="bg-red-600 text-white rounded-md m-3 w-52 py-2 shadow hover:bg-red-700 transition"
        >
          Delete Profile
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
