import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, Navigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ALL_EXAM_SETS_URL = `http://localhost:3000/exams`;

interface Exam {
  Key: string;
}

function ViewIndividualExamPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState("");
  const { examSetName } = useParams();

  const token = localStorage.getItem("token");
  if (!token) {
    setError("Not logged in!");
    return <Navigate to="/login"/>;
  }

  useEffect(() => {

    console.log("set name: ", examSetName);

    const fetchAllExams = async () => {
      try {
        const result = await axios.get(`${ALL_EXAM_SETS_URL}/${examSetName}`, 
        {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("result", result);
        
        setExams(result.data);
      } catch (err) {
        setError("Failed to fetch exams");
        console.error(err);
      }
    };

    fetchAllExams();

    // console.log(exams);
  }, [examSetName]);

  return (
    
    <div className="mt-6 space-y-4 text-center">

    {error && <p>{error}</p>}
          
      {error && <p>{error}</p>}
      {exams.length === 0 ? (
        <p>No Exam Found</p>
      ) : (
        
        <ul className="text-blue-600 items-center">
          {exams.map((exam, index) => {
            const keyParts = exam.Key.split("/");
            const rawExamId = keyParts[3];
            const examId = rawExamId.replace(".json", "");

            return (
              <li key={index} className="flex items-center justify-center space-x-4 mb-2 bg-white py-2 px-4 ">
                <Link to={`/exams/take/${examId}/${examSetName}`} className="block">{examId}</Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ViewIndividualExamPage;
