import { Loader2 } from 'lucide-react';

export default function Loading(): React.ReactElement {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
          role="status"
          aria-label="Loading page content"
        >
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" aria-hidden="true" />
        </div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}
