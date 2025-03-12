import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("Error GIF URL:", assets.error);
  }, []);
  

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center overflow-hidden rounded-2xl relative"
      style={{
        backgroundImage: `url(${assets.error})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay with reduced opacity for testing */}
      <div className="absolute inset-0 bg-green-100 bg-opacity-40"></div>
      
      <div 
        className={`relative z-10 text-center p-8 rounded-full bg-white bg-opacity-90 shadow-2xl transform transition-all duration-500 border-4 border-green-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        style={{
          width: "450px",
          height: "450px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <h1 className="text-6xl font-extrabold mb-6 text-red-600">
          <span className="inline-block animate-bounce mr-2">4</span>
          <span className="inline-block animate-bounce delay-75 mr-2">0</span>
          <span className="inline-block animate-bounce delay-150">4</span>
        </h1>
        
        <div className="w-16 h-1 bg-red-600 mx-auto mb-6 rounded-full"></div>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Oops! Page Not Found</h2>
        
        <p className="mb-8 text-gray-600 max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg"
        >
          Back to Home
        </button>

        {/* Decorative blinking balls */}
        <div className="absolute top-8 right-8 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute top-8 left-8 w-6 h-6 bg-green-500 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-8 right-8 w-6 h-6 bg-green-500 rounded-full animate-pulse delay-150"></div>
        <div className="absolute bottom-8 left-8 w-6 h-6 bg-red-500 rounded-full animate-pulse delay-450"></div>
      </div>
      
      {/* More decorative elements */}
      <div className="absolute bottom-10 left-10 w-20 h-20 bg-red-400 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute top-10 right-10 w-16 h-16 bg-green-400 rounded-full opacity-30 animate-pulse delay-150"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-red-300 rounded-full opacity-30 animate-pulse delay-300"></div>
    </div>
  );
};

export default NotFound;
