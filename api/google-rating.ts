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
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  // Parse requested property from query string or URL
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const propertyParam = (parsedUrl.searchParams.get('property') || (req.query && req.query.property)) as string | undefined;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'GOOGLE_PLACES_API_KEY is not configured on the server' }));
    return;
  }

  const prop = (propertyParam || '').toLowerCase();
  let placeId = '';

  if (prop === 'gangtok' || prop === 'trikuta') {
    placeId = process.env.PLACE_ID_TRIKUTA || '';
  } else if (prop === 'kalyani' || prop === 'parijaye' || prop === 'hotel-parijaye') {
    placeId = process.env.PLACE_ID_PARIJAYE || '';
  }

  // Allow explicit placeId query override if provided
  const directPlaceId = parsedUrl.searchParams.get('placeId') || (req.query && (req.query.placeId as string));
  if (directPlaceId) {
    placeId = directPlaceId;
  }

  if (!placeId) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: `Missing Place ID for property "${propertyParam}". Ensure PLACE_ID_TRIKUTA and PLACE_ID_PARIJAYE are set.`
    }));
    return;
  }

  try {
    // Places API (New) Place Details endpoint
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
      const errBody = await googleRes.text();
      res.statusCode = googleRes.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Failed to retrieve place details from Google Places API (New)',
        status: googleRes.status,
        details: errBody
      }));
      return;
    }

    const data = await googleRes.json();

    // Cache-Control: 1 hour HTTP cache as per requirement
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=3600, stale-while-revalidate=1800');
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      rating: typeof data.rating === 'number' ? data.rating : null,
      userRatingCount: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
      googleMapsUri: typeof data.googleMapsUri === 'string' ? data.googleMapsUri : null
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error while fetching Google rating', message }));
  }
}
