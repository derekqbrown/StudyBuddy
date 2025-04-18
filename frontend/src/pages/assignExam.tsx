import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, Navigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ALL_EXAM_SETS_URL = `${BASE_URL}/exams`;

function AssignExamPage() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const { setName } = useParams();

  const token = localStorage.getItem("token");
  if (!token) {
    setError("Not logged in!");
    return <Navigate to="/login"/>;
  }

  useEffect(() => {

    const fetchAllExams = async () => {
      try {
        const result = await axios.get(`${ALL_EXAM_SETS_URL}/${setName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setExams(result.data);
      } catch (err) {
        setError("Failed to fetch exams");
        console.error(err);
      }
    };

    fetchAllExams();
  }, [setName]);

  return (
    
    <div className="mt-6 space-y-4 text-center">
      
      {error && <p>{error}</p>}
      {exams.length === 0 ? (
        <p>No Exam Found</p>
      ) : (
        
        <ul className="text-blue-600 text-center m-2 mt-10">
          {exams.map((exam, index) => {
            const keyParts = exam.Key.split("/");
            const rawExamId = keyParts[3];
            const examId = rawExamId.replace(".json", "");

            return (
              <li key={index}>
                <button 
                  className="py-2 px-4 m-2 text-purple-800 bg-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2 focus:ring-2  transition-colors duration-200 rounded-md"
                >
                  <Link to={`/exams/take/${examId}/${setName}`}>
                  Take Exam: {setName}
                </Link>
                </button>
                
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AssignExamPage;
