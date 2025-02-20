import React from "react";
import { useNavigate } from "react-router-dom";

interface ErrorPageProps {
  error?: Error;
}

const Error: React.FC<ErrorPageProps> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="bg-red-600 p-8 rounded-lg shadow-lg text-center max-w-md">
        <h1 className="text-white text-3xl font-bold mb-4">Oops!</h1>
        <p className="text-white mb-4">
          {error?.message || "Something went wrong. Please try again later."}
        </p>
        <button
          className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Error;
