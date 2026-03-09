import { createClient, createServiceClient } from '@/lib/supabase/server';

interface RefreshedTokens {
  accessToken: string;
}

// Refresh the Spotify access token using the stored refresh token.
// Call this in any API route that uses Spotify before making API calls.
export async function getValidSpotifyToken(): Promise<RefreshedTokens> {
  const supabase = await createClient();

  // Retrieve stored tokens from Supabase Auth
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error('User not found');

  const { data: token } = await supabase
    .from('user_tokens')
    .select(
      'spotify_access_token, spotify_refresh_token, spotify_token_expires_at',
    )
    .eq('user_id', user.id)
    .single();

  const providerToken = token?.spotify_access_token;
  const refreshToken = token?.spotify_refresh_token;
  const expiresAt = token?.spotify_token_expires_at;

  if (!refreshToken)
    throw new Error('No Spotify refresh token — user must re-authenticate');

  // If token is still valid (with 60s buffer), return it as-is
  if (
    providerToken &&
    expiresAt &&
    Date.now() < new Date(expiresAt).valueOf() - 60_000
  ) {
    return {
      accessToken: providerToken,
    };
  }

  // Token expired — refresh it
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
    }),
  });

  if (!res.ok)
    throw new Error(
      'Failed to refresh Spotify token — user must re-authenticate',
    );

  const tokens = await res.json();
  const newExpiresAt = new Date(
    Date.now() + tokens.expires_in * 1000,
  ).toISOString();

  const newAccessToken = tokens.access_token;
  if (typeof newAccessToken === 'string') {
    try {
      const service = createServiceClient();

      const { error: upsertError } = await service.from('user_tokens').upsert({
        user_id: user.id,
        spotify_access_token: newAccessToken,
        spotify_refresh_token: tokens.refresh_token ?? refreshToken,
        spotify_token_expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      });

      if (upsertError) {
        // Log but don't gate the login on this. The user is authenticated.
        // getValidSpotifyToken() will fail on the first Spotify API call and
        // surface a clear "please re-authenticate" message at that point.
        console.error(
          '[auth/callback] Token upsert failed:',
          upsertError.message,
        );
      }
    } catch (err) {
      console.log(err);
    }
  }

  return { accessToken: tokens.access_token };
}
