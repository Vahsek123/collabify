const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Generic authenticated fetch — all Spotify calls go through here
async function spotifyFetch<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: { message: res.statusText } }));
    throw new Error(
      `Spotify API error ${res.status}: ${error?.error?.message ?? 'Unknown error'}`,
    );
  }

  // 204 No Content responses (e.g. adding tracks) return no body
  if (res.status === 204) return {} as T;
  return res.json();
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  duration_ms: number;
  preview_url: string | null;
}

// Search tracks — called via your proxy API route, never from the browser directly
export async function searchTracks(
  query: string,
  accessToken: string,
  limit = 10,
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: String(limit),
  });
  const data = await spotifyFetch<{ tracks: { items: SpotifyTrack[] } }>(
    `/search?${params}`,
    accessToken,
  );
  return data.tracks.items;
}

// Create a playlist on the owner's Spotify account
export async function createPlaylist(
  spotifyUserId: string,
  name: string,
  accessToken: string,
): Promise<{ id: string; external_urls: { spotify: string } }> {
  return spotifyFetch(`/users/${spotifyUserId}/playlists`, accessToken, {
    method: 'POST',
    body: JSON.stringify({
      name,
      public: true,
      description: 'Created with Collabify 🎵',
    }),
  });
}

// Add tracks to playlist — accepts up to 100 URIs per call (Spotify limit)
export async function addTracksToPlaylist(
  playlistId: string,
  trackUris: string[], // format: "spotify:track:{id}"
  accessToken: string,
): Promise<void> {
  // Batch into chunks of 100 (Spotify hard limit)
  const chunks: string[][] = [];
  for (let i = 0; i < trackUris.length; i += 100) {
    chunks.push(trackUris.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    await spotifyFetch(`/playlists/${playlistId}/tracks`, accessToken, {
      method: 'POST',
      body: JSON.stringify({ uris: chunk }),
    });
  }
}
