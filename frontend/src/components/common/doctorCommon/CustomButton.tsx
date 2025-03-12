import React from "react";

interface CustomButtonProps {
  children: React.ReactNode;
  variant?: "solid" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  variant = "solid",
  size = "md",
  className = "",
  onClick,
  disabled = false,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors rounded-md focus:outline-none";
  const variantClasses = {
    solid: "bg-red-600 text-white hover:bg-red-700",
    outline: "bg-white border hover:bg-gray-50",
  };
  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default CustomButton;
