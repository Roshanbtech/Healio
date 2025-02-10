import React from "react";

interface ToggleButtonProps {
  isBlocked: boolean;
  onClick: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isBlocked, onClick }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={!isBlocked} onChange={onClick} />
      <div
        className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 
        rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:border-gray-300 
        after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"
      ></div>
    </label>
  );
};

export default ToggleButton;