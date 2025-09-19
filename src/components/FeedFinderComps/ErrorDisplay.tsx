import React from "react";

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-ctp-red-900/20 border border-ctp-red-500/50 p-6 text-center animate-fade-in">
      <h2 className="text-xl font-semibold text-ctp-red-300 mb-2">
        An Error Occurred
      </h2>
      <p className="text-ctp-red-300/80">{message}</p>
    </div>
  );
};
