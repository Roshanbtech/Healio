import React from "react";
import Draggable from "react-draggable";
import { assets } from "../../../assets/assets";
import { Doctor } from "../../../types/admin/doctorListTypes";

interface InfoModalProps {
  doctor: Doctor;
  currentCertIndex: number;
  onCertChange: (index: number) => void;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({
  doctor,
  currentCertIndex,
  onCertChange,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <Draggable handle=".modal-header">
        <div
          className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all duration-300"
          style={{ animation: "popIn 0.3s ease-out" }}
        >
          <div className="modal-header cursor-move flex justify-between items-center bg-red-600 p-3 rounded-t-lg">
            <h2 className="text-white text-lg font-bold">Doctor Information</h2>
            <button
              onClick={onClose}
              className="text-white text-2xl leading-none focus:outline-none hover:bg-red-700 px-2 rounded"
              title="Close"
            >
              &times;
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative flex-shrink-0">
                <img
                  src={doctor.image || assets.doc11}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-md"
                />
                <div
                  className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
                    !doctor.isBlocked ? "bg-green-500" : "bg-red-500"
                  }`}
                  title={!doctor.isBlocked ? "Active" : "Blocked"}
                ></div>
              </div>
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="flex items-center space-x-3">
                      <span className="text-xl font-bold text-green-700">{doctor.name}</span>
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          doctor.docStatus === "approved"
                            ? "bg-green-100 text-green-800"
                            : doctor.docStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {doctor.docStatus}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{doctor.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-4">
                  <p className="text-sm">
                    <span className="font-semibold text-green-700">Phone:</span> {doctor.phone || "N/A"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-green-700">Speciality:</span> {doctor.speciality?.name || "N/A"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-green-700">Experience:</span> {doctor.experience || "N/A"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-green-700">Hospital:</span> {doctor.hospital || "N/A"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-green-700">Degree:</span> {doctor.degree || "N/A"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-green-700">Country:</span> {doctor.country || "N/A"}
                  </p>
                </div>
                {doctor.achievements && (
                  <div className="mt-3">
                    <p className="text-sm">
                      <span className="font-semibold text-green-700">Achievements:</span> {doctor.achievements}
                    </p>
                  </div>
                )}
                {doctor.docStatus === "rejected" && doctor.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm">
                      <span className="font-semibold text-red-600">Rejection Reason:</span> {doctor.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-md font-bold text-green-700 mb-3">Certificates</h3>
              {doctor.certificate && doctor.certificate.length > 0 ? (
                <div
                  className="relative overflow-hidden border border-gray-300 rounded-lg shadow-md bg-gray-100"
                  style={{ height: "350px" }}
                >
                  <div className="overflow-auto h-full">
                    <iframe
                      src={doctor.certificate[currentCertIndex]}
                      title={`Certificate ${currentCertIndex + 1}`}
                      className="w-full border-0"
                      style={{ height: "500px" }}
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                  {doctor.certificate.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                      <button
                        onClick={() =>
                          onCertChange((currentCertIndex - 1 + doctor.certificate!.length) % doctor.certificate!.length)
                        }
                        className="bg-gray-700 bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-full transition"
                        title="Previous Certificate"
                      >
                        &#8249;
                      </button>
                      <span className="bg-gray-700 bg-opacity-70 text-white text-xs px-3 py-2 rounded-full">
                        {currentCertIndex + 1} / {doctor.certificate.length}
                      </span>
                      <button
                        onClick={() => onCertChange((currentCertIndex + 1) % doctor.certificate!.length)}
                        className="bg-gray-700 bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-full transition"
                        title="Next Certificate"
                      >
                        &#8250;
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border border-gray-200">
                  <span className="text-gray-500">No Certificates Available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default InfoModal;
