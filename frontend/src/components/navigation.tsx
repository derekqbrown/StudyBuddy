import { Link, useNavigate } from "react-router-dom";

const LoggedInNavbar = () => {
  const navigate = useNavigate();
  let token = localStorage.getItem("token");
  if (!token) {
    return <></>;
  } else {
    return (
      <nav className="bg-gray-100 py-2">
        <ul className="list-none p-0 m-0 flex justify-around items-center">
          <li className="mx-4">
            <Link
              to="/chat"
              className="text-gray-700 hover:text-blue-500 text-lg"
            >
              Chat
            </Link>
          </li>
          <li className="mx-4">
            <Link
              to="/generateFlashcards"
              className="text-gray-700 hover:text-blue-500 text-lg"
            >
              Flashcards
            </Link>
          </li>
          <li className="mx-4">
            <Link
              to="/assign-exam"
              className="text-gray-700 hover:text-blue-500 text-lg"
            >
              Exams
            </Link>
          </li>
          <li className="mx-4">
            <Link
              to="/profile"
              className="text-gray-700 hover:text-blue-500 text-lg"
            >
              Profile
            </Link>
          </li>
          <li className="mx-4">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    );
  }
};

export default LoggedInNavbar;
