import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Question {
  id: string;
  question: string;
  options: string[];
}

interface Exam {
  examId: string;
  questions: Question[];
  examSetName: string;
}

const EXAM_BASE_URL = `${BASE_URL}/exams`;

const TakeExam: React.FC = () => {
  const { examId, examSetName } = useParams<{
    examId: string;
    examSetName: string;
  }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(60 * 60); // 60 minutes default
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  if(!token) {
      return <Navigate to="/login"/>;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ""}${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.post(
          `${EXAM_BASE_URL}/take/${examId}`,
          { examSetName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setExam({
          examId: examId!,
          questions: res.data.exam.map((q: any, index: number) => ({
            id: String(index),
            question: q.question,
            options: q.answers.map((a: any) => a.text),
          })),
          examSetName: examSetName!,
        });
      } catch (err) {
        console.error("Error fetching exam", err);
      }
    };

    if (examId && examSetName) fetchExam();
  }, [examId, examSetName]);

  const handleAnswerChange = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    if (!exam || isSubmitting || isSubmitted) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${EXAM_BASE_URL}/score`,
        { setId: exam.examId, examSetName, answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScore(res.data.score);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error submitting exam", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exam)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">
            Preparing your exam...
          </p>
        </div>
      </div>
    );

  const currentQuestion = exam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;
  const progressPercentage =
    ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const answeredPercentage =
    (Object.keys(answers).length / exam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {exam.examSetName}
                </h1>
                <p className="text-blue-100 mt-1">
                  Question {currentQuestionIndex + 1} of {exam.questions.length}
                </p>
              </div>
              <div
                className={`mt-3 sm:mt-0 text-xl font-semibold ${
                  timeRemaining < 300
                    ? "text-red-300 animate-pulse"
                    : "text-blue-600"
                }`}
              >
                ⏱️ {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          <div className="p-4 border-b">
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Exam Progress</span>
                <span>
                  {currentQuestionIndex + 1}/{exam.questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Questions Answered</span>
                <span>
                  {Object.keys(answers).length}/{exam.questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${answeredPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-wrap gap-2">
            {exam.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                  ${
                    currentQuestionIndex === index
                      ? "bg-blue-600 text-white"
                      : answers[String(index)]
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-start p-4 rounded-lg border transition-all cursor-pointer
                    ${
                      answers[currentQuestion.id] === opt
                        ? "border-blue-500 bg-blue-50 shadow-inner"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={opt}
                      checked={answers[currentQuestion.id] === opt}
                      onChange={() =>
                        handleAnswerChange(currentQuestion.id, opt)
                      }
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <span className="ml-3 text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            ← Previous
          </button>

          {isLastQuestion ? (
            <button
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors
                ${
                  isSubmitting || isSubmitted
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              onClick={handleSubmit}
              disabled={isSubmitting || isSubmitted}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : isSubmitted ? (
                "Submitted"
              ) : (
                "Submit Exam"
              )}
            </button>
          ) : (
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {score !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {(() => {
              const total = exam.questions.length;
              const percentage = Math.round((score / total) * 100);
              const passed = percentage >= 70;

              return (
                <>
                  <div
                    className={`p-6 text-white ${
                      passed ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    <h2 className="text-2xl font-bold text-center">
                      Exam Results
                    </h2>
                  </div>
                  <div className="p-6 text-center">
                    <div className="mx-auto w-32 h-32 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                      <span
                        className={`text-4xl font-bold ${
                          passed ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <p className="text-lg mb-2">
                      {passed
                        ? "🎉 Congratulations! You passed!"
                        : "📝 Keep practicing!"}
                    </p>
                    <p className="text-gray-600 mb-6">
                      {passed
                        ? "You have successfully completed the exam."
                        : "You can retake the exam to improve your score."}
                    </p>
                    <button
                      onClick={() => navigate(`/view-exam-set`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                    >
                      Back to Exams
                      
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeExam;
