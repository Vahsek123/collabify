import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';
import { AppError } from './api';
import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  spotifyId: string;
};

export const verifySession = cache(async (): Promise<SessionUser> => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch the extended profile from our profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('spotify_id, display_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    // Profile missing, auth is valid but data is incomplete,
    // sign out and force re-login to re-trigger the profile trigger
    await supabase.auth.signOut();
    redirect('/login?error=profile_missing');
  }

  return {
    id: user.id,
    email: user.email!,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    spotifyId: profile.spotify_id,
  };
});

export async function getRouteSession(): Promise<{
  user: SessionUser;
  supabase: SupabaseClient<Database>;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AppError('Unauthorized.', 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('spotify_id, display_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new AppError('Profile not found.', 401);
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      spotifyId: profile.spotify_id,
    },
    supabase,
  };
}
