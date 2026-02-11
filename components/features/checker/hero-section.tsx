import { CheckCircle, Search, Zap } from 'lucide-react';
import { UrlForm } from './url-form';
import type { CheckResponse } from '@/lib/types/checker';

interface HeroSectionProps {
  readonly onSuccess: (data: CheckResponse) => void;
  readonly onError: (error: string) => void;
}

export function HeroSection({ onSuccess, onError }: HeroSectionProps): React.ReactElement {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8" aria-label="Hero Section">
      <div className="max-w-3xl mx-auto text-center">
        {/* Title - H1 */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight pt-8">
          Check your website for{' '}
          <span className="text-blue-600">AI Search</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          Analyze 10 key factors that help AI search engines understand and index your website better.
        </p>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 max-w-xl mx-auto">
          <UrlForm onSuccess={onSuccess} onError={onError} />
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-400">
          <TrustIndicator icon={<CheckCircle className="w-5 h-5" />} label="Free Analysis" />
          <TrustIndicator icon={<Zap className="w-5 h-5" />} label="10 Key Factors" />
          <TrustIndicator icon={<Search className="w-5 h-5" />} label="Instant Results" />
        </div>
      </div>
    </section>
  );
}

interface TrustIndicatorProps {
  readonly icon: React.ReactNode;
  readonly label: string;
}

function TrustIndicator({ icon, label }: TrustIndicatorProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span>{label}</span>
    </div>
  );
}
