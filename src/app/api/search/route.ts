/**
 * app/api/search/route.ts
 *
 * GET /api/search?q={query}&limit={limit}
 *
 * Proxies Spotify track search server-side — client credentials
 * never touch the browser. Includes a lightweight in-memory cache
 * to avoid hammering Spotify when multiple room members search
 * the same term simultaneously.
 *
 * Response 200:
 *   { tracks: SpotifyTrack[] }
 *
 * Response 4xx/5xx:
 *   { error: string }
 */

import { NextRequest } from 'next/server';
import { getRouteSession } from '@/lib/dal';
import { getValidSpotifyToken } from '@/lib/spotify/token';
import { searchTracks } from '@/lib/spotify/api';
import { ok, err, handleRouteError, AppError } from '@/lib/api';

// ─── In-memory cache ──────────────────────────────────────────────────────────
// Keyed by "query:limit". TTL of 5 minutes is appropriate — search results
// don't change meaningfully within a session.
// This lives in module scope so it persists across requests in the same
// serverless function instance. On Vercel, instances are reused within a
// deployment, so this provides a meaningful cache hit rate in practice.

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: ReturnType<typeof normaliseTrack>[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

// Normalise Spotify's verbose track shape to what the UI actually needs
function normaliseTrack(track: {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number }[] };
  duration_ms: number;
  preview_url: string | null;
}) {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map((a) => a.name).join(', '),
    // Prefer the middle-size image (index 1) — large enough to look good,
    // small enough not to bloat the response payload
    albumArt: track.album.images[1]?.url ?? track.album.images[0]?.url ?? null,
    previewUrl: track.preview_url,
    durationMs: track.duration_ms,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await getRouteSession();

    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '8', 10), 20);

    if (!q) return err("Query parameter 'q' is required.", 400);
    if (q.length < 1) return err('Query too short.', 400);

    const cacheKey = `${q.toLowerCase()}:${limit}`;
    const cached = cache.get(cacheKey);

    // Return cached result if still fresh
    if (cached && Date.now() < cached.expiresAt) {
      return ok({ tracks: cached.data, cached: true });
    }

    // Get a valid Spotify access token for this user — handles refresh automatically
    const { accessToken } = await getValidSpotifyToken();

    const rawTracks = await searchTracks(q, accessToken, limit);
    const tracks = rawTracks.map(normaliseTrack);

    // Prune stale entries lazily (avoid unbounded cache growth in long-lived instances)
    if (cache.size > 500) {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now >= entry.expiresAt) cache.delete(key);
      }
    }

    cache.set(cacheKey, { data: tracks, expiresAt: Date.now() + CACHE_TTL_MS });

    return ok({ tracks, cached: false });
  } catch (error) {
    return handleRouteError(error);
  }
}
