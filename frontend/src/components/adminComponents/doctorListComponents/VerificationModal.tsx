import React, { useState } from "react";
import { Doctor } from "../../../types/admin/doctorListTypes";

interface VerificationModalProps {
  doctor: Doctor;
  certificates: string[];
  currentCertIndex: number;
  onCertChange: (index: number) => void;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  showRejectInput: boolean;
  rejectionReason: string;
  onRejectionReasonChange: (value: string) => void;
  onClose: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  doctor,
  certificates,
  currentCertIndex,
  onCertChange,
  onApprove,
  onReject,
  showRejectInput,
  rejectionReason,
  onRejectionReasonChange,
  onClose,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove();
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject();
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-lg shadow-2xl z-50 w-full max-w-3xl transition-all duration-300">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-white text-xl font-bold">
              Verify Doctor Documents
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-500 p-2 rounded transition-colors"
            title="Close"
          >
            &times;
          </button>
        </div>
        <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">
            Dr. {doctor.name || "Unknown"}
          </h3>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            Document {currentCertIndex + 1} of {certificates.length}
          </span>
        </div>
        <div className="p-4 md:p-6">
          <div className="mb-4">
            {certificates.length > 0 ? (
              <div className="relative overflow-hidden rounded-lg border border-gray-300 shadow-inner">
                <iframe
                  src={certificates[currentCertIndex]}
                  title={`Certificate ${currentCertIndex + 1}`}
                  className="w-full bg-gray-50 transition-all duration-300"
                  style={{ height: "350px" }}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
                {certificates.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    <button
                      onClick={() =>
                        onCertChange(
                          (currentCertIndex - 1 + certificates.length) %
                            certificates.length
                        )
                      }
                      className="bg-gray-700 bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-full transition"
                      title="Previous Certificate"
                    >
                      &#8249;
                    </button>
                    <button
                      onClick={() =>
                        onCertChange((currentCertIndex + 1) % certificates.length)
                      }
                      className="bg-gray-700 bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-full transition"
                      title="Next Certificate"
                    >
                      &#8250;
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-72 bg-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-500">No Certificates Available</span>
              </div>
            )}
          </div>
          {showRejectInput && (
            <div className="mt-4">
              <p className="mb-1 text-sm font-semibold text-gray-700">
                Reason for rejection:
              </p>
              <textarea
                className="w-full p-3 bg-green-100 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 outline-none"
                rows={3}
                placeholder="Specify the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => onRejectionReasonChange(e.target.value)}
                disabled={isRejecting}
              />
            </div>
          )}
          <div className="flex flex-col-reverse sm:flex-row justify-between mt-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
              disabled={isApproving || isRejecting}
            >
              Cancel
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handleReject}
                disabled={isApproving || isRejecting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium shadow-sm transition-all duration-200 disabled:opacity-70"
              >
                {isRejecting
                  ? "Rejecting..."
                  : showRejectInput
                  ? "Confirm Rejection"
                  : "Reject"}
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium shadow-sm transition-all duration-200 disabled:opacity-70"
              >
                {isApproving ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
