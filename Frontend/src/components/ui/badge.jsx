import React from 'react';

export function Badge({ children, variant = "default", className = "" }) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
  
  const variants = {
    default: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    destructive: "bg-red-100 text-red-800 hover:bg-red-200",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    success: "bg-green-100 text-green-800 hover:bg-green-200",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
  };
  
  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}