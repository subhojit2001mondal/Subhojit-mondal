import { useState, useEffect } from 'react';

export interface GoogleRatingData {
  rating: number;
  userRatingCount: number;
  googleMapsUri?: string;
}

export const VERIFIED_GOOGLE_RATINGS: Record<'gangtok' | 'kalyani', GoogleRatingData> = {
  gangtok: {
    rating: 5.0,
    userRatingCount: 6,
    googleMapsUri: 'https://maps.google.com/?cid=13784680675009851466&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA'
  },
  kalyani: {
    rating: 3.3,
    userRatingCount: 6,
    googleMapsUri: 'https://maps.google.com/?cid=4758636424907637716&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA'
  }
};

export function useGoogleRating(propertyId: 'gangtok' | 'kalyani') {
  const [data, setData] = useState<GoogleRatingData>(VERIFIED_GOOGLE_RATINGS[propertyId]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setData(VERIFIED_GOOGLE_RATINGS[propertyId]);
    setError(false);

    const controller = new AbortController();

    fetch(`/api/google-rating?property=${encodeURIComponent(propertyId)}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (!isMounted) return;
        if (
          json &&
          typeof json.rating === 'number' &&
          typeof json.userRatingCount === 'number' &&
          json.userRatingCount > 0
        ) {
          setData({
            rating: json.rating,
            userRatingCount: json.userRatingCount,
            googleMapsUri: json.googleMapsUri || VERIFIED_GOOGLE_RATINGS[propertyId].googleMapsUri
          });
          setError(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          // Keep the verified static rating as graceful fallback
          setData(VERIFIED_GOOGLE_RATINGS[propertyId]);
          setError(false);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [propertyId]);

  return { data, loading, error };
}
