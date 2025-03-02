import React, { useState, useEffect, useRef } from 'react';
import { assets } from '../../assets/assets';
import HealingAnimation from '../common/userCommon/HealingAnimation';

interface SuccessPageProps {
  transactionId: string;
  amount: string;
  date: string;
  patientName: string;
  email: string;
  address: string;
  doctorName?: string;
  appointmentTime?: string;
  onBackToHome: () => void;
  healioLogo?: string;
}

const SuccessPage: React.FC<SuccessPageProps> = ({
  transactionId,
  amount,
  date,
  patientName,
  email,
  address,
  doctorName,
  appointmentTime,
  onBackToHome,
  healioLogo
}) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const animationRef = useRef<{ triggerBurst?: () => void }>(null);

  // Set animation complete after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

 

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden">
      {/* Background overlay with blending effects */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-emerald-900/10 mix-blend-screen" />
        <div className="absolute inset-0 backdrop-blur-sm opacity-30" />
      </div>

      <div className="relative w-full max-w-lg">
        <HealingAnimation 
          ref={animationRef}
          isActive={animationComplete} 
        />
        
        {/* Success card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-500 transform scale-100 z-30 relative">
          {/* Header section */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20 mix-blend-lighten">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    width: `${20 + i * 15}px`,
                    height: `${20 + i * 15}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)`,
                    filter: `blur(${5 + i * 2}px)`
                  }}
                />
              ))}
            </div>

            {/* Logo and checkmark */}
            <div className="flex justify-center mb-4 bg-white bg-opacity-20 px-4 py-2 rounded-lg backdrop-blur-sm">
              {healioLogo ? (
                <img 
                  src={assets.logo} 
                  alt="Healio Logo" 
                  className="h-12 w-auto filter drop-shadow-lg"
                />
              ) : (
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="text-white font-bold text-xl tracking-wide filter drop-shadow-lg">
                    HEALIO
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-center mb-4">
              <div 
                className={`w-16 h-16 rounded-full bg-white flex items-center justify-center transition-all duration-1000 ${
                  animationComplete ? 'scale-100' : 'scale-0'
                } hover:scale-110 cursor-pointer`}
                onMouseEnter={() => animationRef.current?.triggerBurst?.()}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-green-800 transition-transform hover:rotate-12"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-1 filter drop-shadow-md">
              Booking Confirmed!
            </h2>
            <p className="text-center text-white/90 text-sm">
              Your appointment has been successfully booked
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Appointment Details - Primary focus */}
            <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-lg p-5 text-white shadow-md relative overflow-hidden">
              {/* Add subtle "healing" glow effect in the background */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-1 bg-green-400 opacity-10"></div>
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute rounded-full bg-green-300" 
                    style={{
                      width: 30 + i * 20,
                      height: 30 + i * 20,
                      top: 20 + i * 10,
                      right: 20 + i * 5,
                      opacity: 0.07,
                      filter: `blur(${5 + i * 3}px)`,
                    }}
                  />
                ))}
              </div>
              
              <h3 className="font-bold text-lg mb-3 flex items-center relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Appointment Details
              </h3>
              <div className="grid grid-cols-2 gap-3 relative z-10">
                {doctorName && (
                  <div>
                    <p className="text-xs text-green-100">Doctor</p>
                    <p className="font-medium">Dr. {doctorName}</p>
                  </div>
                )}
                {appointmentTime && (
                  <div>
                    <p className="text-xs text-green-100">Time</p>
                    <p className="font-medium">{appointmentTime}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-green-100">Patient</p>
                  <p className="font-medium">{patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-green-100">Date</p>
                  <p className="font-medium">{date}</p>
                </div>
              </div>
            </div>
            
            {/* Payment Info - Secondary importance */}
            <div className="bg-green-100 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-green-900">
                <div>
                  <p className="text-xs text-green-600">Amount Paid</p>
                  <p className="font-medium">{amount}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600">Transaction ID</p>
                  <p className="font-medium text-xs truncate">{transactionId}</p>
                </div>
              </div>
            </div>
            
            {/* Contact Information - kept minimal */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Contact Information
              </h3>
              <div className="text-sm text-gray-600">
                <p>{email}</p>
                <p className="truncate">{address}</p>
              </div>
            </div>
            
            {/* Info note */}
            <div className="text-center text-sm text-gray-500 mb-2">
              A confirmation email has been sent with all details
            </div>
            
            {/* CTA Button */}
            <button
              onClick={onBackToHome}
              className="w-full py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 shadow-md"
            >
              BACK TO HOME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;