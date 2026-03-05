'use client';

import { useState, useRef, useEffect } from 'react';
import SongCard from './SongCard';

const INITIAL_SONGS = [
  {
    id: 1,
    title: 'Solar Power',
    artist: 'Lorde',
    votes: 14,
    colour: 'bg-[#F5A623]',
  },
  {
    id: 2,
    title: 'Good Days',
    artist: 'SZA',
    votes: 11,
    colour: 'bg-[#7EB8A4]',
  },
  {
    id: 3,
    title: 'Motion Sickness',
    artist: 'Phoebe Bridgers',
    votes: 9,
    colour: 'bg-[#C084FC]',
  },
  {
    id: 4,
    title: 'Fluorescent Adolescent',
    artist: 'Arctic Monkeys',
    votes: 7,
    colour: 'bg-[#60A5FA]',
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

export default function Hero() {
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
    <div className="bg-white/[0.03] border border-white/[0.09] rounded-[20px] p-5 w-full max-w-[340px] backdrop-blur-xl shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]">
      {/* Mockup header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="font-sans font-medium text-[13px] text-white/85">
            Friday Night 🎉
          </p>
          <p className="font-sans font-light text-[11px] text-white/35 mt-0.5">
            4 members · live voting
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
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
      <div className="mt-4 px-3.5 py-2.5 rounded-[10px] bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-[#F5A623]/30 flex items-center justify-center flex-shrink-0">
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
