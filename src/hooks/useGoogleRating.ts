import { useState, useEffect } from 'react';

export interface GoogleRatingData {
  rating: number;
  userRatingCount: number;
  googleMapsUri?: string;
}

export function useGoogleRating(propertyId: 'gangtok' | 'kalyani') {
  const [data, setData] = useState<GoogleRatingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
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
            googleMapsUri: json.googleMapsUri || undefined
          });
          setError(false);
        } else {
          setData(null);
          setError(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setData(null);
          setError(true);
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
