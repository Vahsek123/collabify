'use client';

import { useState, useRef, useEffect } from 'react';
import SongCard from './SongCard';

const INITIAL_SONGS = [
  {
    id: 1,
    title: 'Adventure of a Lifetime',
    artist: 'Coldplay',
    votes: 14,
    cover: '/images/album1.jpg',
    colour: 'outline-[#F5A623]',
  },
  {
    id: 2,
    title: 'Good Days',
    artist: 'SZA',
    votes: 11,
    cover: '/images/album2.jpg',
    colour: 'outline-[#7EB8A4]',
  },
  {
    id: 3,
    title: "Hollywood's Bleeding",
    artist: 'Post Malone',
    votes: 9,
    cover: '/images/album3.jpg',
    colour: 'outline-[#C084FC]',
  },
  {
    id: 4,
    title: 'I Wanna Be Yours',
    artist: 'Arctic Monkeys',
    votes: 7,
    cover: '/images/album4.jpg',
    colour: 'outline-[#60A5FA]',
  },
];

const VOTE_SEQUENCE = [
  [1, 1],
  [1, 1],
  [3, 1],
  [2, -1],
  [1, 1],
  [0, 1],
  [3, 1],
  [1, 1],
  [2, 1],
  [3, 1],
];

export default function VotingDisplay() {
  const [songs, setSongs] = useState(INITIAL_SONGS);
  const [activeSongId, setActiveSongId] = useState(0);
  const stepRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const [songIdx, delta] =
        VOTE_SEQUENCE[stepRef.current % VOTE_SEQUENCE.length];
      stepRef.current++;

      setSongs((prev) => {
        const next = prev.map((s, i) =>
          i === songIdx ? { ...s, votes: s.votes + delta } : s,
        );
        return [...next].sort((a, b) => b.votes - a.votes);
      });

      setActiveSongId(INITIAL_SONGS[songIdx].id);
      setTimeout(() => setActiveSongId(0), 600);
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-85 rounded-4xl border border-white/9 bg-white/3 p-5 shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl">
      {/* Mockup header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-sans text-[13px] font-medium text-white/85">
            Friday Night 🎉
          </p>
          <p className="mt-0.5 font-sans text-[11px] font-light text-white/35">
            20 members · live voting
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          <span className="font-sans text-[11px] font-medium text-green-500">
            LIVE
          </span>
        </div>
      </div>

      {/* Song list */}
      <div className="flex flex-col gap-2">
        {songs.map((song, i) => (
          <SongCard
            key={song.id}
            song={song}
            rank={i + 1}
            isActive={song.id === activeSongId}
          />
        ))}
      </div>

      {/* Footer bar */}
      <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-[#F5A623]/20 bg-[#F5A623]/10 px-3.5 py-2.5">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5A623]/30">
          <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
            <path d="M1 1L7 5L1 9V1Z" fill="#F5A623" />
          </svg>
        </div>
        <span className="font-sans text-xs text-[#F5A623]/90">
          Now playing on Spotify
        </span>
      </div>
    </div>
  );
}
