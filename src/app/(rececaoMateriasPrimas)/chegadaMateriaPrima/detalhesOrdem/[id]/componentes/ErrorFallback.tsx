import React from 'react';
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error?: Error | { message: string };
  onRetry: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <h3 className="text-lg font-semibold text-red-600 mb-2">
      Erro ao carregar dados
    </h3>
    <p className="text-gray-600 mb-4">
      {error?.message || "Ocorreu um erro inesperado"}
    </p>
    <Button onClick={onRetry} variant="outline">
      Tentar novamente
    </Button>
  </div>
);

export default ErrorFallback;