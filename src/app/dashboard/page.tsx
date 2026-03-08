import Link from 'next/link';
import { verifySession } from '@/lib/dal';
import { createClient } from '@/lib/supabase/server';
import DashboardActions from '@/components/dashboard/DashboardActions';
import SignOutButton from '@/components/dashboard/SignOutButton';
import Image from 'next/image';
import '@/styles/dashboard.css';
import { RoomRow } from '@/types/dashboard';
import RoomCard from '@/components/dashboard/RoomCard';
import EmptyDisplay from '@/components/dashboard/EmptyDisplay';
import Section from '@/components/dashboard/Section';

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  // Fetch rooms where user is a member (covers both owned and joined)
  // along with aggregate counts. Two queries — clean and readable.
  const [roomsRes, songsRes] = await Promise.all([
    supabase
      .from('rooms')
      .select(
        `
        id,
        name,
        invite_code,
        status,
        vote_threshold,
        created_at,
        owner_id,
        room_members!inner ( user_id )
      `,
      )
      .eq('room_members.user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),

    // Song counts per room in one query — avoids N+1
    supabase
      .from('songs')
      .select('room_id, status')
      .in('status', ['pending', 'promoted']),
  ]);

  const rooms = roomsRes.data ?? [];
  const songs = songsRes.data ?? [];

  // Build a lookup: roomId → { pending, promoted }
  const songCounts: Record<string, { pending: number; promoted: number }> = {};
  for (const song of songs) {
    if (!songCounts[song.room_id]) {
      songCounts[song.room_id] = { pending: 0, promoted: 0 };
    }
    if (song.status === 'pending') songCounts[song.room_id].pending++;
    if (song.status === 'promoted') songCounts[song.room_id].promoted++;
  }

  // Member counts per room
  const roomIds = rooms.map((r) => r.id);
  const { data: memberData } = await supabase
    .from('room_members')
    .select('room_id')
    .in('room_id', roomIds);

  const memberCounts: Record<string, number> = {};
  for (const m of memberData ?? []) {
    memberCounts[m.room_id] = (memberCounts[m.room_id] ?? 0) + 1;
  }

  // Merge into a clean shape
  const enriched: RoomRow[] = rooms.map((room) => ({
    id: room.id,
    name: room.name,
    invite_code: room.invite_code,
    status: room.status,
    vote_threshold: room.vote_threshold,
    created_at: room.created_at ?? '',
    owner_id: room.owner_id,
    memberCount: memberCounts[room.id] ?? 0,
    pendingSongs: songCounts[room.id]?.pending ?? 0,
    promotedSongs: songCounts[room.id]?.promoted ?? 0,
  }));

  return {
    owned: enriched.filter((r) => r.owner_id === userId),
    joined: enriched.filter((r) => r.owner_id !== userId),
  };
}

export default async function DashboardPage() {
  // verifySession() already ran in layout — this call is de-duped by React cache().
  // We call it again here to get the typed user object for the greeting.
  const user = await verifySession();
  const { owned, joined } = await getDashboardData(user.id);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const firstName = user.displayName.split(' ')[0];
  const roomCount = owned.length + joined.length;

  return (
    <>
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-52 -right-24 z-0 h-175 w-175 bg-[radial-gradient(circle,rgba(245,166,35,0.07)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-72 -left-48 z-0 h-200 w-200 bg-[radial-gradient(circle,rgba(126,184,164,0.05)_0%,transparent_70%)]" />

      {/* Nav */}
      <nav className="top-0 z-20 border-b border-white/6">
        <div className="mx-auto flex h-14 items-center justify-between px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 font-serif text-[18px] tracking-[-0.02em] text-[#F5F0E8] transition-opacity duration-200 hover:opacity-70"
          >
            <span className="text-[#F5A623]">♪</span> Collabify
          </Link>

          {/* User + sign out */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5A623]/20">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  width={28}
                  height={28}
                  alt={user.displayName}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-serif text-[10px] text-[#F5A623]">
                    {user.displayName[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-275 px-8 pt-12 pb-20">
        {/* Page header */}
        <div className="animate-fade-up mb-10">
          <h1 className="mb-2 font-serif text-[36px] leading-tight tracking-[-0.03em] text-[#F5F0E8] sm:text-[44px]">
            {greeting},{' '}
            <em className="text-[#F5A623] not-italic">{firstName}.</em>
          </h1>
          <p className="font-sans text-[15px] font-light text-white/35">
            {roomCount === 0
              ? 'Create your first room to get started.'
              : `You have ${roomCount} active ${roomCount === 1 ? 'room' : 'rooms'}.`}
          </p>
        </div>

        {/* Action bar */}
        <div className="animate-fade-up mb-12 delay-1">
          <DashboardActions />
        </div>

        {/* Divider */}
        <div className="mb-10 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.07)_30%,rgba(255,255,255,0.07)_70%,transparent)]" />

        {/* Rooms */}
        <div className="animate-fade-up space-y-10 delay-2">
          {/* Owned rooms */}
          <Section title="Your rooms" count={owned.length}>
            {owned.length === 0 ? (
              <EmptyDisplay message="You haven't created any rooms yet. Start one above." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {owned.map((room) => (
                  <RoomCard key={room.id} room={room} isOwner={true} />
                ))}
              </div>
            )}
          </Section>

          {/* Joined rooms */}
          {joined.length > 0 && (
            <Section title="Joined rooms" count={joined.length}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {joined.map((room) => (
                  <RoomCard key={room.id} room={room} isOwner={false} />
                ))}
              </div>
            </Section>
          )}
        </div>
      </main>
    </>
  );
}
