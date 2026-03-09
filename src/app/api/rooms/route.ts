import { z } from 'zod';
import { getRouteSession } from '@/lib/dal';
import {
  created,
  handleRouteError,
  generateInviteCode,
  AppError,
} from '@/lib/api';

const CreateRoomSchema = z.object({
  name: z
    .string()
    .min(1, 'Room name is required.')
    .max(60, 'Room name must be 60 characters or fewer.')
    .transform((s) => s.trim()),

  voteThreshold: z
    .number()
    .int()
    .min(1, 'Vote threshold must be at least 1.')
    .max(20, 'Vote threshold cannot exceed 20.')
    .default(3),
});

export async function POST(request: Request) {
  try {
    // 1. Auth - redirects to /login if invalid; no session = no room
    const { user, supabase } = await getRouteSession();

    // 2. Parse + validate body
    const body = await request.json().catch(() => {
      throw new AppError('Invalid JSON body.', 400);
    });

    const { name, voteThreshold } = CreateRoomSchema.parse(body);

    // 3. Generate a unique invite code - retry once on the rare collision
    let inviteCode = generateInviteCode();

    const { data: existing } = await supabase
      .from('rooms')
      .select('id')
      .eq('invite_code', inviteCode)
      .maybeSingle();

    if (existing) {
      // Collision - generate a second code (probability of two collisions is negligible)
      inviteCode = generateInviteCode();
    }

    // 4. Insert room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        name,
        owner_id: user.id,
        invite_code: inviteCode,
        vote_threshold: voteThreshold,
        status: 'active',
      })
      .select('id, name, invite_code')
      .single();

    if (roomError || !room) {
      console.error('[POST /api/rooms] Insert error:', roomError);
      throw new AppError('Failed to create room. Please try again.', 500);
    }

    // 5. Add owner as the first room member
    // Done separately (not in the same insert) so the room exists before
    // the FK constraint on room_members is evaluated.
    const { error: memberError } = await supabase
      .from('room_members')
      .insert({ room_id: room.id, user_id: user.id });

    if (memberError) {
      // Room was created but membership failed — clean up to avoid orphaned rooms
      await supabase.from('rooms').delete().eq('id', room.id);
      console.error('[POST /api/rooms] Member insert error:', memberError);
      throw new AppError(
        'Failed to set up room membership. Please try again.',
        500,
      );
    }

    // 6. Return only what the client needs - no DB internals
    return created({
      id: room.id,
      inviteCode: room.invite_code,
      name: room.name,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
