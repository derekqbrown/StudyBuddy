import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const ALL_EXAM_SETS_URL = 'http://localhost:3000/exams';


function AssignExamPage(){
    const [exams, setExams] = useState([]);
    const [error, setError] = useState('');


    const { setName } = useParams();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(!token){
            setError('Not logged in!');
            return;
        }

        const fetchAllExams = async () => {
            const result = await axios.get(`${ALL_EXAM_SETS_URL}/${setName}`, {
                headers: {Authorization: `Bearer ${token}`}
            });

            console.log(result.data.Key);

            setExams(result.data.Key);
        }


        fetchAllExams();

    }, [])
    return(
        <div>
            {exams.length == 0 ? (
                <p>No Exam Found</p>
            ) : (
                <ul>
                    {exams.map((exam, index) => (
                        <li key={index}>
                            <Link to={`${exam}`}>{exam}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}


export default AssignExamPage;