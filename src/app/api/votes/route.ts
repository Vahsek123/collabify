/**
 * app/api/votes/route.ts
 *
 * POST /api/votes
 * Casts, updates, or removes a vote on a song.
 * The DB trigger handles net_votes recalculation and status promotion.
 *
 * value: 1   → upvote
 * value: -1  → downvote
 * value: null → remove existing vote
 *
 * Idempotent — casting the same vote twice is a no-op (not an error).
 *
 * Request body:
 *   { songId: string, value: 1 | -1 | null }
 *
 * Response 200:
 *   { songId: string, value: 1 | -1 | null, netVotes: number }
 *
 * Response 4xx:
 *   { error: string }
 */

import { z } from 'zod';
import { getRouteSession } from '@/lib/dal';
import { ok, handleRouteError, AppError } from '@/lib/api';

const VoteSchema = z.object({
  songId: z.uuid('Invalid song ID.'),
  // value is 1, -1, or null (null = remove vote)
  value: z.union([z.literal(1), z.literal(-1), z.null()]),
});

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getRouteSession();

    const body = await request.json().catch(() => {
      throw new AppError('Invalid JSON body.', 400);
    });

    const { songId, value } = VoteSchema.parse(body);

    // 1. Verify the song exists and the user is a member of its room
    const { data: song } = await supabase
      .from('songs')
      .select('id, room_id, status, net_votes')
      .eq('id', songId)
      .single();

    if (!song) throw new AppError('Song not found.', 404);

    // Songs that have been pushed or rejected can no longer be voted on
    if (['pushed', 'rejected'].includes(song.status)) {
      throw new AppError('This song can no longer be voted on.', 409);
    }

    const { data: membership } = await supabase
      .from('room_members')
      .select('user_id')
      .eq('room_id', song.room_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership)
      throw new AppError('You are not a member of this room.', 403);

    // 2. Remove vote case
    if (value === null) {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('song_id', songId)
        .eq('user_id', user.id);

      if (error) {
        console.error('[POST /api/votes] Delete error:', error);
        throw new AppError('Failed to remove vote.', 500);
      }

      // Fetch updated net_votes after the trigger has run
      const { data: updated } = await supabase
        .from('songs')
        .select('net_votes')
        .eq('id', songId)
        .single();

      return ok({
        songId,
        value: null,
        netVotes: updated?.net_votes ?? song.net_votes,
      });
    }

    // 3. Upsert vote — handles both new votes and vote changes in one query.
    // The PRIMARY KEY (song_id, user_id) on the votes table means a second
    // vote from the same user updates rather than errors.
    const { error: upsertError } = await supabase
      .from('votes')
      .upsert(
        { song_id: songId, user_id: user.id, value },
        { onConflict: 'song_id,user_id' },
      );

    if (upsertError) {
      console.error('[POST /api/votes] Upsert error:', upsertError);
      throw new AppError('Failed to cast vote.', 500);
    }

    // Fetch updated net_votes after the DB trigger has recalculated
    const { data: updated } = await supabase
      .from('songs')
      .select('net_votes')
      .eq('id', songId)
      .single();

    return ok({
      songId,
      value,
      netVotes: updated?.net_votes ?? song.net_votes,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
