import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');

  // Spotify OAuth was denied by user
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabase = await createClient();
  const { data: sessionData, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  const { session } = sessionData;

  if (exchangeError || !session) {
    console.error('Auth exchange error:', exchangeError);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  if (session.provider_token && session.provider_refresh_token) {
    try {
      const service = createServiceClient();

      // Spotify issues 3600-second access tokens. We derive the absolute
      // expiry from now rather than trusting a field that isn't returned.
      const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

      const { error: upsertError } = await service.from('user_tokens').upsert(
        {
          user_id: session.user.id,
          spotify_access_token: session.provider_token,
          spotify_refresh_token: session.provider_refresh_token,
          spotify_token_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

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
      console.error('[auth/callback] Token persistence exception:', err);
    }
  } else {
    // This can happen if the Spotify OAuth scopes didn't trigger a consent
    // screen (re-login without full re-consent). Log so it's debuggable.
    console.warn(
      '[auth/callback] provider_token or provider_refresh_token missing from session. ' +
        'User may need to re-authorise with Spotify to grant full access.',
    );
  }

  // Successful auth — redirect to intended destination
  return NextResponse.redirect(`${origin}${next}`);
}
