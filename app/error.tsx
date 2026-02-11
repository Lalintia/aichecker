'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps): React.ReactElement {
  useEffect(() => {
    // Log to error tracking service
    console.error('ErrorBoundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center px-4">
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        
        <h2 className="text-xl font-bold text-rose-900 mb-2">
          Something went wrong
        </h2>
        
        <p className="text-rose-700 mb-4">
          We encountered an unexpected error. Please try again.
        </p>
        
        {error.digest && (
          <p className="text-xs text-rose-500 mb-4">
            Error ID: {error.digest}
          </p>
        )}
        
        <button
          onClick={reset}
          className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
