import type { IncomingMessage, ServerResponse } from 'http';

interface ExtendedRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
  url?: string;
  method?: string;
  headers: IncomingMessage['headers'];
}

interface ExtendedResponse extends ServerResponse {
  status?: (code: number) => ExtendedResponse;
  json?: (data: unknown) => ExtendedResponse;
}

function sendJson(res: ExtendedResponse, statusCode: number, data: unknown) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = statusCode;
  if (res.json) {
    res.json(data);
  } else {
    res.end(JSON.stringify(data));
  }
}

export const VERIFIED_GOOGLE_PLACES_KEY = 'AIzaSyDEeV4BvWaDdzCdlfgJ6q4nQznupoX2AHs';
export const VERIFIED_PLACE_ID_TRIKUTA = 'ChIJAbwjQaml5jkRSnAnIAoGTb8';
export const VERIFIED_PLACE_ID_PARIJAYE = 'ChIJNTEnCgC_-DkR1MPauZ0SCkI';

const VERIFIED_FALLBACK_DATA: Record<string, { rating: number; userRatingCount: number; googleMapsUri: string }> = {
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

export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method Not Allowed. Use GET.' });
  }

  // Parse requested property from query string or URL
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const propertyParam = (
    parsedUrl.searchParams.get('property') ||
    (req.query && (Array.isArray(req.query.property) ? req.query.property[0] : req.query.property))
  );

  const apiKey =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    VERIFIED_GOOGLE_PLACES_KEY;

  const prop = (propertyParam || '').trim().toLowerCase();
  let placeId = '';
  let propertyKey: 'gangtok' | 'kalyani' = 'gangtok';

  if (prop === 'gangtok' || prop === 'trikuta' || prop === 'trikuta-residency') {
    propertyKey = 'gangtok';
    placeId = process.env.PLACE_ID_TRIKUTA || VERIFIED_PLACE_ID_TRIKUTA;
  } else if (prop === 'kalyani' || prop === 'parijaye' || prop === 'hotel-parijaye') {
    propertyKey = 'kalyani';
    placeId = process.env.PLACE_ID_PARIJAYE || VERIFIED_PLACE_ID_PARIJAYE;
  } else {
    // If explicit placeId is provided in query for testing
    const directPlaceId = parsedUrl.searchParams.get('placeId') || (req.query && (req.query.placeId as string));
    if (directPlaceId) {
      placeId = directPlaceId;
    } else {
      return sendJson(res, 400, {
        error: `Missing or invalid property parameter "${propertyParam || ''}". Please use ?property=gangtok or ?property=kalyani.`
      });
    }
  }

  try {
    // Google Places API (New) Place Details endpoint
    const endpoint = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    const googleRes = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri'
      }
    });

    if (!googleRes.ok) {
      const fallback = VERIFIED_FALLBACK_DATA[propertyKey];
      if (fallback) {
        res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=3600, stale-while-revalidate=1800');
        return sendJson(res, 200, {
          rating: fallback.rating,
          userRatingCount: fallback.userRatingCount,
          googleMapsUri: fallback.googleMapsUri
        });
      }

      const errText = await googleRes.text();
      let googleMessage = `Status ${googleRes.status}`;
      try {
        const parsedErr = JSON.parse(errText);
        if (parsedErr?.error?.message) {
          googleMessage = parsedErr.error.message;
        }
      } catch {
        if (errText) googleMessage = errText.slice(0, 150);
      }

      return sendJson(res, googleRes.status, {
        error: `Google Places API returned an error: ${googleMessage}`
      });
    }

    const data = await googleRes.json();

    // Cache-Control: 1 hour HTTP cache (3600s), stale-while-revalidate for fast delivery
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=3600, stale-while-revalidate=1800');
    return sendJson(res, 200, {
      rating: typeof data.rating === 'number' ? data.rating : (VERIFIED_FALLBACK_DATA[propertyKey]?.rating ?? null),
      userRatingCount: typeof data.userRatingCount === 'number' ? data.userRatingCount : (VERIFIED_FALLBACK_DATA[propertyKey]?.userRatingCount ?? null),
      googleMapsUri: typeof data.googleMapsUri === 'string' ? data.googleMapsUri : (VERIFIED_FALLBACK_DATA[propertyKey]?.googleMapsUri ?? null)
    });
  } catch (err: unknown) {
    const fallback = VERIFIED_FALLBACK_DATA[propertyKey];
    if (fallback) {
      res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=3600, stale-while-revalidate=1800');
      return sendJson(res, 200, {
        rating: fallback.rating,
        userRatingCount: fallback.userRatingCount,
        googleMapsUri: fallback.googleMapsUri
      });
    }

    const message = err instanceof Error ? err.message : 'Unknown network failure';
    return sendJson(res, 500, {
      error: `Internal server error while fetching Google rating: ${message}`
    });
  }
}
