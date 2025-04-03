// src/components/ErrorFallback.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-100">
      <div className="bg-red-600 p-8 rounded-lg shadow-lg text-center max-w-md">
        <h1 className="text-white text-3xl font-bold mb-4">Something went wrong</h1>
        <p className="text-white mb-4">
          {error?.message || "An unexpected error occurred. Please try again later."}
        </p>
        <button
          className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;
