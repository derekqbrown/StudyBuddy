import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

const ALL_EXAM_SETS_URL = "http://localhost:3000/exams";

function AssignExamPage() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const { setName } = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not logged in!");
      return;
    }

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
    <div>
      {error && <p>{error}</p>}
      {exams.length === 0 ? (
        <p>No Exam Found</p>
      ) : (
        <ul>
          {exams.map((exam, index) => {
            const keyParts = exam.Key.split("/");
            const rawExamId = keyParts[3];
            const examId = rawExamId.replace(".json", "");

            return (
              <li key={index}>
                <Link to={`/exams/take/${examId}/${setName}`}>
                  Take Exam: {examId}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AssignExamPage;
