import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AssignExamPage from './assignExam';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ALL_EXAM_SETS_URL = `${BASE_URL}/exams/all-sets`;
const PROFILE_URL = `${BASE_URL}/users`;


function AssignExamSetPage(){
    const [userId, setUserId] = useState('');
    const [examSet, setExamSet] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(!token){
            setError('Not logged in!');
            return;
        }

        const fetchProfile = async () => {

            try{
                const response = await axios.get(PROFILE_URL, {
                    headers: {Authorization: `Bearer ${token}`}
                });

                setUserId(response.data.id);
                // console.log(userId);
            }catch(err){
                console.error(err);
                setError("Failed to get profile");
            }
        }


        const fetchExamSets = async () => {

            try{
                const response = await axios.get(ALL_EXAM_SETS_URL , {
                    headers: {Authorization: `Bearer ${token}`}
                });

                // console.log(response);

                setExamSet(response.data);
            }catch(err){
                console.error(err);
                setError("Failed to get exam sets");
            }
        }

        fetchProfile();
        fetchExamSets();
    }, [])


    return(
        <div className="flex flex-col justify-center items-center">
            
                <h1 className="text-white text-2xl mt-60"
                    >
                    Your Exam Sets
                </h1>

                
            <div className="flex flex-col justify-center items-center"
                >
                
                {examSet.length == 0 ? (
                    <p className="text-center">No Exam Set Found</p>
                ) : (
                    <ul className="mt-10">
                        {examSet.map((set, index) => (
                            <li key={index} 
                            className="bg-white hover:bg-gray-400 text-gray-800 py-2 px-4 w-50 rounded-md shadow-sm transition mb-2 text-center"
                            >
                                <Link to={`/assign-exam/${set}`} className="block w-full h-full">{set}</Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}


export default AssignExamSetPage;