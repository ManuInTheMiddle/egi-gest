"use client";
import React from "react";

interface ErrorDisplayProps {
  error: string | null;
  title?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title = "Erro",
}) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <strong>{title}:</strong> {error}
    </div>
  );
};

export default ErrorDisplay;
