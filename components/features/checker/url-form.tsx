'use client';

import { useState } from 'react';
import { AlertCircle, Search, Loader2 } from 'lucide-react';
import type { CheckResponse } from '@/lib/types/checker';

interface UrlFormProps {
  readonly onSuccess: (data: CheckResponse) => void;
  readonly onError: (error: string) => void;
}

export function UrlForm({ onSuccess, onError }: UrlFormProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clientError, setClientError] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setClientError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const url = formData.get('url') as string;

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const result: CheckResponse = await response.json();
      onSuccess(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setClientError(message);
      onError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Website Analysis Form">
      <div className="text-left">
        <label htmlFor="website-url" className="block text-gray-700 text-sm font-medium mb-2">
          Website URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="website-url"
            name="url"
            type="text"
            placeholder="www.example.com"
            autoComplete="url"
            required
            className={`w-full bg-gray-50 border rounded-xl pl-11 pr-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
              clientError ? 'border-rose-300 bg-rose-50/50' : 'border-gray-200'
            }`}
            aria-required="true"
            aria-invalid={clientError ? 'true' : 'false'}
            aria-describedby={clientError ? 'url-error' : undefined}
          />
        </div>
        {clientError && (
          <div id="url-error" className="flex items-center gap-2 mt-2 text-rose-600 text-sm" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>{clientError}</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-md hover:shadow-lg"
        aria-label={isLoading ? 'Analyzing website...' : 'Analyze Website'}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Search className="h-5 w-5" />
            <span>Analyze Website</span>
          </>
        )}
      </button>
    </form>
  );
}
