'use client';
import Image from 'next/image';
import { useState } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album_art_url: string | null;
  net_votes: number;
  status: 'pending' | 'promoted' | 'rejected' | 'pushed';
  suggested_by: string;
  spotify_track_id: string;
}

interface VotingCardProps {
  song: Song;
  userVote: 1 | -1 | null;
  currentUserId: string;
  onVote: (songId: string, value: 1 | -1 | null) => Promise<void>;
}

export default function VotingCard({
  song,
  userVote,
  onVote,
}: VotingCardProps) {
  const [voting, setVoting] = useState(false);

  async function handleVote(value: 1 | -1) {
    if (voting) return;
    setVoting(true);
    // If clicking the same vote → remove it (toggle off)
    await onVote(song.id, userVote === value ? null : value);
    setVoting(false);
  }

  const isPromoted = song.status === 'promoted';

  return (
    <div
      className={[
        'group flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-300',
        isPromoted
          ? 'border-[#F5A623]/25 bg-[#F5A623]/6'
          : 'border-white/[0.07] bg-white/3 hover:border-white/12 hover:bg-white/5',
      ].join(' ')}
    >
      {/* Album art */}
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/6">
        {song.album_art_url ? (
          <Image
            src={song.album_art_url}
            width={44}
            height={44}
            alt={song.title}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-serif text-base text-white/20">♪</span>
          </div>
        )}
      </div>

      {/* Song info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-sans text-[13px] font-medium text-white/90">
            {song.title}
          </p>
          {isPromoted && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#F5A623]/30 bg-[#F5A623]/15 px-1.5 py-0.5">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path
                  d="M4 6V2M2 4L4 2L6 4"
                  stroke="#F5A623"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-sans text-[10px] font-medium tracking-wide text-[#F5A623]">
                HOT
              </span>
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate font-sans text-[12px] font-light text-white/35">
          {song.artist}
        </p>
      </div>

      {/* Vote controls */}
      <div className="flex shrink-0 items-center gap-1.5">
        {/* Upvote */}
        <button
          onClick={() => handleVote(1)}
          disabled={voting}
          className={[
            'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-40',
            userVote === 1
              ? 'bg-[#F5A623] text-[#0A0A0A]'
              : 'bg-white/5 text-white/40 hover:bg-[#F5A623]/20 hover:text-[#F5A623]',
          ].join(' ')}
        >
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M6 1L11 9H1L6 1Z" fill="currentColor" />
          </svg>
        </button>

        {/* Net vote count */}
        <span
          className={[
            'w-8 text-center font-serif text-[15px] leading-none transition-colors duration-200',
            song.net_votes > 0
              ? 'text-[#F5A623]'
              : song.net_votes < 0
                ? 'text-red-400/70'
                : 'text-white/40',
          ].join(' ')}
        >
          {song.net_votes > 0 ? `+${song.net_votes}` : song.net_votes}
        </span>

        {/* Downvote */}
        <button
          onClick={() => handleVote(-1)}
          disabled={voting}
          className={[
            'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-40',
            userVote === -1
              ? 'bg-red-500/80 text-white'
              : 'bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-400',
          ].join(' ')}
        >
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M6 9L1 1H11L6 9Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
