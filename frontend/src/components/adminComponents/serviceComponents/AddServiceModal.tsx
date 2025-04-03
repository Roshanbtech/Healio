import React, { useState } from "react";

interface AddServiceModalProps {
    newService: { name: string };
    errorMessage: string;
    onNewServiceChange: (value: string) => void;
    onClose: () => void;
    onAdd: () => void;
  }
  

const AddServiceModal: React.FC<AddServiceModalProps> = ({
  newService,
  onNewServiceChange,
  onClose,
  onAdd,
}) => {
  const [error, setError] = useState<string>("");

  const validateAndAdd = () => {
    const name = newService.name;
    if (!name.trim()) {
      setError("Service name cannot be empty.");
      return;
    }
    if (/\s/.test(name)) {
      setError("Service name must not contain spaces.");
      return;
    }
    if (/[^A-Za-z]/.test(name)) {
      setError("Service name must contain only letters.");
      return;
    }
    if (name.length > 20) {
      setError("Service name cannot exceed 20 characters.");
      return;
    }
    // Clear error and add service.
    setError("");
    onAdd();
  };

  const inputClassName = `w-full bg-green-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
    error
      ? "border-red-500 focus:ring-red-500"
      : newService.name.trim() !== ""
      ? "border-green-500 focus:ring-green-500"
      : "border-gray-300 focus:ring-green-500"
  }`;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-96">
        <div className="bg-red-600 rounded-t-lg p-4">
          <h2 className="text-lg font-semibold text-white text-center">
            Add Service
          </h2>
        </div>
        <div className="p-6 space-y-3">
          <input
            type="text"
            placeholder="Service Name"
            value={newService.name}
            onChange={(e) => onNewServiceChange(e.target.value)}
            className={inputClassName}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={validateAndAdd}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;
