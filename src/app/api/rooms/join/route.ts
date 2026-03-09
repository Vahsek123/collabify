import { z } from 'zod';
import { getRouteSession } from '@/lib/dal';
import { ok, handleRouteError, AppError } from '@/lib/api';

const JoinRoomSchema = z.object({
  inviteCode: z
    .string()
    .min(1, 'Invite code is required.')
    .max(8)
    .transform((s) => s.trim().toUpperCase()),
});

export async function POST(request: Request) {
  try {
    // 1. Auth
    const { user, supabase } = await getRouteSession();

    // 2. Validate body
    const body = await request.json().catch(() => {
      throw new AppError('Invalid JSON body.', 400);
    });

    const { inviteCode } = JoinRoomSchema.parse(body);

    // 3. Look up the room - include owner_id so we can show context if needed
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, name, status, owner_id')
      .eq('invite_code', inviteCode)
      .maybeSingle();

    if (roomError) {
      console.error('[POST /api/rooms/join] Lookup error:', roomError);
      throw new AppError('Failed to look up room. Please try again.', 500);
    }

    // 4. Room not found - deliberately vague to prevent invite code enumeration
    if (!room) {
      throw new AppError(
        'Invalid invite code. Double-check and try again.',
        404,
      );
    }

    // 5. Room is closed
    if (room.status !== 'active') {
      throw new AppError('This room has been closed by its owner.', 410);
    }

    // 6. Check existing membership - idempotent: already a member is a success, not an error
    const { data: existing } = await supabase
      .from('room_members')
      .select('user_id')
      .eq('room_id', room.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // Already a member - return success so the client can navigate to the room
      return ok({
        inviteCode,
        roomName: room.name,
        alreadyMember: true,
      });
    }

    // 7. Insert membership
    const { error: insertError } = await supabase
      .from('room_members')
      .insert({ room_id: room.id, user_id: user.id });

    if (insertError) {
      console.error('[POST /api/rooms/join] Insert error:', insertError);
      throw new AppError('Failed to join room. Please try again.', 500);
    }

    return ok({
      inviteCode,
      roomName: room.name,
      alreadyMember: false,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
