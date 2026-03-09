/**
 * app/room/[code]/layout.tsx
 *
 * Verifies:
 * 1. User is authenticated (via verifySession)
 * 2. Room exists and is active
 * 3. User is a member — if not, auto-joins before rendering
 */

import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import { createClient } from '@/lib/supabase/server';

export default async function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await verifySession();
  const supabase = await createClient();

  // Verify room exists and is active
  const { data: room } = await supabase
    .from('rooms')
    .select('id, status')
    .eq('invite_code', code.toUpperCase())
    .single();

  if (!room) redirect('/dashboard?error=room_not_found');
  if (room.status !== 'active') redirect('/dashboard?error=room_closed');

  // Auto-join if not already a member — handles direct link navigation
  const { data: membership } = await supabase
    .from('room_members')
    .select('user_id')
    .eq('room_id', room.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    const { error } = await supabase
      .from('room_members')
      .insert({ room_id: room.id, user_id: user.id });

    if (error) redirect('/dashboard?error=join_failed');
  }

  return children;
}
