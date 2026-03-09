'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import VotingCard from './VotingCard';
import SongSearch from './SongSearch';
import PromotedQueue from './PromotedQueue';
import '@/styles/room.css';
import { Room, Song, Member, CurrentUser } from '@/types/room';
import MemberAvatars from './MemberAvatars';
import CopyCode from './CopyCode';

interface RoomClientProps {
  room: Room;
  initialSongs: Song[];
  initialUserVotes: Record<string, 1 | -1>;
  initialMembers: Member[];
  currentUser: CurrentUser;
}

export default function RoomClient({
  room,
  initialSongs,
  initialUserVotes,
  initialMembers,
  currentUser,
}: RoomClientProps) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [userVotes, setUserVotes] =
    useState<Record<string, 1 | -1>>(initialUserVotes);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(
    room.spotifyPlaylistUrl,
  );

  const isOwner = currentUser.id === room.ownerId;

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'songs',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newSong = payload.new as Song;
            // Only show pending/promoted songs in the queue
            if (['pending', 'promoted'].includes(newSong.status)) {
              setSongs((prev) => {
                // Avoid duplicates if server component already included it
                if (prev.find((s) => s.id === newSong.id)) return prev;
                return [...prev, newSong].sort(
                  (a, b) =>
                    b.net_votes - a.net_votes ||
                    new Date(a.created_at).getTime() -
                      new Date(b.created_at).getTime(),
                );
              });
            }
          }

          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Song;
            setSongs((prev) => {
              // Remove from queue if pushed or rejected
              if (['pushed', 'rejected'].includes(updated.status)) {
                return prev.filter((s) => s.id !== updated.id);
              }
              return prev
                .map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
                .sort(
                  (a, b) =>
                    b.net_votes - a.net_votes ||
                    new Date(a.created_at).getTime() -
                      new Date(b.created_at).getTime(),
                );
            });
          }

          if (payload.eventType === 'DELETE') {
            setSongs((prev) =>
              prev.filter((s) => {
                return (
                  (payload.old as Song).room_id === room.id &&
                  s.id !== (payload.old as Song).id
                );
              }),
            );
          }
        },
      )
      // Also watch for new members joining
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_members',
          filter: `room_id=eq.${room.id}`,
        },
        async (payload) => {
          const supabaseInner = createClient();
          const { data: profile } = await supabaseInner
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          if (profile) {
            setMembers((prev) => {
              if (prev.find((m) => m.userId === payload.new.user_id))
                return prev;
              return [
                ...prev,
                {
                  userId: payload.new.user_id,
                  joinedAt: payload.new.joined_at,
                  displayName: profile.display_name,
                  avatarUrl: profile.avatar_url,
                },
              ];
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleVote = useCallback(
    async (songId: string, value: 1 | -1 | null) => {
      // Optimistic update
      const previousVote = userVotes[songId] ?? null;

      setUserVotes((prev) => {
        const next = { ...prev };
        if (value === null) delete next[songId];
        else next[songId] = value;
        return next;
      });

      // Optimistically adjust net_votes in local state
      setSongs((prev) =>
        prev.map((s) => {
          if (s.id !== songId) return s;
          let delta = 0;
          if (previousVote !== null) delta -= previousVote; // remove old vote
          if (value !== null) delta += value; // add new vote
          return { ...s, net_votes: s.net_votes + delta };
        }),
      );

      try {
        const res = await fetch('/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId, value }),
        });

        if (!res.ok) throw new Error('Vote failed');
      } catch {
        // Revert optimistic update on failure
        setUserVotes((prev) => {
          const next = { ...prev };
          if (previousVote === null) delete next[songId];
          else next[songId] = previousVote;
          return next;
        });
        setSongs((prev) =>
          prev.map((s) => {
            if (s.id !== songId) return s;
            let delta = 0;
            if (value !== null) delta -= value;
            if (previousVote !== null) delta += previousVote;
            return { ...s, net_votes: s.net_votes + delta };
          }),
        );
      }
    },
    [userVotes],
  );

  const pendingSongs = songs.filter((s) => s.status === 'pending');
  const promotedSongs = songs.filter((s) => s.status === 'promoted');

  return (
    <>
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-52 -right-24 z-0 h-175 w-175 bg-[radial-gradient(circle,rgba(245,166,35,0.07)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-72 -left-48 z-0 h-200 w-200 bg-[radial-gradient(circle,rgba(126,184,164,0.05)_0%,transparent_70%)]" />

      {/*  Nav  */}
      <nav className="top-0 z-20 border-b border-white/6">
        <div className="mx-auto flex h-14 items-center justify-between gap-4 px-6">
          {/* Left: back + room name */}
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/30 transition-all duration-150 hover:bg-white/6 hover:text-white/70"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9 1L3 7L9 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <div className="min-w-0">
              <h1 className="truncate font-serif text-[17px] leading-tight tracking-[-0.02em] text-[#F5F0E8]">
                {room.name}
              </h1>
            </div>
          </div>

          {/* Right: members + code */}
          <div className="flex shrink-0 items-center gap-4">
            <div className="hidden sm:block">
              <MemberAvatars members={members} />
            </div>
            <CopyCode code={room.inviteCode} />
          </div>
        </div>
      </nav>

      {/* Main layout */}
      <main className="relative z-10 mx-auto max-w-300 px-6 pt-8 pb-20">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/*  Left: voting queue */}
          <div className="animate-fade-up min-w-0 flex-1">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-sans text-[12px] font-medium tracking-widest text-white/25 uppercase">
                Song queue
              </h2>
              {songs.length > 0 && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.07] font-sans text-[11px] font-medium text-white/40">
                  {songs.length}
                </span>
              )}
            </div>

            {songs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.07] px-6 py-20 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/4">
                  <span className="font-serif text-xl text-white/20">♪</span>
                </div>
                <p className="max-w-45 font-sans text-[13px] leading-relaxed font-light text-white/25">
                  No songs yet. Search for a track and suggest it.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Promoted songs first */}
                {promotedSongs.map((song) => (
                  <VotingCard
                    key={song.id}
                    song={song}
                    userVote={userVotes[song.id] ?? null}
                    currentUserId={currentUser.id}
                    onVote={handleVote}
                  />
                ))}

                {/* Divider between promoted and pending */}
                {promotedSongs.length > 0 && pendingSongs.length > 0 && (
                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-white/6" />
                    <span className="font-sans text-[11px] font-light tracking-[0.08em] text-white/20 uppercase">
                      Pending
                    </span>
                    <div className="h-px flex-1 bg-white/6" />
                  </div>
                )}

                {/* Pending songs */}
                {pendingSongs.map((song) => (
                  <VotingCard
                    key={song.id}
                    song={song}
                    userVote={userVotes[song.id] ?? null}
                    currentUserId={currentUser.id}
                    onVote={handleVote}
                  />
                ))}
              </div>
            )}
          </div>

          {/*  Right: sidebar  */}
          <div className="animate-fade-up flex w-full shrink-0 flex-col gap-4 delay-1 lg:w-85">
            {/* Search */}
            <div>
              <h2 className="mb-3 font-sans text-[12px] font-medium tracking-widest text-white/25 uppercase">
                Suggest a song
              </h2>
              <SongSearch
                roomId={room.id}
                onSuggested={() => {}} // Realtime handles the queue update
              />
            </div>

            {/* Owner-only: promoted queue */}
            {isOwner && (
              <div className="animate-fade-up delay-2">
                <h2 className="mb-3 font-sans text-[12px] font-medium tracking-widest text-white/25 uppercase">
                  Ready to push
                  <span className="ml-1.5 font-light tracking-normal text-white/20 normal-case">
                    · {room.voteThreshold}+ votes
                  </span>
                </h2>
                <PromotedQueue
                  roomId={room.id}
                  songs={promotedSongs}
                  playlistUrl={playlistUrl}
                  onPushed={() => {
                    // Realtime will update the song statuses.
                    // Refresh playlist URL if it was just created.
                    fetch(`/api/rooms/${room.id}/playlist`)
                      .then((r) => r.json())
                      .then((d) => d.url && setPlaylistUrl(d.url))
                      .catch(() => {});
                  }}
                />
              </div>
            )}

            {/* Room info */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-4">
              <h2 className="mb-3 font-sans text-[12px] font-medium tracking-widest text-white/25 uppercase">
                Room info
              </h2>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[12px] font-light text-white/30">
                    Host
                  </span>
                  <span className="font-sans text-[12px] font-normal text-white/60">
                    {room.ownerName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[12px] font-light text-white/30">
                    Vote threshold
                  </span>
                  <span className="font-sans text-[12px] font-normal text-[#F5A623]">
                    +{room.voteThreshold}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[12px] font-light text-white/30">
                    Members
                  </span>
                  <span className="font-sans text-[12px] font-normal text-white/60">
                    {members.length}
                  </span>
                </div>
              </div>

              {/* Mobile member avatars */}
              <div className="mt-4 border-t border-white/6 pt-3.5 sm:hidden">
                <MemberAvatars members={members} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
