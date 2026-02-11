'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/features/checker/hero-section';
import { ResultsView } from '@/components/features/results/results-view';
import type { CheckResponse } from '@/lib/types/checker';

export default function HomePage(): React.ReactElement {
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = (data: CheckResponse): void => {
    setResult(data);
    setError(null);
  };

  const handleError = (err: string): void => {
    setError(err);
    setResult(null);
  };

  const handleReset = (): void => {
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      <div id="main-content">
        {!result && !error && (
          <HeroSection onSuccess={handleSuccess} onError={handleError} />
        )}

        {error && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
              <h2 className="text-rose-700 font-semibold text-lg mb-2">Error</h2>
              <p className="text-rose-600 mb-4">{error}</p>
              <button
                onClick={handleReset}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {result && (
          <ResultsView result={result} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}
