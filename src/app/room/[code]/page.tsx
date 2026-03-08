/**
 * app/room/[code]/page.tsx
 *
 * Server component — fetches all initial room data before paint.
 * Passes a fully-hydrated snapshot to RoomClient, which takes over
 * with Supabase Realtime for live updates.
 */

import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import { createClient } from '@/lib/supabase/server';
import RoomClient from '@/components/room/RoomClient';

export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await verifySession();
  const supabase = await createClient();

  // Room + owner profile
  const { data: room } = await supabase
    .from('rooms')
    .select(
      `
      id, name, invite_code, status,
      vote_threshold, owner_id, created_at,
      spotify_playlist_id, spotify_playlist_url,
      profiles!rooms_owner_id_fkey (
        display_name, avatar_url
      )
    `,
    )
    .eq('invite_code', code.toUpperCase())
    .single();

  if (!room) redirect('/dashboard?error=room_not_found');

  // Songs with vote counts, ordered by net_votes desc
  const { data: songs } = await supabase
    .from('songs')
    .select('*')
    .eq('room_id', room.id)
    .in('status', ['pending', 'promoted'])
    .order('net_votes', { ascending: false })
    .order('created_at', { ascending: true });

  // All votes in this room (for current user's vote state)
  const { data: votes } = await supabase
    .from('votes')
    .select('song_id, value')
    .eq('user_id', user.id)
    .in(
      'song_id',
      (songs ?? []).map((s) => s.id),
    );

  // Members with profiles
  const { data: members } = await supabase
    .from('room_members')
    .select(
      'user_id, joined_at, profiles!room_members_user_id_fkey(display_name, avatar_url)',
    )
    .eq('room_id', room.id);

  // Build user vote map: songId → 1 | -1
  const userVotes: Record<string, 1 | -1> = {};
  for (const vote of votes ?? []) {
    userVotes[vote.song_id] = vote.value as 1 | -1;
  }

  return (
    <RoomClient
      room={{
        id: room.id,
        name: room.name,
        inviteCode: room.invite_code,
        status: room.status as 'active' | 'closed',
        voteThreshold: room.vote_threshold,
        ownerId: room.owner_id,
        spotifyPlaylistId: room.spotify_playlist_id,
        spotifyPlaylistUrl: room.spotify_playlist_url,
        ownerName: (room.profiles as any)?.display_name ?? 'Owner',
      }}
      initialSongs={songs ?? []}
      initialUserVotes={userVotes}
      initialMembers={(members ?? []).map((m) => ({
        userId: m.user_id,
        joinedAt: m.joined_at,
        displayName: (m.profiles as any)?.display_name ?? 'Member',
        avatarUrl: (m.profiles as any)?.avatar_url ?? null,
      }))}
      currentUser={{
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      }}
    />
  );
}
