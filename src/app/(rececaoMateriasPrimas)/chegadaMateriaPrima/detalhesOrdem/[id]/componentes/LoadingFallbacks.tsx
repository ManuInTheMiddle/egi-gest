import React from 'react';
import { Rings } from "react-loader-spinner";

interface LoadingFallbackProps {
  message?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "A carregar..." 
}) => (
  <div className="flex items-center justify-center p-8">
    <Rings visible height="40" width="40" color="#84CC27" />
    <span className="ml-2">{message}</span>
  </div>
);

export default LoadingFallback;