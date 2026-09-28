import React from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { useGoogleRating } from '../hooks/useGoogleRating';

export function GoogleMarkIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.27-2.09 3.675-5.17 3.675-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.24C.45 8.18 0 9.94 0 12s.45 3.82 1.24 5.39l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.61l4.03 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

interface GoogleRatingBadgeProps {
  propertyId: 'gangtok' | 'kalyani';
  isNight?: boolean;
  fallbackMapUrl?: string;
  variant?: 'header' | 'section';
}

export const GoogleRatingBadge: React.FC<GoogleRatingBadgeProps> = ({
  propertyId,
  isNight = false,
  fallbackMapUrl,
  variant = 'header'
}) => {
  const { data, loading, error } = useGoogleRating(propertyId);

  // If loading, show a small subtle loading placeholder as requested
  if (loading) {
    if (variant === 'section') {
      return (
        <div className="flex items-center gap-2 text-xs opacity-60 animate-pulse">
          <GoogleMarkIcon className="w-3.5 h-3.5 opacity-50" />
          <div className="w-32 h-3 rounded bg-slate-300 dark:bg-slate-700" />
        </div>
      );
    }

    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs animate-pulse ${
          isNight
            ? 'bg-slate-900/60 border-slate-800 text-slate-400'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}
        aria-busy="true"
        aria-label="Loading verified Google rating"
      >
        <GoogleMarkIcon className="w-3.5 h-3.5 opacity-60" />
        <div className="w-28 h-3 rounded bg-slate-300 dark:bg-slate-700" />
      </div>
    );
  }

  // If function is unavailable, key is missing, or request fails: completely hide the row!
  if (error || !data) {
    return null;
  }

  const mapLink = data.googleMapsUri || fallbackMapUrl;
  const ratingFormatted = data.rating.toFixed(1);
  const reviewsCountFormatted = data.userRatingCount.toLocaleString();

  if (variant === 'section') {
    return (
      <div
        className={`flex items-center gap-2 text-xs flex-wrap ${
          isNight ? 'text-slate-300' : 'text-slate-700'
        }`}
      >
        <GoogleMarkIcon className="w-4 h-4 shrink-0" />
        <span className={`font-semibold ${isNight ? 'text-white' : 'text-slate-900'}`}>
          {ratingFormatted} / 5.0
        </span>
        <span className="text-slate-400">·</span>
        <span>Based on {reviewsCountFormatted} Google Reviews</span>
        {mapLink && (
          <>
            <span className="text-slate-400">·</span>
            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:underline font-medium"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </>
        )}
      </div>
    );
  }

  // Default: 'header' variant
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold flex-wrap transition-colors ${
        isNight
          ? 'bg-slate-900/90 border-slate-800 text-slate-200'
          : 'bg-white border-slate-200 text-slate-800 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <GoogleMarkIcon className="w-4 h-4 shrink-0" />
        <span className="text-amber-400 font-mono font-bold flex items-center gap-0.5">
          {ratingFormatted} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        </span>
        <span className="text-[11px] text-slate-400">
          · {reviewsCountFormatted} reviews on Google
        </span>
      </div>

      {mapLink && (
        <a
          href={mapLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-blue-500 dark:text-blue-400 hover:underline ml-1"
          title="View verified listing on Google Maps"
        >
          <span>View on Google Maps</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
        </a>
      )}
    </div>
  );
};
