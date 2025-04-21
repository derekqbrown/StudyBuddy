import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, Navigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ALL_EXAM_SETS_URL = `${BASE_URL}/exams`;
const ASSIGN_EXAM_URL = `${BASE_URL}/exams/assign`;

interface Exam {
  Key: string;
}

function AssignExamPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState('');
  const [assignmentMessage, setAssignmentMessage] = useState("");
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

  const handleExamClick = (examId: string) => {
    setSelectedExamId(examId);
    setStudentId(""); 
    setAssignmentMessage("");
  }

  const handleAssignClick = async () => {
    if (!selectedExamId) {
      setAssignmentMessage("Please select an exam first.");
      return;
    }
    if (!studentId) {
      setAssignmentMessage("Please enter a student ID.");
      return;
    }

    try{
      const response = await axios.post(`${ASSIGN_EXAM_URL}/${setName}/${selectedExamId}`,
        {
          studentId: studentId 
        },
        {
          headers: {authorization: `Bearer ${token}`}
        }
      )

      setAssignmentMessage(response.data.message || "Exam assigned successfully!");
      setSelectedExamId(null);
      setStudentId("");

    }catch(err){
      setError('Failed to Assign Exam!');
      console.error(err);
    }
  }

  return (
    
    <div className="mt-6 space-y-4 text-center">

    {error && <p>{error}</p>}
    {assignmentMessage && <p className={assignmentMessage.includes("Failed") ? "text-red-500" : "text-green-500"}>{assignmentMessage}</p>}
          
      {error && <p>{error}</p>}
      {exams.length === 0 ? (
        <p>No Exam Found</p>
      ) : (
        
        <ul className="text-blue-600 text-center m-2 mt-10">
          {exams.map((exam, index) => {
            const keyParts = exam.Key.split("/");
            const rawExamId = keyParts[3];
            const examName = keyParts[2];
            const examId = rawExamId.replace(".json", "");
            //console.log(keyParts);

            return (
              <li key={index} className="flex items-center justify-center space-x-4 mb-2">
                <button
                  className="py-2 px-4 text-purple-800 bg-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2 focus:ring-2 transition-colors duration-200 rounded-md"
                  onClick={() => handleExamClick(examId)}
                >
                  {examName}
                </button>
                {selectedExamId === examId && (
                  <>
                    <input
                      type="text"
                      placeholder="Enter Student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border-gray-300 rounded-md w-48 bg-white"
                    />
                    <button
                      className="py-2 px-4 text-white bg-green-500 hover:bg-green-700 focus:ring-green-500 focus:ring-offset-2 focus:ring-2 transition-colors duration-200 rounded-md"
                      onClick={handleAssignClick}
                    >
                      Assign
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AssignExamPage;
