/**
 * app/api/songs/route.ts
 *
 * POST /api/songs
 * Suggests a track to a room. The user must be a member.
 * Duplicate suggestions within the same room are rejected at the DB level
 * (unique constraint on room_id + spotify_track_id).
 *
 * Request body:
 *   {
 *     roomId:         string,
 *     spotifyTrackId: string,
 *     title:          string,
 *     artist:         string,
 *     albumArtUrl?:   string,
 *     previewUrl?:    string,
 *     durationMs?:    number,
 *   }
 *
 * Response 201:
 *   { id: string, title: string, artist: string, netVotes: number }
 *
 * Response 4xx:
 *   { error: string }
 */

import { z } from 'zod';
import { getRouteSession } from '@/lib/dal';
import { created, handleRouteError, AppError } from '@/lib/api';

const SuggestSongSchema = z.object({
  roomId: z.uuid('Invalid room ID.'),

  spotifyTrackId: z.string().min(1, 'Spotify track ID is required.').max(64),

  title: z
    .string()
    .min(1, 'Title is required.')
    .max(200)
    .transform((s) => s.trim()),

  artist: z
    .string()
    .min(1, 'Artist is required.')
    .max(200)
    .transform((s) => s.trim()),

  albumArtUrl: z.url().nullable().optional(),
  previewUrl: z.url().nullable().optional(),
  durationMs: z.number().int().positive().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getRouteSession();

    const body = await request.json().catch(() => {
      throw new AppError('Invalid JSON body.', 400);
    });

    const {
      roomId,
      spotifyTrackId,
      title,
      artist,
      albumArtUrl,
      previewUrl,
      durationMs,
    } = SuggestSongSchema.parse(body);

    // 1. Verify room exists and is active
    const { data: room } = await supabase
      .from('rooms')
      .select('id, status')
      .eq('id', roomId)
      .single();

    if (!room) throw new AppError('Room not found.', 404);
    if (room.status !== 'active')
      throw new AppError('This room is closed.', 410);

    // 2. Verify user is a member
    const { data: membership } = await supabase
      .from('room_members')
      .select('user_id')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership)
      throw new AppError('You are not a member of this room.', 403);

    // 3. Insert song — unique(room_id, spotify_track_id) will reject duplicates
    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        room_id: roomId,
        suggested_by: user.id,
        spotify_track_id: spotifyTrackId,
        title,
        artist,
        album_art_url: albumArtUrl ?? null,
        preview_url: previewUrl ?? null,
        duration_ms: durationMs ?? null,
        status: 'pending',
        net_votes: 0,
      })
      .select('id, title, artist, net_votes')
      .single();

    if (songError) {
      // Postgres unique violation — song already suggested in this room
      if (songError.code === '23505') {
        throw new AppError(
          'This song has already been suggested in this room.',
          409,
        );
      }
      console.error('[POST /api/songs] Insert error:', songError);
      throw new AppError('Failed to suggest song. Please try again.', 500);
    }

    return created({
      id: song.id,
      title: song.title,
      artist: song.artist,
      netVotes: song.net_votes,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
